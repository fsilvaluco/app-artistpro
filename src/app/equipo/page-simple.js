"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import { getTeamMembers } from "../../utils/teamManagement";
import styles from "./page.module.css";

export default function EquipoPageWrapper() {
  return (
    <ProtectedRoute>
      <EquipoPage />
    </ProtectedRoute>
  );
}

function EquipoPage() {
  const [theme, setTheme] = useState("system");
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  
  const userData = getUserData();
  const currentArtist = getCurrentArtist();
  const artistId = getCurrentArtistId();

  // Función simplificada para cargar equipo
  const loadTeamMembers = async () => {
    if (!userData?.uid || !artistId) {
      console.log("❌ No hay usuario o artista");
      setTeamMembers([]);
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      console.log("🔄 Cargando equipo...");
      
      const members = await getTeamMembers(artistId, userData.uid);
      console.log("✅ Equipo cargado:", members.length, "miembros");
      
      setTeamMembers(members);
    } catch (err) {
      console.error("❌ Error cargando equipo:", err);
      setError(err.message);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect para cargar cuando cambien las dependencias
  useEffect(() => {
    console.log("🔍 useEffect triggered - userData:", !!userData, "artistId:", artistId);
    
    if (userData?.uid && artistId) {
      loadTeamMembers();
    } else {
      setTeamMembers([]);
      setLoading(false);
    }
  }, [userData?.uid, artistId]);

  // Listener para cambios de artista
  useEffect(() => {
    const handleArtistChange = () => {
      console.log("🎨 Artist changed event");
      setTimeout(loadTeamMembers, 100);
    };

    window.addEventListener('artistChanged', handleArtistChange);
    return () => window.removeEventListener('artistChanged', handleArtistChange);
  }, []);

  return (
    <Sidebar theme={theme} setTheme={setTheme}>
      <div className={styles.equipo}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>👥 Equipo</h1>
            {currentArtist && (
              <p>Gestiona el equipo de <strong>{currentArtist.name}</strong></p>
            )}
          </div>
        </div>

        {/* Estado de debugging */}
        <div className={styles.debugInfo}>
          <p><strong>Usuario:</strong> {userData?.email || 'No autenticado'}</p>
          <p><strong>Artista:</strong> {currentArtist?.name || 'No seleccionado'}</p>
          <p><strong>Artist ID:</strong> {artistId || 'N/A'}</p>
          <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
          <p><strong>Miembros:</strong> {teamMembers.length}</p>
          {error && <p><strong>Error:</strong> {error}</p>}
        </div>

        {/* Contenido principal */}
        {!artistId ? (
          <div className={styles.noArtist}>
            <h2>🎨 Selecciona un artista</h2>
            <p>Para gestionar el equipo, primero selecciona un artista desde el selector en la barra lateral.</p>
          </div>
        ) : loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando equipo...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button onClick={loadTeamMembers} className={styles.retryButton}>
              🔄 Reintentar
            </button>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>👥 No hay miembros en el equipo</h3>
            <p>Este artista aún no tiene miembros en su equipo.</p>
            <p>Puedes poblar datos de muestra desde la página de administración.</p>
          </div>
        ) : (
          <div className={styles.teamList}>
            <h3>Miembros del Equipo ({teamMembers.length})</h3>
            <div className={styles.memberCards}>
              {teamMembers.map(member => (
                <div key={member.id} className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                    <p>{member.email}</p>
                    <p>{member.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
