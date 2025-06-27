"use client";

import styles from "./Step3TerminosCondiciones.module.css";

export default function Step3TerminosCondiciones({ formData, updateFormData, onSubmit, onPrev, isValid, isSubmitting }) {
  
  const handleTermsChange = (accepted) => {
    updateFormData({ acceptedTerms: accepted });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Aceptar Términos y Condiciones</h2>
        <p className={styles.description}>
          Antes de enviar tu solicitud, necesitas aceptar nuestros términos y condiciones.
        </p>

        {/* Resumen de la solicitud */}
        <div className={styles.summaryCard}>
          <h3>Resumen de tu solicitud</h3>
          
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Artista:</span>
              <span className={styles.summaryValue}>{formData.selectedArtist?.name}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Nombre:</span>
              <span className={styles.summaryValue}>
                {formData.firstName} {formData.lastName}
              </span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Email:</span>
              <span className={styles.summaryValue}>{formData.businessEmail}</span>
            </div>
            
            {formData.company && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Empresa:</span>
                <span className={styles.summaryValue}>{formData.company}</span>
              </div>
            )}
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Rol:</span>
              <span className={styles.summaryValue}>
                {getRoleLabel(formData.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className={styles.termsSection}>
          <div className={styles.termsContent}>
            <h4>Términos y Condiciones de Uso</h4>
            <div className={styles.termsText}>
              <p>
                Al solicitar acceso a un perfil de artista en nuestra plataforma de gestión musical, 
                aceptas cumplir con los siguientes términos:
              </p>
              
              <ul>
                <li>
                  <strong>Uso responsable:</strong> Te comprometes a usar la plataforma de manera 
                  responsable y profesional, respetando la información confidencial del artista.
                </li>
                <li>
                  <strong>Veracidad de la información:</strong> Garantizas que toda la información 
                  proporcionada en esta solicitud es veraz y actualizada.
                </li>
                <li>
                  <strong>Confidencialidad:</strong> Mantendrás la confidencialidad de todos los 
                  datos, estadísticas y estrategias del artista que tengas acceso.
                </li>
                <li>
                  <strong>Autorización:</strong> Solo accederás a la información para la cual 
                  has sido autorizado por el administrador del artista.
                </li>
                <li>
                  <strong>Revocación de acceso:</strong> El administrador del artista puede 
                  revocar tu acceso en cualquier momento sin previo aviso.
                </li>
              </ul>
              
              <p>
                Para más información detallada, consulta nuestros 
                <a href="#" className={styles.link}> Términos y Condiciones completos</a> y 
                <a href="#" className={styles.link}> Política de Privacidad</a>.
              </p>
            </div>
          </div>

          {/* Checkbox de aceptación */}
          <div className={styles.acceptanceSection}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) => handleTermsChange(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                Por la presente, acepto los <strong>Términos y Condiciones</strong> y la 
                <strong> Política de Privacidad</strong> de la plataforma de gestión de artistas.
              </span>
            </label>
          </div>
        </div>

        {/* Información final */}
        <div className={styles.finalInfo}>
          <div className={styles.infoIcon}>📧</div>
          <div className={styles.infoText}>
            <p><strong>¿Qué sigue después?</strong></p>
            <p>
              Una vez enviada tu solicitud, el administrador del artista la revisará. 
              Recibirás una notificación por email cuando sea aprobada o rechazada.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className={styles.actions}>
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className={`${styles.prevButton} ${isSubmitting ? styles.disabled : ''}`}
        >
          Atrás
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className={`${styles.submitButton} ${(!isValid || isSubmitting) ? styles.disabled : ''}`}
        >
          {isSubmitting ? 'Enviando solicitud...' : 'Enviar Solicitud'}
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
