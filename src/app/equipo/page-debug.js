"use client";

import { useState, useEffect, useRef } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  
  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  
  // Usar refs para evitar re-renders
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función simple para cargar equipo
  const loadTeam = async () => {
    const userData = getUserData();
    const artistId = getCurrentArtistId();
    
    console.log("🔄 loadTeam called", { user: !!userData?.uid, artist: artistId, loading: loadingRef.current });
    
    if (!userData?.uid || !artistId) {
      setDebugInfo(`No user (${!!userData?.uid}) or artist (${artistId})`);
      setTeamMembers([]);
      setLoading(false);
      return;
    }
    
    if (loadingRef.current) {
      console.log("⚠️ Ya se está cargando, saltando...");
      return;
    }
    
    try {
      loadingRef.current = true;
      setError(null);
      setLoading(true);
      setDebugInfo(`Loading team for artist: ${artistId}`);
      
      const members = await getTeamMembers(artistId, userData.uid);
      
      if (mountedRef.current) {
        setTeamMembers(members);
        setDebugInfo(`Loaded ${members.length} team members`);
        console.log("✅ Team loaded:", members.length, "members");
      }
    } catch (err) {
      console.error("❌ Error loading team:", err);
      if (mountedRef.current) {
        setError(err.message || "Error desconocido");
        setTeamMembers([]);
        setDebugInfo(`Error: ${err.message}`);
      }
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Effect principal
  useEffect(() => {
    console.log("🔍 Main useEffect triggered");
    const userData = getUserData();
    const artistId = getCurrentArtistId();
    
    if (userData?.uid && artistId) {
      loadTeam();
    } else {
      setLoading(false);
      setDebugInfo("Waiting for user and artist data...");
    }
  }, []); // Sin dependencias para evitar loops

  // Effect para escuchar cambios de artista
  useEffect(() => {
    const handleArtistChange = () => {
      console.log("🎨 Artist changed, reloading team");
      setTimeout(loadTeam, 100);
    };

    window.addEventListener('artistChanged', handleArtistChange);
    return () => window.removeEventListener('artistChanged', handleArtistChange);
  }, []);

  const userData = getUserData();
  const currentArtist = getCurrentArtist();
  const artistId = getCurrentArtistId();

  return (
    <Sidebar theme={theme} setTheme={setTheme}>
      <div className={styles.equipo}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>👥 Equipo (Debug Version)</h1>
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
          <p><strong>Loading Ref:</strong> {loadingRef.current ? 'Sí' : 'No'}</p>
          <p><strong>Miembros:</strong> {teamMembers.length}</p>
          <p><strong>Debug Info:</strong> {debugInfo}</p>
          {error && <p><strong>Error:</strong> {error}</p>}
          <button onClick={loadTeam} style={{ marginTop: '10px', padding: '5px 10px' }}>
            🔄 Recargar Manualmente
          </button>
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
            <button onClick={loadTeam} className={styles.retryButton}>
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
                    <p><strong>Rol:</strong> {member.role}</p>
                    <p><strong>Email:</strong> {member.email}</p>
                    <p><strong>Departamento:</strong> {member.department}</p>
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
