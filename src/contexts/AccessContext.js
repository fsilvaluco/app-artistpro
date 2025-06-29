"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "./SessionContext";
import { getUserAccessibleArtists } from "../utils/artistRequests";
import { useRouter } from "next/navigation";

// Crear el contexto
const AccessContext = createContext(null);

// Hook personalizado para usar el contexto
export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess debe ser usado dentro de AccessProvider");
  }
  return context;
};

// Provider del contexto
export function AccessProvider({ children }) {
  const [accessibleArtists, setAccessibleArtists] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  
  const { user, isAuthenticated } = useSession();
  const router = useRouter();

  // Verificar acceso del usuario
  const checkUserAccess = async () => {
    if (!user?.uid) {
      setHasAccess(false);
      setAccessibleArtists([]);
      setLoading(false);
      setAccessChecked(true);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Verificando acceso para usuario:", user.uid, user.email);
      
      const accessible = await getUserAccessibleArtists(user.uid, user.email);
      console.log("🎭 Artistas accesibles:", accessible);
      
      setAccessibleArtists(accessible);
      setHasAccess(accessible.length > 0);
      setAccessChecked(true);
      
      // Si no tiene acceso a ningún artista y está en una ruta protegida, redirigir
      if (accessible.length === 0) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/solicitar-acceso', '/solicitud-acceso-flujo', '/', '/admin'];
        
        if (!publicPaths.includes(currentPath)) {
          console.log("❌ Usuario sin acceso, redirigiendo a solicitar-acceso desde:", currentPath);
          router.push('/solicitar-acceso');
        } else {
          console.log("✅ Usuario en ruta pública:", currentPath);
        }
      }
      
    } catch (error) {
      console.error("Error al verificar acceso:", error);
      setHasAccess(false);
      setAccessibleArtists([]);
      setAccessChecked(true);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar acceso
  const refreshAccess = () => {
    checkUserAccess();
  };

  // Verificar si tiene acceso a un artista específico
  const hasAccessToArtist = (artistId) => {
    return accessibleArtists.some(artist => artist.id === artistId);
  };

  // Obtener artista accesible por ID
  const getAccessibleArtist = (artistId) => {
    return accessibleArtists.find(artist => artist.id === artistId);
  };

  useEffect(() => {
    if (isAuthenticated()) {
      checkUserAccess();
    } else {
      setHasAccess(false);
      setAccessibleArtists([]);
      setLoading(false);
      setAccessChecked(true);
    }
    
    // Escuchar evento de logout
    const handleUserLogout = () => {
      console.log("🚪 Logout detectado en AccessContext, limpiando acceso");
      setHasAccess(false);
      setAccessibleArtists([]);
      setAccessChecked(false);
    };
    
    window.addEventListener('userLogout', handleUserLogout);
    
    return () => {
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, [user, isAuthenticated]);

  const value = {
    accessibleArtists,
    hasAccess,
    loading,
    accessChecked,
    checkUserAccess,
    refreshAccess,
    hasAccessToArtist,
    getAccessibleArtist
  };

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}
