import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  orderBy,
  serverTimestamp,
  where,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "../app/firebase";

// CRUD para Miembros del Equipo (usando usuarios de la colección users)
export const addUserToTeam = async (artistId, userId, userToAdd, role, department = '') => {
  if (!artistId) throw new Error("No hay artista seleccionado");
  if (!userId) throw new Error("Usuario no autenticado");
  
  try {
    // Verificar si el usuario ya está en el equipo
    const existingMembers = await getTeamMembers(artistId, userId);
    if (existingMembers.some(member => member.userId === userToAdd.id)) {
      throw new Error("Este usuario ya está en el equipo");
    }
    
    const docRef = await addDoc(collection(db, "artists", artistId, "team"), {
      userId: userToAdd.id,
      userName: userToAdd.name,
      userEmail: userToAdd.email,
      role: role,
      department: department,
      addedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      userId: userToAdd.id,
      userName: userToAdd.name,
      userEmail: userToAdd.email,
      role,
      department,
      addedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error adding user to team:", error);
    throw error;
  }
};

export const createTeamMember = async (artistId, userId, memberData) => {
  if (!artistId) throw new Error("No hay artista seleccionado");
  if (!userId) throw new Error("Usuario no autenticado");
  
  try {
    const docRef = await addDoc(collection(db, "artists", artistId, "team"), {
      ...memberData,
      addedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...memberData,
      addedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error creating team member:", error);
    throw error;
  }
};

export const getTeamMembers = async (artistId, currentUserId) => {
  console.log("🔍 getTeamMembers called with:", { artistId, currentUserId });
  
  if (!artistId || !currentUserId) {
    console.log("❌ getTeamMembers: Missing artistId or currentUserId");
    return [];
  }
  
  try {
    console.log("📂 Consultando miembros del equipo para artista:", artistId);
    
    const teamCollection = collection(db, "artists", artistId, "team");
    console.log("📂 Collection reference created");
    
    const querySnapshot = await getDocs(teamCollection);
    console.log("📊 Query executed, docs found:", querySnapshot.size);
    
    const members = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("📄 Processing doc:", doc.id, data);
      
      // Filtrar datos de ejemplo (emails con @example.com)
      const isExampleData = data.email && data.email.includes('@example.com');
      
      if (isExampleData) {
        console.log("🚫 Skipping example data:", data.name);
        return;
      }
      
      // Verificar acceso: debe ser agregado por el usuario actual o ser datos legacy
      if (data.addedBy === currentUserId || !data.addedBy) {
        // Determinar si es un miembro nuevo (con userId) o legacy (con datos directos)
        if (data.userId && data.userName) {
          // Miembro nuevo: referencia a usuario de la colección users
          members.push({
            id: doc.id,
            userId: data.userId,
            name: data.userName,
            email: data.userEmail,
            role: data.role,
            department: data.department,
            type: 'user_reference',
            ...data
          });
          console.log("✅ Added user reference member:", data.userName);
        } else if (data.name && !isExampleData) {
          // Miembro legacy válido: datos directos pero no de ejemplo
          members.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department,
            type: 'legacy',
            ...data
          });
          console.log("✅ Added valid legacy member:", data.name);
        }
      } else {
        console.log("⚠️ Skipping member (wrong addedBy):", data.name || data.userName, "expected:", currentUserId, "got:", data.addedBy);
      }
    });
    
    // Ordenar en el cliente
    members.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    console.log("👥 Final members list:", members.length, members);
    return members;
  } catch (error) {
    console.error("❌ Error loading team members:", error);
    return [];
  }
};

