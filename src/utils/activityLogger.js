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
  PROJECT_STATUS_CHANGED: 'project_status_changed',
  
  // Tareas
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_ASSIGNED: 'task_assigned',
  
  // Eventos
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_DELETED: 'event_deleted',
  EVENT_PUBLISHED: 'event_published',
  
  // Blog/Comunicados
  BLOG_POST_CREATED: 'blog_post_created',
  BLOG_POST_UPDATED: 'blog_post_updated',
  BLOG_POST_DELETED: 'blog_post_deleted',
  BLOG_POST_PUBLISHED: 'blog_post_published',
  
  // EPK (Electronic Press Kit)
  EPK_CREATED: 'epk_created',
  EPK_UPDATED: 'epk_updated',
  EPK_DELETED: 'epk_deleted',
  
  // Notas
  NOTE_CREATED: 'note_created',
  NOTE_UPDATED: 'note_updated',
  NOTE_DELETED: 'note_deleted',
  
  // Análisis/RRSS
  SOCIAL_MEDIA_CONNECTED: 'social_media_connected',
  SOCIAL_MEDIA_DISCONNECTED: 'social_media_disconnected',
  ANALYTICS_REPORT_GENERATED: 'analytics_report_generated',
  
  // Kanban
  KANBAN_BOARD_CREATED: 'kanban_board_created',
  KANBAN_BOARD_UPDATED: 'kanban_board_updated',
  KANBAN_CARD_CREATED: 'kanban_card_created',
  KANBAN_CARD_MOVED: 'kanban_card_moved',
  KANBAN_CARD_UPDATED: 'kanban_card_updated',
  KANBAN_CARD_DELETED: 'kanban_card_deleted',
  
  // Solicitudes
  ACCESS_REQUEST_CREATED: 'access_request_created',
  ACCESS_REQUEST_APPROVED: 'access_request_approved',
  ACCESS_REQUEST_REJECTED: 'access_request_rejected',
  
  // Configuración
  SETTINGS_UPDATED: 'settings_updated',
  PERMISSIONS_UPDATED: 'permissions_updated',
  PROFILE_UPDATED: 'profile_updated',
  
  // Archivos/Media
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',
  
  // Sistema
  LOGIN: 'login',
  LOGOUT: 'logout'
};

