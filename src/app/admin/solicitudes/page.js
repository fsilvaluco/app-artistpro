"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import { usePermissions } from "../../contexts/PermissionsContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import PermissionGuard from "../../components/PermissionGuard";
import { 
  getArtistRequests,
  approveArtistRequest,
  rejectArtistRequest,
  REQUEST_STATUS
} from "../../utils/artistRequests";
import { updateArtistRequestWithRole } from "../../utils/roleManagement";
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS, getAssignableRoles } from "../../utils/roles";
import { PERMISSIONS } from "../../utils/roles";
import styles from "./page.module.css";

export default function AdminSolicitudes() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [selectedRoles, setSelectedRoles] = useState({}); // Para manejar roles seleccionados
  
  const { user, isAuthenticated } = useSession();
  const { userRole } = usePermissions();
  const { showSuccess, showError, showProgress, removeNotification } = useNotification();
  const router = useRouter();

  // Obtener roles que puede asignar el usuario actual
  const assignableRoles = getAssignableRoles(userRole);

  // Cargar solicitudes
  const loadRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await getArtistRequests();
      console.log("📥 Solicitudes cargadas:", allRequests);
      setRequests(allRequests);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      showError("Error al cargar las solicitudes", {
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  // Aprobar solicitud con rol
  const handleApproveWithRole = async (requestId) => {
    const selectedRole = selectedRoles[requestId] || ROLES.VIEWER;
    const request = requests.find(r => r.id === requestId);
    
    // Debug logging
    console.log("🔍 Debug aprobación:", {
      requestId,
      selectedRole,
      selectedRolesState: selectedRoles,
      ROLES_VIEWER: ROLES.VIEWER,
      hasSelectedRole: selectedRoles.hasOwnProperty(requestId)
    });
    
    // Validación adicional antes de proceder
    if (!selectedRole) {
      showError("Error: No se pudo determinar el rol a asignar");
      return;
    }
    
    let progressId;
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      
      progressId = showProgress(`Aprobando solicitud de ${request?.userName}...`);
      
      await updateArtistRequestWithRole(requestId, selectedRole, user.uid);
      console.log("✅ Solicitud aprobada con rol:", selectedRole);
      
      if (progressId) removeNotification(progressId);
      
      showSuccess(
        `Solicitud de ${request?.userName} aprobada como ${ROLE_LABELS[selectedRole]}`,
        {
          title: "Solicitud Aprobada",
          duration: 6000
        }
      );
      
      await loadRequests(); // Recargar solicitudes
      
      // Limpiar rol seleccionado
      setSelectedRoles(prev => {
        const newRoles = { ...prev };
        delete newRoles[requestId];
        return newRoles;
      });
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
      
      if (progressId) removeNotification(progressId);
      
      showError("Error al aprobar la solicitud", {
        message: error.message,
        duration: 8000
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Aprobar solicitud (método simple)
  const handleApprove = async (requestId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      await approveArtistRequest(requestId);
      console.log("✅ Solicitud aprobada:", requestId);
      await loadRequests(); // Recargar solicitudes
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
      alert("Error al aprobar la solicitud");
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Rechazar solicitud
  const handleReject = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    
    let progressId;
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      
      progressId = showProgress(`Rechazando solicitud de ${request?.userName}...`);
      
      await rejectArtistRequest(requestId);
      console.log("❌ Solicitud rechazada:", requestId);
      
      if (progressId) removeNotification(progressId);
      
      showSuccess(
        `Solicitud de ${request?.userName} para "${request?.artistName}" rechazada`,
        {
          title: "Solicitud Rechazada",
          duration: 6000
        }
      );
      
      await loadRequests(); // Recargar solicitudes
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      
      if (progressId) removeNotification(progressId);
      
      showError("Error al rechazar la solicitud", {
        message: error.message,
        duration: 8000
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Filtrar solicitudes
  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  // Obtener clase CSS según el estado
  const getStatusClass = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING:
        return styles.statusPending;
      case REQUEST_STATUS.APPROVED:
        return styles.statusApproved;
      case REQUEST_STATUS.REJECTED:
        return styles.statusRejected;
      default:
        return '';
    }
  };

  // Obtener texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING:
        return 'Pendiente';
      case REQUEST_STATUS.APPROVED:
        return 'Aprobada';
      case REQUEST_STATUS.REJECTED:
        return 'Rechazada';
      default:
        return status;
    }
  };

  // Manejar cambio de rol seleccionado
  const handleRoleChange = (requestId, role) => {
    setSelectedRoles(prev => ({ ...prev, [requestId]: role }));
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    
    loadRequests();
  }, [isAuthenticated, router]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <PermissionGuard 
      permission={PERMISSIONS.ADMIN_REQUESTS}
      fallback={
        <div className={styles.noAccess}>
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para gestionar solicitudes.</p>
          <button onClick={() => router.push('/inicio')} className={styles.backButton}>
            Volver al Inicio
          </button>
        </div>
      }
    >
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
        <div className={styles.header}>
          <h1>Administrar Solicitudes de Acceso</h1>
          <button 
            onClick={loadRequests}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? 'Cargando...' : '🔄 Actualizar'}
          </button>
        </div>

        {/* Filtros */}
        <div className={styles.filters}>
          <label>Filtrar por estado:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas</option>
            <option value={REQUEST_STATUS.PENDING}>Pendientes</option>
            <option value={REQUEST_STATUS.APPROVED}>Aprobadas</option>
            <option value={REQUEST_STATUS.REJECTED}>Rechazadas</option>
          </select>
        </div>

        {/* Lista de solicitudes */}
        <div className={styles.requestsList}>
          {loading ? (
            <div className={styles.loading}>Cargando solicitudes...</div>
          ) : filteredRequests.length === 0 ? (
            <div className={styles.noRequests}>
              No hay solicitudes {filter !== 'all' ? `con estado "${getStatusText(filter)}"` : ''}
            </div>
          ) : (
            filteredRequests.map(request => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <div className={styles.requestHeader}>
                    <h3>{request.userName}</h3>
                    <span className={`${styles.status} ${getStatusClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  
                  <div className={styles.requestDetails}>
                    <p><strong>Email:</strong> {request.userEmail}</p>
                    <p><strong>Artista:</strong> {request.artistName}</p>
                    <p><strong>Fecha:</strong> {request.createdAt?.toDate()?.toLocaleDateString() || 'N/A'}</p>
                    {request.message && (
                      <p><strong>Mensaje:</strong> {request.message}</p>
                    )}
                  </div>
                </div>

                {request.status === REQUEST_STATUS.PENDING && (
                  <div className={styles.requestActions}>
                    {/* Selector de rol */}
                    <div className={styles.roleSelector}>
                      <label className={styles.roleLabel}>Asignar rol:</label>
                      <select
                        value={selectedRoles[request.id] || ROLES.VIEWER}
                        onChange={(e) => handleRoleChange(request.id, e.target.value)}
                        className={styles.roleSelect}
                        disabled={actionLoading[request.id]}
                      >
                        {assignableRoles.map(role => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Botones de acción */}
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleApproveWithRole(request.id)}
                        disabled={actionLoading[request.id]}
                        className={styles.approveButton}
                        title={`Aprobar con rol: ${ROLE_LABELS[selectedRoles[request.id] || ROLES.VIEWER]}`}
                      >
                        {actionLoading[request.id] ? 'Procesando...' : '✅ Aprobar con Rol'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading[request.id]}
                        className={styles.rejectButton}
                      >
                        {actionLoading[request.id] ? 'Procesando...' : '❌ Rechazar'}
                      </button>
                    </div>

                    {/* Información del rol seleccionado */}
                    {selectedRoles[request.id] && (
                      <div className={styles.roleInfo}>
                        <span className={styles.roleDescription}>
                          {ROLE_DESCRIPTIONS[selectedRoles[request.id]]}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
    </PermissionGuard>
  );
}
