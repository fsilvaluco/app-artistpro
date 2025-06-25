"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../app/firebase";

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
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar artistas disponibles
  const loadArtists = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "artists"));
      const artistsData = [];
      querySnapshot.forEach((doc) => {
        artistsData.push({ id: doc.id, ...doc.data() });
      });
      
      setArtists(artistsData);
      
      // Recuperar artista seleccionado del localStorage o seleccionar el primero
      const savedArtistId = localStorage.getItem('selectedArtistId');
      if (savedArtistId) {
        const savedArtist = artistsData.find(artist => artist.id === savedArtistId);
        if (savedArtist) {
          setSelectedArtist(savedArtist);
        } else if (artistsData.length > 0) {
          setSelectedArtist(artistsData[0]);
          localStorage.setItem('selectedArtistId', artistsData[0].id);
        }
      } else if (artistsData.length > 0) {
        setSelectedArtist(artistsData[0]);
        localStorage.setItem('selectedArtistId', artistsData[0].id);
      }
    } catch (error) {
      console.error("Error loading artists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  // Función para cambiar de artista
  const selectArtist = (artist) => {
    setSelectedArtist(artist);
    localStorage.setItem('selectedArtistId', artist.id);
    
    // Emitir evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('artistChanged', { 
      detail: { artistId: artist.id, artist } 
    }));
  };

  // Función para obtener el artista actual
  const getCurrentArtist = () => {
    return selectedArtist;
  };

  // Función para obtener el ID del artista actual
  const getCurrentArtistId = () => {
    return selectedArtist?.id || null;
  };

  // Función para obtener el nombre del artista actual
  const getCurrentArtistName = () => {
    return selectedArtist?.name || 'Sin artista seleccionado';
  };

  // Función para refrescar artistas
  const refreshArtists = () => {
    loadArtists();
  };

  const value = {
    artists,
    selectedArtist,
    loading,
    selectArtist,
    getCurrentArtist,
    getCurrentArtistId,
    getCurrentArtistName,
    refreshArtists
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
}
