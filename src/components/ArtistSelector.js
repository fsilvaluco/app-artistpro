"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../app/firebase";
import styles from "./ArtistSelector.module.css";

export default function ArtistSelector() {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "artists"));
        const artistsData = [];
        querySnapshot.forEach((doc) => {
          artistsData.push({ id: doc.id, ...doc.data() });
        });
        setArtists(artistsData);
        
        // Seleccionar el primer artista por defecto si hay artistas disponibles
        if (artistsData.length > 0) {
          setSelectedArtist(artistsData[0]);
        }
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
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
