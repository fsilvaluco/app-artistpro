import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  orderBy,
  serverTimestamp 
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
        } else if (data.name) {
          // Miembro legacy: datos directos
          members.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department,
            type: 'legacy',
            ...data
          });
          console.log("✅ Added legacy member:", data.name);
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
