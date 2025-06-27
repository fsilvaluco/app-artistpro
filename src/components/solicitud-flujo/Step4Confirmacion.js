"use client";

import styles from "./Step4Confirmacion.module.css";

export default function Step4Confirmacion({ formData, onClose }) {
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Icono de éxito */}
        <div className={styles.successIcon}>
          <div className={styles.checkmark}>
            <div className={styles.checkmarkStem}></div>
            <div className={styles.checkmarkKick}></div>
          </div>
        </div>

        {/* Mensaje principal */}
        <h2>¡Solicitud enviada con éxito!</h2>
        <p className={styles.mainMessage}>
          Tu solicitud para unirte al equipo de <strong>{formData.selectedArtist?.name}</strong> 
          ha sido enviada correctamente.
        </p>

        {/* Información de la solicitud */}
        <div className={styles.requestInfo}>
          <h3>Detalles de tu solicitud</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Artista:</span>
              <span className={styles.infoValue}>{formData.selectedArtist?.name}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Solicitante:</span>
              <span className={styles.infoValue}>
                {formData.firstName} {formData.lastName}
              </span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{formData.businessEmail}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rol solicitado:</span>
              <span className={styles.infoValue}>
                {getRoleLabel(formData.role)}
              </span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha de solicitud:</span>
              <span className={styles.infoValue}>
                {new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className={styles.nextSteps}>
          <h3>¿Qué sigue ahora?</h3>
          <div className={styles.stepsList}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <span className={styles.stepTitle}>Revisión de la solicitud</span>
                <span className={styles.stepDescription}>
                  El administrador del artista revisará tu solicitud y verificará tu información.
                </span>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <span className={styles.stepTitle}>Notificación por email</span>
                <span className={styles.stepDescription}>
                  Recibirás una notificación en <strong>{formData.businessEmail}</strong> con la 
                  decisión del administrador.
                </span>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <span className={styles.stepTitle}>Acceso a la plataforma</span>
                <span className={styles.stepDescription}>
                  Si tu solicitud es aprobada, podrás acceder inmediatamente a la información 
                  del artista según tu nivel de permisos.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className={styles.contactInfo}>
          <div className={styles.contactIcon}>📞</div>
          <div className={styles.contactText}>
            <p><strong>¿Necesitas ayuda?</strong></p>
            <p>
              Si tienes alguna pregunta sobre tu solicitud, puedes contactar al administrador 
              del artista o a nuestro equipo de soporte.
            </p>
          </div>
        </div>

        {/* Recordatorio importante */}
        <div className={styles.reminder}>
          <span className={styles.reminderIcon}>⚠️</span>
          <span className={styles.reminderText}>
            <strong>Recordatorio:</strong> Solo puedes tener una solicitud pendiente a la vez. 
            Espera la respuesta antes de solicitar acceso a otro artista.
          </span>
        </div>
      </div>

      {/* Botón de cierre */}
      <div className={styles.actions}>
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

// Función helper para obtener el label del rol
function getRoleLabel(roleValue) {
  const roleMap = {
    'manager': 'Manager',
    'agente': 'Agente',
    'musico': 'Músico',
    'productor': 'Productor',
    'ingeniero': 'Ingeniero de sonido',
    'marketing': 'Marketing',
    'prensa': 'Prensa',
    'booking': 'Booking',
    'diseñador': 'Diseñador',
    'fotografo': 'Fotógrafo',
    'video': 'Video/Audiovisual',
    'otro': 'Otro'
  };
  return roleMap[roleValue] || roleValue;
}
