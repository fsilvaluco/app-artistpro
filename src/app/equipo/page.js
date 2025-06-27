"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import { useNotification } from "../../contexts/NotificationContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import PermissionGuard from "../../components/PermissionGuard";
import Sidebar from "../../components/Sidebar";
import { getTeamMembers, createTeamMember, deleteTeamMember, addUserToTeam } from "../../utils/teamManagement";
import { PERMISSIONS, ROLES, ROLE_LABELS, ROLE_COLORS, ACCESS_LEVELS, ACCESS_LEVEL_LABELS, ACCESS_LEVEL_COLORS } from "../../utils/roles";
import UserSelector from "../../components/UserSelector";
import styles from "./page.module.css";

export default function EquipoPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.OTHER,
    accessLevel: ACCESS_LEVELS.LECTOR,
    department: ''
  });

  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  const { showSuccess, showError, showProgress, removeNotification } = useNotification();
  
  const userData = getUserData();
  const currentArtist = getCurrentArtist();
  const artistId = getCurrentArtistId();

  // Cargar equipo
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [userData?.uid, artistId]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest(`.${styles.menuContainer}`)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Funciones del modal
  const openInviteModal = () => {
    setShowInviteModal(true);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: ROLES.OTHER,
      accessLevel: ACCESS_LEVELS.LECTOR,
      department: ''
    });
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setShowUserSelector(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: ROLES.OTHER,
      accessLevel: ACCESS_LEVELS.LECTOR,
      department: ''
    });
  };

  // Manejar selección de usuario
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowUserSelector(false);
    setFormData({
      name: user.name || user.email,
      email: user.email,
      role: ROLES.OTHER,
      accessLevel: ACCESS_LEVELS.LECTOR,
      department: ''
    });
  };

  // Enviar invitación
  const sendInvite = async () => {
    if (!formData.email || !formData.role || !formData.accessLevel) {
      showError("Email, rol y nivel de acceso son obligatorios");
      return;
    }

    let progressId;
    try {
      setLoading(true);
      progressId = showProgress("Enviando invitación...");
      
      if (selectedUser) {
        await addUserToTeam({
          artistId,
          userId: selectedUser.uid,
          userEmail: selectedUser.email,
          userName: selectedUser.name || selectedUser.email,
          role: formData.role,
          accessLevel: formData.accessLevel,
          department: formData.department,
          addedBy: userData.uid
        });
      } else {
        await createTeamMember(artistId, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          accessLevel: formData.accessLevel,
          department: formData.department,
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

  // Funciones para el menú desplegable
  const toggleMenu = (memberId) => {
    setOpenMenuId(openMenuId === memberId ? null : memberId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  // Funciones para editar miembro
  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || ROLES.OTHER,
      accessLevel: member.accessLevel || ACCESS_LEVELS.LECTOR,
      department: member.department || ''
    });
    setShowEditModal(true);
    closeMenu();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      role: ROLES.OTHER,
      accessLevel: ACCESS_LEVELS.LECTOR,
      department: ''
    });
  };

  const saveEditMember = async () => {
    if (!editingMember || !formData.role || !formData.accessLevel) {
      showError("Rol y nivel de acceso son obligatorios");
      return;
    }

    let progressId;
    try {
      setLoading(true);
      progressId = showProgress("Actualizando miembro...");
      
      // Aquí necesitaremos implementar una función de actualización en teamManagement
      // Por ahora, simularemos la actualización recreando el miembro
      await deleteTeamMember(artistId, editingMember.id);
      
      await createTeamMember(artistId, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        accessLevel: formData.accessLevel,
        department: formData.department,
        isManual: true,
        createdBy: userData.uid
      });
      
      if (progressId) removeNotification(progressId);
      showSuccess("Miembro actualizado exitosamente");
      closeEditModal();
      await loadTeam();
    } catch (err) {
      console.error("Error actualizando miembro:", err);
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al actualizar el miembro");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar miembro
  const handleDeleteMember = async (member) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${member.name} del equipo?`)) {
      return;
    }

    let progressId;
    try {
      setLoading(true);
      progressId = showProgress("Eliminando miembro...");
      
      await deleteTeamMember(artistId, member.id);
      
      if (progressId) removeNotification(progressId);
      showSuccess(`${member.name} eliminado del equipo`);
      await loadTeam();
    } catch (err) {
      console.error("Error eliminando miembro:", err);
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al eliminar miembro");
    } finally {
      setLoading(false);
    }
    
    closeMenu();
  };

  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.TEAM_VIEW}
        fallback={
          <Sidebar theme="system">
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Acceso Denegado</h1>
              <p>No tienes permisos para ver el equipo.</p>
            </div>
          </Sidebar>
        }
      >
        <Sidebar theme="system">
          <div className={styles.container}>
            {/* Header con breadcrumb */}
            <div className={styles.header}>
              <div className={styles.breadcrumb}>
                <span>Tus equipos</span>
              </div>
              
              <div className={styles.artistHeader}>
                <div>
                  <h1 className={styles.artistName}>
                    {currentArtist?.name || "Selecciona un artista"}
                  </h1>
                </div>
                
                {artistId && (
                  <PermissionGuard permission={PERMISSIONS.TEAM_INVITE}>
                    <button 
                      className={styles.inviteButton}
                      onClick={openInviteModal}
                      disabled={loading}
                    >
                      Invitar
                    </button>
                  </PermissionGuard>
                )}
              </div>

              {/* Tabs de navegación */}
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

            {/* Contenido principal */}
            <div className={styles.content}>
              {!artistId ? (
                <div className={styles.emptyState}>
                  <h2>Selecciona un artista</h2>
                  <p>Para ver y gestionar el equipo, primero selecciona un artista.</p>
                </div>
              ) : (
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
                              {member.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <strong>{member.name || 'Sin nombre'}</strong>
                              <p>{member.email || 'Sin email'}</p>
                            </div>
                          </div>
                          
                          <div className={styles.memberFunction}>
                            {ROLE_LABELS[member.role] || member.department || 'Sin función'}
                          </div>
                          
                          <div className={styles.memberRole}>
                            <span 
                              className={styles.roleBadge}
                              style={{ 
                                backgroundColor: ACCESS_LEVEL_COLORS[member.accessLevel] || '#6b7280',
                                color: 'white'
                              }}
                            >
                              {ACCESS_LEVEL_LABELS[member.accessLevel] || member.accessLevel || 'Lector'}
                            </span>
                          </div>
                          
                          <div className={styles.memberActions}>
                            <PermissionGuard permission={PERMISSIONS.TEAM_EDIT}>
                              <div className={styles.menuContainer}>
                                <button 
                                  className={styles.menuButton}
                                  onClick={() => toggleMenu(member.id)}
                                >
                                  ⋯
                                </button>

                                {openMenuId === member.id && (
                                  <div className={styles.dropdownMenu}>
                                    <button 
                                      className={styles.menuItem}
                                      onClick={() => openEditModal(member)}
                                    >
                                      <span className={styles.menuIcon}>✏️</span>
                                      Editar
                                    </button>
                                    <button 
                                      className={styles.menuItem}
                                      onClick={() => handleDeleteMember(member)}
                                    >
                                      <span className={styles.menuIcon}>🗑️</span>
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </PermissionGuard>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      <div className={styles.form}>
                        {selectedUser && (
                          <div className={styles.selectedUserInfo}>
                            <p><strong>Usuario seleccionado:</strong> {selectedUser.name || selectedUser.email}</p>
                          </div>
                        )}

                        <div className={styles.formGroup}>
                          <label>Nombre</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Nombre completo"
                            disabled={!!selectedUser}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="usuario@ejemplo.com"
                            disabled={!!selectedUser}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Función/Rol</label>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                          >
                            {Object.entries(ROLE_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Nivel de Acceso</label>
                          <select
                            value={formData.accessLevel}
                            onChange={(e) => setFormData({...formData, accessLevel: e.target.value})}
                          >
                            {Object.entries(ACCESS_LEVEL_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Departamento (opcional)</label>
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            placeholder="ej: Artístico, Producción, Marketing"
                          />
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
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal de edición */}
            {showEditModal && editingMember && (
              <div className={styles.modalOverlay} onClick={closeEditModal}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h3>Editar miembro</h3>
                    <button onClick={closeEditModal} className={styles.closeButton}>
                      ✕
                    </button>
                  </div>
                  
                  <div className={styles.modalContent}>
                    <div className={styles.form}>
                      <div className={styles.formGroup}>
                        <label>Nombre</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Nombre completo"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="usuario@ejemplo.com"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Función/Rol</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                          {Object.entries(ROLE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Nivel de Acceso</label>
                        <select
                          value={formData.accessLevel}
                          onChange={(e) => setFormData({...formData, accessLevel: e.target.value})}
                        >
                          {Object.entries(ACCESS_LEVEL_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Departamento (opcional)</label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          placeholder="ej: Artístico, Producción, Marketing"
                        />
                      </div>

                      <div className={styles.modalFooter}>
                        <button onClick={closeEditModal} className={styles.cancelButton}>
                          Cancelar
                        </button>
                        <button 
                          onClick={saveEditMember} 
                          className={styles.inviteButton}
                          disabled={loading}
                        >
                          {loading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
