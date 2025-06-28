// Definición de roles/funciones en el equipo
export const ROLES = {
  MANAGER: 'manager',                // Manager del artista
  AGENT: 'agent',                    // Agente de booking/shows
  MARKETING: 'marketing',            // Especialista en marketing
  PRESS: 'press',                    // Relaciones públicas/prensa
  PRODUCER: 'producer',              // Productor musical
  SOUND_ENGINEER: 'sound_engineer',  // Ingeniero de sonido
  MUSICIAN: 'musician',              // Músico
  PHOTOGRAPHER: 'photographer',      // Fotógrafo
  VIDEOGRAPHER: 'videographer',      // Videoógrafo
  DESIGNER: 'designer',              // Diseñador gráfico
  SOCIAL_MEDIA: 'social_media',      // Community manager
  BOOKING: 'booking',                // Booking agent
  OTHER: 'other',                    // Otro rol
  VIEWER: 'lector'                   // Alias para nivel básico de lectura
};

// Definición de niveles de acceso/permisos
export const ACCESS_LEVELS = {
  SUPER_ADMIN: 'super_admin',        // Acceso total al sistema
  ADMINISTRADOR: 'administrador',    // Administrador del artista
  EDITOR: 'editor',                  // Editor con permisos limitados
  LECTOR: 'lector',                  // Solo lectura
  VIEWER: 'lector'                   // Alias para LECTOR (retrocompatibilidad)
};

// Permisos por módulo
export const PERMISSIONS = {
  // Gestión de usuarios y equipo
  TEAM_VIEW: 'team.view',
  TEAM_EDIT: 'team.edit',
  TEAM_DELETE: 'team.delete',
  TEAM_INVITE: 'team.invite',
  
  // Proyectos y tareas
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_EDIT: 'projects.edit',
  PROJECTS_DELETE: 'projects.delete',
  
  // Análisis y métricas
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // Comunicados y blog
  BLOG_VIEW: 'blog.view',
  BLOG_CREATE: 'blog.create',
  BLOG_EDIT: 'blog.edit',
  BLOG_DELETE: 'blog.delete',
  BLOG_PUBLISH: 'blog.publish',
  
  // EPK (Electronic Press Kit)
  EPK_VIEW: 'epk.view',
  EPK_EDIT: 'epk.edit',
  EPK_EXPORT: 'epk.export',
  
  // Administración del sistema
  ADMIN_USERS: 'admin.users',
  ADMIN_REQUESTS: 'admin.requests',
  ADMIN_SETTINGS: 'admin.settings',
  
  // Notas y documentos
  NOTES_VIEW: 'notes.view',
  NOTES_CREATE: 'notes.create',
  NOTES_EDIT: 'notes.edit',
  NOTES_DELETE: 'notes.delete'
};

// Configuración de permisos por nivel de acceso
export const ACCESS_LEVEL_PERMISSIONS = {
  [ACCESS_LEVELS.SUPER_ADMIN]: [
    // Acceso total a todo
    ...Object.values(PERMISSIONS)
  ],
  
  [ACCESS_LEVELS.ADMINISTRADOR]: [
    // Los administradores pueden agregar, actualizar y eliminar miembros del equipo, 
    // información de la facturación e información del artista
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_EDIT,
    PERMISSIONS.TEAM_DELETE,
    PERMISSIONS.TEAM_INVITE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.BLOG_DELETE,
    PERMISSIONS.BLOG_PUBLISH,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.EPK_EDIT,
    PERMISSIONS.EPK_EXPORT,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_REQUESTS,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT,
    PERMISSIONS.NOTES_DELETE
  ],
  
  [ACCESS_LEVELS.EDITOR]: [
    // Los editores pueden agregar, actualizar y eliminar información, 
    // presentaciones para consideración editorial y campañas de los artistas
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.EPK_EDIT,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT
  ],
  
  [ACCESS_LEVELS.LECTOR]: [
    // Solo lectura
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.NOTES_VIEW
  ]
};

