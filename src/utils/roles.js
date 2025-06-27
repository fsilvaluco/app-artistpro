// Definición de roles del sistema
export const ROLES = {
  SUPER_ADMIN: 'super_admin',        // Acceso total al sistema
  ARTIST_ADMIN: 'artist_admin',      // Administrador del artista
  MANAGER: 'manager',                // Manager del artista
  AGENT: 'agent',                    // Agente de booking/shows
  MARKETING: 'marketing',            // Especialista en marketing
  PRESS: 'press',                    // Relaciones públicas/prensa
  EDITOR: 'editor',                  // Editor de contenido
  VIEWER: 'viewer'                   // Solo lectura
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

// Configuración de permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // Acceso total a todo
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.ARTIST_ADMIN]: [
    // Casi todo excepto super admin functions
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
  
  [ROLES.MANAGER]: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_EDIT,
    PERMISSIONS.TEAM_INVITE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.BLOG_PUBLISH,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.EPK_EDIT,
    PERMISSIONS.EPK_EXPORT,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT
  ],
  
  [ROLES.AGENT]: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT
  ],
  
  [ROLES.MARKETING]: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.BLOG_PUBLISH,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.EPK_EDIT,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT
  ],
  
  [ROLES.PRESS]: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.EPK_EDIT,
    PERMISSIONS.EPK_EXPORT,
    PERMISSIONS.NOTES_VIEW,
    PERMISSIONS.NOTES_CREATE,
    PERMISSIONS.NOTES_EDIT
  ],
  
  [ROLES.EDITOR]: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
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
  
  [ROLES.VIEWER]: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.EPK_VIEW,
    PERMISSIONS.NOTES_VIEW
  ]
};

// Labels legibles para los roles
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrador',
  [ROLES.ARTIST_ADMIN]: 'Administrador del Artista',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.AGENT]: 'Agente',
  [ROLES.MARKETING]: 'Marketing',
  [ROLES.PRESS]: 'Prensa',
  [ROLES.EDITOR]: 'Editor',
  [ROLES.VIEWER]: 'Visualizador'
};

// Descripciones de los roles
export const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: 'Acceso completo al sistema y todos los artistas',
  [ROLES.ARTIST_ADMIN]: 'Control total sobre el artista y su equipo',
  [ROLES.MANAGER]: 'Gestión de proyectos, equipo y estrategia general',
  [ROLES.AGENT]: 'Enfocado en booking, shows y eventos',
  [ROLES.MARKETING]: 'Campañas, promoción y análisis de marketing',
  [ROLES.PRESS]: 'Relaciones públicas, comunicados y EPK',
  [ROLES.EDITOR]: 'Creación y edición de contenido',
  [ROLES.VIEWER]: 'Solo lectura, sin permisos de edición'
};

// Colores para los roles (para UI)
export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: '#8b5cf6',     // Púrpura
  [ROLES.ARTIST_ADMIN]: '#ef4444',    // Rojo
  [ROLES.MANAGER]: '#f59e0b',         // Amarillo
  [ROLES.AGENT]: '#10b981',           // Verde
  [ROLES.MARKETING]: '#3b82f6',       // Azul
  [ROLES.PRESS]: '#ec4899',           // Rosa
  [ROLES.EDITOR]: '#06b6d4',          // Cian
  [ROLES.VIEWER]: '#6b7280'           // Gris
};

// Función para verificar si un rol tiene un permiso específico
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Función para verificar múltiples permisos (AND)
export const hasAllPermissions = (userRole, permissions) => {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Función para verificar al menos uno de varios permisos (OR)
export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Función para obtener todos los permisos de un rol
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Función para verificar si un rol es administrativo
export const isAdminRole = (role) => {
  return [ROLES.SUPER_ADMIN, ROLES.ARTIST_ADMIN].includes(role);
};

// Función para obtener roles disponibles para asignar (según el rol del usuario actual)
export const getAssignableRoles = (currentUserRole) => {
  switch (currentUserRole) {
    case ROLES.SUPER_ADMIN:
      return Object.values(ROLES); // Puede asignar cualquier rol
      
    case ROLES.ARTIST_ADMIN:
      return [
        ROLES.MANAGER,
        ROLES.AGENT,
        ROLES.MARKETING,
        ROLES.PRESS,
        ROLES.EDITOR,
        ROLES.VIEWER
      ]; // No puede crear otros admins
      
    default:
      return []; // Otros roles no pueden asignar roles
  }
};
