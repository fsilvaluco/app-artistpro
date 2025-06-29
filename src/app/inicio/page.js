"use client";

import Sidebar from "../../components/Sidebar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import { useProject } from "../../contexts/ProjectContext";
import { useNotification } from "../../contexts/NotificationContext";
import CategoryBadge from "../../components/CategoryBadge";
import styles from "./inicio.module.css";

export default function InicioPageWrapper() {
  return (
    <ProtectedRoute>
      <InicioPage />
    </ProtectedRoute>
  );
}

function InicioPage() {
  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistName } = useArtist();
  const { projects, tasks, loading } = useProject();
  const userData = getUserData();
  const currentArtist = getCurrentArtist();

  return (
    <Sidebar>
      <Inicio 
        userData={userData} 
        currentArtist={currentArtist}
        projects={projects}
        tasks={tasks}
        loading={loading}
      />
    </Sidebar>
  );
}

function Inicio({ userData, currentArtist, projects, tasks, loading }) {
  const { showSuccess, showError, showWarning, showInfo, showProgress, removeNotification } = useNotification();

  // Funciones de demostración de notificaciones
  const demoNotifications = () => {
    // Success
    showSuccess("¡Operación completada exitosamente!", {
      title: "¡Perfecto!",
      duration: 5000
    });

    // Info después de 1 segundo
    setTimeout(() => {
      showInfo("Esta es una notificación informativa con botones de acción.", {
        title: "Información",
        actions: [
          {
            label: "Ver Más",
            type: "primary",
            onClick: () => console.log("Ver más clickeado")
          },
          {
            label: "Cancelar",
            type: "default",
            onClick: () => console.log("Cancelar clickeado")
          }
        ]
      });
    }, 1000);

    // Warning después de 2 segundos
    setTimeout(() => {
      showWarning("Ten cuidado con esta acción", {
        title: "⚠️ Advertencia"
      });
    }, 2000);

    // Error después de 3 segundos
    setTimeout(() => {
      showError("Algo salió mal, pero puedes intentar de nuevo", {
        title: "Error Crítico",
        duration: 8000,
        actions: [
          {
            label: "Reintentar",
            type: "primary",
            onClick: () => console.log("Reintentar clickeado")
          }
        ]
      });
    }, 3000);

    // Progress después de 4 segundos
    setTimeout(() => {
      const progressId = showProgress("Procesando datos del artista...", {
        title: "Cargando..."
      });
      
      // Remover progress después de 3 segundos
      setTimeout(() => {
        removeNotification(progressId);
        showSuccess("¡Proceso completado!", {
          title: "Finalizado"
        });
      }, 3000);
    }, 4000);
  };

  // Calcular estadísticas
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status !== 'completed').length;
  const activeProjects = projects.filter(project => project.status !== 'completed').length;
  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= weekFromNow;
  }).length;

  if (loading) {
    return (
      <div className={styles.inicio}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inicio}>
      <div className={styles.welcomeSection}>
        <h1>¡Bienvenido a ArtistPro!</h1>
        
        {/* Información del artista seleccionado */}
        {currentArtist && (
          <div className={styles.artistInfo}>
            <div className={styles.artistHeader}>
              <img
                src={currentArtist.avatar || currentArtist.photo || "/next.svg"}
                alt={currentArtist.name}
                className={styles.artistPhoto}
                onError={(e) => {
                  e.target.src = "/next.svg";
                }}
              />
              <div className={styles.artistDetails}>
                <h2>🎵 {currentArtist.name}</h2>
                {currentArtist.genre && (
                  <p className={styles.artistGenre}>📀 {currentArtist.genre}</p>
                )}
                {currentArtist.description && (
                  <p className={styles.artistDescription}>{currentArtist.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón de demostración de notificaciones */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={demoNotifications}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s ease',
              marginRight: '10px'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔔 Ver Demostración de Notificaciones
          </button>

          <button 
            onClick={() => {
              console.log("🔄 Forzando recarga de permisos...");
              // Limpiar localStorage relacionado con permisos
              localStorage.clear();
              // Recargar la página
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 Limpiar Caché y Recargar
          </button>
        </div>

        {userData && (
          <div className={styles.userInfo}>
            <div className={styles.userGreeting}>
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.displayName || userData.email}
                  className={styles.userPhoto}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.userPhotoPlaceholder}>
                  {(userData.displayName || userData.email).charAt(0).toUpperCase()}
                </div>
              )}
              <p>
                Hola, <strong>{userData.displayName || userData.email}</strong>
                {userData.email && userData.displayName && (
                  <span className={styles.userEmail}>({userData.email})</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📂 Proyectos Activos</h2>
            <div className={styles.cardIcon}>📊</div>
          </div>
          <p>Administra tus proyectos musicales en curso.</p>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{activeProjects}</span>
            <span className={styles.statLabel}>proyectos activos</span>
          </div>
          {currentArtist && (
            <div className={styles.cardFooter}>
              <span className={styles.artistTag}>Para: {currentArtist.name}</span>
            </div>
          )}
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📋 Tareas Pendientes</h2>
            <div className={styles.cardIcon}>⏳</div>
          </div>
          <p>Revisa las tareas que necesitan tu atención.</p>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{pendingTasks}</span>
            <span className={styles.statLabel}>tareas pendientes</span>
          </div>
          <div className={styles.miniStat}>
            <span>✅ {completedTasks} completadas</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📅 Próximas 7 días</h2>
            <div className={styles.cardIcon}>🔔</div>
          </div>
          <p>Tareas con fecha límite próxima.</p>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{upcomingTasks}</span>
            <span className={styles.statLabel}>tareas próximas</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📊 Total General</h2>
            <div className={styles.cardIcon}>📈</div>
          </div>
          <p>Resumen completo de tu actividad.</p>
          <div className={styles.statsGrid}>
            <div className={styles.miniStat}>
              <strong>{projects.length}</strong>
              <span>Proyectos</span>
            </div>
            <div className={styles.miniStat}>
              <strong>{tasks.length}</strong>
              <span>Tareas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado vacío cuando no hay artista seleccionado */}
      {!currentArtist && (
        <div className={styles.emptyState}>
          <h3>🎨 Selecciona un Artista</h3>
          <p>Para comenzar, selecciona un artista desde el selector en la parte superior de la pantalla.</p>
        </div>
      )}
    </div>
  );
}
