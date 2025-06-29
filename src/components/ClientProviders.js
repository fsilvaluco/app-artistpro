"use client";

import { useEffect, useState } from "react";
import ArtistSelector from "./ArtistSelector";
import RouteProtection from "./RouteProtection";
import { SessionProvider } from "../contexts/SessionContext";
import { AccessProvider } from "../contexts/AccessContext";
import { ArtistProvider } from "../contexts/ArtistContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";
import { ProjectProvider } from "../contexts/ProjectContext";
import { UserProvider } from "../contexts/UserContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { SocialMediaProvider } from "../contexts/SocialMediaContext";
import NotificationContainer from "./NotificationContainer";

// Componente para manejar el tema del documento
function ThemeHandler() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme, mounted]);

  return null;
}

// Componente para aplicar favicon personalizado
function FaviconHandler() {
  useEffect(() => {
    // Aplicar favicon personalizado si existe
    try {
      const faviconData = localStorage.getItem('artistpro_favicon');
      if (faviconData) {
        const favicon = JSON.parse(faviconData);
        
        // Remover favicon existente
        const existingFavicon = document.querySelector('link[rel*="icon"]');
        if (existingFavicon) {
          existingFavicon.remove();
        }

        // Crear nuevo elemento de favicon
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.type = 'image/x-icon';
        newFavicon.href = favicon.data;
        
        // Agregar al head
        document.head.appendChild(newFavicon);
        
        console.log('✅ Favicon personalizado aplicado al cargar');
      }
    } catch (error) {
      console.error('Error aplicando favicon personalizado:', error);
    }
  }, []);

  return null;
}

export default function ClientProviders({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar hydration mismatch mostrando un loading inicial
  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '14px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ThemeHandler />
      <SessionProvider>
        <AccessProvider>
          <ArtistProvider>
            <PermissionsProvider>
              <UserProvider>
                <ProjectProvider>
                  <NotificationProvider>
                    <SocialMediaProvider>
                      {/* RouteProtection con lógica corregida - HABILITADO */}
                      <RouteProtection>
                        <ArtistSelector />
                        {children}
                        <NotificationContainer />
                      </RouteProtection>
                    </SocialMediaProvider>
                  </NotificationProvider>
                </ProjectProvider>
              </UserProvider>
            </PermissionsProvider>
          </ArtistProvider>
        </AccessProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
