"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useSession } from "../../contexts/SessionContext";
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
  const userData = getUserData();

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
      <Inicio userData={userData} />
    </Sidebar>
  );
}

function Inicio({ userData }) {
  return (
    <div className={styles.inicio}>
      <div className={styles.welcomeSection}>
        <h1>¡Bienvenido a ArtistPro!</h1>
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
          <h2>Proyectos Activos</h2>
          <p>Administra tus proyectos musicales en curso.</p>
          <div className={styles.stat}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>proyectos</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <h2>Tareas Pendientes</h2>
          <p>Revisa las tareas que necesitan tu atención.</p>
          <div className={styles.stat}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>tareas</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <h2>Eventos Próximos</h2>
          <p>Mantente al día con tus próximos eventos.</p>
          <div className={styles.stat}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>eventos</span>
          </div>
        </div>
      </div>
      
      <div className={styles.recentActivity}>
        <h2>Actividad Reciente</h2>
        <p>Aquí aparecerá tu actividad reciente una vez que comiences a usar la aplicación.</p>
      </div>
    </div>
  );
}
