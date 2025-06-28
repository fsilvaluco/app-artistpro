import Image from "next/image";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Sidebar({ children }) {
  const [open, setOpen] = useState({ 
    analisis: false,
    gestionProyectos: false 
  });
  const { logout, getUserData } = useSession();
  const { theme, setTheme } = useTheme();
  const userData = getUserData();

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      logout();
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <Image src="/next.svg" alt="ArtistPro logo" width={36} height={36} />
          <span className={styles.logoText}>ArtistPro</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/inicio" className={styles.link}>
            Inicio
          </Link>
          
          <div className={styles.menuGroup}>
            <button
              className={styles.menuButton}
              onClick={() => setOpen((o) => ({ ...o, gestionProyectos: !o.gestionProyectos }))}
            >
              Gestión de Proyectos
              <span
                className={
                  open.gestionProyectos ? styles.arrowDown : styles.arrowRight
                }
              ></span>
            </button>
            {open.gestionProyectos && (
              <div className={styles.subMenu}>
                <Link
                  href="/gestion-proyectos/proyectos"
                  className={styles.link}
                >
                  Proyectos
                </Link>
                <Link
                  href="/gestion-proyectos/actividades"
                  className={styles.link}
                >
                  Actividades
                </Link>
                <Link
                  href="/gestion-proyectos/kanban"
                  className={styles.link}
                >
                  Vista Kanban
                </Link>
                <Link
                  href="/gestion-proyectos/gantt"
                  className={styles.link}
                >
                  Vista Gantt
                </Link>
              </div>
            )}
          </div>

          <div className={styles.menuGroup}>
            <button
              className={styles.menuButton}
              onClick={() => setOpen((o) => ({ ...o, analisis: !o.analisis }))}
            >
              Análisis de rendimiento
              <span
                className={
                  open.analisis ? styles.arrowDown : styles.arrowRight
                }
              ></span>
            </button>
            {open.analisis && (
              <div className={styles.subMenu}>
                <Link
                  href="/analisis/rrss"
                  className={styles.link}
                >
                  Rendimiento RRSS
                </Link>
                <Link
                  href="/analisis/eventos"
                  className={styles.link}
                >
                  Eventos
                </Link>
                <Link
                  href="/analisis/prensa"
                  className={styles.link}
                >
                  Notas de prensa
                </Link>
                <Link
                  href="/analisis/plataformas"
                  className={styles.link}
                >
                  Rendimiento Plataformas Digitales
                </Link>
              </div>
            )}
          </div>

          <Link href="/equipo" className={styles.link}>
            Equipo
          </Link>
          <Link href="/notas" className={styles.link}>
            Notas
          </Link>
          <Link href="/permisos" className={styles.link}>
            Permisos
          </Link>
        </nav>
        <div className={styles.themeSection}>
          <div className={styles.userSection}>
            {userData && (
              <div className={styles.userInfo}>
                <div className={styles.userProfile}>
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
                  <div className={styles.userText}>
                    <span className={styles.userName}>
                      {userData.displayName || userData.email}
                    </span>
                    {userData.email && userData.displayName && (
                      <span className={styles.userEmail}>
                        {userData.email}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className={styles.logoutButton}
                  title="Cerrar sesión"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
          <label htmlFor="theme-select" className={styles.themeLabel}>
            Tema
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className={styles.themeSelect}
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
            <option value="system">Sistema</option>
          </select>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
