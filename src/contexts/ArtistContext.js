"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../app/firebase";
import { useAccess } from "./AccessContext";
import { useSession } from "./SessionContext";

// Crear el contexto
const ArtistContext = createContext(null);

// Hook personalizado para usar el contexto
export const useArtist = () => {
  const context = useContext(ArtistContext);
  if (!context) {
    throw new Error("useArtist debe ser usado dentro de ArtistProvider");
  }
  return context;
};

// Provider del contexto
export function ArtistProvider({ children }) {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  const { accessibleArtists, hasAccess, loading: accessLoading, accessChecked } = useAccess();

  // Cargar artista seleccionado solo de los artistas accesibles
  const loadSelectedArtist = () => {
    if (!accessChecked || accessLoading || !hasAccess || accessibleArtists.length === 0) {
      setSelectedArtist(null);
      setLoading(false);
      return;
    }

    try {
      console.log("🎭 Cargando artista seleccionado de artistas accesibles:", accessibleArtists);
      
      // Recuperar artista seleccionado del localStorage
      const savedArtistId = localStorage.getItem('selectedArtistId');
      let artistToSelect = null;
      
      if (savedArtistId) {
        // Verificar que el artista guardado sea accesible
        artistToSelect = accessibleArtists.find(artist => artist.id === savedArtistId);
        console.log("🔍 Artista guardado encontrado y accesible:", artistToSelect);
      }
      
      // Si no hay artista guardado o no es accesible, seleccionar el primero
      if (!artistToSelect && accessibleArtists.length > 0) {
        artistToSelect = accessibleArtists[0];
        localStorage.setItem('selectedArtistId', artistToSelect.id);
        console.log("🎯 Seleccionando primer artista accesible:", artistToSelect);
      }
      
      setSelectedArtist(artistToSelect);
    } catch (error) {
      console.error("Error loading selected artist:", error);
      setSelectedArtist(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSelectedArtist();
    
    // Escuchar eventos de logout
    const handleUserLogout = () => {
      console.log("🚪 Logout detectado en ArtistContext, limpiando artista seleccionado");
      setSelectedArtist(null);
    };
    
    window.addEventListener('userLogout', handleUserLogout);
    
    return () => {
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, [accessibleArtists, hasAccess, accessChecked, accessLoading]);

  // Función para cambiar de artista (solo artistas accesibles)
  const selectArtist = (artist) => {
    // Verificar que el artista sea accesible
    const isAccessible = accessibleArtists.some(a => a.id === artist?.id);
    if (!isAccessible) {
      console.warn("⚠️ Intento de seleccionar artista no accesible:", artist);
      return;
    }
    
    console.log("🎨 Cambiando a artista:", artist?.name, "ID:", artist?.id);
    console.log("🎨 Artista anterior:", selectedArtist?.name, "ID:", selectedArtist?.id);
    
    setSelectedArtist(artist);
    if (artist && artist.id) {
      localStorage.setItem('selectedArtistId', artist.id);
      console.log("💾 Artista guardado en localStorage:", artist.id);
    }
    
    // Emitir evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('artistChanged', { 
      detail: { artistId: artist.id, artist } 
    }));
    console.log("📡 Evento artistChanged emitido");
  };

  // Función para obtener el artista actual
  const getCurrentArtist = () => {
    return selectedArtist;
  };

  // Función para obtener el ID del artista actual
  const getCurrentArtistId = () => {
    const id = selectedArtist?.id || null;
    console.log("🎯 getCurrentArtistId llamado, retornando:", id);
    return id;
  };

  // Función para obtener el nombre del artista actual
  const getCurrentArtistName = () => {
    return selectedArtist?.name || 'Sin artista seleccionado';
  };

  // Función para refrescar artistas accesibles
  const refreshArtists = () => {
    // Esto ahora se maneja a través del AccessContext
    console.log("🔄 Refresh de artistas - delegado al AccessContext");
  };

  const value = {
    artists: accessibleArtists, // Solo artistas accesibles
    selectedArtist,
    loading: loading || accessLoading,
    selectArtist,
    getCurrentArtist,
    getCurrentArtistId,
    getCurrentArtistName,
    refreshArtists,
    hasAccess // Agregar información de acceso
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
}
