"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "../../../contexts/SessionContext";
import { useArtist } from "../../../contexts/ArtistContext";
import { useNotification } from "../../../contexts/NotificationContext";
import { usePermissions } from "../../../contexts/PermissionsContext";
import Sidebar from "../../../components/Sidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import { PERMISSIONS } from "../../../utils/roles";
import { 
  createEvent, 
  getEvents, 
  updateEvent, 
  deleteEvent,
  EVENT_STATES,
  EVENT_STATE_LABELS,
  EVENT_STATE_COLORS,
  formatDateForInput,
  formatDateForDisplay,
  calculateEventMetrics
} from "../../../utils/eventManagement";
import { REGIONES_CHILE, PAISES } from "../../../utils/geoData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from "./page.module.css";

export default function AnalisisEventosPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    lugar: '',
    comuna: '',
    region: '',
    pais: 'Chile',
    asistentes: '',
    estado: EVENT_STATES.PLANIFICADO,
    comentario: ''
  });

  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  const { showSuccess, showError, showProgress, removeNotification } = useNotification();
  const { checkPermission } = usePermissions();
  
  const userData = getUserData();
  const currentArtist = getCurrentArtist();
  const artistId = getCurrentArtistId();

  // Calcular métricas de eventos
  const eventMetrics = useMemo(() => {
    return calculateEventMetrics(events);
  }, [events]);

  // Cargar eventos
  const loadEvents = async () => {
    if (!artistId) {
      console.log('🚫 No hay artistId, saltando carga de eventos');
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Iniciando carga de eventos para artistId:', artistId);
      setLoading(true);
      
      const eventsData = await getEvents(artistId);
      console.log('✅ Eventos cargados exitosamente:', eventsData.length, eventsData);
      
      setEvents(eventsData);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      showError(`Error al cargar eventos: ${error.message}`);
      setEvents([]); // Limpiar eventos en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [artistId]);

  // Debug info - temporal para identificar problemas
  useEffect(() => {
    console.log('🔧 DEBUG INFO:', {
      userData: userData?.uid,
      currentArtist: currentArtist?.name,
      artistId,
      eventsCount: events.length,
      loading
    });
  }, [userData, currentArtist, artistId, events.length, loading]);

  // Abrir modal para nuevo evento
  const openNewEventModal = () => {
    if (!checkPermission(PERMISSIONS.ANALYTICS_EDIT)) {
      showError('No tienes permisos para crear eventos');
      return;
    }
    
    setEditingEvent(null);
    setFormData({
      name: '',
      date: '',
      lugar: '',
      comuna: '',
      region: '',
      pais: 'Chile',
      asistentes: '',
      estado: EVENT_STATES.PLANIFICADO,
      comentario: ''
    });
    setSelectedRegion('');
    setShowModal(true);
  };

  // Abrir modal para editar evento
  const openEditEventModal = (event) => {
    if (!checkPermission(PERMISSIONS.ANALYTICS_EDIT)) {
      showError('No tienes permisos para editar eventos');
      return;
    }
    
    setEditingEvent(event);
    setFormData({
      name: event.name || '',
      date: formatDateForInput(event.date?.toDate ? event.date.toDate() : event.date),
      lugar: event.lugar || '',
      comuna: event.comuna || '',
      region: event.region || '',
      pais: event.pais || 'Chile',
      asistentes: event.asistentes || '',
      estado: event.estado || EVENT_STATES.PLANIFICADO,
      comentario: event.comentario || ''
    });
    setSelectedRegion(event.region || '');
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setSelectedRegion('');
  };

  // Manejar cambio en formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si cambia la región, limpiar comuna
    if (field === 'region') {
      setSelectedRegion(value);
      setFormData(prev => ({
        ...prev,
        comuna: ''
      }));
    }
  };

  // Guardar evento
  const saveEvent = async () => {
    if (!checkPermission(PERMISSIONS.ANALYTICS_EDIT)) {
      showError('No tienes permisos para guardar eventos');
      return;
    }
    
    if (!formData.name || !formData.date || !formData.lugar) {
      showError('Nombre, fecha y lugar son obligatorios');
      return;
    }

    console.log('💾 Guardando evento:', { formData, artistId, userData: userData?.uid });

    let progressId;
    try {
      setLoading(true);
      progressId = showProgress(editingEvent ? 'Actualizando evento...' : 'Creando evento...');

      const eventData = {
        ...formData,
        date: new Date(formData.date),
        asistentes: formData.asistentes ? parseInt(formData.asistentes) : null
      };

      console.log('📝 Datos del evento a guardar:', eventData);

      if (editingEvent) {
        console.log('✏️ Actualizando evento existente:', editingEvent.id);
        await updateEvent(editingEvent.id, eventData);
        showSuccess('Evento actualizado exitosamente');
      } else {
        console.log('➕ Creando nuevo evento');
        const result = await createEvent(artistId, eventData, userData.uid);
        console.log('✅ Evento creado con ID:', result.id);
        showSuccess('Evento creado exitosamente');
      }

      closeModal();
      console.log('🔄 Recargando lista de eventos...');
      await loadEvents();
    } catch (error) {
      console.error('❌ Error guardando evento:', error);
      showError(error.message || 'Error al guardar evento');
    } finally {
      if (progressId) removeNotification(progressId);
      setLoading(false);
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async (event) => {
    if (!checkPermission(PERMISSIONS.ANALYTICS_EDIT)) {
      showError('No tienes permisos para eliminar eventos');
      return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres eliminar el evento "${event.name}"?`)) {
      return;
    }

    let progressId;
    try {
      setLoading(true);
      progressId = showProgress('Eliminando evento...');

      await deleteEvent(event.id);
      showSuccess('Evento eliminado exitosamente');
      await loadEvents();
    } catch (error) {
      console.error('Error eliminando evento:', error);
      showError(error.message || 'Error al eliminar evento');
    } finally {
      if (progressId) removeNotification(progressId);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.ANALYTICS_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el análisis de eventos.</p>
          </div>
        }
      >
        <Sidebar theme="system">
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <div>
                  <h1>🎵 Gestión de Eventos</h1>
                  <p>Administra los eventos y shows de {currentArtist?.name || 'tu artista'}</p>
                  {/* Debug info temporal */}
                  <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                    Debug: Artist ID: {artistId || 'No seleccionado'} | Eventos: {events.length} | Loading: {loading ? 'Sí' : 'No'}
                  </small>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {/* Botón de debug temporal */}
                  <button 
                    onClick={() => {
                      console.log('🔧 MANUAL DEBUG:', { artistId, userData, currentArtist });
                      loadEvents();
                    }}
                    style={{ 
                      padding: '8px 16px', 
                      background: '#f59e0b', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >
                    🔄 Debug Reload
                  </button>
                  
                  {artistId && (
                    <PermissionGuard permission={PERMISSIONS.ANALYTICS_EDIT} showDisabled={true}>
                      <button 
                        className={styles.addButton}
                        onClick={openNewEventModal}
                        disabled={loading}
                      >
                        ➕ Nuevo Evento
                      </button>
                    </PermissionGuard>
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Métricas y Visualizaciones */}
            {artistId && events.length > 0 && (
              <div className={styles.metricsSection}>
                {/* Cards de Métricas */}
                <div className={styles.metricsCards}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>🎵</div>
                    <div className={styles.metricInfo}>
                      <div className={styles.metricNumber}>{eventMetrics.totalEvents}</div>
                      <div className={styles.metricLabel}>Total Eventos</div>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>👥</div>
                    <div className={styles.metricInfo}>
                      <div className={styles.metricNumber}>{eventMetrics.totalAttendees.toLocaleString()}</div>
                      <div className={styles.metricLabel}>Total Asistentes</div>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>📅</div>
                    <div className={styles.metricInfo}>
                      <div className={styles.metricNumber}>{eventMetrics.upcomingEvents}</div>
                      <div className={styles.metricLabel}>Próximos Eventos</div>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>✅</div>
                    <div className={styles.metricInfo}>
                      <div className={styles.metricNumber}>{eventMetrics.completedEvents}</div>
                      <div className={styles.metricLabel}>Completados</div>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className={styles.chartsSection}>
                  {/* Gráfico de Asistencia */}
                  {eventMetrics.attendanceData.length > 0 && (
                    <div className={styles.chartContainer}>
                      <h3>📊 Asistencia por Evento</h3>
                      <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={eventMetrics.attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              fontSize={12}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [value.toLocaleString(), 'Asistentes']}
                              labelFormatter={(label) => {
                                const item = eventMetrics.attendanceData.find(d => d.name === label);
                                return item ? `${item.fullName}\n${item.fecha}\n${item.lugar}` : label;
                              }}
                            />
                            <Bar dataKey="asistentes" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Estados de Eventos (Gráfico Circular) */}
                  {Object.keys(eventMetrics.eventsByStatus).length > 0 && (
                    <div className={styles.chartContainer}>
                      <h3>📈 Estados de Eventos</h3>
                      <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={Object.entries(eventMetrics.eventsByStatus).map(([status, count]) => ({
                                name: EVENT_STATE_LABELS[status] || status,
                                value: count,
                                color: EVENT_STATE_COLORS[status] || '#6b7280'
                              }))}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({name, value}) => `${name}: ${value}`}
                            >
                              {Object.entries(eventMetrics.eventsByStatus).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={EVENT_STATE_COLORS[entry[0]] || '#6b7280'} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline de Próximos Eventos */}
                {eventMetrics.upcomingEventsList.length > 0 && (
                  <div className={styles.timelineSection}>
                    <h3>🗓️ Próximos Eventos</h3>
                    <div className={styles.timeline}>
                      {eventMetrics.upcomingEventsList.map((event, index) => (
                        <div key={event.id} className={styles.timelineItem}>
                          <div className={styles.timelineDate}>
                            <div className={styles.timelineDay}>
                              {new Date(event.date).getDate()}
                            </div>
                            <div className={styles.timelineMonth}>
                              {new Date(event.date).toLocaleDateString('es-ES', { month: 'short' })}
                            </div>
                          </div>
                          <div className={styles.timelineContent}>
                            <h4>{event.name}</h4>
                            <p>📍 {event.lugar}</p>
                            <p>🕐 {formatDateForDisplay(event.date)}</p>
                            {event.asistentes && (
                              <p>👥 {event.asistentes.toLocaleString()} asistentes esperados</p>
                            )}
                            <span 
                              className={styles.timelineStatus}
                              style={{ backgroundColor: EVENT_STATE_COLORS[event.estado] }}
                            >
                              {EVENT_STATE_LABELS[event.estado]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.content}>
              {!artistId ? (
                <div className={styles.emptyState}>
                  <h2>Selecciona un artista</h2>
                  <p>Para gestionar eventos, primero selecciona un artista.</p>
                </div>
              ) : loading && events.length === 0 ? (
                <div className={styles.loading}>
                  <p>Cargando eventos...</p>
                </div>
              ) : events.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎪</div>
                  <h2>No hay eventos registrados</h2>
                  <p>Comienza creando tu primer evento o show.</p>
                  <PermissionGuard permission={PERMISSIONS.ANALYTICS_EDIT} showDisabled={true}>
                    <button onClick={openNewEventModal} className={styles.addButton}>
                      Crear primer evento
                    </button>
                  </PermissionGuard>
                </div>
              ) : (
                <div className={styles.eventsList}>
                  <div className={styles.eventsTable}>
                    <div className={styles.tableHeader}>
                      <div className={styles.tableHeaderCell}>Evento</div>
                      <div className={styles.tableHeaderCell}>Fecha</div>
                      <div className={styles.tableHeaderCell}>Ubicación</div>
                      <div className={styles.tableHeaderCell}>Asistentes</div>
                      <div className={styles.tableHeaderCell}>Estado</div>
                      <div className={styles.tableHeaderCell}>Acciones</div>
                    </div>
                    {events.map((event) => (
                      <div key={event.id} className={styles.eventRow}>
                        <div className={styles.eventName}>
                          <span className={styles.eventTitle}>{event.name}</span>
                          {event.comentario && (
                            <span className={styles.eventCommentPreview}>
                              💬 {event.comentario.substring(0, 50)}{event.comentario.length > 50 ? '...' : ''}
                            </span>
                          )}
                        </div>
                        
                        <div className={styles.eventDate}>
                          {formatDateForDisplay(event.date?.toDate ? event.date.toDate() : event.date)}
                        </div>
                        
                        <div className={styles.eventLocation}>
                          <span className={styles.locationMain}>{event.lugar}</span>
                          <span className={styles.locationSecondary}>
                            {event.comuna && `${event.comuna}`}
                            {event.region && `, ${REGIONES_CHILE[event.region]?.nombre}`}
                            {event.pais && event.pais !== 'Chile' && `, ${event.pais}`}
                          </span>
                        </div>
                        
                        <div className={styles.eventAttendees}>
                          {event.asistentes ? `${event.asistentes.toLocaleString()}` : '—'}
                        </div>
                        
                        <div className={styles.eventStatus}>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: EVENT_STATE_COLORS[event.estado] }}
                          >
                            {EVENT_STATE_LABELS[event.estado]}
                          </span>
                        </div>
                        
                        <div className={styles.eventActions}>
                          <PermissionGuard permission={PERMISSIONS.ANALYTICS_EDIT} showDisabled={true}>
                            <button 
                              className={styles.editButton}
                              onClick={() => openEditEventModal(event)}
                              title="Editar evento"
                            >
                              ✏️
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission={PERMISSIONS.ANALYTICS_EDIT} showDisabled={true}>
                            <button 
                              className={styles.deleteButton}
                              onClick={() => handleDeleteEvent(event)}
                              title="Eliminar evento"
                            >
                              🗑️
                            </button>
                          </PermissionGuard>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal de evento */}
            {showModal && (
              <div className={styles.modalOverlay} onClick={closeModal}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h3>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h3>
                    <button onClick={closeModal} className={styles.closeButton}>
                      ✕
                    </button>
                  </div>
                  
                  <div className={styles.modalContent}>
                    <div className={styles.form}>
                      <div className={styles.formGroup}>
                        <label>Nombre del Evento *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Ej: Concierto en vivo, Festival de música..."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Fecha y Hora *</label>
                        <input
                          type="datetime-local"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                        />
                        <small>Formato: DD/MM/YYYY HH:mm</small>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Lugar *</label>
                        <input
                          type="text"
                          value={formData.lugar}
                          onChange={(e) => handleInputChange('lugar', e.target.value)}
                          placeholder="Ej: Teatro Municipal, Club de Jazz, Plaza Central..."
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>País</label>
                          <select
                            value={formData.pais}
                            onChange={(e) => handleInputChange('pais', e.target.value)}
                          >
                            {PAISES.map(pais => (
                              <option key={pais} value={pais}>{pais}</option>
                            ))}
                          </select>
                        </div>

                        {formData.pais === 'Chile' && (
                          <div className={styles.formGroup}>
                            <label>Región</label>
                            <select
                              value={formData.region}
                              onChange={(e) => handleInputChange('region', e.target.value)}
                            >
                              <option value="">Seleccionar región</option>
                              {Object.entries(REGIONES_CHILE).map(([codigo, region]) => (
                                <option key={codigo} value={codigo}>{region.nombre}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {formData.pais === 'Chile' && selectedRegion && (
                        <div className={styles.formGroup}>
                          <label>Comuna</label>
                          <select
                            value={formData.comuna}
                            onChange={(e) => handleInputChange('comuna', e.target.value)}
                          >
                            <option value="">Seleccionar comuna</option>
                            {REGIONES_CHILE[selectedRegion]?.comunas.map(comuna => (
                              <option key={comuna} value={comuna}>{comuna}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Asistentes</label>
                          <input
                            type="number"
                            value={formData.asistentes}
                            onChange={(e) => handleInputChange('asistentes', e.target.value)}
                            placeholder="Número de asistentes"
                            min="0"
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Estado</label>
                          <select
                            value={formData.estado}
                            onChange={(e) => handleInputChange('estado', e.target.value)}
                          >
                            {Object.entries(EVENT_STATE_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Comentario Adicional</label>
                        <textarea
                          value={formData.comentario}
                          onChange={(e) => handleInputChange('comentario', e.target.value)}
                          placeholder="Notas adicionales sobre el evento..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className={styles.modalFooter}>
                      <button onClick={closeModal} className={styles.cancelButton}>
                        Cancelar
                      </button>
                      <PermissionGuard permission={PERMISSIONS.ANALYTICS_EDIT} showDisabled={true}>
                        <button 
                          onClick={saveEvent} 
                          className={styles.saveButton}
                          disabled={loading}
                        >
                          {loading ? 'Guardando...' : (editingEvent ? 'Actualizar' : 'Crear Evento')}
                        </button>
                      </PermissionGuard>
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