// Labels legibles para los roles/funciones
export const ROLE_LABELS = {
  [ROLES.MANAGER]: 'Manager',
  [ROLES.AGENT]: 'Agente',
  [ROLES.MARKETING]: 'Marketing',
  [ROLES.PRESS]: 'Prensa',
  [ROLES.PRODUCER]: 'Productor',
  [ROLES.SOUND_ENGINEER]: 'Ingeniero de Sonido',
  [ROLES.MUSICIAN]: 'Músico',
  [ROLES.PHOTOGRAPHER]: 'Fotógrafo',
  [ROLES.VIDEOGRAPHER]: 'Videoógrafo',
  [ROLES.DESIGNER]: 'Diseñador',
  [ROLES.SOCIAL_MEDIA]: 'Community Manager',
  [ROLES.BOOKING]: 'Booking Agent',
  [ROLES.OTHER]: 'Otro',
  [ROLES.VIEWER]: 'Lector'
};

// Labels legibles para los niveles de acceso
export const ACCESS_LEVEL_LABELS = {
  [ACCESS_LEVELS.SUPER_ADMIN]: 'Super Administrador',
  [ACCESS_LEVELS.ADMINISTRADOR]: 'Administrador',
  [ACCESS_LEVELS.EDITOR]: 'Editor',
  [ACCESS_LEVELS.LECTOR]: 'Lector'
};

// Descripciones de los roles/funciones
export const ROLE_DESCRIPTIONS = {
  [ROLES.MANAGER]: 'Gestión general del artista y coordinación del equipo',
  [ROLES.AGENT]: 'Representación y negociación de contratos',
  [ROLES.MARKETING]: 'Estrategias de promoción y marketing digital',
  [ROLES.PRESS]: 'Relaciones públicas y medios de comunicación',
  [ROLES.PRODUCER]: 'Producción musical y dirección artística',
  [ROLES.SOUND_ENGINEER]: 'Grabación, mezcla y masterización',
  [ROLES.MUSICIAN]: 'Interpretación y composición musical',
  [ROLES.PHOTOGRAPHER]: 'Fotografía artística y promocional',
  [ROLES.VIDEOGRAPHER]: 'Producción audiovisual y videoclips',
  [ROLES.DESIGNER]: 'Diseño gráfico y material promocional',
  [ROLES.SOCIAL_MEDIA]: 'Gestión de redes sociales y comunidad',
  [ROLES.BOOKING]: 'Gestión de shows y eventos en vivo',
  [ROLES.OTHER]: 'Función especializada no listada',
  [ROLES.VIEWER]: 'Solo puede ver la información, sin permisos de edición'
};

// Descripciones de los niveles de acceso
export const ACCESS_LEVEL_DESCRIPTIONS = {
  [ACCESS_LEVELS.SUPER_ADMIN]: 'Acceso completo al sistema y todos los artistas',
  [ACCESS_LEVELS.ADMINISTRADOR]: 'Puede agregar, actualizar y eliminar miembros del equipo, información de facturación e información del artista',
  [ACCESS_LEVELS.EDITOR]: 'Puede agregar, actualizar y eliminar información, presentaciones para consideración editorial y campañas de los artistas',
  [ACCESS_LEVELS.LECTOR]: 'Solo puede ver la información, sin permisos de edición'
};

// Colores para los roles/funciones (para UI)
export const ROLE_COLORS = {
  [ROLES.MANAGER]: '#f59e0b',         // Amarillo
  [ROLES.AGENT]: '#10b981',           // Verde
  [ROLES.MARKETING]: '#3b82f6',       // Azul
  [ROLES.PRESS]: '#ec4899',           // Rosa
  [ROLES.PRODUCER]: '#8b5cf6',        // Púrpura
  [ROLES.SOUND_ENGINEER]: '#06b6d4',  // Cian
  [ROLES.MUSICIAN]: '#ef4444',        // Rojo
  [ROLES.PHOTOGRAPHER]: '#f97316',    // Naranja
  [ROLES.VIDEOGRAPHER]: '#84cc16',    // Lima
  [ROLES.DESIGNER]: '#a855f7',        // Violeta
  [ROLES.SOCIAL_MEDIA]: '#14b8a6',    // Teal
  [ROLES.BOOKING]: '#22c55e',         // Verde claro
  [ROLES.OTHER]: '#6b7280',           // Gris
  [ROLES.VIEWER]: '#6b7280'           // Gris
};

