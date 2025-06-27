"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../app/firebase";
import styles from "./Step1ReclamarPerfil.module.css";

export default function Step1ReclamarPerfil({ formData, updateFormData, user, onNext, isValid }) {
  const [artists, setArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [artistUri, setArtistUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Cargar todos los artistas
  const loadArtists = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "artists"));
      const artistsData = [];
      querySnapshot.forEach((doc) => {
        artistsData.push({ id: doc.id, ...doc.data() });
      });
      setArtists(artistsData);
    } catch (error) {
      console.error("Error al cargar artistas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar artistas por nombre
  const searchArtists = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = artists.filter(artist => 
      artist.name?.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Seleccionar artista
  const selectArtist = (artist) => {
    updateFormData({ 
      selectedArtist: artist,
      artistName: artist.name,
      artistId: artist.id 
    });
    setSearchTerm(artist.name);
    setSearchResults([]);
  };

  // Procesar URI de artista
  const processArtistUri = () => {
    if (!artistUri.trim()) return;

    // Extraer ID del URI (ejemplo: spotify:artist:4Z8W4fKeB5YxbusRsdQVPb)
    const uriParts = artistUri.split(':');
    if (uriParts.length >= 3) {
      const artistId = uriParts[uriParts.length - 1];
      const foundArtist = artists.find(a => a.spotifyId === artistId || a.id === artistId);
      
      if (foundArtist) {
        selectArtist(foundArtist);
        setArtistUri('');
      } else {
        alert('Artista no encontrado con ese URI');
      }
    } else {
      alert('URI de artista no válido');
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  useEffect(() => {
    searchArtists(searchTerm);
  }, [searchTerm, artists]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Buscar perfil de artista</h2>
        <p className={styles.description}>
          Encuentra el artista al que quieres solicitar acceso. Solo puedes reclamar un perfil a la vez. 
          Espera la aprobación antes de intentar reclamar otro.
        </p>

        {/* Búsqueda por nombre */}
        <div className={styles.searchSection}>
          <label className={styles.label}>
            <span className={styles.labelText}>Buscar artista por nombre</span>
            <input
              type="text"
              placeholder="Escribe el nombre del artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </label>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map(artist => (
                <div
                  key={artist.id}
                  className={`${styles.artistResult} ${formData.selectedArtist?.id === artist.id ? styles.selected : ''}`}
                  onClick={() => selectArtist(artist)}
                >
                  <div className={styles.artistInfo}>
                    <img
                      src={artist.avatar || artist.photo || "/next.svg"}
                      alt={artist.name}
                      className={styles.artistAvatar}
                      onError={(e) => {
                        e.target.src = "/next.svg";
                      }}
                    />
                    <div className={styles.artistDetails}>
                      <span className={styles.artistName}>{artist.name}</span>
                      {artist.genre && (
                        <span className={styles.artistGenre}>{artist.genre}</span>
                      )}
                    </div>
                  </div>
                  {formData.selectedArtist?.id === artist.id && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Separador */}
        <div className={styles.divider}>
          <span>O</span>
        </div>

        {/* URI de artista */}
        <div className={styles.uriSection}>
          <label className={styles.label}>
            <span className={styles.labelText}>Pegar URI de artista de Spotify</span>
            <div className={styles.uriInputGroup}>
              <input
                type="text"
                placeholder="spotify:artist:4Z8W4fKeB5YxbusRsdQVPb"
                value={artistUri}
                onChange={(e) => setArtistUri(e.target.value)}
                className={styles.uriInput}
              />
              <button
                onClick={processArtistUri}
                disabled={!artistUri.trim() || loading}
                className={styles.processUriButton}
              >
                Buscar
              </button>
            </div>
          </label>
        </div>

        {/* Artista seleccionado */}
        {formData.selectedArtist && (
          <div className={styles.selectedArtist}>
            <h3>Artista seleccionado:</h3>
            <div className={styles.selectedArtistCard}>
              <img
                src={formData.selectedArtist.avatar || formData.selectedArtist.photo || "/next.svg"}
                alt={formData.selectedArtist.name}
                className={styles.selectedAvatar}
                onError={(e) => {
                  e.target.src = "/next.svg";
                }}
              />
              <div className={styles.selectedDetails}>
                <span className={styles.selectedName}>{formData.selectedArtist.name}</span>
                {formData.selectedArtist.genre && (
                  <span className={styles.selectedGenre}>{formData.selectedArtist.genre}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Advertencia */}
        <div className={styles.warning}>
          <span className={styles.warningIcon}>⚠️</span>
          <span className={styles.warningText}>
            Solo puedes reclamar un perfil a la vez. Espera la aprobación antes de intentar reclamar otro.
          </span>
        </div>
      </div>

      {/* Botón siguiente */}
      <div className={styles.actions}>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`${styles.nextButton} ${!isValid ? styles.disabled : ''}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
