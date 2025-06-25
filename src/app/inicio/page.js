"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import { useProject } from "../../contexts/ProjectContext";
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
  const [theme, setTheme] = useState("system");
  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistName } = useArtist();
  const { projects, tasks, loading } = useProject();
  const userData = getUserData();
  const currentArtist = getCurrentArtist();

  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      document.body.dataset.theme = mq.matches ? "dark" : "light";
      const handler = (e) => {
        document.body.dataset.theme = e.matches ? "dark" : "light";
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      document.body.dataset.theme = theme;
    }
  }, [theme]);
  
  return (
    <Sidebar theme={theme} setTheme={setTheme}>
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

      {/* Actividad reciente */}
      {(projects.length > 0 || tasks.length > 0) && (
        <div className={styles.recentActivity}>
          <h3>📈 Actividad Reciente</h3>
          <div className={styles.activityGrid}>
            {/* Proyectos recientes */}
            {projects.slice(0, 3).map(project => (
              <div key={project.id} className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <span className={styles.activityType}>📁 Proyecto</span>
                  <span className={styles.activityDate}>
                    {project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente'}
                  </span>
                </div>
                <h4>{project.title}</h4>
                {project.category && (
                  <CategoryBadge categoryId={project.category} variant="light" size="small" />
                )}
              </div>
            ))}
            
            {/* Tareas recientes */}
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <span className={styles.activityType}>📋 Tarea</span>
                  <span className={styles.activityDate}>
                    {task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente'}
                  </span>
                </div>
                <h4>{task.title}</h4>
                <div className={styles.taskStatus}>
                  <span className={`${styles.statusBadge} ${styles[task.status]}`}>
                    {task.status === 'todo' ? 'Por hacer' : 
                     task.status === 'in_progress' ? 'En proceso' : 'Completado'}
                  </span>
                  {task.category && (
                    <CategoryBadge categoryId={task.category} variant="light" size="small" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
