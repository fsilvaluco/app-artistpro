"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ArtistSelector from "../components/ArtistSelector";
import { SessionProvider } from "../contexts/SessionContext";
import { ProjectProvider } from "../contexts/ProjectContext";
import { UserProvider } from "../contexts/UserContext";

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
          <UserProvider>
            <ProjectProvider>
              <ArtistSelector />
              {children}
            </ProjectProvider>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
