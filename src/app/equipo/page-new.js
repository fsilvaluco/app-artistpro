"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import { useNotification } from "../../contexts/NotificationContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import PermissionGuard from "../../components/PermissionGuard";
import Sidebar from "../../components/Sidebar";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, addUserToTeam } from "../../utils/teamManagement";
import { PERMISSIONS, ROLES, ROLE_LABELS, ROLE_COLORS } from "../../utils/roles";
import UserSelector from "../../components/UserSelector";
import styles from "./page.module.css";

export default function EquipoPageWrapper() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.TEAM_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el equipo.</p>
          </div>
        }
      >
        <EquipoPage />
      </PermissionGuard>
    </ProtectedRoute>
  );
}

function EquipoPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: ROLES.VIEWER,
    department: ''
  });

  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  const { showSuccess, showError, showProgress, removeNotification } = useNotification();
  
  const userData = getUserData();
  const currentArtist = getCurrentArtist();
  const artistId = getCurrentArtistId();

  // Cargar datos del equipo
  const loadTeam = async () => {
    if (!userData?.uid || !artistId) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const members = await getTeamMembers(artistId, userData.uid);
      setTeamMembers(members || []);
    } catch (err) {
      console.error("Error cargando equipo:", err);
      setError(err.message || "Error al cargar el equipo");
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos
  useEffect(() => {
    if (userData?.uid && artistId) {
      loadTeam();
    } else {
      setLoading(false);
      setTeamMembers([]);
    }
  }, [userData?.uid, artistId]);

  // Funciones del modal de invitación
  const openInviteModal = () => {
    setShowInviteModal(true);
    setSelectedUser(null);
    setInviteData({
      name: '',
      email: '',
      role: ROLES.VIEWER,
      department: ''
    });
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedUser(null);
    setShowUserSelector(false);
    setInviteData({
      name: '',
      email: '',
      role: ROLES.VIEWER,
      department: ''
    });
  };

  // Manejar selección de usuario existente
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowUserSelector(false);
    setInviteData({
      name: user.name || user.email,
      email: user.email,
      role: ROLES.VIEWER,
      department: ''
    });
  };

  // Enviar invitación
  const sendInvite = async () => {
    if (!inviteData.email || !inviteData.role) {
      showError("Email y rol son obligatorios");
      return;
    }

    let progressId;
    try {
      setLoading(true);
      
      progressId = showProgress("Enviando invitación...");
      
      if (selectedUser) {
        // Agregar usuario existente
        await addUserToTeam({
          artistId,
          userId: selectedUser.uid,
          userEmail: selectedUser.email,
          userName: selectedUser.name || selectedUser.email,
          role: inviteData.role,
          department: inviteData.department,
          addedBy: userData.uid
        });
      } else {
        // Crear miembro manual o enviar invitación
        await createTeamMember(artistId, {
          name: inviteData.name,
          email: inviteData.email,
          role: inviteData.role,
          department: inviteData.department,
          isManual: true,
          createdBy: userData.uid
        });
      }
      
      if (progressId) removeNotification(progressId);
      showSuccess("Invitación enviada exitosamente");
      
      closeInviteModal();
      await loadTeam();
    } catch (err) {
      console.error("Error enviando invitación:", err);
      
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al enviar la invitación");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar miembro
  const removeMember = async (memberId, memberName) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${memberName} del equipo?`)) {
      return;
    }

    let progressId;
    try {
      setLoading(true);
      
      progressId = showProgress(`Eliminando a ${memberName}...`);
      
      await deleteTeamMember(artistId, memberId);
      
      if (progressId) removeNotification(progressId);
      showSuccess(`${memberName} eliminado del equipo`);
      
      await loadTeam();
    } catch (err) {
      console.error("Error eliminando miembro:", err);
      
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al eliminar el miembro");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar rol de miembro
  const changeRole = async (memberId, newRole) => {
    let progressId;
    try {
      setLoading(true);
      
      progressId = showProgress("Actualizando rol...");
      
      await updateTeamMember(artistId, memberId, { role: newRole });
      
      if (progressId) removeNotification(progressId);
      showSuccess("Rol actualizado exitosamente");
      
      await loadTeam();
    } catch (err) {
      console.error("Error actualizando rol:", err);
      
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al actualizar el rol");
    } finally {
      setLoading(false);
    }
  };

  if (!artistId) {
    return (
      <Sidebar theme="system">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Equipo</h1>
            <p>Selecciona un artista para ver su equipo</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar theme="system">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <span>Tus equipos</span>
          </div>
          
          <div className={styles.artistHeader}>
            <div>
              <h1 className={styles.artistName}>{currentArtist?.name || "Artista"}</h1>
            </div>
            
            <PermissionGuard permission={PERMISSIONS.TEAM_INVITE}>
              <button 
                className={styles.inviteButton}
                onClick={openInviteModal}
                disabled={loading}
              >
                Invitar
              </button>
            </PermissionGuard>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.active}`}>
              Miembros del equipo
            </button>
            <button className={styles.tab}>
              Actividad
            </button>
            <button className={styles.tab}>
              Facturación
            </button>
          </div>
        </div>

        {/* Solicitudes pendientes */}
        {pendingRequests.length > 0 && (
          <div className={styles.section}>
            <h2>Solicitudes ({pendingRequests.length})</h2>
            
            <div className={styles.requestsList}>
              {pendingRequests.map((request) => (
                <div key={request.id} className={styles.requestItem}>
                  <div className={styles.requestInfo}>
                    <div className={styles.avatar}>
                      {request.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{request.userName}</strong>
                      <p>{request.userEmail}</p>
                    </div>
                  </div>
                  
                  <div className={styles.requestDate}>
                    <span>Hoy, 4:03 p.m.</span>
                  </div>
                  
                  <div className={styles.requestActions}>
                    <select 
                      className={styles.roleSelect}
                      defaultValue=""
                    >
                      <option value="">Elegir</option>
                      {Object.entries(ROLE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    
                    <button className={styles.rejectButton}>
                      Rechazar
                    </button>
                    <button className={styles.approveButton}>
                      Aprobar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de miembros */}
        <div className={styles.section}>
          <h2>Miembros</h2>
          
          {loading && (
            <div className={styles.loading}>
              <p>Cargando equipo...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>Error: {error}</p>
              <button onClick={loadTeam}>Reintentar</button>
            </div>
          )}

          {!loading && !error && teamMembers.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay miembros en el equipo</p>
              <button onClick={openInviteModal} className={styles.inviteButton}>
                Invitar primer miembro
              </button>
            </div>
          )}

          {!loading && !error && teamMembers.length > 0 && (
            <div className={styles.membersList}>
              <div className={styles.membersHeader}>
                <div>Nombre</div>
                <div>Función</div>
                <div>Nivel De Acceso</div>
                <div>Administrar</div>
              </div>
              
              {teamMembers.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <div className={styles.avatar}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{member.name}</strong>
                      <p>{member.email}</p>
                    </div>
                  </div>
                  
                  <div className={styles.memberFunction}>
                    {member.department || 'Sin departamento'}
                  </div>
                  
                  <div className={styles.memberRole}>
                    <span 
                      className={styles.roleBadge}
                      style={{ 
                        backgroundColor: ROLE_COLORS[member.role] || '#6b7280',
                        color: 'white'
                      }}
                    >
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                  </div>
                  
                  <div className={styles.memberActions}>
                    <PermissionGuard permission={PERMISSIONS.TEAM_EDIT}>
                      <button 
                        className={styles.menuButton}
                        onClick={() => removeMember(member.id, member.name)}
                      >
                        ⋯
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de invitación */}
        {showInviteModal && (
          <div className={styles.modalOverlay} onClick={closeInviteModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Invitar al equipo</h3>
                <button onClick={closeInviteModal} className={styles.closeButton}>
                  ✕
                </button>
              </div>
              
              <div className={styles.modalContent}>
                <div className={styles.modalTabs}>
                  <button 
                    className={`${styles.modalTab} ${!showUserSelector ? styles.active : ''}`}
                    onClick={() => {
                      setShowUserSelector(false);
                      setSelectedUser(null);
                    }}
                  >
                    Invitar por email
                  </button>
                  <button 
                    className={`${styles.modalTab} ${showUserSelector ? styles.active : ''}`}
                    onClick={() => setShowUserSelector(true)}
                  >
                    Seleccionar usuario
                  </button>
                </div>

                {showUserSelector ? (
                  <div className={styles.userSelectorContainer}>
                    <UserSelector 
                      onSelect={handleUserSelect}
                      onClose={() => setShowUserSelector(false)}
                    />
                  </div>
                ) : (
                  <>
                    {selectedUser && (
                      <div className={styles.selectedUserInfo}>
                        <p><strong>Usuario seleccionado:</strong> {selectedUser.name || selectedUser.email}</p>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>Nombre</label>
                      <input
                        type="text"
                        value={inviteData.name}
                        onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                        placeholder="Nombre completo"
                        disabled={!!selectedUser}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                        placeholder="usuario@ejemplo.com"
                        disabled={!!selectedUser}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Rol</label>
                      <select
                        value={inviteData.role}
                        onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                      >
                        {Object.entries(ROLE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Departamento (opcional)</label>
                      <input
                        type="text"
                        value={inviteData.department}
                        onChange={(e) => setInviteData({...inviteData, department: e.target.value})}
                        placeholder="ej: Artístico, Producción, Marketing"
                      />
                    </div>
                  </>
                )}
              </div>
              
              {!showUserSelector && (
                <div className={styles.modalFooter}>
                  <button onClick={closeInviteModal} className={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button 
                    onClick={sendInvite} 
                    className={styles.inviteButton}
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar invitación'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
