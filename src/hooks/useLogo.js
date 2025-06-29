"use client";

import { useState, useEffect } from 'react';

// Hook personalizado para gestionar el logo y favicon dinámicos
export const useLogo = () => {
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el logo actual
  const getCurrentLogo = () => {
    try {
      const logoData = localStorage.getItem('artistpro_logo');
      return logoData ? JSON.parse(logoData) : null;
    } catch (error) {
      console.error('Error obteniendo logo:', error);
      return null;
    }
  };

  // Función para obtener el favicon actual
  const getCurrentFavicon = () => {
    try {
      const faviconData = localStorage.getItem('artistpro_favicon');
      return faviconData ? JSON.parse(faviconData) : null;
    } catch (error) {
      console.error('Error obteniendo favicon:', error);
      return null;
    }
  };

  // Función para obtener la URL del logo
  const getLogoUrl = () => {
    const currentLogo = getCurrentLogo();
    return currentLogo ? currentLogo.data : '/artistpro-logo.png';
  };

  // Función para obtener la URL del favicon
  const getFaviconUrl = () => {
    const currentFavicon = getCurrentFavicon();
    return currentFavicon ? currentFavicon.data : '/favicon.ico';
  };

  // Función para actualizar el favicon en el documento
  const updateFaviconInDocument = (faviconUrl) => {
    try {
      // Remover favicon existente
      const existingFavicon = document.querySelector('link[rel*="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Crear nuevo elemento de favicon
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/x-icon';
      newFavicon.href = faviconUrl;
      
      // Agregar al head
      document.head.appendChild(newFavicon);
      
      console.log('✅ Favicon actualizado en el documento');
    } catch (error) {
      console.error('Error actualizando favicon en documento:', error);
    }
  };

  // Cargar logo y favicon inicial
  useEffect(() => {
    setLogo(getCurrentLogo());
    setFavicon(getCurrentFavicon());
    
    // Aplicar favicon personalizado si existe
    const faviconData = getCurrentFavicon();
    if (faviconData) {
      updateFaviconInDocument(faviconData.data);
    }
    
    setLoading(false);
  }, []);

  // Escuchar cambios en el logo
  useEffect(() => {
    const handleLogoChange = (event) => {
      setLogo(event.detail);
    };

    const handleFaviconChange = (event) => {
      setFavicon(event.detail);
      // Actualizar favicon en el documento si se cambió
      if (event.detail) {
        updateFaviconInDocument(event.detail.data);
      } else {
        updateFaviconInDocument('/favicon.ico');
      }
    };

    window.addEventListener('logoChanged', handleLogoChange);
    window.addEventListener('faviconChanged', handleFaviconChange);
    
    return () => {
      window.removeEventListener('logoChanged', handleLogoChange);
      window.removeEventListener('faviconChanged', handleFaviconChange);
    };
  }, []);

  return {
    logo,
    favicon,
    logoUrl: getLogoUrl(),
    faviconUrl: getFaviconUrl(),
    loading,
    hasCustomLogo: logo !== null,
    hasCustomFavicon: favicon !== null
  };
};