// Descripciones y emojis para cada tipo de actividad
export const ACTIVITY_DESCRIPTIONS = {
  // Equipo
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

  // Proyectos
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
  [ACTIVITY_TYPES.PROJECT_STATUS_CHANGED]: {
    emoji: '🔄',
    template: 'Se cambió el estado del proyecto "{projectName}" a {newStatus}',
    category: 'Proyectos'
  },

  // Tareas
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
  [ACTIVITY_TYPES.TASK_STATUS_CHANGED]: {
    emoji: '🔄',
    template: 'Se cambió el estado de la tarea "{taskName}" a {newStatus}',
    category: 'Tareas'
  },
  [ACTIVITY_TYPES.TASK_ASSIGNED]: {
    emoji: '👤',
    template: 'Se asignó la tarea "{taskName}" a {assignedTo}',
    category: 'Tareas'
  },

  // Eventos
  [ACTIVITY_TYPES.EVENT_CREATED]: {
    emoji: '🎪',
    template: 'Se creó el evento "{eventName}"',
    category: 'Eventos'
  },
  [ACTIVITY_TYPES.EVENT_UPDATED]: {
    emoji: '📝',
    template: 'Se actualizó el evento "{eventName}"',
    category: 'Eventos'
  },
  [ACTIVITY_TYPES.EVENT_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó el evento "{eventName}"',
    category: 'Eventos'
  },
  [ACTIVITY_TYPES.EVENT_PUBLISHED]: {
    emoji: '🎉',
    template: 'Se publicó el evento "{eventName}"',
    category: 'Eventos'
  },

  // Blog/Comunicados
  [ACTIVITY_TYPES.BLOG_POST_CREATED]: {
    emoji: '📄',
    template: 'Se creó el artículo "{postTitle}"',
    category: 'Blog'
  },
  [ACTIVITY_TYPES.BLOG_POST_UPDATED]: {
    emoji: '✏️',
    template: 'Se actualizó el artículo "{postTitle}"',
    category: 'Blog'
  },
  [ACTIVITY_TYPES.BLOG_POST_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó el artículo "{postTitle}"',
    category: 'Blog'
  },
  [ACTIVITY_TYPES.BLOG_POST_PUBLISHED]: {
    emoji: '📢',
    template: 'Se publicó el artículo "{postTitle}"',
    category: 'Blog'
  },

  // EPK
  [ACTIVITY_TYPES.EPK_CREATED]: {
    emoji: '📦',
    template: 'Se creó el EPK "{epkName}"',
    category: 'EPK'
  },
  [ACTIVITY_TYPES.EPK_UPDATED]: {
    emoji: '📝',
    template: 'Se actualizó el EPK "{epkName}"',
    category: 'EPK'
  },
  [ACTIVITY_TYPES.EPK_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó el EPK "{epkName}"',
    category: 'EPK'
  },

  // Notas
  [ACTIVITY_TYPES.NOTE_CREATED]: {
    emoji: '📝',
    template: 'Se creó la nota "{noteTitle}"',
    category: 'Notas'
  },
  [ACTIVITY_TYPES.NOTE_UPDATED]: {
    emoji: '✏️',
    template: 'Se actualizó la nota "{noteTitle}"',
    category: 'Notas'
  },
  [ACTIVITY_TYPES.NOTE_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó la nota "{noteTitle}"',
    category: 'Notas'
  },

  // Redes Sociales y Análisis
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
  [ACTIVITY_TYPES.ANALYTICS_REPORT_GENERATED]: {
    emoji: '📊',
    template: 'Se generó un reporte de análisis para {platform}',
    category: 'Análisis'
  },

  // Kanban
  [ACTIVITY_TYPES.KANBAN_BOARD_CREATED]: {
    emoji: '📋',
    template: 'Se creó el tablero Kanban "{boardName}"',
    category: 'Kanban'
  },
  [ACTIVITY_TYPES.KANBAN_BOARD_UPDATED]: {
    emoji: '📝',
    template: 'Se actualizó el tablero Kanban "{boardName}"',
    category: 'Kanban'
  },
  [ACTIVITY_TYPES.KANBAN_CARD_CREATED]: {
    emoji: '🗃️',
    template: 'Se creó la tarjeta "{cardTitle}" en {columnName}',
    category: 'Kanban'
  },
  [ACTIVITY_TYPES.KANBAN_CARD_MOVED]: {
    emoji: '↔️',
    template: 'Se movió la tarjeta "{cardTitle}" de {fromColumn} a {toColumn}',
    category: 'Kanban'
  },
  [ACTIVITY_TYPES.KANBAN_CARD_UPDATED]: {
    emoji: '✏️',
    template: 'Se actualizó la tarjeta "{cardTitle}"',
    category: 'Kanban'
  },
  [ACTIVITY_TYPES.KANBAN_CARD_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó la tarjeta "{cardTitle}"',
    category: 'Kanban'
  },

  // Solicitudes
  [ACTIVITY_TYPES.ACCESS_REQUEST_CREATED]: {
    emoji: '📝',
    template: 'Se creó una solicitud de acceso para {userEmail}',
    category: 'Acceso'
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

  // Configuración
  [ACTIVITY_TYPES.SETTINGS_UPDATED]: {
    emoji: '⚙️',
    template: 'Se actualizó la configuración',
    category: 'Configuración'
  },
  [ACTIVITY_TYPES.PERMISSIONS_UPDATED]: {
    emoji: '🔐',
    template: 'Se actualizaron los permisos de {targetUser}',
    category: 'Configuración'
  },
  [ACTIVITY_TYPES.PROFILE_UPDATED]: {
    emoji: '👤',
    template: 'Se actualizó el perfil',
    category: 'Configuración'
  },

  // Archivos
  [ACTIVITY_TYPES.FILE_UPLOADED]: {
    emoji: '📎',
    template: 'Se subió el archivo "{fileName}"',
    category: 'Archivos'
  },
  [ACTIVITY_TYPES.FILE_DELETED]: {
    emoji: '🗑️',
    template: 'Se eliminó el archivo "{fileName}"',
    category: 'Archivos'
  },

  // Sistema
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

    // Usar la consulta más simple posible - solo filtro por artistId
    const q = query(
      collection(db, 'activityLogs'),
      where('artistId', '==', artistId)
    );

    console.log('🔍 Ejecutando consulta simple a Firebase...');
    const querySnapshot = await getDocs(q);
    
    let activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir timestamp a Date si es necesario
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));

    console.log(`📊 Documentos obtenidos de Firebase: ${activities.length}`);

    // Ordenar por fecha en el cliente (más recientes primero)
    activities.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Aplicar límite en el cliente
    const limitedActivities = activities.slice(0, limitCount);

    console.log(`✅ Actividades finales: ${limitedActivities.length} (limitadas de ${activities.length})`);
    return limitedActivities;
    
  } catch (error) {
    console.error('❌ Error obteniendo actividades:', error);
    console.error('Error details:', error.message);
    
    // Si incluso la consulta más simple falla, devolver array vacío
    return [];
  }
};

/**
 * Obtiene actividades filtradas por tipo o categoría
 * Usa filtrado en el cliente para evitar problemas de índices
 */
