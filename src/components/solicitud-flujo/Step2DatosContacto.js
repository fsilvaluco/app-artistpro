"use client";

import styles from "./Step2DatosContacto.module.css";

const ROLES = [
  { value: '', label: 'Seleccionar rol...' },
  { value: 'manager', label: 'Manager' },
  { value: 'agente', label: 'Agente' },
  { value: 'musico', label: 'Músico' },
  { value: 'productor', label: 'Productor' },
  { value: 'ingeniero', label: 'Ingeniero de sonido' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'prensa', label: 'Prensa' },
  { value: 'booking', label: 'Booking' },
  { value: 'diseñador', label: 'Diseñador' },
  { value: 'fotografo', label: 'Fotógrafo' },
  { value: 'video', label: 'Video/Audiovisual' },
  { value: 'otro', label: 'Otro' }
];

export default function Step2DatosContacto({ formData, updateFormData, user, onNext, onPrev, isValid }) {
  
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = formData.businessEmail ? validateEmail(formData.businessEmail) : true;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Solicitud para unirse al artista</h2>
        <p className={styles.description}>
          Completa tus datos de contacto y rol dentro del equipo del artista.
        </p>

        {/* Información del artista seleccionado */}
        {formData.selectedArtist && (
          <div className={styles.selectedArtistInfo}>
            <div className={styles.artistCard}>
              <img
                src={formData.selectedArtist.avatar || formData.selectedArtist.photo || "/next.svg"}
                alt={formData.selectedArtist.name}
                className={styles.artistAvatar}
                onError={(e) => {
                  e.target.src = "/next.svg";
                }}
              />
              <div className={styles.artistDetails}>
                <span className={styles.artistName}>{formData.selectedArtist.name}</span>
                <span className={styles.requestLabel}>Solicitando acceso</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de datos */}
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.labelText}>Nombre *</span>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={styles.input}
                  required
                />
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.labelText}>Apellido *</span>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={styles.input}
                  required
                />
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <span className={styles.labelText}>Correo electrónico de la empresa *</span>
              <input
                type="email"
                placeholder="tu.email@empresa.com"
                value={formData.businessEmail}
                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                className={`${styles.input} ${formData.businessEmail && !isEmailValid ? styles.invalid : ''}`}
                required
              />
              {formData.businessEmail && !isEmailValid && (
                <span className={styles.errorText}>Por favor ingresa un email válido</span>
              )}
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <span className={styles.labelText}>Empresa</span>
              <input
                type="text"
                placeholder="Nombre de tu empresa (opcional)"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <span className={styles.labelText}>Rol en el equipo *</span>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={styles.select}
                required
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Información adicional */}
        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <span className={styles.infoIcon}>ℹ️</span>
            <span className={styles.infoTitle}>Información importante</span>
          </div>
          <ul className={styles.infoList}>
            <li>Este email será usado para comunicaciones relacionadas con el artista</li>
            <li>El administrador del artista revisará tu solicitud</li>
            <li>Recibirás una notificación cuando tu solicitud sea procesada</li>
          </ul>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className={styles.actions}>
        <button
          onClick={onPrev}
          className={styles.prevButton}
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!isValid || !isEmailValid}
          className={`${styles.nextButton} ${(!isValid || !isEmailValid) ? styles.disabled : ''}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
