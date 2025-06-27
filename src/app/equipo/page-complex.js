"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import TeamManager from "../../components/TeamManager";
import { 
  createTeamMember,
  getTeamMembers,
  updateTeamMember,
  deleteTeamMember 
} from "../../utils/teamManagement";
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
  const [loading, setLoading] = useState(false); // Cambiar a false por defecto
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  const userData = getUserData();
  const currentArtist = getCurrentArtist();
  const artistId = getCurrentArtistId();

  // Cargar miembros del equipo
  const loadTeamMembers = async () => {
    const currentUserId = userData?.uid;
    const currentArtistId = getCurrentArtistId();
    
    if (!currentUserId || !currentArtistId) {
      console.log("❌ No hay usuario o artista para cargar equipo");
      setTeamMembers([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("🔄 Cargando miembros del equipo para artista:", currentArtistId);
      const members = await getTeamMembers(currentArtistId, currentUserId);
      console.log("👥 Miembros cargados:", members.length);
      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading team members:", error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambie el artista o usuario
  useEffect(() => {
    const userId = userData?.uid;
    const currentArtistId = getCurrentArtistId();
    
    if (userId && currentArtistId) {
      loadTeamMembers();
    } else {
      setTeamMembers([]);
      setLoading(false);
    }
  }, [userData?.uid, artistId]);

  // Escuchar cambios de artista
  useEffect(() => {
    const handleArtistChange = () => {
      console.log("🎨 Evento de cambio de artista detectado en equipo");
      // Usar un pequeño delay para asegurar que el contexto se haya actualizado
      setTimeout(() => {
        const currentUserId = userData?.uid;
        const currentArtistId = getCurrentArtistId();
        
        if (currentUserId && currentArtistId) {
          loadTeamMembers();
        }
      }, 100);
    };

    window.addEventListener('artistChanged', handleArtistChange);
    return () => {
      window.removeEventListener('artistChanged', handleArtistChange);
    };
  }, []); // Sin dependencias para evitar bucles

  const handleAddMember = async (memberData) => {
    if (!artistId || !userData) return;
    
    try {
      const newMember = await createTeamMember(artistId, userData.uid, memberData);
      setTeamMembers(prev => [newMember, ...prev]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding team member:", error);
      alert("Error al agregar miembro del equipo");
    }
  };

  const handleEditMember = async (memberId, updates) => {
    if (!artistId) return;
    
    try {
      await updateTeamMember(artistId, memberId, updates);
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, ...updates, updatedAt: new Date() }
            : member
        )
      );
      setEditingMember(null);
    } catch (error) {
      console.error("Error updating team member:", error);
      alert("Error al actualizar miembro del equipo");
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!artistId) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este miembro del equipo?")) return;
    
    try {
      await deleteTeamMember(artistId, memberId);
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error("Error deleting team member:", error);
      alert("Error al eliminar miembro del equipo");
    }
  };

  if (loading) {
    return (
      <Sidebar theme={theme} setTheme={setTheme}>
        <div className={styles.equipo}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando equipo...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

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
          <button 
            onClick={() => setShowAddForm(true)}
            className={styles.addButton}
            disabled={!artistId}
          >
            ➕ Agregar Miembro
          </button>
        </div>

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
        ) : (
          <div className={styles.teamContent}>
            <TeamManager
              teamMembers={teamMembers}
              showAddForm={showAddForm}
              editingMember={editingMember}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onCancelAdd={() => setShowAddForm(false)}
              onStartEdit={(member) => setEditingMember(member)}
              onCancelEdit={() => setEditingMember(null)}
            />
          </div>
        )}
      </div>
    </Sidebar>
  );
}