export const getFilteredActivityLog = async (artistId, filters = {}) => {
  try {
    const { type, category, userId, limitCount = 50 } = filters;
    
    // Obtener todas las actividades del artista
    const allActivities = await getActivityLog(artistId, 200); // Obtener más para filtrar
    
    // Filtrar en el cliente
    let filteredActivities = allActivities;
    
    if (type) {
      filteredActivities = filteredActivities.filter(activity => activity.type === type);
    }
    
    if (category) {
      filteredActivities = filteredActivities.filter(activity => activity.category === category);
    }
    
    if (userId) {
      filteredActivities = filteredActivities.filter(activity => activity.userId === userId);
    }

    // Limitar resultados
    return filteredActivities.slice(0, limitCount);
    
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

/**
 * Helper para registrar actividades de eventos
 */
export const logEventActivity = {
  created: (userData, artistId, eventName) =>
    logActivity(ACTIVITY_TYPES.EVENT_CREATED, userData, artistId, { eventName }),
    
  updated: (userData, artistId, eventName) =>
    logActivity(ACTIVITY_TYPES.EVENT_UPDATED, userData, artistId, { eventName }),
    
  deleted: (userData, artistId, eventName) =>
    logActivity(ACTIVITY_TYPES.EVENT_DELETED, userData, artistId, { eventName }),
    
  published: (userData, artistId, eventName) =>
    logActivity(ACTIVITY_TYPES.EVENT_PUBLISHED, userData, artistId, { eventName })
};

/**
 * Helper para registrar actividades de blog/comunicados
 */
export const logBlogActivity = {
  created: (userData, artistId, postTitle) =>
    logActivity(ACTIVITY_TYPES.BLOG_POST_CREATED, userData, artistId, { postTitle }),
    
  updated: (userData, artistId, postTitle) =>
    logActivity(ACTIVITY_TYPES.BLOG_POST_UPDATED, userData, artistId, { postTitle }),
    
  deleted: (userData, artistId, postTitle) =>
    logActivity(ACTIVITY_TYPES.BLOG_POST_DELETED, userData, artistId, { postTitle }),
    
  published: (userData, artistId, postTitle) =>
    logActivity(ACTIVITY_TYPES.BLOG_POST_PUBLISHED, userData, artistId, { postTitle })
};

/**
 * Helper para registrar actividades de EPK
 */
export const logEPKActivity = {
  created: (userData, artistId, epkName) =>
    logActivity(ACTIVITY_TYPES.EPK_CREATED, userData, artistId, { epkName }),
    
  updated: (userData, artistId, epkName) =>
    logActivity(ACTIVITY_TYPES.EPK_UPDATED, userData, artistId, { epkName }),
    
  deleted: (userData, artistId, epkName) =>
    logActivity(ACTIVITY_TYPES.EPK_DELETED, userData, artistId, { epkName })
};

/**
 * Helper para registrar actividades de notas
 */
export const logNoteActivity = {
  created: (userData, artistId, noteTitle) =>
    logActivity(ACTIVITY_TYPES.NOTE_CREATED, userData, artistId, { noteTitle }),
    
  updated: (userData, artistId, noteTitle) =>
    logActivity(ACTIVITY_TYPES.NOTE_UPDATED, userData, artistId, { noteTitle }),
    
  deleted: (userData, artistId, noteTitle) =>
    logActivity(ACTIVITY_TYPES.NOTE_DELETED, userData, artistId, { noteTitle })
};

/**
 * Helper para registrar actividades de Kanban
 */
export const logKanbanActivity = {
  boardCreated: (userData, artistId, boardName) =>
    logActivity(ACTIVITY_TYPES.KANBAN_BOARD_CREATED, userData, artistId, { boardName }),
    
  boardUpdated: (userData, artistId, boardName) =>
    logActivity(ACTIVITY_TYPES.KANBAN_BOARD_UPDATED, userData, artistId, { boardName }),
    
  cardCreated: (userData, artistId, cardTitle, columnName) =>
    logActivity(ACTIVITY_TYPES.KANBAN_CARD_CREATED, userData, artistId, { cardTitle, columnName }),
    
  cardMoved: (userData, artistId, cardTitle, fromColumn, toColumn) =>
    logActivity(ACTIVITY_TYPES.KANBAN_CARD_MOVED, userData, artistId, { cardTitle, fromColumn, toColumn }),
    
  cardUpdated: (userData, artistId, cardTitle) =>
    logActivity(ACTIVITY_TYPES.KANBAN_CARD_UPDATED, userData, artistId, { cardTitle }),
    
  cardDeleted: (userData, artistId, cardTitle) =>
    logActivity(ACTIVITY_TYPES.KANBAN_CARD_DELETED, userData, artistId, { cardTitle })
};

/**
 * Helper para registrar actividades de acceso
 */
export const logAccessActivity = {
  requestCreated: (userData, artistId, userEmail) =>
    logActivity(ACTIVITY_TYPES.ACCESS_REQUEST_CREATED, userData, artistId, { userEmail }),
    
  requestApproved: (userData, artistId, userEmail) =>
    logActivity(ACTIVITY_TYPES.ACCESS_REQUEST_APPROVED, userData, artistId, { userEmail }),
    
  requestRejected: (userData, artistId, userEmail) =>
    logActivity(ACTIVITY_TYPES.ACCESS_REQUEST_REJECTED, userData, artistId, { userEmail })
};

/**
 * Helper para registrar actividades de configuración
 */
export const logConfigActivity = {
  settingsUpdated: (userData, artistId) =>
    logActivity(ACTIVITY_TYPES.SETTINGS_UPDATED, userData, artistId, {}),
    
  permissionsUpdated: (userData, artistId, targetUser) =>
    logActivity(ACTIVITY_TYPES.PERMISSIONS_UPDATED, userData, artistId, { targetUser }),
    
  profileUpdated: (userData, artistId) =>
    logActivity(ACTIVITY_TYPES.PROFILE_UPDATED, userData, artistId, {})
};

/**
 * Helper para registrar actividades de archivos
 */
export const logFileActivity = {
  uploaded: (userData, artistId, fileName) =>
    logActivity(ACTIVITY_TYPES.FILE_UPLOADED, userData, artistId, { fileName }),
    
  deleted: (userData, artistId, fileName) =>
    logActivity(ACTIVITY_TYPES.FILE_DELETED, userData, artistId, { fileName })
};

/**
 * Helper para registrar actividades de redes sociales
 */
export const logSocialMediaActivity = {
  connected: (userData, artistId, platform) =>
    logActivity(ACTIVITY_TYPES.SOCIAL_MEDIA_CONNECTED, userData, artistId, { platform }),
    
  disconnected: (userData, artistId, platform) =>
    logActivity(ACTIVITY_TYPES.SOCIAL_MEDIA_DISCONNECTED, userData, artistId, { platform }),
    
  reportGenerated: (userData, artistId, platform) =>
    logActivity(ACTIVITY_TYPES.ANALYTICS_REPORT_GENERATED, userData, artistId, { platform })
};

/**
 * Helper para registrar actividades del sistema
 */
export const logSystemActivity = {
  login: (userData, artistId) =>
    logActivity(ACTIVITY_TYPES.LOGIN, userData, artistId, {}),
    
  logout: (userData, artistId) =>
    logActivity(ACTIVITY_TYPES.LOGOUT, userData, artistId, {})
};

/**
 * Helper para generar actividades de ejemplo con los nuevos tipos
 */
export const generateSampleActivities = async (userData, artistId) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ generateSampleActivities solo funciona en desarrollo');
    return;
  }

  const activities = [
    // Proyectos
    logProjectActivity.created(userData, artistId, "Nuevo Álbum 2024"),
    logProjectActivity.updated(userData, artistId, "Gira Nacional"),
    
    // Tareas
    logTaskActivity.created(userData, artistId, "Diseñar portada del álbum"),
    logTaskActivity.completed(userData, artistId, "Masterizar track principal"),
    
    // Eventos
    logEventActivity.created(userData, artistId, "Concierto Madrid"),
    logEventActivity.published(userData, artistId, "Lanzamiento de single"),
    
    // Blog
    logBlogActivity.created(userData, artistId, "Behind the scenes del nuevo video"),
    logBlogActivity.published(userData, artistId, "Anuncio de nueva gira"),
    
    // Notas
    logNoteActivity.created(userData, artistId, "Ideas para próximo álbum"),
    logNoteActivity.updated(userData, artistId, "Contactos de medios"),
    
    // Kanban
    logKanbanActivity.cardCreated(userData, artistId, "Grabar voces", "En Proceso"),
    logKanbanActivity.cardMoved(userData, artistId, "Mezcla final", "En Proceso", "Completado"),
    
    // Archivos
    logFileActivity.uploaded(userData, artistId, "demo_track_01.mp3"),
    logFileActivity.uploaded(userData, artistId, "press_photo_hq.jpg"),
    
    // Redes sociales
    logSocialMediaActivity.connected(userData, artistId, "Instagram"),
    logSocialMediaActivity.reportGenerated(userData, artistId, "Spotify")
  ];

  console.log('🎯 Generando actividades de ejemplo...');
  
  // Ejecutar todas las actividades
  await Promise.all(activities);
  
  console.log('✅ Actividades de ejemplo generadas');
};
