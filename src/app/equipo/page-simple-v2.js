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

  // Función para cargar equipo
  const loadTeam = async () => {
    console.log("🔄 loadTeam called", { artistId, userId: userData?.uid });
    
    if (!userData?.uid) {
      console.log("❌ No user");
      setError("Usuario no autenticado");
      return;
    }
    
    if (!artistId) {
      console.log("❌ No artist");
      setTeamMembers([]);
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      console.log("📡 Llamando getTeamMembers...");
      
      const members = await getTeamMembers(artistId, userData.uid);
      console.log("✅ Respuesta recibida:", members);
      
      setTeamMembers(members || []);
    } catch (err) {
      console.error("❌ Error en loadTeam:", err);
      setError(err.message || "Error desconocido");
      setTeamMembers([]);
    } finally {
      console.log("🏁 loadTeam finished");
      setLoading(false);
    }
  };

  // Efecto que se ejecuta cuando cambian los datos necesarios
  useEffect(() => {
    console.log("🔍 useEffect:", { user: !!userData?.uid, artist: artistId });
    
    if (userData?.uid && artistId) {
      loadTeam();
    } else {
      setLoading(false);
      setTeamMembers([]);
    }
  }, [userData?.uid, artistId]);

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

        {/* Info de debugging */}
        <div className={styles.debugInfo}>
          <p><strong>Usuario:</strong> {userData?.email || 'No autenticado'}</p>
          <p><strong>Artista:</strong> {currentArtist?.name || 'No seleccionado'}</p>
          <p><strong>Artist ID:</strong> {artistId || 'N/A'}</p>
          <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
          <p><strong>Miembros:</strong> {teamMembers.length}</p>
          {error && <p style={{color: 'red'}}><strong>Error:</strong> {error}</p>}
          <button 
            onClick={loadTeam} 
            style={{ 
              marginTop: '10px', 
              padding: '8px 15px', 
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            🔄 Recargar
          </button>
        </div>

        {/* Contenido */}
        {!userData?.uid ? (
          <div className={styles.noArtist}>
            <h2>🚪 No autenticado</h2>
            <p>Necesitas estar autenticado para ver esta página.</p>
          </div>
        ) : !artistId ? (
          <div className={styles.noArtist}>
            <h2>🎨 Selecciona un artista</h2>
            <p>Para gestionar el equipo, primero selecciona un artista.</p>
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
            <h3>👥 Sin miembros</h3>
            <p>Este artista no tiene miembros en su equipo.</p>
            <p>Ve a <strong>Admin → Poblar Equipos</strong> para crear datos de muestra.</p>
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
                    {member.department && <p><strong>Departamento:</strong> {member.department}</p>}
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
