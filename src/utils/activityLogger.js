import { db } from "../app/firebase";
import { collection, addDoc, query, orderBy, limit, where, getDocs, serverTimestamp } from "firebase/firestore";

// Tipos de actividades disponibles
export const ACTIVITY_TYPES = {
  // Equipo
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed',
  TEAM_ROLE_CHANGED: 'team_role_changed',
  
  // Proyectos
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  
  // Tareas
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  
  // Análisis
  SOCIAL_MEDIA_CONNECTED: 'social_media_connected',
  SOCIAL_MEDIA_DISCONNECTED: 'social_media_disconnected',
  
  // Solicitudes
  ACCESS_REQUEST_APPROVED: 'access_request_approved',
  ACCESS_REQUEST_REJECTED: 'access_request_rejected',
  
  // Configuración
  SETTINGS_UPDATED: 'settings_updated',
  
  // Sistema
  LOGIN: 'login',
  LOGOUT: 'logout'
};

// Descripciones y emojis para cada tipo de actividad
export const ACTIVITY_DESCRIPTIONS = {
  [ACTIVITY_TYPES.TEAM_MEMBER_ADDED]: {
    emoji: '👥',
    template: 'Se agregó {memberName} al equipo como {role}',
    category: 'Equipo'
  },
  [ACTIVITY_TYPES.TEAM_MEMBER_REMOVED]: {
    emoji: '👤',
    template: 'Se removió {memberName} del equipo',
    category: 'Equipo'
  },
  [ACTIVITY_TYPES.TEAM_ROLE_CHANGED]: {
    emoji: '🔄',
    template: 'Se cambió el rol de {memberName} a {newRole}',
    category: 'Equipo'
  },
  [ACTIVITY_TYPES.PROJECT_CREATED]: {
    emoji: '📁',
    template: 'Se creó el proyecto "{projectName}"',
    category: 'Proyectos'
  },
  [ACTIVITY_TYPES.PROJECT_UPDATED]: {
    emoji: '📝',
    template: 'Se actualizó el proyecto "{projectName}"',
    category: 'Proyectos'
  },
  [ACTIVITY_TYPES.PROJECT_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó el proyecto "{projectName}"',
    category: 'Proyectos'
  },
  [ACTIVITY_TYPES.TASK_CREATED]: {
    emoji: '📋',
    template: 'Se creó la tarea "{taskName}"',
    category: 'Tareas'
  },
  [ACTIVITY_TYPES.TASK_UPDATED]: {
    emoji: '✏️',
    template: 'Se actualizó la tarea "{taskName}"',
    category: 'Tareas'
  },
  [ACTIVITY_TYPES.TASK_COMPLETED]: {
    emoji: '✅',
    template: 'Se completó la tarea "{taskName}"',
    category: 'Tareas'
  },
  [ACTIVITY_TYPES.TASK_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó la tarea "{taskName}"',
    category: 'Tareas'
  },
  [ACTIVITY_TYPES.SOCIAL_MEDIA_CONNECTED]: {
    emoji: '🔗',
    template: 'Se conectó la cuenta de {platform}',
    category: 'Redes Sociales'
  },
  [ACTIVITY_TYPES.SOCIAL_MEDIA_DISCONNECTED]: {
    emoji: '🔌',
    template: 'Se desconectó la cuenta de {platform}',
    category: 'Redes Sociales'
  },
  [ACTIVITY_TYPES.ACCESS_REQUEST_APPROVED]: {
    emoji: '✅',
    template: 'Se aprobó el acceso para {userEmail}',
    category: 'Acceso'
  },
  [ACTIVITY_TYPES.ACCESS_REQUEST_REJECTED]: {
    emoji: '❌',
    template: 'Se rechazó el acceso para {userEmail}',
    category: 'Acceso'
  },
  [ACTIVITY_TYPES.SETTINGS_UPDATED]: {
    emoji: '⚙️',
    template: 'Se actualizó la configuración',
    category: 'Configuración'
  },
  [ACTIVITY_TYPES.LOGIN]: {
    emoji: '🔐',
    template: 'Inició sesión',
    category: 'Sistema'
  },
  [ACTIVITY_TYPES.LOGOUT]: {
    emoji: '🚪',
    template: 'Cerró sesión',
    category: 'Sistema'
  }
};

/**
 * Registra una nueva actividad en el log
 */
