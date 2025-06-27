import { 
  collection, 
  addDoc, 
  getDocs, 
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
];

// Verificar si un usuario es administrador inicial
export const isInitialAdmin = (userEmail) => {
  const isAdmin = INITIAL_ADMINS.includes(userEmail?.toLowerCase());
  console.log(`🔍 Verificando administrador inicial para ${userEmail}: ${isAdmin}`);
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

    // Crear solicitudes aprobadas automáticamente para todos los artistas
    for (const artistDoc of artistsSnapshot.docs) {
      const artistData = artistDoc.data();
      const artistId = artistDoc.id;

      // Verificar si ya tiene acceso (evitar duplicados)
      const hasAccess = await checkUserArtistAccess(userId, artistId);
      if (!hasAccess) {
        try {
          // Crear solicitud aprobada automáticamente
          const docRef = await addDoc(collection(db, "artistRequests"), {
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
          });

          grantedAccess.push({
            id: artistId,
            name: artistData.name || 'Artista sin nombre',
            approvedAt: new Date()
          });

          console.log("✅ Acceso otorgado al artista:", artistData.name);
        } catch (error) {
          console.error("Error otorgando acceso al artista:", artistData.name, error);
        }
      } else {
        console.log("ℹ️ Usuario ya tiene acceso al artista:", artistData.name);
        grantedAccess.push({
          id: artistId,
          name: artistData.name || 'Artista sin nombre',
          approvedAt: new Date()
        });
      }
    }

    console.log(`🎉 Proceso completado. Acceso garantizado a ${grantedAccess.length} artistas`);
    return grantedAccess;
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
    const approvedRequests = await query(
      collection(db, "artistRequests"),
      where("userId", "==", userId),
      where("artistId", "==", artistId),
      where("status", "==", REQUEST_STATUS.APPROVED)
    );
    
    const querySnapshot = await getDocs(approvedRequests);
    return !querySnapshot.empty;
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
        name: data.artistName,
        approvedAt: data.approvedAt
      });
    });
    
    console.log(`🎨 Usuario tiene acceso a ${artistIds.length} artistas:`, artistIds.map(a => a.name));
    return artistIds;
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
