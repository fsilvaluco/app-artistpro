import { generateSampleActivities } from "./activityLogger";

/**
 * Función para generar actividades de ejemplo (solo en desarrollo)
 */
export const createSampleActivities = async (userData, artistId) => {
  return generateSampleActivities(userData, artistId);
};

/**
 * Función para limpiar todas las actividades de prueba (opcional)
 */
export const clearSampleActivities = async (artistId) => {
  // Esta función se podría implementar para limpiar datos de prueba
  // Por ahora solo mostramos un mensaje
  console.log(`⚠️ Para limpiar actividades del artista ${artistId}, usar las herramientas de Firebase Console`);
};
