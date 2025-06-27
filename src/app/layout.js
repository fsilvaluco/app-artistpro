"use client";

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
import NotificationContainer from "../components/NotificationContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
      </body>
    </html>
  );
}
