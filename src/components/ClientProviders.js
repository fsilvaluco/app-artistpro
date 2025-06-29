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
