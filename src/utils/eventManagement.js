// Utilidades para gestión de eventos
import { db } from '../app/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { logEventActivity } from './activityLogger';

// Estados posibles para eventos
export const EVENT_STATES = {
  PLANIFICADO: 'planificado',
  CONFIRMADO: 'confirmado',
  EN_CURSO: 'en_curso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
  POSPUESTO: 'pospuesto'
};

export const EVENT_STATE_LABELS = {
  [EVENT_STATES.PLANIFICADO]: 'Planificado',
  [EVENT_STATES.CONFIRMADO]: 'Confirmado',
  [EVENT_STATES.EN_CURSO]: 'En Curso',
  [EVENT_STATES.COMPLETADO]: 'Completado',
  [EVENT_STATES.CANCELADO]: 'Cancelado',
  [EVENT_STATES.POSPUESTO]: 'Pospuesto'
};

export const EVENT_STATE_COLORS = {
  [EVENT_STATES.PLANIFICADO]: '#3b82f6',
  [EVENT_STATES.CONFIRMADO]: '#10b981',
  [EVENT_STATES.EN_CURSO]: '#f59e0b',
  [EVENT_STATES.COMPLETADO]: '#22c55e',
  [EVENT_STATES.CANCELADO]: '#ef4444',
  [EVENT_STATES.POSPUESTO]: '#6b7280'
};

// Función para crear un nuevo evento
export const createEvent = async (artistId, eventData, createdBy, userData = null) => {
  try {
    if (!artistId || !eventData) {
      throw new Error('Artist ID y datos del evento son requeridos');
    }

    console.log('🏗️ Creando evento:', { artistId, eventData, createdBy });

    const eventsRef = collection(db, 'events');
    
    const newEvent = {
      ...eventData,
      artistId,
      createdBy,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    console.log('📤 Enviando a Firebase:', newEvent);

    const docRef = await addDoc(eventsRef, newEvent);
    
    console.log('✅ Evento creado con ID:', docRef.id);
    
    // Registrar actividad
    if (userData) {
      await logEventActivity.created(userData, artistId, eventData.title || eventData.name);
    }
    
    return {
      id: docRef.id,
      ...newEvent
    };
  } catch (error) {
    console.error('❌ Error al crear evento:', error);
    throw error;
  }
};

// Función para obtener eventos de un artista
export const getEvents = async (artistId) => {
  try {
    if (!artistId) {
      throw new Error('Artist ID es requerido');
    }

    console.log('🔍 Buscando eventos para artistId:', artistId);

    const eventsRef = collection(db, 'events');
    
    // Usar consulta simple sin orderBy para evitar problemas de índices
    const q = query(
      eventsRef, 
      where('artistId', '==', artistId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('📊 Eventos encontrados:', querySnapshot.docs.length);
    
    const events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Evento:', { id: doc.id, data });
      return {
        id: doc.id,
        ...data
      };
    });

    // Ordenar manualmente por fecha (más reciente primero)
    const sortedEvents = events.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
      return dateB - dateA;
    });

    console.log('✅ Eventos ordenados:', sortedEvents);
    return sortedEvents;
      
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error);
    
    // Si hay un error, intentemos una consulta más básica
    try {
      console.log('🔄 Intentando consulta de respaldo...');
      const eventsRef = collection(db, 'events');
      const querySnapshot = await getDocs(eventsRef);
      
      const allEvents = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => event.artistId === artistId);
      
      console.log('📊 Eventos de respaldo encontrados:', allEvents.length);
      return allEvents;
      
    } catch (backupError) {
      console.error('❌ Error en consulta de respaldo:', backupError);
      throw error; // Lanzar el error original
    }
  }
};

// Función para actualizar un evento
export const updateEvent = async (eventId, eventData, userData = null, artistId = null) => {
  try {
    if (!eventId || !eventData) {
      throw new Error('Event ID y datos del evento son requeridos');
    }

    const eventRef = doc(db, 'events', eventId);
    
    const updatedData = {
      ...eventData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    await updateDoc(eventRef, updatedData);
    
    // Registrar actividad
    if (userData && artistId) {
      await logEventActivity.updated(userData, artistId, eventData.title || eventData.name);
    }
    
    return {
      id: eventId,
      ...updatedData
    };
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    throw error;
  }
};

// Función para eliminar un evento
export const deleteEvent = async (eventId, eventName, userData = null, artistId = null) => {
  try {
    if (!eventId) {
      throw new Error('Event ID es requerido');
    }

    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    
    // Registrar actividad
    if (userData && artistId && eventName) {
      await logEventActivity.deleted(userData, artistId, eventName);
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    throw error;
  }
};

// Función para formatear fecha para input datetime-local
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Función para formatear fecha para mostrar (DD/MM/YYYY HH:mm)
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Funciones para cálculos de métricas
export const calculateEventMetrics = (events) => {
  if (!events || events.length === 0) {
    return {
      totalEvents: 0,
      totalAttendees: 0,
      upcomingEvents: 0,
      completedEvents: 0,
      eventsByStatus: {},
      attendanceData: [],
      upcomingEventsList: []
    };
  }

  const now = new Date();
  let totalAttendees = 0;
  let upcomingEvents = 0;
  let completedEvents = 0;
  const eventsByStatus = {};
  const attendanceData = [];
  const upcomingEventsList = [];

  events.forEach(event => {
    // Calcular asistentes totales
    if (event.asistentes) {
      totalAttendees += event.asistentes;
    }

    // Contar por estados
    const status = event.estado || EVENT_STATES.PLANIFICADO;
    eventsByStatus[status] = (eventsByStatus[status] || 0) + 1;

    // Verificar si es próximo o completado
    const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
    if (eventDate > now && status !== EVENT_STATES.CANCELADO) {
      upcomingEvents++;
      upcomingEventsList.push({
        ...event,
        date: eventDate
      });
    }

    if (status === EVENT_STATES.COMPLETADO) {
      completedEvents++;
    }

    // Datos para gráfico de asistencia (solo eventos con asistentes)
    if (event.asistentes && event.asistentes > 0) {
      attendanceData.push({
        name: event.name?.length > 20 ? event.name.substring(0, 20) + '...' : event.name,
        fullName: event.name,
        asistentes: event.asistentes,
        fecha: formatDateForDisplay(eventDate),
        lugar: event.lugar,
        estado: status
      });
    }
  });

  // Ordenar próximos eventos por fecha
  upcomingEventsList.sort((a, b) => a.date - b.date);

  // Ordenar datos de asistencia por cantidad (mayor a menor)
  attendanceData.sort((a, b) => b.asistentes - a.asistentes);

  return {
    totalEvents: events.length,
    totalAttendees,
    upcomingEvents,
    completedEvents,
    eventsByStatus,
    attendanceData: attendanceData.slice(0, 10), // Top 10 eventos con más asistencia
    upcomingEventsList: upcomingEventsList.slice(0, 5) // Próximos 5 eventos
  };
};