export const updateTeamMember = async (artistId, memberId, updates) => {
  try {
    const memberRef = doc(db, "artists", artistId, "team", memberId);
    await updateDoc(memberRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    throw error;
  }
};

export const deleteTeamMember = async (artistId, memberId) => {
  try {
    await deleteDoc(doc(db, "artists", artistId, "team", memberId));
  } catch (error) {
    console.error("Error deleting team member:", error);
    throw error;
  }
};

// Obtener miembros del equipo basándose en roles asignados
export const getTeamMembersFromRoles = async (artistId) => {
  if (!artistId) {
    console.log("🚫 getTeamMembersFromRoles: falta artistId");
    return [];
  }

  try {
    console.log(`👥 Cargando equipo desde roles para artista: ${artistId}`);
    
    // Obtener todos los roles asignados para este artista
    const rolesQuery = query(
      collection(db, "userRoles"),
      where("artistId", "==", artistId),
      orderBy("createdAt", "desc")
    );
    
    const rolesSnapshot = await getDocs(rolesQuery);
    console.log("📊 Roles encontrados:", rolesSnapshot.size);
    
    // Si no hay roles, mostrar información de debug sobre la estructura esperada
    if (rolesSnapshot.empty) {
      console.log("⚠️ No se encontraron roles para el artista:", artistId);
      console.log("📋 Estructura esperada en Firebase:");
      console.log("  Colección: userRoles");
      console.log("  Documentos con campos:");
      console.log("    - userId: 'id_del_usuario'");
      console.log("    - artistId: '" + artistId + "'");
      console.log("    - role: 'administrador', 'editor', o 'lector'");
      console.log("    - assignedBy: 'id_del_usuario_que_asigno'");
      console.log("    - createdAt: timestamp");
      console.log("📋 Estructura esperada en users:");
      console.log("  Colección: users");
      console.log("  Documentos con campos:");
      console.log("    - name: 'Nombre del usuario'");
      console.log("    - email: 'email@ejemplo.com'");
      return [];
    }
    console.log("📊 Roles encontrados:", rolesSnapshot.size);
    
    const members = [];
    
    // Para cada rol, obtener la información del usuario
    for (const roleDoc of rolesSnapshot.docs) {
      const roleData = roleDoc.data();
      console.log("🔍 Procesando rol:", roleData);
      
      try {
        // Obtener información del usuario desde la colección users
        const userDoc = await getDoc(doc(db, "users", roleData.userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("👤 Datos del usuario encontrados:", userData);
          
          members.push({
            id: roleDoc.id, // ID del rol, no del usuario
            userId: roleData.userId,
            name: userData.name || userData.email,
            email: userData.email,
            role: "other", // Rol de equipo por defecto
            accessLevel: roleData.role, // El rol de permisos
            department: userData.department || '',
            type: 'role_based',
            assignedBy: roleData.assignedBy,
            createdAt: roleData.createdAt,
            updatedAt: roleData.updatedAt
          });
          
          console.log("✅ Agregado miembro con rol:", userData.name || userData.email, "access level:", roleData.role);
        } else {
          console.log("⚠️ Usuario no encontrado en colección 'users':", roleData.userId);
          console.log("💡 Verifica que el usuario exista en la colección 'users' con ID:", roleData.userId);
        }
      } catch (error) {
        console.error("❌ Error obteniendo usuario:", roleData.userId, error);
      }
    }
    
    // Si no hay miembros, agregar información de debug
    if (members.length === 0) {
      console.log("⚠️ No se encontraron miembros con roles para el artista:", artistId);
      console.log("💡 Posibles causas:");
      console.log("  1. Los usuarios referenciados en userRoles no existen en la colección 'users'");
      console.log("  2. Los IDs de usuario no coinciden entre las colecciones");
      console.log("  3. Faltan campos obligatorios en los documentos");
    }

    console.log("👥 Lista final de miembros desde roles:", members.length, members);
    return members;
    
  } catch (error) {
    console.error("❌ Error loading team members from roles:", error);
    return [];
  }
};

// Función para obtener miembros del equipo basándose en el contexto de acceso
export const getTeamMembersFromAccessContext = async (artistId, currentUserId) => {
  if (!artistId || !currentUserId) {
    console.log("🚫 getTeamMembersFromAccessContext: faltan parámetros");
    return [];
  }

  try {
    console.log("🔍 Obteniendo miembros del equipo desde contexto de acceso...");
    
    // Primero, obtener todos los usuarios que tienen acceso a artistas
    const usersWithAccess = [];
    
    // Obtener todos los documentos de la colección users
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log(`👥 Usuarios totales en la colección: ${usersSnapshot.size}`);
    
    // Para cada usuario, verificar si tiene acceso al artista actual
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      try {
        // Usar la misma función que usa AccessContext
        const { getUserAccessibleArtists } = await import("../utils/artistRequests");
        const accessibleArtists = await getUserAccessibleArtists(userId, userData.email);
        
        // Verificar si este artista está en la lista de accesibles
        const hasAccessToCurrentArtist = accessibleArtists.some(artist => artist.id === artistId);
        
        if (hasAccessToCurrentArtist) {
          // Obtener el rol real del usuario desde userRoles
          let accessLevel = "lector"; // Default
          let teamRole = "other"; // Default
          
          try {
            // Buscar el rol específico para este usuario y artista
            const userRolesQuery = query(
              collection(db, "userRoles"),
              where("userId", "==", userId),
              where("artistId", "==", artistId)
            );
            
            const userRolesSnapshot = await getDocs(userRolesQuery);
            if (!userRolesSnapshot.empty) {
              // Tomar el primer rol encontrado (debería haber solo uno)
              const roleData = userRolesSnapshot.docs[0].data();
              accessLevel = roleData.role || "lector";
              console.log(`🔑 Rol encontrado para ${userData.email}: ${accessLevel}`);
            } else {
              console.log(`⚠️ No se encontró rol específico para ${userData.email}, usando 'lector'`);
            }
            
            // Asignar rol de equipo basado en si es el usuario actual
            teamRole = userId === currentUserId ? "manager" : "other";
            
          } catch (roleError) {
            console.log("❌ Error obteniendo rol específico:", roleError);
            accessLevel = "lector";
          }
          
          usersWithAccess.push({
            id: userId,
            userId: userId,
            name: userData.name || userData.email?.split('@')[0] || 'Usuario',
            email: userData.email,
            role: teamRole, // Rol de equipo
            accessLevel: accessLevel, // Rol de permisos REAL desde userRoles
            department: userData.department || '',
            type: 'access_based',
            source: 'AccessContext'
          });
          
          console.log("✅ Usuario con acceso encontrado:", userData.name || userData.email, "team role:", teamRole, "access level:", accessLevel);
        }
      } catch (error) {
        console.log("⚠️ Error verificando acceso para usuario:", userId, error);
      }
    }
    
    console.log(`👥 Total de usuarios con acceso al artista ${artistId}: ${usersWithAccess.length}`);
    return usersWithAccess;
    
  } catch (error) {
    console.error("❌ Error obteniendo miembros desde contexto de acceso:", error);
    return [];
  }
};

// Roles predefinidos para miembros del equipo
export const TEAM_ROLES = [
  { value: "manager", label: "👔 Manager", color: "#3b82f6" },
  { value: "producer", label: "🎵 Productor", color: "#8b5cf6" },
  { value: "sound_engineer", label: "🎚️ Ingeniero de Sonido", color: "#10b981" },
  { value: "musician", label: "🎸 Músico", color: "#f59e0b" },
  { value: "vocalist", label: "🎤 Vocalista", color: "#ef4444" },
  { value: "songwriter", label: "✍️ Compositor", color: "#06b6d4" },
  { value: "marketing", label: "📢 Marketing", color: "#84cc16" },
  { value: "designer", label: "🎨 Diseñador", color: "#f97316" },
  { value: "photographer", label: "📸 Fotógrafo", color: "#6366f1" },
  { value: "videographer", label: "🎬 Videógrafo", color: "#ec4899" },
  { value: "social_media", label: "📱 Redes Sociales", color: "#14b8a6" },
  { value: "booking", label: "📅 Booking Agent", color: "#a855f7" },
  { value: "lawyer", label: "⚖️ Abogado", color: "#64748b" },
  { value: "accountant", label: "💰 Contador", color: "#059669" },
  { value: "stylist", label: "💄 Estilista", color: "#d946ef" },
  { value: "roadie", label: "🛠️ Roadie", color: "#7c3aed" },
  { value: "other", label: "👤 Otro", color: "#6b7280" }
];

// Función para obtener el color de un rol
export const getRoleColor = (role) => {
  const roleData = TEAM_ROLES.find(r => r.value === role);
  return roleData ? roleData.color : "#6b7280";
};

// Función para obtener el label de un rol
export const getRoleLabel = (role) => {
  const roleData = TEAM_ROLES.find(r => r.value === role);
  return roleData ? roleData.label : "👤 Otro";
};

// Datos de muestra para miembros del equipo
export const sampleTeamMembers = [
  {
    name: "Carlos Mendoza",
    email: "carlos@example.com",
    phone: "+1-555-0123",
    role: "manager",
    department: "Administración",
    startDate: new Date("2024-01-15"),
    salary: 3500,
    status: "active",
    notes: "Manager principal con 10 años de experiencia en la industria musical",
    photo: null,
    emergency_contact: "María Mendoza - +1-555-0124"
  },
  {
    name: "Ana García",
    email: "ana@example.com",
    phone: "+1-555-0125",
    role: "producer",
    department: "Producción",
    startDate: new Date("2024-02-01"),
    salary: 4000,
    status: "active",
    notes: "Productora musical especializada en pop latino",
    photo: null,
    emergency_contact: "Pedro García - +1-555-0126"
  },
  {
    name: "Miguel Torres",
    email: "miguel@example.com",
    phone: "+1-555-0127",
    role: "sound_engineer",
    department: "Técnico",
    startDate: new Date("2024-03-10"),
    salary: 2800,
    status: "active",
    notes: "Ingeniero de sonido con certificación Pro Tools",
    photo: null,
    emergency_contact: "Laura Torres - +1-555-0128"
  },
  {
    name: "Sofia Ramírez",
    email: "sofia@example.com",
    phone: "+1-555-0129",
    role: "marketing",
    department: "Marketing",
    startDate: new Date("2024-01-20"),
    salary: 3200,
    status: "active",
    notes: "Especialista en marketing digital y redes sociales",
    photo: null,
    emergency_contact: "Roberto Ramírez - +1-555-0130"
  },
  {
    name: "David López",
    email: "david@example.com",
    phone: "+1-555-0131",
    role: "musician",
    department: "Artístico",
    startDate: new Date("2024-04-05"),
    salary: 2500,
    status: "active",
    notes: "Guitarrista y bajista sesionista",
    photo: null,
    emergency_contact: "Carmen López - +1-555-0132"
  }
];

// Función para poblar datos de muestra del equipo
export const populateTeamSampleData = async (userId, artistId) => {
  try {
    console.log(`👥 Poblando equipo para artista ${artistId}...`);
    
    // Verificar si ya hay miembros
    const membersSnapshot = await getDocs(collection(db, "artists", artistId, "team"));
    if (!membersSnapshot.empty) {
      console.log(`ℹ️ El artista ${artistId} ya tiene equipo`);
      return { success: true, message: "El artista ya tiene equipo" };
    }
    
    // Crear miembros de muestra
    for (const memberData of sampleTeamMembers) {
      await createTeamMember(artistId, userId, memberData);
    }
    
    console.log(`✅ Equipo poblado para artista ${artistId}`);
    return { success: true, message: "Equipo de muestra creado" };
  } catch (error) {
    console.error("❌ Error poblando equipo:", error);
    return { success: false, error: error.message };
  }
};

// Función para limpiar datos de muestra del equipo
export const clearTeamSampleData = async (artistId, currentUserId) => {
  try {
    console.log(`🧹 Limpiando datos de muestra para artista ${artistId}...`);
    
    const membersSnapshot = await getDocs(collection(db, "artists", artistId, "team"));
    let deletedCount = 0;
    
    for (const docSnapshot of membersSnapshot.docs) {
      const data = docSnapshot.data();
      
      // Verificar si es un dato de muestra (no tiene userId, solo name y email de ejemplo)
      const isExampleData = !data.userId && 
                           data.name && 
                           data.email &&
                           data.email.includes('@example.com');
      
      if (isExampleData) {
        await deleteDoc(doc(db, "artists", artistId, "team", docSnapshot.id));
        deletedCount++;
        console.log(`🗑️ Eliminado miembro de ejemplo: ${data.name}`);
      }
    }
    
    console.log(`✅ Limpieza completada. Eliminados ${deletedCount} miembros de ejemplo`);
    return { success: true, deletedCount };
  } catch (error) {
    console.error("❌ Error limpiando datos de muestra:", error);
    throw error;
  }
};

// Función de desarrollo: crear rol automático para el usuario actual
export const ensureUserHasRole = async (userId, artistId, userEmail) => {
  if (!userId || !artistId) {
    console.log("🚫 ensureUserHasRole: faltan parámetros");
    return false;
  }

  try {
    // Primero asegurar que el usuario exista en la colección users
    await ensureUserExists(userId, userEmail);
    
    // Verificar si el usuario ya tiene un rol para este artista
    const rolesQuery = query(
      collection(db, "userRoles"),
      where("userId", "==", userId),
      where("artistId", "==", artistId)
    );
    
    const rolesSnapshot = await getDocs(rolesQuery);
    
    if (!rolesSnapshot.empty) {
      console.log("✅ Usuario ya tiene rol asignado");
      return true;
    }
    
    // Si no tiene rol, crear uno automáticamente (solo en desarrollo)
    console.log("🔧 Usuario sin rol, creando rol automático de administrador...");
    
    await addDoc(collection(db, "userRoles"), {
      userId: userId,
      artistId: artistId,
      role: "administrador", // Asignar como administrador por defecto
      assignedBy: userId, // Auto-asignado
      autoAssigned: true, // Marcar como auto-asignado
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Rol automático creado para usuario:", userEmail);
    return true;
    
  } catch (error) {
    console.error("❌ Error ensuring user role:", error);
    return false;
  }
};

// Función de desarrollo: asegurar que el usuario actual exista en la colección users
export const ensureUserExists = async (userId, userEmail, userName = null) => {
  if (!userId || !userEmail) {
    console.log("🚫 ensureUserExists: faltan parámetros (userId, userEmail)");
    return false;
  }

  try {
    // Verificar si el usuario ya existe
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      console.log("✅ Usuario ya existe en colección 'users'");
      return true;
    }
    
    // Si no existe, crear el usuario
    console.log("🔧 Usuario no existe, creando en colección 'users'...");
    
    const userData = {
      email: userEmail,
      name: userName || userEmail.split('@')[0], // Usar parte antes de @ como nombre si no se proporciona
      department: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      autoCreated: true // Marcar como auto-creado
    };
    
    await setDoc(doc(db, "users", userId), userData);
    
    console.log("✅ Usuario creado en colección 'users':", userData);
    return true;
    
  } catch (error) {
    console.error("❌ Error ensuring user exists:", error);
    return false;
  }
};

// Función de debug: mostrar información completa de Firebase
export const debugFirebaseStructure = async (artistId, userId) => {
  try {
    console.log("🔍 DEBUG: Estructura de Firebase");
    console.log("==================================================");
    
    // 1. Verificar colección users
    console.log("👥 1. Verificando colección 'users'...");
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log(`   Usuarios encontrados: ${usersSnapshot.size}`);
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   📄 Usuario ID: ${doc.id}`);
      console.log(`      - Name: ${data.name || 'NO NAME'}`);
      console.log(`      - Email: ${data.email || 'NO EMAIL'}`);
      console.log(`      - Department: ${data.department || 'NO DEPARTMENT'}`);
    });
    
    // 2. Verificar colección userRoles
    console.log("\n🎭 2. Verificando colección 'userRoles'...");
    const rolesSnapshot = await getDocs(collection(db, "userRoles"));
    console.log(`   Roles encontrados: ${rolesSnapshot.size}`);
    
    rolesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   📄 Rol ID: ${doc.id}`);
      console.log(`      - UserID: ${data.userId || 'NO USER ID'}`);
      console.log(`      - ArtistID: ${data.artistId || 'NO ARTIST ID'}`);
      console.log(`      - Role: ${data.role || 'NO ROLE'}`);
      console.log(`      - AssignedBy: ${data.assignedBy || 'NO ASSIGNED BY'}`);
    });
    
    // 3. Verificar roles para el artista específico
    if (artistId) {
      console.log(`\n🎯 3. Verificando roles para artista específico: ${artistId}...`);
      const artistRolesQuery = query(
        collection(db, "userRoles"),
        where("artistId", "==", artistId)
      );
      const artistRolesSnapshot = await getDocs(artistRolesQuery);
      console.log(`   Roles para este artista: ${artistRolesSnapshot.size}`);
      
      artistRolesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   📄 Rol específico ID: ${doc.id}`);
        console.log(`      - UserID: ${data.userId}`);
        console.log(`      - Role: ${data.role}`);
      });
    }
    
    // 4. Verificar si el usuario actual existe
    if (userId) {
      console.log(`\n👤 4. Verificando usuario actual: ${userId}...`);
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("   ✅ Usuario actual encontrado:");
        console.log(`      - Name: ${userData.name}`);
        console.log(`      - Email: ${userData.email}`);
      } else {
        console.log("   ❌ Usuario actual NO encontrado en colección 'users'");
      }
    }
    
    console.log("==================================================");
    console.log("🔍 FIN DEBUG");
    
  } catch (error) {
    console.error("❌ Error en debug de Firebase:", error);
  }
};

// Función de diagnóstico: verificar estado de autenticación y datos
export const diagnoseUserState = async (userData, artistId) => {
  console.log("🩺 DIAGNÓSTICO DEL ESTADO DEL USUARIO");
  console.log("=====================================");
  
  // 1. Verificar autenticación
  console.log("1. Estado de autenticación:");
  console.log("   - Usuario autenticado:", !!userData);
  if (userData) {
    console.log("   - UID:", userData.uid);
    console.log("   - Email:", userData.email);
    console.log("   - Name:", userData.name || "NO NAME");
  }
  
  // 2. Verificar artista seleccionado
  console.log("2. Artista seleccionado:");
  console.log("   - Artist ID:", artistId || "NO ARTIST SELECTED");
  
  // 3. Verificar conectividad con Firebase
  console.log("3. Verificando conectividad con Firebase...");
  try {
    const testQuery = await getDocs(collection(db, "users"));
    console.log("   ✅ Conexión con Firebase OK - Users collection size:", testQuery.size);
  } catch (error) {
    console.log("   ❌ Error de conexión con Firebase:", error);
    return false;
  }
  
  // 4. Verificar si el usuario necesita ser creado
  if (userData?.uid) {
    console.log("4. Verificando existencia del usuario en Firebase...");
    try {
      const userDoc = await getDoc(doc(db, "users", userData.uid));
      if (userDoc.exists()) {
        console.log("   ✅ Usuario existe en Firebase");
      } else {
        console.log("   ⚠️ Usuario NO existe en Firebase - necesita ser creado");
      }
    } catch (error) {
      console.log("   ❌ Error verificando usuario:", error);
    }
  }
  
  // 5. Verificar roles para el artista
  if (userData?.uid && artistId) {
    console.log("5. Verificando roles para el artista...");
    try {
      const rolesQuery = query(
        collection(db, "userRoles"),
        where("userId", "==", userData.uid),
        where("artistId", "==", artistId)
      );
      const rolesSnapshot = await getDocs(rolesQuery);
      
      if (rolesSnapshot.empty) {
        console.log("   ⚠️ Usuario NO tiene roles asignados para este artista");
      } else {
        console.log("   ✅ Usuario tiene roles asignados:");
        rolesSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`      - Rol: ${data.role}`);
        });
      }
    } catch (error) {
      console.log("   ❌ Error verificando roles:", error);
    }
  }
  
  // 6. Verificar solicitudes de acceso a artistas
  if (userData?.uid) {
    console.log("6. Verificando solicitudes de acceso...");
    await debugArtistRequests(userData.uid);
  }
  
  console.log("=====================================");
  console.log("🩺 FIN DIAGNÓSTICO");
  
  return true;
};

// Función de debug: mostrar información sobre solicitudes de acceso
export const debugArtistRequests = async (userId) => {
  try {
    console.log("🎭 DEBUG: Solicitudes de acceso a artistas");
    console.log("==========================================");
    
    if (userId) {
      console.log(`👤 Usuario: ${userId}`);
      
      // Obtener todas las solicitudes del usuario
      const userRequestsQuery = query(
        collection(db, "artistRequests"),
        where("userId", "==", userId)
      );
      
      const userRequestsSnapshot = await getDocs(userRequestsQuery);
      console.log(`📋 Solicitudes del usuario: ${userRequestsSnapshot.size}`);
      
      userRequestsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   📄 Solicitud ID: ${doc.id}`);
        console.log(`      - Artista: ${data.artistName} (${data.artistId})`);
        console.log(`      - Estado: ${data.status}`);
        console.log(`      - Rol solicitado: ${data.requestedRole || 'No especificado'}`);
        console.log(`      - Fecha: ${data.createdAt?.toDate?.() || data.createdAt}`);
      });
    }
    
    // Obtener todas las solicitudes para debug general
    console.log("\n📋 Todas las solicitudes en la base de datos:");
    const allRequestsSnapshot = await getDocs(collection(db, "artistRequests"));
    console.log(`   Total de solicitudes: ${allRequestsSnapshot.size}`);
    
    const statusCount = {};
    allRequestsSnapshot.forEach((doc) => {
      const data = doc.data();
      statusCount[data.status] = (statusCount[data.status] || 0) + 1;
    });
    
    console.log("   Distribución por estado:", statusCount);
    console.log("==========================================");
    
  } catch (error) {
    console.error("❌ Error en debug de solicitudes:", error);
  }
};

