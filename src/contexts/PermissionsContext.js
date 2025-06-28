"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "./SessionContext";
import { useArtist } from "./ArtistContext";
import { getUserRole } from "../utils/roleManagement";
import { hasPermission, hasAllPermissions, hasAnyPermission, isAdminAccessLevel, ACCESS_LEVELS, ACCESS_LEVEL_PERMISSIONS } from "../utils/roles";
import { isInitialAdmin, grantSuperAdminRole } from "../utils/artistRequests";

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
  const [userRole, setUserRole] = useState(null); // Rol en el equipo (manager, marketing, etc.)
  const [userAccessLevel, setUserAccessLevel] = useState(ACCESS_LEVELS.LECTOR); // Nivel de permisos
  const [loading, setLoading] = useState(true);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const { user } = useSession();
  const { selectedArtist } = useArtist();

  // Cargar rol y nivel de acceso del usuario para el artista seleccionado
  const loadUserRole = async () => {
    if (!user?.uid) {
      setUserRole(null);
      setUserAccessLevel(ACCESS_LEVELS.LECTOR);
      setLoading(false);
      setRoleLoaded(true);
      return;
    }

    try {
      setLoading(true);
      
      // Verificar si es administrador inicial PRIMERO
      if (isInitialAdmin(user.email)) {
        console.log("🔑 Usuario es administrador inicial, asignando Super Admin:", user.email);
        console.log("📧 Email verificado:", user.email);
        console.log("🔍 isInitialAdmin(user.email):", isInitialAdmin(user.email));
        setUserRole(null); // Los super admins no tienen rol específico
        setUserAccessLevel(ACCESS_LEVELS.SUPER_ADMIN);
        
        try {
          await grantSuperAdminRole(user.uid, user.email, user.displayName || 'Admin');
          console.log("✅ Super Admin asignado correctamente");
        } catch (error) {
          console.error("❌ Error asignando Super Admin:", error);
          // Continuar con el rol ya asignado
        }
        
        setRoleLoaded(true);
        setLoading(false);
        console.log("🦾 Super Admin configurado exitosamente, ACCESS_LEVEL:", ACCESS_LEVELS.SUPER_ADMIN);
        return; // Salir temprano para super admins
      } else {
        console.log("❌ Usuario NO es administrador inicial:", user.email);
        console.log("🔍 isInitialAdmin result:", isInitialAdmin(user.email));
      }
      
      // Si hay artista seleccionado, obtener rol y nivel de acceso específicos para usuarios normales
      if (selectedArtist?.id) {
        console.log("🔍 Cargando datos del usuario:", user.uid, "para artista:", selectedArtist.id);
        
        const userData = await getUserRole(user.uid, selectedArtist.id);
        console.log("👤 Datos obtenidos:", userData);
        
        // Separar rol y accessLevel (permisos)
        setUserRole(userData?.role || null);
        setUserAccessLevel(userData?.accessLevel || ACCESS_LEVELS.LECTOR);
      } else {
        // Si no hay artista seleccionado y no es admin inicial, usar lector
        setUserRole(null);
        setUserAccessLevel(ACCESS_LEVELS.LECTOR);
      }
      
      setRoleLoaded(true);
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      
      // Si es administrador inicial, asignar super admin como fallback
      if (isInitialAdmin(user.email)) {
        setUserRole(null);
        setUserAccessLevel(ACCESS_LEVELS.SUPER_ADMIN);
      } else {
        setUserRole(null);
        setUserAccessLevel(ACCESS_LEVELS.LECTOR); // Nivel por defecto en caso de error
      }
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
    const result = hasPermission(userAccessLevel, permission);
    console.log(`🔍 checkPermission - User: ${user?.email}, AccessLevel: ${userAccessLevel}, Permission: ${permission}, Result: ${result}`);
    
    // Debug adicional para administradores
    if (userAccessLevel === ACCESS_LEVELS.ADMINISTRADOR && !result) {
      console.log(`⚠️ PROBLEMA: Administrador sin permiso ${permission}`);
      console.log(`📋 Permisos de administrador:`, ACCESS_LEVEL_PERMISSIONS[ACCESS_LEVELS.ADMINISTRADOR]);
    }
    
    return result;
  };

  // Función para verificar múltiples permisos (AND)
  const checkAllPermissions = (permissions) => {
    return hasAllPermissions(userAccessLevel, permissions);
  };

  // Función para verificar al menos uno de varios permisos (OR)
  const checkAnyPermission = (permissions) => {
    return hasAnyPermission(userAccessLevel, permissions);
  };

  // Función para verificar si es administrador
  const isAdmin = () => {
    return isAdminAccessLevel(userAccessLevel);
  };

  // Función para verificar si es super administrador
  const isSuperAdmin = () => {
    const result = userAccessLevel === ACCESS_LEVELS.SUPER_ADMIN;
    console.log(`🦾 isSuperAdmin check - AccessLevel: ${userAccessLevel}, IsSuperAdmin: ${result}`);
    return result;
  };

  // Función para refrescar permisos
  const refreshPermissions = () => {
    loadUserRole();
  };

  const value = {
    userRole,
    userAccessLevel,
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