// Colores para los niveles de acceso (para UI)
export const ACCESS_LEVEL_COLORS = {
  [ACCESS_LEVELS.SUPER_ADMIN]: '#8b5cf6',     // Púrpura
  [ACCESS_LEVELS.ADMINISTRADOR]: '#ef4444',    // Rojo
  [ACCESS_LEVELS.EDITOR]: '#f59e0b',          // Amarillo
  [ACCESS_LEVELS.LECTOR]: '#6b7280'           // Gris
};

// Función para verificar si un nivel de acceso tiene un permiso específico
export const hasPermission = (userAccessLevel, permission) => {
  if (!userAccessLevel || !permission) {
    console.log(`❌ hasPermission: Parámetros inválidos - AccessLevel: ${userAccessLevel}, Permission: ${permission}`);
    return false;
  }
  
  const accessLevelPermissions = ACCESS_LEVEL_PERMISSIONS[userAccessLevel] || [];
  const hasAccess = accessLevelPermissions.includes(permission);
  
  console.log(`🔍 hasPermission - AccessLevel: ${userAccessLevel}, Permission: ${permission}, HasAccess: ${hasAccess}`);
  if (userAccessLevel === ACCESS_LEVELS.SUPER_ADMIN) {
    console.log(`🦾 SUPER_ADMIN permissions:`, accessLevelPermissions.slice(0, 5), '... (total:', accessLevelPermissions.length, ')');
  }
  
  return hasAccess;
};

// Función para verificar múltiples permisos (AND)
export const hasAllPermissions = (userAccessLevel, permissions) => {
  if (!userAccessLevel || !permissions || !Array.isArray(permissions)) return false;
  
  return permissions.every(permission => hasPermission(userAccessLevel, permission));
};

// Función para verificar al menos uno de varios permisos (OR)
export const hasAnyPermission = (userAccessLevel, permissions) => {
  if (!userAccessLevel || !permissions || !Array.isArray(permissions)) return false;
  
  return permissions.some(permission => hasPermission(userAccessLevel, permission));
};

// Función para obtener todos los permisos de un nivel de acceso
export const getAccessLevelPermissions = (accessLevel) => {
  return ACCESS_LEVEL_PERMISSIONS[accessLevel] || [];
};

// Función para verificar si un nivel de acceso es administrativo
export const isAdminAccessLevel = (accessLevel) => {
  return [ACCESS_LEVELS.SUPER_ADMIN, ACCESS_LEVELS.ADMINISTRADOR].includes(accessLevel);
};

// Función para obtener niveles de acceso disponibles para asignar (según el nivel del usuario actual)
export const getAssignableAccessLevels = (currentUserAccessLevel) => {
  switch (currentUserAccessLevel) {
    case ACCESS_LEVELS.SUPER_ADMIN:
      return Object.values(ACCESS_LEVELS); // Puede asignar cualquier nivel
      
    case ACCESS_LEVELS.ADMINISTRADOR:
      return [
        ACCESS_LEVELS.EDITOR,
        ACCESS_LEVELS.LECTOR
      ]; // No puede crear otros admins
      
    default:
      return []; // Otros niveles no pueden asignar niveles
  }
};

// Función para obtener roles disponibles (siempre disponibles para todos)
export const getAvailableRoles = () => {
  return Object.values(ROLES);
};

// Retrocompatibilidad: mantener algunas funciones con nombres antiguos
export const ROLE_PERMISSIONS = ACCESS_LEVEL_PERMISSIONS; // Para retrocompatibilidad
export const getRolePermissions = getAccessLevelPermissions; // Para retrocompatibilidad
export const isAdminRole = isAdminAccessLevel; // Para retrocompatibilidad
export const getAssignableRoles = getAssignableAccessLevels; // Para retrocompatibilidad
