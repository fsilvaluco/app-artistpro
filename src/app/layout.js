import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import ClientProviders from "../components/ClientProviders";

export const metadata = {
  title: "ArtistPro - Gestión Profesional de Artistas",
  description: "Plataforma integral para la gestión de artistas musicales",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

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
      <body 
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning={true}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
