"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ArtistSelector from "../components/ArtistSelector";
import RouteProtection from "../components/RouteProtection";
import { SessionProvider } from "../contexts/SessionContext";
import { AccessProvider } from "../contexts/AccessContext";
import { ArtistProvider } from "../contexts/ArtistContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";
import { ProjectProvider } from "../contexts/ProjectContext";
import { UserProvider } from "../contexts/UserContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import NotificationContainer from "../components/NotificationContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Componente interno para manejar los atributos del HTML con el tema
function HTMLWithTheme({ children }) {
  const { theme, resolvedTheme } = useTheme();
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return (
    <html lang="en" data-theme={resolvedTheme}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <HTMLWithTheme>
        <SessionProvider>
          <AccessProvider>
            <ArtistProvider>
              <PermissionsProvider>
                <UserProvider>
                  <ProjectProvider>
                    <NotificationProvider>
                      <RouteProtection>
                        <ArtistSelector />
                        {children}
                        <NotificationContainer />
                      </RouteProtection>
                    </NotificationProvider>
                  </ProjectProvider>
                </UserProvider>
              </PermissionsProvider>
            </ArtistProvider>
          </AccessProvider>
        </SessionProvider>
      </HTMLWithTheme>
    </ThemeProvider>
  );
}
