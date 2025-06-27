"use client";

import { useState } from "react";
import { useArtist } from "../contexts/ArtistContext";
import { useAccess } from "../contexts/AccessContext";
import { useSession } from "../contexts/SessionContext";
import { useRouter, usePathname } from "next/navigation";
import styles from "./ArtistSelector.module.css";

export default function ArtistSelector() {
  const { 
    artists, 
    selectedArtist, 
    loading, 
    selectArtist,
    hasAccess
  } = useArtist();

  const { isAuthenticated } = useSession();
  const { hasAccess: userHasAccess } = useAccess();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  // No mostrar el selector en ciertas rutas
  const hiddenRoutes = ['/solicitar-acceso', '/'];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  // No mostrar si no está autenticado
  if (!isAuthenticated()) {
    return null;
  }

  const handleArtistSelect = (artist) => {
    console.log("🎯 ArtistSelector: Seleccionando artista:", artist?.name, "ID:", artist?.id);
    selectArtist(artist);
    setIsOpen(false);
    
    // Forzar un pequeño retraso para asegurar que el evento se procese
    setTimeout(() => {
      console.log("✅ ArtistSelector: Cambio de artista completado");
    }, 100);
  };

  const handleSolicitudAcceso = () => {
    router.push('/solicitar-acceso');
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.artistSelector}>
        <div className={styles.avatarPlaceholder}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  // Si no tiene acceso, mostrar botón para solicitar acceso
  if (!userHasAccess) {
    return (
      <div className={styles.artistSelector}>
        <button
          className={styles.noAccessButton}
          onClick={handleSolicitudAcceso}
          title="Solicitar acceso a artistas"
        >
          <span className={styles.noAccessIcon}>🔒</span>
          <span className={styles.noAccessText}>Sin acceso</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.artistSelector}>
      <button
        className={styles.artistButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Artista: ${selectedArtist?.name || 'Sin seleccionar'}`}
        title={selectedArtist?.name || 'Seleccionar artista'}
      >
        {selectedArtist ? (
          <img
            src={selectedArtist.avatar || selectedArtist.photo || "/next.svg"}
            alt={selectedArtist.name || "Artista"}
            className={styles.avatar}
            onError={(e) => {
              e.target.src = "/next.svg";
            }}
          />
        ) : (
          <div className={styles.avatarEmpty}>
            <span className={styles.avatarInitial}>?</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Artistas Accesibles</span>
          </div>
          {artists.length === 0 ? (
            <div className={styles.noArtists}>
              <p>No tienes acceso a ningún artista</p>
              <button 
                onClick={handleSolicitudAcceso}
                className={styles.solicitudButton}
              >
                Solicitar Acceso
              </button>
            </div>
          ) : (
            artists.map((artist) => (
              <button
                key={artist.id}
                className={`${styles.artistOption} ${
                  selectedArtist?.id === artist.id ? styles.selected : ""
                }`}
                onClick={() => handleArtistSelect(artist)}
              >
                <img
                  src={artist.avatar || artist.photo || "/next.svg"}
                  alt={artist.name || "Artista"}
                  className={styles.optionAvatar}
                  onError={(e) => {
                    e.target.src = "/next.svg";
                  }}
                />
                <div className={styles.artistInfo}>
                  <span className={styles.optionName}>
                    {artist.name || "Sin nombre"}
                  </span>
                  {artist.genre && (
                    <span className={styles.optionGenre}>{artist.genre}</span>
                  )}
                </div>
                {selectedArtist?.id === artist.id && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
