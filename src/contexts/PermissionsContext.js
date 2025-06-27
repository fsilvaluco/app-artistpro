"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "./SessionContext";
import { useArtist } from "./ArtistContext";
import { getUserRole } from "../utils/roleManagement";
import { hasPermission, hasAllPermissions, hasAnyPermission, isAdminRole, ROLES } from "../utils/roles";

// Crear el contexto
const PermissionsContext = createContext(null);

// Hook personalizado para usar el contexto
export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions debe ser usado dentro de PermissionsProvider");
  }
  return context;
};

// Provider del contexto
export function PermissionsProvider({ children }) {
  const [userRole, setUserRole] = useState(ROLES.VIEWER);
  const [loading, setLoading] = useState(true);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const { user } = useSession();
  const { selectedArtist } = useArtist();

  // Cargar rol del usuario para el artista seleccionado
  const loadUserRole = async () => {
    if (!user?.uid || !selectedArtist?.id) {
      setUserRole(ROLES.VIEWER);
      setLoading(false);
      setRoleLoaded(true);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Cargando rol del usuario:", user.uid, "para artista:", selectedArtist.id);
      
      const role = await getUserRole(user.uid, selectedArtist.id);
      console.log("👤 Rol obtenido:", role);
      
      setUserRole(role);
      setRoleLoaded(true);
    } catch (error) {
      console.error("Error al cargar rol del usuario:", error);
      setUserRole(ROLES.VIEWER); // Rol por defecto en caso de error
      setRoleLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Recargar rol cuando cambie el usuario o artista
  useEffect(() => {
    loadUserRole();
  }, [user?.uid, selectedArtist?.id]);

  // Función para verificar un permiso específico
  const checkPermission = (permission) => {
    return hasPermission(userRole, permission);
  };

  // Función para verificar múltiples permisos (AND)
  const checkAllPermissions = (permissions) => {
    return hasAllPermissions(userRole, permissions);
  };

  // Función para verificar al menos uno de varios permisos (OR)
  const checkAnyPermission = (permissions) => {
    return hasAnyPermission(userRole, permissions);
  };

  // Función para verificar si es administrador
  const isAdmin = () => {
    return isAdminRole(userRole);
  };

  // Función para verificar si es super administrador
  const isSuperAdmin = () => {
    return userRole === ROLES.SUPER_ADMIN;
  };

  // Función para refrescar permisos
  const refreshPermissions = () => {
    loadUserRole();
  };

  const value = {
    userRole,
    loading,
    roleLoaded,
    checkPermission,
    checkAllPermissions,
    checkAnyPermission,
    isAdmin,
    isSuperAdmin,
    refreshPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}