export const logActivity = async (activityType, userData, artistId, metadata = {}) => {
  try {
    console.log('📝 Registrando actividad:', { activityType, artistId, metadata });
    
    if (!userData || !artistId) {
      console.warn('⚠️ Faltan datos para registrar actividad:', { userData: !!userData, artistId });
      return null;
    }

    const activityData = {
      type: activityType,
      artistId,
      userId: userData.uid,
      userName: userData.displayName || userData.name || userData.email,
      userEmail: userData.email,
      metadata: metadata || {},
      createdAt: serverTimestamp(),
      // Campos adicionales para facilitar consultas
      category: ACTIVITY_DESCRIPTIONS[activityType]?.category || 'General',
      emoji: ACTIVITY_DESCRIPTIONS[activityType]?.emoji || '📌'
    };

    const docRef = await addDoc(collection(db, 'activityLogs'), activityData);
    
    console.log('✅ Actividad registrada:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error registrando actividad:', error);
    return null;
  }
};

/**
 * Obtiene el log de actividades para un artista
 */
export const getActivityLog = async (artistId, limitCount = 50) => {
  try {
    console.log('📖 Obteniendo log de actividades:', { artistId, limitCount });
    
    if (!artistId) {
      console.warn('⚠️ No se proporcionó artistId');
      return [];
    }

    const q = query(
      collection(db, 'activityLogs'),
      where('artistId', '==', artistId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir timestamp a Date si es necesario
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));

    console.log('✅ Actividades obtenidas:', activities.length);
    return activities;
    
  } catch (error) {
    console.error('❌ Error obteniendo actividades:', error);
    return [];
  }
};

/**
 * Obtiene actividades filtradas por tipo o categoría
 */
export const getFilteredActivityLog = async (artistId, filters = {}) => {
  try {
    const { type, category, userId, limitCount = 50 } = filters;
    
    let q = query(
      collection(db, 'activityLogs'),
      where('artistId', '==', artistId)
    );

    // Añadir filtros adicionales
    if (type) {
      q = query(q, where('type', '==', type));
    }
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }

    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));

    return activities;
    
  } catch (error) {
    console.error('❌ Error obteniendo actividades filtradas:', error);
    return [];
  }
};

/**
 * Formatea el mensaje de una actividad usando su template
 */
export const formatActivityMessage = (activity) => {
  const description = ACTIVITY_DESCRIPTIONS[activity.type];
  
  if (!description) {
    return `Actividad: ${activity.type}`;
  }

  let message = description.template;
  
  // Reemplazar placeholders con datos reales
  if (activity.metadata) {
    Object.keys(activity.metadata).forEach(key => {
      const placeholder = `{${key}}`;
      if (message.includes(placeholder)) {
        message = message.replace(placeholder, activity.metadata[key]);
      }
    });
  }

  return message;
};

/**
 * Helper para registrar actividades comunes del equipo
 */
export const logTeamActivity = {
  memberAdded: (userData, artistId, memberName, role) => 
    logActivity(ACTIVITY_TYPES.TEAM_MEMBER_ADDED, userData, artistId, { memberName, role }),
    
  memberRemoved: (userData, artistId, memberName) =>
    logActivity(ACTIVITY_TYPES.TEAM_MEMBER_REMOVED, userData, artistId, { memberName }),
    
  roleChanged: (userData, artistId, memberName, newRole) =>
    logActivity(ACTIVITY_TYPES.TEAM_ROLE_CHANGED, userData, artistId, { memberName, newRole })
};

/**
 * Helper para registrar actividades de proyectos
 */
export const logProjectActivity = {
  created: (userData, artistId, projectName) =>
    logActivity(ACTIVITY_TYPES.PROJECT_CREATED, userData, artistId, { projectName }),
    
  updated: (userData, artistId, projectName) =>
    logActivity(ACTIVITY_TYPES.PROJECT_UPDATED, userData, artistId, { projectName }),
    
  deleted: (userData, artistId, projectName) =>
    logActivity(ACTIVITY_TYPES.PROJECT_DELETED, userData, artistId, { projectName })
};

/**
 * Helper para registrar actividades de tareas
 */
export const logTaskActivity = {
  created: (userData, artistId, taskName) =>
    logActivity(ACTIVITY_TYPES.TASK_CREATED, userData, artistId, { taskName }),
    
  updated: (userData, artistId, taskName) =>
    logActivity(ACTIVITY_TYPES.TASK_UPDATED, userData, artistId, { taskName }),
    
  completed: (userData, artistId, taskName) =>
    logActivity(ACTIVITY_TYPES.TASK_COMPLETED, userData, artistId, { taskName }),
    
  deleted: (userData, artistId, taskName) =>
    logActivity(ACTIVITY_TYPES.TASK_DELETED, userData, artistId, { taskName })
};