// Función de diagnóstico completo de permisos
export const diagnosisPermissions = async (userId, artistId, userEmail) => {
  console.log("🔧 DIAGNÓSTICO COMPLETO DE PERMISOS");
  console.log("====================================");
  
  try {
    // 1. Verificar datos básicos
    console.log("1. DATOS BÁSICOS:");
    console.log(`   User ID: ${userId}`);
    console.log(`   Artist ID: ${artistId}`);
    console.log(`   Email: ${userEmail}`);
    
    // 2. Verificar existencia en colección users
    console.log("\n2. VERIFICANDO COLECCIÓN 'users':");
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("   ✅ Usuario encontrado en 'users':");
      console.log(`      - Name: ${userData.name}`);
      console.log(`      - Email: ${userData.email}`);
    } else {
      console.log("   ❌ Usuario NO encontrado en 'users'");
      return false;
    }
    
    // 3. Verificar roles para este artista
    console.log("\n3. VERIFICANDO ROLES PARA ESTE ARTISTA:");
    const rolesQuery = query(
      collection(db, "userRoles"),
      where("userId", "==", userId),
      where("artistId", "==", artistId)
    );
    
    const rolesSnapshot = await getDocs(rolesQuery);
    
    if (rolesSnapshot.empty) {
      console.log("   ❌ NO se encontraron roles para este usuario/artista");
      console.log("   💡 Creando rol automático...");
      
      // Crear rol automático
      await ensureUserHasRole(userId, artistId, userEmail);
      
      // Verificar de nuevo
      const newRolesSnapshot = await getDocs(rolesQuery);
      if (!newRolesSnapshot.empty) {
        const roleData = newRolesSnapshot.docs[0].data();
        console.log("   ✅ Rol automático creado:");
        console.log(`      - Role: ${roleData.role}`);
        console.log(`      - Assigned by: ${roleData.assignedBy}`);
      }
    } else {
      console.log("   ✅ Roles encontrados:");
      rolesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`      - Role: ${data.role}`);
        console.log(`      - Assigned by: ${data.assignedBy}`);
        console.log(`      - Created at: ${data.createdAt?.toDate?.() || data.createdAt}`);
      });
    }
    
    // 4. Verificar función getUserRole
    console.log("\n4. VERIFICANDO FUNCIÓN getUserRole:");
    const { getUserRole } = await import("../utils/roleManagement");
    const userRoleData = await getUserRole(userId, artistId);
    console.log("   Resultado de getUserRole:");
    console.log(`      - role: ${userRoleData.role}`);
    console.log(`      - accessLevel: ${userRoleData.accessLevel}`);
    
    // 5. Verificar permisos específicos
    console.log("\n5. VERIFICANDO PERMISOS ESPECÍFICOS:");
    const { hasPermission, PERMISSIONS, ACCESS_LEVELS } = await import("../utils/roles");
    
    const testPermissions = [
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANALYTICS_EDIT,
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.TEAM_EDIT
    ];
    
    console.log(`   AccessLevel actual: ${userRoleData.accessLevel}`);
    console.log(`   Es administrador: ${userRoleData.accessLevel === ACCESS_LEVELS.ADMINISTRADOR}`);
    
    testPermissions.forEach(permission => {
      const hasAccess = hasPermission(userRoleData.accessLevel, permission);
      console.log(`   ${hasAccess ? '✅' : '❌'} ${permission}: ${hasAccess}`);
    });
    
    // 6. Verificar contexto de permisos en tiempo real
    console.log("\n6. ESTADO ACTUAL EN EL NAVEGADOR:");
    console.log("   Abre las herramientas de desarrollador y ejecuta:");
    console.log("   window.__permissionsDebug = true;");
    console.log("   Luego intenta crear un evento y observa los logs");
    
    console.log("\n====================================");
    console.log("🔧 FIN DIAGNÓSTICO DE PERMISOS");
    
    return true;
    
  } catch (error) {
    console.error("❌ Error en diagnóstico de permisos:", error);
    return false;
  }
};
