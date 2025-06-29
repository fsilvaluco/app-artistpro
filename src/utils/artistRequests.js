import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../app/firebase";

// Estados de solicitudes
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected'
};

// Crear solicitud de acceso a artista
export const createArtistRequest = async (userId, userEmail, userName, artistId, artistName, message = '') => {
  try {
    // Verificar si ya existe una solicitud pendiente
    const existingRequests = await getUserPendingRequests(userId);
    const existingRequest = existingRequests.find(req => req.artistId === artistId);
    
    if (existingRequest) {
      throw new Error('Ya tienes una solicitud pendiente para este artista');
    }

    const docRef = await addDoc(collection(db, "artistRequests"), {
      userId,
      userEmail,
      userName,
      artistId,
      artistName,
      message,
      status: REQUEST_STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      userId,
      userEmail,
      userName,
      artistId,
      artistName,
      message,
      status: REQUEST_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error creating artist request:", error);
    throw error;
  }
};

// Obtener solicitudes pendientes del usuario
export const getUserPendingRequests = async (userId) => {
  try {
    const q = query(
      collection(db, "artistRequests"),
      where("userId", "==", userId),
      where("status", "==", REQUEST_STATUS.PENDING),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const requests = [];
    
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    
    return requests;
  } catch (error) {
    console.error("Error getting user pending requests:", error);
    return [];
  }
};

// Obtener todas las solicitudes del usuario
export const getUserRequests = async (userId) => {
  try {
    const q = query(
      collection(db, "artistRequests"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const requests = [];
    
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    
    return requests;
  } catch (error) {
    console.error("Error getting user requests:", error);
    return [];
  }
};

// Lista de administradores iniciales por email
const INITIAL_ADMINS = [
  'francisco@agenciakatarsis.cl',
  'info@agenciakatarsis.cl',
  // Agregar más emails de administradores iniciales aquí
  'admin@test.com', // Email temporal para testing
  'test@example.com', // Email temporal para testing
];

// Verificar si un usuario es administrador inicial
export const isInitialAdmin = (userEmail) => {
  if (!userEmail) {
    console.log("❌ isInitialAdmin: userEmail no proporcionado");
    return false;
  }
  
  const emailLower = userEmail.toLowerCase();
  const isAdmin = INITIAL_ADMINS.includes(emailLower);
  console.log(`🔍 Verificando administrador inicial para ${userEmail} (${emailLower}): ${isAdmin}`);
  console.log(`📋 Lista de admins iniciales:`, INITIAL_ADMINS);
  return isAdmin;
};

// Otorgar acceso automático a administradores iniciales
export const grantInitialAdminAccess = async (userId, userEmail, userName) => {
  try {
    if (!isInitialAdmin(userEmail)) {
      console.log("❌ Usuario no es administrador inicial:", userEmail);
      return [];
    }

    console.log("🔑 Otorgando acceso de administrador inicial a:", userEmail);

    // Obtener todos los artistas
    const artistsSnapshot = await getDocs(collection(db, "artists"));
    const grantedAccess = [];

    // Crear un array de promesas para verificación paralela
    const accessPromises = artistsSnapshot.docs.map(async (artistDoc) => {
      const artistData = artistDoc.data();
      const artistId = artistDoc.id;

      // Verificar si ya tiene acceso (evitar duplicados)
      const hasAccess = await checkUserArtistAccess(userId, artistId);
      
      if (!hasAccess) {
        try {
          // Crear solicitud aprobada automáticamente
          const requestData = {
            userId,
            userEmail,
            userName: userName || 'Admin',
            artistId,
            artistName: artistData.name || 'Artista sin nombre',
            message: 'Acceso automático de administrador inicial',
            status: REQUEST_STATUS.APPROVED,
            approvedBy: 'system',
            approvedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isInitialAdmin: true
          };

          await addDoc(collection(db, "artistRequests"), requestData);

          return {
            id: artistId,
            name: artistData.name || 'Artista sin nombre',
            approvedAt: new Date()
          };
        } catch (error) {
          console.error("Error otorgando acceso al artista:", artistData.name, error);
          return null;
        }
      } else {
        console.log("✅ Usuario ya tiene acceso al artista:", artistData.name);
        return {
          id: artistId,
          name: artistData.name || 'Artista sin nombre',
          approvedAt: new Date(),
          alreadyExists: true
        };
      }
    });

    // Esperar a que todas las verificaciones/creaciones se completen
    const results = await Promise.all(accessPromises);
    
    // Filtrar resultados válidos
    const validResults = results.filter(result => result !== null);
    const newAccess = validResults.filter(result => !result.alreadyExists);
    const existingAccess = validResults.filter(result => result.alreadyExists);

    console.log(`✅ Acceso procesado: ${newAccess.length} nuevos, ${existingAccess.length} existentes`);
    
    return validResults;
  } catch (error) {
    console.error("Error granting initial admin access:", error);
    throw error;
  }
};

// Aprobar solicitud
export const approveArtistRequest = async (requestId, adminUserId = 'admin') => {
  try {
    const requestRef = doc(db, "artistRequests", requestId);
    await updateDoc(requestRef, {
      status: REQUEST_STATUS.APPROVED,
      approvedBy: adminUserId,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Solicitud aprobada");
  } catch (error) {
    console.error("Error approving request:", error);
    throw error;
  }
};

// Rechazar solicitud
export const rejectArtistRequest = async (requestId, adminUserId = 'admin', reason = '') => {
  try {
    const requestRef = doc(db, "artistRequests", requestId);
    await updateDoc(requestRef, {
      status: REQUEST_STATUS.REJECTED,
      rejectedBy: adminUserId,
      rejectedAt: serverTimestamp(),
      rejectionReason: reason,
      updatedAt: serverTimestamp()
    });
    
    console.log("❌ Solicitud rechazada");
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};

// Verificar si el usuario tiene acceso a un artista
export const checkUserArtistAccess = async (userId, artistId) => {
  try {
    const approvedRequests = query(
      collection(db, "artistRequests"),
      where("userId", "==", userId),
      where("artistId", "==", artistId),
      where("status", "==", REQUEST_STATUS.APPROVED)
    );
    
    const querySnapshot = await getDocs(approvedRequests);
    const hasAccess = !querySnapshot.empty;
    
    if (hasAccess) {
      console.log(`✅ Usuario ${userId} ya tiene acceso al artista ${artistId}`);
    }
    
    return hasAccess;
  } catch (error) {
    console.error("Error checking user artist access:", error);
    return false;
  }
};

// Obtener artistas a los que el usuario tiene acceso (mejorado con admin inicial)
export const getUserAccessibleArtists = async (userId, userEmail) => {
  try {
    console.log(`🎭 Obteniendo artistas accesibles para usuario: ${userId} (${userEmail})`);
    
    // Si es administrador inicial, otorgar acceso automático
    if (userEmail && isInitialAdmin(userEmail)) {
      console.log("🔑 Usuario es administrador inicial, otorgando acceso automático");
      const grantedAccess = await grantInitialAdminAccess(userId, userEmail, 'Admin');
      console.log(`✅ Acceso automático otorgado a ${grantedAccess.length} artistas`);
    }

    const approvedRequests = query(
      collection(db, "artistRequests"),
      where("userId", "==", userId),
      where("status", "==", REQUEST_STATUS.APPROVED)
    );
    
    const querySnapshot = await getDocs(approvedRequests);
    const artistIds = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      artistIds.push({
        id: data.artistId,
        name: data.artistName, // Nombre temporal, se actualizará abajo
        approvedAt: data.approvedAt
      });
    });

    // Filtrar solo artistas activos y obtener nombres actualizados
    const activeArtists = [];
    for (const artistId of artistIds) {
      try {
        const artistDoc = await getDoc(doc(db, "artists", artistId.id));
        
        if (artistDoc.exists()) {
          const artistData = artistDoc.data();
          // Solo incluir si el artista está activo (o si no tiene el campo isActive, asumir activo)
          if (artistData.isActive !== false) {
            activeArtists.push({
              id: artistId.id,
              name: artistData.name, // Usar el nombre actual de la colección artists
              approvedAt: artistId.approvedAt,
              isActive: artistData.isActive,
              genre: artistData.genre,
              country: artistData.country,
              avatar: artistData.avatar || artistData.photo
            });
          } else {
            console.log(`⏸️ Artista inactivo excluido: ${artistData.name}`);
          }
        }
      } catch (error) {
        console.error(`Error verificando estado del artista ${artistId.name}:`, error);
        // En caso de error, incluir el artista por defecto
        activeArtists.push(artistId);
      }
    }
    
    console.log(`🎨 Usuario tiene acceso a ${activeArtists.length} artistas activos (de ${artistIds.length} totales):`, activeArtists.map(a => a.name));
    return activeArtists;
  } catch (error) {
    console.error("Error getting user accessible artists:", error);
    return [];
  }
};

// Obtener todas las solicitudes (para administradores)
export const getArtistRequests = async () => {
  try {
    const q = query(
      collection(db, "artistRequests"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const requests = [];
    
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    
    return requests;
  } catch (error) {
    console.error("Error getting all requests:", error);
    return [];
  }
};

// Otorgar rol de super administrador automáticamente
export const grantSuperAdminRole = async (userId, userEmail, userName) => {
  try {
    if (!isInitialAdmin(userEmail)) {
      console.log("❌ Usuario no es administrador inicial:", userEmail);
      return false;
    }

    console.log("🔑 Asignando rol de Super Administrador a:", userEmail);

    // Importar función para establecer rol
    const { setUserRole } = await import('./roleManagement');
    const { ACCESS_LEVELS } = await import('./roles');

    // Asignar rol de super admin (sin necesidad de artista específico)
    await setUserRole(userId, 'global', ACCESS_LEVELS.SUPER_ADMIN, 'system');
    
    console.log("✅ Rol de Super Administrador asignado correctamente");
    return true;
  } catch (error) {
    console.error("Error assigning super admin role:", error);
    throw error;
  }
};

// Sincronizar nombre de artista en solicitudes cuando se actualiza
export const syncArtistNameInRequests = async (artistId, newName) => {
  try {
    console.log(`🔄 Sincronizando nombre del artista ${artistId} a "${newName}"`);
    
    // Buscar todas las solicitudes de este artista
    const requestsQuery = query(
      collection(db, "artistRequests"),
      where("artistId", "==", artistId)
    );
    
    const querySnapshot = await getDocs(requestsQuery);
    const updatePromises = [];
    
    querySnapshot.forEach((requestDoc) => {
      const updatePromise = updateDoc(requestDoc.ref, {
        artistName: newName,
        updatedAt: serverTimestamp()
      });
      updatePromises.push(updatePromise);
    });
    
    await Promise.all(updatePromises);
    console.log(`✅ Sincronizados ${updatePromises.length} registros de solicitudes para ${newName}`);
    
    return updatePromises.length;
  } catch (error) {
    console.error("Error sincronizando nombre del artista:", error);
    throw error;
  }
};
