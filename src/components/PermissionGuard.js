"use client";

import { usePermissions } from "../contexts/PermissionsContext";

export default function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false, 
  adminOnly = false,
  superAdminOnly = false,
  fallback = null,
  children 
}) {
  const { 
    checkPermission, 
    checkAllPermissions, 
    checkAnyPermission, 
    isAdmin, 
    isSuperAdmin, 
    loading,
    roleLoaded
  } = usePermissions();

  // Mostrar loading mientras se cargan los permisos
  if (loading || !roleLoaded) {
    return fallback || <div>Verificando permisos...</div>;
  }

  // Verificar super admin
  if (superAdminOnly && !isSuperAdmin()) {
    return fallback || <div>Acceso denegado: Se requieren permisos de super administrador</div>;
  }

  // Verificar admin
  if (adminOnly && !isAdmin()) {
    return fallback || <div>Acceso denegado: Se requieren permisos de administrador</div>;
  }

  // Verificar permiso único
  if (permission && !checkPermission(permission)) {
    return fallback || <div>Acceso denegado: Permiso insuficiente</div>;
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);
    
    if (!hasAccess) {
      return fallback || <div>Acceso denegado: Permisos insuficientes</div>;
    }
  }

  return children;
}
