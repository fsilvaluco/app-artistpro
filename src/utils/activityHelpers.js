import { 
  logProjectActivity, 
  logTaskActivity, 
  logEventActivity,
  logBlogActivity,
  logEPKActivity,
  logNoteActivity,
  logKanbanActivity,
  logAccessActivity,
  logConfigActivity,
  logFileActivity,
  logSocialMediaActivity,
  logSystemActivity
} from './activityLogger';

/**
 * Helper centralizado para facilitar el logging de actividades
 * Wrapper que simplifica el uso de los loggers específicos
 */
export class ActivityHelper {
  constructor(userData, artistId) {
    this.userData = userData;
    this.artistId = artistId;
  }

  // Métodos para proyectos
  async projectCreated(projectName) {
    if (!this.userData || !this.artistId) return;
    return logProjectActivity.created(this.userData, this.artistId, projectName);
  }

  async projectUpdated(projectName) {
    if (!this.userData || !this.artistId) return;
    return logProjectActivity.updated(this.userData, this.artistId, projectName);
  }

  async projectDeleted(projectName) {
    if (!this.userData || !this.artistId) return;
    return logProjectActivity.deleted(this.userData, this.artistId, projectName);
  }

  // Métodos para tareas
  async taskCreated(taskName) {
    if (!this.userData || !this.artistId) return;
    return logTaskActivity.created(this.userData, this.artistId, taskName);
  }

  async taskUpdated(taskName) {
    if (!this.userData || !this.artistId) return;
    return logTaskActivity.updated(this.userData, this.artistId, taskName);
  }

  async taskCompleted(taskName) {
    if (!this.userData || !this.artistId) return;
    return logTaskActivity.completed(this.userData, this.artistId, taskName);
  }

  async taskDeleted(taskName) {
    if (!this.userData || !this.artistId) return;
    return logTaskActivity.deleted(this.userData, this.artistId, taskName);
  }

  // Métodos para eventos
  async eventCreated(eventName) {
    if (!this.userData || !this.artistId) return;
    return logEventActivity.created(this.userData, this.artistId, eventName);
  }

  async eventUpdated(eventName) {
    if (!this.userData || !this.artistId) return;
    return logEventActivity.updated(this.userData, this.artistId, eventName);
  }

  async eventDeleted(eventName) {
    if (!this.userData || !this.artistId) return;
    return logEventActivity.deleted(this.userData, this.artistId, eventName);
  }

  async eventPublished(eventName) {
    if (!this.userData || !this.artistId) return;
    return logEventActivity.published(this.userData, this.artistId, eventName);
  }

  // Métodos para blog/comunicados
  async blogCreated(postTitle) {
    if (!this.userData || !this.artistId) return;
    return logBlogActivity.created(this.userData, this.artistId, postTitle);
  }

  async blogUpdated(postTitle) {
    if (!this.userData || !this.artistId) return;
    return logBlogActivity.updated(this.userData, this.artistId, postTitle);
  }

  async blogDeleted(postTitle) {
    if (!this.userData || !this.artistId) return;
    return logBlogActivity.deleted(this.userData, this.artistId, postTitle);
  }

  async blogPublished(postTitle) {
    if (!this.userData || !this.artistId) return;
    return logBlogActivity.published(this.userData, this.artistId, postTitle);
  }

  // Métodos para notas
  async noteCreated(noteTitle) {
    if (!this.userData || !this.artistId) return;
    return logNoteActivity.created(this.userData, this.artistId, noteTitle);
  }

  async noteUpdated(noteTitle) {
    if (!this.userData || !this.artistId) return;
    return logNoteActivity.updated(this.userData, this.artistId, noteTitle);
  }

  async noteDeleted(noteTitle) {
    if (!this.userData || !this.artistId) return;
    return logNoteActivity.deleted(this.userData, this.artistId, noteTitle);
  }

  // Métodos para archivos
  async fileUploaded(fileName) {
    if (!this.userData || !this.artistId) return;
    return logFileActivity.uploaded(this.userData, this.artistId, fileName);
  }

  async fileDeleted(fileName) {
    if (!this.userData || !this.artistId) return;
    return logFileActivity.deleted(this.userData, this.artistId, fileName);
  }

  // Métodos para redes sociales
  async socialMediaConnected(platform) {
    if (!this.userData || !this.artistId) return;
    return logSocialMediaActivity.connected(this.userData, this.artistId, platform);
  }

  async socialMediaDisconnected(platform) {
    if (!this.userData || !this.artistId) return;
    return logSocialMediaActivity.disconnected(this.userData, this.artistId, platform);
  }

  async reportGenerated(platform) {
    if (!this.userData || !this.artistId) return;
    return logSocialMediaActivity.reportGenerated(this.userData, this.artistId, platform);
  }

  // Métodos para configuración
  async settingsUpdated() {
    if (!this.userData || !this.artistId) return;
    return logConfigActivity.settingsUpdated(this.userData, this.artistId);
  }

  async permissionsUpdated(targetUser) {
    if (!this.userData || !this.artistId) return;
    return logConfigActivity.permissionsUpdated(this.userData, this.artistId, targetUser);
  }

  async profileUpdated() {
    if (!this.userData || !this.artistId) return;
    return logConfigActivity.profileUpdated(this.userData, this.artistId);
  }
}

/**
 * Hook personalizado para usar el ActivityHelper en componentes React
 */
export const useActivityLogger = (userData, artistId) => {
  return new ActivityHelper(userData, artistId);
};

/**
 * Función de conveniencia para crear un ActivityHelper
 */
export const createActivityLogger = (userData, artistId) => {
  return new ActivityHelper(userData, artistId);
};
