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
  const [showRequestsModal, setShowRequestsModal] = useState(false);
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
                        onClick={() => {
                          // Mostrar menú de opciones
                        }}
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
                    className={`${styles.modalTab} ${!selectedUser ? styles.active : ''}`}
                    onClick={() => setSelectedUser(null)}
                  >
                    Invitar por email
                  </button>
                  <button 
                    className={`${styles.modalTab} ${selectedUser ? styles.active : ''}`}
                    onClick={() => {
                      // Mostrar selector de usuarios
                    }}
                  >
                    Seleccionar usuario
                  </button>
                </div>

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
              </div>
              
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
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
  
  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  const { showSuccess, showError, showProgress, removeNotification } = useNotification();
  
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

  // Funciones para manejar el modal
  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        role: member.role || '',
        email: member.email || '',
        department: member.department || ''
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        email: '',
        department: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setSelectedUser(null);
    setFormData({
      name: '',
      role: '',
      email: '',
      department: ''
    });
  };

  // Función para guardar miembro
  const saveMember = async () => {
    if (!formData.role) {
      showError("El rol es obligatorio");
      return;
    }

    // Si hay un usuario seleccionado, usar saveUserToTeam
    if (selectedUser) {
      return saveUserToTeam();
    }

    // Validar campos para miembro manual
    if (!formData.name || !formData.email) {
      showError("Nombre y email son obligatorios para miembros manuales");
      return;
    }

    let progressId;
    try {
      setLoading(true);
      
      const isEditing = !!editingMember;
      const actionText = isEditing ? "Actualizando" : "Creando";
      
      progressId = showProgress(`${actionText} miembro del equipo...`);
      
      if (isEditing) {
        // Actualizar miembro existente
        await updateTeamMember(artistId, editingMember.id, formData);
        console.log("✅ Miembro actualizado");
        
        if (progressId) removeNotification(progressId);
        showSuccess(`Miembro "${formData.name}" actualizado correctamente`);
      } else {
        // Crear nuevo miembro manual
        await createTeamMember(artistId, userData.uid, formData);
        console.log("✅ Miembro creado");
        
        if (progressId) removeNotification(progressId);
        showSuccess(`Miembro "${formData.name}" agregado al equipo`);
      }
      
      closeModal();
      await loadTeam(); // Recargar la lista
    } catch (err) {
      console.error("❌ Error guardando miembro:", err);
      
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al guardar el miembro");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar miembro
  const deleteMember = async (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    const memberName = member?.name || 'este miembro';
    
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${memberName} del equipo?`)) {
      return;
    }

    let progressId;
    try {
      setLoading(true);
      
      progressId = showProgress(`Eliminando a ${memberName} del equipo...`);
      
      await deleteTeamMember(artistId, memberId);
      console.log("✅ Miembro eliminado");
      
      if (progressId) removeNotification(progressId);
      showSuccess(`${memberName} eliminado del equipo`);
      
      await loadTeam(); // Recargar la lista
    } catch (err) {
      console.error("❌ Error eliminando miembro:", err);
      
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al eliminar el miembro");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar el selector de usuarios
  const handleUserSelect = async (user) => {
    // Cerrar el selector
    setShowUserSelector(false);
    
    // Abrir modal para asignar rol
    setSelectedUser(user);
    setFormData({
      name: user.name || user.email,
      role: '',
      email: user.email,
      department: ''
    });
    setShowModal(true);
  };

  const saveUserToTeam = async () => {
    if (!selectedUser || !formData.role) {
      showError("Usuario y rol son obligatorios");
      return;
    }

    let progressId;
    try {
      setLoading(true);
      
      progressId = showProgress(`Agregando ${selectedUser.name || selectedUser.email} al equipo...`);
      
      await addUserToTeam(artistId, userData.uid, selectedUser, formData.role, formData.department);
      console.log("✅ Usuario agregado al equipo");
      
      if (progressId) removeNotification(progressId);
      showSuccess(`${selectedUser.name || selectedUser.email} agregado al equipo como ${formData.role}`);
      
      closeModal();
      await loadTeam();
    } catch (err) {
      console.error("❌ Error agregando usuario:", err);
      
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al agregar el usuario al equipo");
    } finally {
      setLoading(false);
    }
  };

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
          {artistId && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <PermissionGuard permission={PERMISSIONS.TEAM_INVITE}>
                <button 
                  onClick={() => setShowUserSelector(true)}
                  className={styles.addButton}
                  disabled={loading}
                >
                  👤 Agregar Usuario
                </button>
              </PermissionGuard>
              <PermissionGuard permission={PERMISSIONS.TEAM_EDIT}>
                <button 
                  onClick={() => openModal()}
                  className={styles.addButton}
                  disabled={loading}
                  style={{ background: '#6b7280' }}
                >
                  ➕ Crear Miembro
                </button>
              </PermissionGuard>
            </div>
          )}
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
                <div key={member.id} className={`${styles.memberCard} ${member.type === 'user_reference' ? styles.userMember : styles.manualMember}`}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberHeader}>
                      <h4>{member.name}</h4>
                      {member.type === 'user_reference' && (
                        <span className={styles.userBadge}>👤 Usuario</span>
                      )}
                      {member.type === 'legacy' && (
                        <span className={styles.legacyBadge}>📝 Manual</span>
                      )}
                    </div>
                    <p><strong>Rol:</strong> {member.role}</p>
                    <p><strong>Email:</strong> {member.email}</p>
                    {member.department && <p><strong>Departamento:</strong> {member.department}</p>}
                  </div>
                  <div className={styles.memberActions}>
                    <PermissionGuard permission={PERMISSIONS.TEAM_EDIT}>
                      <button 
                        onClick={() => openModal(member)}
                        className={styles.editButton}
                        disabled={loading}
                      >
                        ✏️ Editar
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.TEAM_DELETE}>
                      <button 
                        onClick={() => deleteMember(member.id)}
                        className={styles.deleteButton}
                        disabled={loading}
                      >
                        🗑️ Eliminar
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal para agregar/editar miembro */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  {selectedUser ? `Agregar ${selectedUser.name || selectedUser.email} al equipo` :
                   editingMember ? 'Editar Miembro' : 'Crear Miembro Manual'}
                </h3>
                <button onClick={closeModal} className={styles.closeButton}>✕</button>
              </div>
              
              <div className={styles.modalBody}>
                {selectedUser && (
                  <div className={styles.selectedUserInfo}>
                    <p><strong>Usuario seleccionado:</strong> {selectedUser.name || selectedUser.email}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label>Nombre {!selectedUser && '*'}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nombre completo"
                    disabled={!!selectedUser}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Rol *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="ej: musician, producer, manager"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email {!selectedUser && '*'}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="correo@ejemplo.com"
                    disabled={!!selectedUser}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Departamento</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="ej: Artístico, Producción, Administración"
                  />
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button onClick={closeModal} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button onClick={saveMember} className={styles.saveButton} disabled={loading}>
                  {loading ? 'Guardando...' : 
                   selectedUser ? 'Agregar al Equipo' :
                   editingMember ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selector de usuarios */}
        {showUserSelector && (
          <UserSelector
            onSelect={handleUserSelect}
            onClose={() => setShowUserSelector(false)}
          />
        )}

        {/* Selector de usuarios */}
        {showUserSelector && (
          <div className={styles.modalOverlay} onClick={() => setShowUserSelector(false)}>
            <div className={styles.userSelector} onClick={(e) => e.stopPropagation()}>
              <div className={styles.selectorHeader}>
                <h3>Seleccionar Usuario</h3>
                <button onClick={() => setShowUserSelector(false)} className={styles.closeButton}>✕</button>
              </div>
              
              <div className={styles.selectorBody}>
                <UserSelector 
                  onSelect={handleUserSelect}
                  onClose={() => setShowUserSelector(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
