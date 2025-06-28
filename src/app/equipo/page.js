"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import { useNotification } from "../../contexts/NotificationContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import PermissionGuard from "../../components/PermissionGuard";
import Sidebar from "../../components/Sidebar";
import { getTeamMembers, createTeamMember, deleteTeamMember, addUserToTeam, clearTeamSampleData, getTeamMembersFromRoles, ensureUserHasRole, debugFirebaseStructure, ensureUserExists, diagnoseUserState, getTeamMembersFromAccessContext, debugArtistRequests, diagnosisPermissions, TEAM_ROLES, getRoleLabel } from "../../utils/teamManagement";
import { getArtistRequests, approveArtistRequest, rejectArtistRequest, REQUEST_STATUS } from "../../utils/artistRequests";
import { updateArtistRequestWithRole } from "../../utils/roleManagement";
import { PERMISSIONS, ROLES, ROLE_LABELS, ROLE_COLORS, ACCESS_LEVELS, ACCESS_LEVEL_LABELS, ACCESS_LEVEL_COLORS } from "../../utils/roles";
import UserSelector from "../../components/UserSelector";
import styles from "./page.module.css";

export default function EquipoPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({}); // Para roles en solicitudes
  const [activeTab, setActiveTab] = useState('team'); // 'team' o 'requests'
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

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest(`.${styles.menuContainer}`)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Cargar equipo
  const loadTeam = async () => {
    if (!userData?.uid || !artistId) {
      console.log("⚠️ loadTeam: Faltan datos - userData:", !!userData?.uid, "artistId:", !!artistId);
      setTeamMembers([]);
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      console.log("👤 Usuario actual:", userData.uid, userData.email);
      console.log("🎯 Artista actual:", artistId);
      
      // Ejecutar diagnóstico completo
      console.log("🩺 Ejecutando diagnóstico del estado...");
      await diagnoseUserState(userData, artistId);
      
      // Asegurar que el usuario actual exista en la colección users
      console.log("🔧 Asegurando que el usuario existe en Firebase...");
      await ensureUserExists(userData.uid, userData.email, userData.name);
      
      // Asegurar que el usuario actual tenga un rol asignado (función de desarrollo)
      console.log("🔧 Verificando/creando rol del usuario actual...");
      const roleResult = await ensureUserHasRole(userData.uid, artistId, userData.email);
      console.log("🔧 Resultado de ensureUserHasRole:", roleResult);
      
      // Mostrar debug completo de Firebase
      console.log("🔍 Ejecutando debug completo de Firebase...");
      await debugFirebaseStructure(artistId, userData.uid);
      
      // Usar la nueva función que obtiene miembros desde roles asignados
      console.log("👥 Obteniendo miembros del equipo desde roles...");
      let members = await getTeamMembersFromRoles(artistId);
      console.log("👥 Miembros desde roles:", members);
      
      // Si no hay miembros desde roles, intentar obtenerlos desde el contexto de acceso
      if (!members || members.length === 0) {
        console.log("🔄 No hay miembros desde roles, intentando desde contexto de acceso...");
        members = await getTeamMembersFromAccessContext(artistId, userData.uid);
        console.log("👥 Miembros desde contexto de acceso:", members);
      }
      
      setTeamMembers(members || []);
    } catch (err) {
      console.error("❌ Error cargando equipo:", err);
      setError(err.message || "Error al cargar el equipo");
    } finally {
      setLoading(false);
    }
  };

  // Cargar solicitudes pendientes para el artista actual
  const loadPendingRequests = async () => {
    if (!artistId) {
      setPendingRequests([]);
      return;
    }

    try {
      setRequestsLoading(true);
      const allRequests = await getArtistRequests();
      
      // Filtrar solicitudes pendientes para el artista actual
      const artistRequests = allRequests.filter(request => 
        request.artistId === artistId && 
        request.status === REQUEST_STATUS.PENDING
      );
      
      setPendingRequests(artistRequests);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      showError("Error al cargar solicitudes pendientes");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
    loadPendingRequests();
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

  // Manejar aprobación de solicitud
  const handleApproveRequest = async (requestId) => {
    const selectedAccessLevel = selectedRoles[requestId] || ACCESS_LEVELS.LECTOR;
    
    let progressId;
    try {
      progressId = showProgress("Aprobando solicitud...");
      
      // Pasar el nivel de acceso como segundo parámetro y el adminUserId como tercero
      await updateArtistRequestWithRole(requestId, selectedAccessLevel, userData.uid);
      
      if (progressId) removeNotification(progressId);
      showSuccess("Solicitud aprobada exitosamente");
      
      // Recargar solicitudes y equipo
      await loadPendingRequests();
      await loadTeam();
    } catch (err) {
      console.error("Error aprobando solicitud:", err);
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al aprobar la solicitud");
    }
  };

  // Manejar rechazo de solicitud
  const handleRejectRequest = async (requestId, reason = "No especificado") => {
    let progressId;
    try {
      progressId = showProgress("Rechazando solicitud...");
      
      await rejectArtistRequest(requestId, reason);
      
      if (progressId) removeNotification(progressId);
      showSuccess("Solicitud rechazada");
      
      // Recargar solicitudes
      await loadPendingRequests();
    } catch (err) {
      console.error("Error rechazando solicitud:", err);
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al rechazar la solicitud");
    }
  };

  // Manejar cambio de nivel de acceso para solicitud
  const handleRoleChange = (requestId, accessLevel) => {
    setSelectedRoles(prev => ({
      ...prev,
      [requestId]: accessLevel
    }));
  };

  // Limpiar datos de ejemplo del equipo
  const handleClearSampleData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los miembros de ejemplo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    let progressId;
    try {
      progressId = showProgress("Limpiando datos de ejemplo...");
      
      const result = await clearTeamSampleData(artistId, userData.uid);
      
      if (progressId) removeNotification(progressId);
      showSuccess(`Eliminados ${result.deletedCount} miembros de ejemplo`);
      
      // Recargar equipo
      await loadTeam();
    } catch (err) {
      console.error("Error limpiando datos de ejemplo:", err);
      if (progressId) removeNotification(progressId);
      showError(err.message || "Error al limpiar datos de ejemplo");
    }
  };

  // Funciones para el menú desplegable
  const toggleMenu = (memberId) => {
    if (openMenuId === memberId) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(memberId);
      
      // Usar setTimeout para permitir que el DOM se actualice
      setTimeout(() => {
        const menuContainer = document.querySelector(`[data-member-id="${memberId}"] .${styles.menuContainer}`);
        const menuElement = menuContainer?.querySelector(`.${styles.dropdownMenu}`);
        
        if (menuElement && menuContainer) {
          // Resetear clases primero
          menuElement.classList.remove(styles.dropdownMenuUp);
          
          // Forzar un repaint para obtener medidas correctas
          menuElement.offsetHeight;
          
          // Calcular posición
          const containerRect = menuContainer.getBoundingClientRect();
          const menuRect = menuElement.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          // Calcular si hay espacio suficiente abajo
          const spaceBelow = viewportHeight - (containerRect.bottom - scrollTop);
          const menuHeight = menuRect.height;
          
          // Si no hay espacio abajo y hay espacio arriba, mostrar hacia arriba
          if (spaceBelow < menuHeight + 20 && containerRect.top > menuHeight + 20) {
            menuElement.classList.add(styles.dropdownMenuUp);
          }
        }
      }, 50); // Aumentar el timeout para asegurar que el DOM esté listo
    }
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

  // Función helper para obtener el label correcto del rol
  const getMemberRoleLabel = (member) => {
    console.log("🏷️ getMemberRoleLabel - member:", member);
    
    // Si tiene un rol de equipo (team role), mostrarlo
    if (member.role && TEAM_ROLES.find(r => r.value === member.role)) {
      const label = getRoleLabel(member.role);
      console.log("🏷️ Found team role:", member.role, "label:", label);
      return label;
    }
    
    // Si tiene un rol de permisos (access level), mostrarlo
    if (member.role && ACCESS_LEVEL_LABELS[member.role]) {
      const label = ACCESS_LEVEL_LABELS[member.role];
      console.log("🏷️ Found access level role:", member.role, "label:", label);
      return label;
    }
    
    // Si tiene accessLevel, mostrarlo
    if (member.accessLevel && ACCESS_LEVEL_LABELS[member.accessLevel]) {
      const label = ACCESS_LEVEL_LABELS[member.accessLevel];
      console.log("🏷️ Found accessLevel:", member.accessLevel, "label:", label);
      return label;
    }
    
    // Si tiene department, mostrarlo
    if (member.department) {
      console.log("🏷️ Using department:", member.department);
      return member.department;
    }
    
    // Fallback
    console.log("🏷️ Using fallback: Sin rol");
    return 'Sin rol';
  };

  // Función helper para obtener el nivel de acceso correcto
  const getMemberAccessLevel = (member) => {
    console.log("🔑 getMemberAccessLevel - member:", member);
    
    // Si tiene accessLevel explícito, usarlo
    if (member.accessLevel) {
      console.log("🔑 Using explicit accessLevel:", member.accessLevel);
      return member.accessLevel;
    }
    
    // Si el rol es un rol de permisos, usarlo como accessLevel
    if (member.role && ACCESS_LEVEL_LABELS[member.role]) {
      console.log("🔑 Using role as accessLevel:", member.role);
      return member.role;
    }
    
    // Fallback: si tiene role de equipo, asumir que es editor
    if (member.role && TEAM_ROLES.find(r => r.value === member.role)) {
      console.log("🔑 Team role found, defaulting to EDITOR");
      return ACCESS_LEVELS.EDITOR;
    }
    
    // Default
    console.log("🔑 Using default: LECTOR");
    return ACCESS_LEVELS.LECTOR;
  };

  // Función de diagnóstico de permisos
  const handleDiagnosisPermissions = async () => {
    if (!userData?.uid || !artistId) {
      showError("Faltan datos de usuario o artista para el diagnóstico");
      return;
    }
    
    try {
      console.log("🔧 Iniciando diagnóstico de permisos...");
      await diagnosisPermissions(userData.uid, artistId, userData.email);
      showSuccess("Diagnóstico completado. Revisa la consola del navegador (F12)");
    } catch (error) {
      console.error("Error en diagnóstico:", error);
      showError("Error al ejecutar diagnóstico: " + error.message);
    }
  };

  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.TEAM_VIEW}
        fallback={
          <Sidebar>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Acceso Denegado</h1>
              <p>No tienes permisos para ver el equipo.</p>
            </div>
          </Sidebar>
        }
      >
        <Sidebar>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <PermissionGuard permission={PERMISSIONS.TEAM_INVITE}>
                      <button 
                        className={styles.inviteButton}
                        onClick={openInviteModal}
                        disabled={loading}
                      >
                        Invitar
                      </button>
                    </PermissionGuard>
                    
                    {/* Botón de diagnóstico temporal */}
                    <button 
                      onClick={handleDiagnosisPermissions}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                      title="Diagnosticar permisos"
                    >
                      🔧 Debug Permisos
                    </button>
                    
                    <PermissionGuard permission={PERMISSIONS.ADMIN_SETTINGS}>
                      <button 
                        className={styles.clearButton}
                        onClick={handleClearSampleData}
                        disabled={loading}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        🧹 Limpiar Ejemplo
                      </button>
                      
                      <button 
                        className={styles.debugButton}
                        onClick={async () => {
                          console.log("🔧 Debug: Verificando estructura de Firebase...");
                          await debugFirebaseStructure(artistId, userData.uid);
                          console.log("🔧 Debug: Asegurando que el usuario existe...");
                          await ensureUserExists(userData.uid, userData.email, userData.name);
                          console.log("🔧 Debug: Verificando rol del usuario actual...");
                          await ensureUserHasRole(userData.uid, artistId, userData.email);
                          showSuccess("Debug completado - revisar consola");
                          await loadTeam();
                        }}
                        disabled={loading}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        🔧 Debug Firebase
                      </button>
                    </PermissionGuard>
                  </div>
                )}
              </div>

              {/* Tabs de navegación */}
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'team' ? styles.active : ''}`}
                  onClick={() => setActiveTab('team')}
                >
                  Miembros del equipo
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  Solicitudes pendientes
                  {pendingRequests.length > 0 && (
                    <span className={styles.badge}>{pendingRequests.length}</span>
                  )}
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
                <>
                  {/* Tab de Miembros del equipo */}
                  {activeTab === 'team' && (
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
                          <h3>No hay miembros en el equipo</h3>
                          <p>No se encontraron usuarios con roles asignados para este artista.</p>
                          <div style={{ marginTop: '20px' }}>
                            <PermissionGuard permission={PERMISSIONS.ADMIN_SETTINGS} showDisabled={false}>
                              <button 
                                onClick={async () => {
                                  console.log("🔧 Configurando acceso automático...");
                                  await diagnoseUserState(userData, artistId);
                                  await ensureUserExists(userData.uid, userData.email, userData.name);
                                  await ensureUserHasRole(userData.uid, artistId, userData.email);
                                  showSuccess("Acceso configurado - revisar consola para detalles");
                                  await loadTeam();
                                }}
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '12px 24px',
                                  borderRadius: '8px',
                                  fontSize: '16px',
                                  cursor: 'pointer',
                                  marginRight: '12px'
                                }}
                              >
                                🔧 Configurar Mi Acceso
                              </button>
                            </PermissionGuard>
                            <button onClick={openInviteModal} className={styles.inviteButton}>
                              Invitar miembro
                            </button>
                          </div>
                          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                            <p><strong>Estructura esperada en Firebase:</strong></p>
                            <p>• Colección <code>users</code> con tu información de usuario</p>
                            <p>• Colección <code>userRoles</code> con roles asignados por artista</p>
                          </div>
                        </div>
                      )}

                  {!loading && !error && teamMembers.length > 0 && (
                    <div className={styles.membersList}>
                      <div className={styles.membersHeader}>
                        <div>Nombre</div>
                        <div>Rol</div>
                        <div>Nivel De Acceso</div>
                        <div>Administrar</div>
                      </div>
                      
                      {teamMembers.map((member) => (
                        <div key={member.id} className={styles.memberItem} data-member-id={member.id}>
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
                            {getMemberRoleLabel(member)}
                          </div>
                          
                          <div className={styles.memberRole}>
                            <span 
                              className={styles.roleBadge}
                              style={{ 
                                backgroundColor: ACCESS_LEVEL_COLORS[getMemberAccessLevel(member)] || '#6b7280',
                                color: 'white'
                              }}
                            >
                              {ACCESS_LEVEL_LABELS[getMemberAccessLevel(member)] || getMemberAccessLevel(member) || 'Lector'}
                            </span>
                          </div>
                          
                          <div className={styles.memberActions}>
                            <PermissionGuard permission={PERMISSIONS.TEAM_EDIT}>
                              <div className={styles.menuContainer} data-member-id={member.id}>
                                <button 
                                  className={`${styles.menuButton} ${openMenuId === member.id ? styles.menuButtonActive : ''}`}
                                  onClick={() => toggleMenu(member.id)}
                                  title="Administrar miembro del equipo"
                                  aria-label="Opciones de administración"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>

                                {openMenuId === member.id && (
                                  <div className={styles.dropdownMenu}>
                                    <button 
                                      className={styles.menuItem}
                                      onClick={() => openEditModal(member)}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      Editar información
                                    </button>
                                    <button 
                                      className={styles.menuItem}
                                      onClick={() => handleDeleteMember(member)}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      Quitar del equipo
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

                  {/* Tab de Solicitudes pendientes */}
                  {activeTab === 'requests' && (
                    <div className={styles.section}>
                      <h2>Solicitudes pendientes</h2>
                      
                      {requestsLoading && (
                        <div className={styles.loading}>
                          <p>Cargando solicitudes...</p>
                        </div>
                      )}

                      {!requestsLoading && pendingRequests.length === 0 && (
                        <div className={styles.emptyState}>
                          <p>No hay solicitudes pendientes</p>
                        </div>
                      )}

                      {!requestsLoading && pendingRequests.length > 0 && (
                        <div className={styles.requestsList}>
                          {pendingRequests.map((request) => (
                            <div key={request.id} className={styles.requestItem}>
                              <div className={styles.requestInfo}>
                                <div className={styles.avatar}>
                                  {request.userName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <strong>{request.userName || 'Usuario'}</strong>
                                  <p>{request.userEmail}</p>
                                  {request.message && (
                                    <p className={styles.requestMessage}>"{request.message}"</p>
                                  )}
                                  <p className={styles.requestDate}>
                                    Solicitado el {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className={styles.requestActions}>
                                <div className={styles.roleSelector}>
                                  <label>Asignar nivel de acceso:</label>
                                  <select 
                                    value={selectedRoles[request.id] || ACCESS_LEVELS.LECTOR}
                                    onChange={(e) => handleRoleChange(request.id, e.target.value)}
                                    className={styles.roleSelect}
                                  >
                                    <option value={ACCESS_LEVELS.LECTOR}>Lector</option>
                                    <option value={ACCESS_LEVELS.EDITOR}>Editor</option>
                                    <option value={ACCESS_LEVELS.ADMINISTRADOR}>Administrador</option>
                                  </select>
                                </div>
                                
                                <div className={styles.actionButtons}>
                                  <button 
                                    className={styles.approveButton}
                                    onClick={() => handleApproveRequest(request.id)}
                                  >
                                    ✓ Aprobar
                                  </button>
                                  <button 
                                    className={styles.rejectButton}
                                    onClick={() => handleRejectRequest(request.id)}
                                  >
                                    ✗ Rechazar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
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
                          <label>Rol</label>
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
                        <label>Rol</label>
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
