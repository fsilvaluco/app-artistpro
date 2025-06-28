import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc,
  updateDoc, 
  deleteDoc, 
  query,
  where,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../app/firebase";
import { ROLES, ACCESS_LEVELS, hasPermission, isAdminRole } from "./roles";

// Crear o actualizar rol de usuario en un artista
export const setUserRole = async (userId, artistId, role, assignedBy) => {
  try {
    // Validar que todos los parámetros requeridos estén presentes
    if (!userId || !artistId || !role || !assignedBy) {
      throw new Error(`Parámetros faltantes: userId=${userId}, artistId=${artistId}, role=${role}, assignedBy=${assignedBy}`);
    }

    // Validar que el rol sea válido
    const validRoles = [...Object.values(ROLES), ...Object.values(ACCESS_LEVELS)];
    if (!validRoles.includes(role)) {
      throw new Error(`Rol inválido: ${role}. Roles válidos: ${validRoles.join(', ')}`);
    }

    // Verificar si ya existe un rol para este usuario y artista
    const existingRoleQuery = query(
      collection(db, "userRoles"),
      where("userId", "==", userId),
      where("artistId", "==", artistId)
    );
    
    const existingRoleSnapshot = await getDocs(existingRoleQuery);
    
    if (!existingRoleSnapshot.empty) {
      // Actualizar rol existente
      const roleDoc = existingRoleSnapshot.docs[0];
      await updateDoc(doc(db, "userRoles", roleDoc.id), {
        role,
        updatedAt: serverTimestamp(),
        updatedBy: assignedBy
      });
      
      return { id: roleDoc.id, updated: true };
    } else {
      // Crear nuevo rol
      const docRef = await addDoc(collection(db, "userRoles"), {
        userId,
        artistId,
        role,
        assignedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: docRef.id, updated: false };
    }
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

// Obtener rol de usuario en un artista específico
export const getUserRole = async (userId, artistId) => {
  try {
    const roleQuery = query(
      collection(db, "userRoles"),
      where("userId", "==", userId),
      where("artistId", "==", artistId)
    );
    
    const roleSnapshot = await getDocs(roleQuery);
    
    if (!roleSnapshot.empty) {
      const roleData = roleSnapshot.docs[0].data();
      return roleData.role;
    }
    
    // Si no tiene rol específico, verificar si es super admin
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.isSuperAdmin) {
        return ACCESS_LEVELS.SUPER_ADMIN;
      }
    }
    
    return ROLES.VIEWER; // Rol por defecto
  } catch (error) {
    console.error("Error getting user role:", error);
    return ROLES.VIEWER; // Rol por defecto en caso de error
  }
};

// Obtener todos los roles de un usuario
export const getUserRoles = async (userId) => {
  try {
    const rolesQuery = query(
      collection(db, "userRoles"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    
    const rolesSnapshot = await getDocs(rolesQuery);
    const roles = [];
    
    rolesSnapshot.forEach((doc) => {
      roles.push({ id: doc.id, ...doc.data() });
    });
    
    return roles;
  } catch (error) {
    console.error("Error getting user roles:", error);
    return [];
  }
};

// Obtener todos los usuarios con roles en un artista
export const getArtistTeamWithRoles = async (artistId) => {
  try {
    const rolesQuery = query(
      collection(db, "userRoles"),
      where("artistId", "==", artistId),
      orderBy("updatedAt", "desc")
    );
    
    const rolesSnapshot = await getDocs(rolesQuery);
    const teamMembers = [];
    
    for (const roleDoc of rolesSnapshot.docs) {
      const roleData = roleDoc.data();
      
      // Obtener información del usuario
      const userDoc = await getDoc(doc(db, "users", roleData.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        teamMembers.push({
          id: roleDoc.id,
          userId: roleData.userId,
          role: roleData.role,
          assignedBy: roleData.assignedBy,
          createdAt: roleData.createdAt,
          updatedAt: roleData.updatedAt,
          user: {
            name: userData.name || userData.displayName,
            email: userData.email,
            avatar: userData.avatar || userData.photoURL
          }
        });
      }
    }
    
    return teamMembers;
  } catch (error) {
    console.error("Error getting artist team with roles:", error);
    return [];
  }
};

// Eliminar rol de usuario
export const removeUserRole = async (roleId) => {
  try {
    await deleteDoc(doc(db, "userRoles", roleId));
    return true;
  } catch (error) {
    console.error("Error removing user role:", error);
    throw error;
  }
};

// Verificar si un usuario tiene un permiso específico para un artista
export const checkUserPermission = async (userId, artistId, permission) => {
  try {
    const userRole = await getUserRole(userId, artistId);
    return hasPermission(userRole, permission);
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
};

// Obtener usuarios que pueden ser administradores
export const getPotentialAdmins = async (artistId) => {
  try {
    // Obtener todos los usuarios con acceso al artista
    const requestsQuery = query(
      collection(db, "artistRequests"),
      where("artistId", "==", artistId),
      where("status", "==", "approved")
    );
    
    const requestsSnapshot = await getDocs(requestsQuery);
    const users = [];
    
    for (const requestDoc of requestsSnapshot.docs) {
      const requestData = requestDoc.data();
      
      // Verificar si ya tiene un rol administrativo
      const currentRole = await getUserRole(requestData.userId, artistId);
      
      if (!isAdminRole(currentRole)) {
        users.push({
          userId: requestData.userId,
          email: requestData.userEmail,
          name: requestData.userName,
          currentRole
        });
      }
    }
    
    return users;
  } catch (error) {
    console.error("Error getting potential admins:", error);
    return [];
  }
};

// Actualizar solicitud de acceso con rol específico
export const updateArtistRequestWithRole = async (requestId, newRole, adminUserId) => {
  try {
    // Validar parámetros de entrada
    if (!requestId || !newRole || !adminUserId) {
      throw new Error(`Parámetros faltantes: requestId=${requestId}, newRole=${newRole}, adminUserId=${adminUserId}`);
    }

    // Validar que el rol sea válido
    const validRoles = [...Object.values(ROLES), ...Object.values(ACCESS_LEVELS)];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Rol inválido: ${newRole}. Roles válidos: ${validRoles.join(', ')}`);
    }

    // Obtener la solicitud
    const requestDoc = await getDoc(doc(db, "artistRequests", requestId));
    
    if (!requestDoc.exists()) {
      throw new Error("Solicitud no encontrada");
    }
    
    const requestData = requestDoc.data();
    
    // Actualizar la solicitud con el rol
    await updateDoc(doc(db, "artistRequests", requestId), {
      status: "approved",
      approvedBy: adminUserId,
      approvedAt: serverTimestamp(),
      assignedRole: newRole,
      updatedAt: serverTimestamp()
    });
    
    // Asignar el rol al usuario
    await setUserRole(
      requestData.userId,
      requestData.artistId,
      newRole,
      adminUserId
    );
    
    return true;
  } catch (error) {
    console.error("Error updating request with role:", error);
    throw error;
  }
};

// Promover usuario a administrador
export const promoteToAdmin = async (userId, artistId, promotedBy) => {
  try {
    await setUserRole(userId, artistId, ACCESS_LEVELS.ADMINISTRADOR, promotedBy);
    return true;
  } catch (error) {
    console.error("Error promoting to admin:", error);
    throw error;
  }
};
