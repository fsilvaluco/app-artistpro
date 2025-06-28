"use client";

import { usePermissions } from "../contexts/PermissionsContext";

export default function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false, 
  adminOnly = false,
  superAdminOnly = false,
  fallback = null,
  showDisabled = false,
  disabledStyle = {},
  children 
}) {
  const { 
    checkPermission, 
    checkAllPermissions, 
    checkAnyPermission, 
    isAdmin, 
    isSuperAdmin, 
    loading,
    roleLoaded,
    userAccessLevel
  } = usePermissions();

  console.log(`🛡️ PermissionGuard - Email: ${userAccessLevel?.email}, AccessLevel: ${userAccessLevel}, Loading: ${loading}, RoleLoaded: ${roleLoaded}, IsSuperAdmin: ${isSuperAdmin()}, IsAdmin: ${isAdmin()}`);

  // Mostrar loading mientras se cargan los permisos
  if (loading || !roleLoaded) {
    console.log("⏳ PermissionGuard: Cargando permisos...");
    return fallback || <div>Verificando permisos...</div>;
  }

  // Los super admins tienen acceso automático a todo
  if (isSuperAdmin()) {
    console.log("🦾 PermissionGuard: Super Admin detectado, acceso garantizado");
    return children;
  }

  // Verificar super admin
  if (superAdminOnly && !isSuperAdmin()) {
    return fallback || <div>Acceso denegado: Se requieren permisos de super administrador</div>;
  }

  // Verificar admin
  if (adminOnly && !isAdmin()) {
    return fallback || <div>Acceso denegado: Se requieren permisos de administrador</div>;
  }

  // Función para aplicar estilos de deshabilitado
  const applyDisabledStyles = (element) => {
    if (!element || !element.props) return element;
    
    const defaultDisabledStyle = {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
      background: '#6b7280',
      color: '#9ca3af',
      ...disabledStyle
    };

    return {
      ...element,
      props: {
        ...element.props,
        disabled: true,
        style: {
          ...element.props.style,
          ...defaultDisabledStyle
        },
        onClick: undefined,
        onMouseOver: undefined,
        onMouseOut: undefined
      }
    };
  };

  // Verificar permiso único
  if (permission && !checkPermission(permission)) {
    if (showDisabled) {
      return applyDisabledStyles(children);
    }
    return fallback || <div>Acceso denegado: Permiso insuficiente</div>;
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);
    
    if (!hasAccess) {
      if (showDisabled) {
        return applyDisabledStyles(children);
      }
      return fallback || <div>Acceso denegado: Permisos insuficientes</div>;
    }
  }

  return children;
}
