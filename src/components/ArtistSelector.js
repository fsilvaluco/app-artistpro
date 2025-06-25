"use client";

import { useState } from "react";
import { useArtist } from "../contexts/ArtistContext";
import styles from "./ArtistSelector.module.css";

export default function ArtistSelector() {
  const { 
    artists, 
    selectedArtist, 
    loading, 
    selectArtist 
  } = useArtist();

  const [isOpen, setIsOpen] = useState(false);

  const handleArtistSelect = (artist) => {
    selectArtist(artist);
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
            <span className={styles.dropdownTitle}>Seleccionar Artista</span>
          </div>
          {artists.length === 0 ? (
            <div className={styles.noArtists}>No hay artistas disponibles</div>
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
