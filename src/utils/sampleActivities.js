import { logActivity, ACTIVITY_TYPES } from "./activityLogger";

/**
 * Genera actividades de ejemplo para probar el sistema de logs
 */
export const generateSampleActivities = async (userData, artistId) => {
  if (!userData || !artistId) {
    console.warn('No se pueden generar actividades de ejemplo sin userData y artistId');
    return;
  }

  const sampleActivities = [
    {
      type: ACTIVITY_TYPES.TEAM_MEMBER_ADDED,
      metadata: { memberName: 'María García', role: 'Manager' },
      delay: 0
    },
    {
      type: ACTIVITY_TYPES.PROJECT_CREATED,
      metadata: { projectName: 'Nuevo Álbum 2025' },
      delay: 1000
    },
    {
      type: ACTIVITY_TYPES.SOCIAL_MEDIA_CONNECTED,
      metadata: { platform: 'Instagram' },
      delay: 2000
    },
    {
      type: ACTIVITY_TYPES.TASK_CREATED,
      metadata: { taskName: 'Grabación de voces principales' },
      delay: 3000
    },
    {
      type: ACTIVITY_TYPES.TEAM_ROLE_CHANGED,
      metadata: { memberName: 'Juan Pérez', newRole: 'Administrador' },
      delay: 4000
    },
    {
      type: ACTIVITY_TYPES.TASK_COMPLETED,
      metadata: { taskName: 'Revisión de mezcla' },
      delay: 5000
    },
    {
      type: ACTIVITY_TYPES.ACCESS_REQUEST_APPROVED,
      metadata: { userEmail: 'nuevo.miembro@ejemplo.com' },
      delay: 6000
    },
    {
      type: ACTIVITY_TYPES.PROJECT_UPDATED,
      metadata: { projectName: 'EP Navideño' },
      delay: 7000
    }
  ];

  console.log('🎭 Generando actividades de ejemplo...');

  for (const activity of sampleActivities) {
    setTimeout(async () => {
      try {
        await logActivity(activity.type, userData, artistId, activity.metadata);
        console.log(`✅ Actividad creada: ${activity.type}`);
      } catch (error) {
        console.error(`❌ Error creando actividad ${activity.type}:`, error);
      }
    }, activity.delay);
  }

  console.log('🎉 Proceso de generación de actividades iniciado');
};

/**
 * Función específica para generar actividades cuando se añade un miembro al equipo
 */
export const logTeamMemberAddedActivity = async (userData, artistId, memberData) => {
  try {
    await logActivity(
      ACTIVITY_TYPES.TEAM_MEMBER_ADDED,
      userData,
      artistId,
      {
        memberName: memberData.name || memberData.email,
        role: memberData.role || 'Miembro'
      }
    );
  } catch (error) {
    console.error('Error logging team member activity:', error);
  }
};

/**
 * Función para limpiar todas las actividades de prueba (opcional)
 */
export const clearSampleActivities = async (artistId) => {
  // Esta función se podría implementar para limpiar datos de prueba
  // Por ahora solo mostramos un mensaje
  console.log(`⚠️ Para limpiar actividades del artista ${artistId}, usar las herramientas de Firebase Console`);
};
