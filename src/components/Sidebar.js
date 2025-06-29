import Image from "next/image";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLogo } from "../hooks/useLogo";

export default function Sidebar({ children }) {
  const [open, setOpen] = useState({ 
    analisis: false,
    gestionProyectos: false 
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, getUserData } = useSession();
  const { theme, setTheme } = useTheme();
  const { logoUrl } = useLogo();
  const userData = getUserData();

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      logout();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLinkClick = () => {
    // Cerrar sidebar en móvil al hacer click en un enlace
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layout}>
      {/* Header móvil */}
      <header className={styles.mobileHeader}>
        <button
          className={styles.hamburgerButton}
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <div className={styles.mobileLogoContainer}>
          <img src={logoUrl} alt="ArtistPro" width={24} height={24} />
          <span className={styles.mobileLogoText}>ArtistPro</span>
        </div>
        <div></div>
      </header>

      {/* Overlay para cerrar menú en móvil */}
      <div 
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarVisible : ''}`}>
        <div className={styles.logoSection}>
          <img src={logoUrl} alt="ArtistPro logo" width={36} height={36} />
          <span className={styles.logoText}>ArtistPro</span>
          <button
            className={styles.closeButton}
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/inicio" className={styles.link} onClick={handleLinkClick}>
            📊 Inicio
          </Link>
          
          <div className={styles.menuGroup}>
            <button
              className={styles.menuButton}
              onClick={() => setOpen((o) => ({ ...o, gestionProyectos: !o.gestionProyectos }))}
            >
              📁 Gestión de Proyectos
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
                  onClick={handleLinkClick}
                >
                  🎯 Proyectos
                </Link>
                <Link
                  href="/gestion-proyectos/actividades"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  📝 Actividades
                </Link>
                <Link
                  href="/kanban"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  📋 Kanban
                </Link>
                <Link
                  href="/gestion-proyectos/gantt"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  📊 Gantt
                </Link>
              </div>
            )}
          </div>

          <div className={styles.menuGroup}>
            <button
              className={styles.menuButton}
              onClick={() => setOpen((o) => ({ ...o, analisis: !o.analisis }))}
            >
              📈 Análisis
              <span
                className={open.analisis ? styles.arrowDown : styles.arrowRight}
              ></span>
            </button>
            {open.analisis && (
              <div className={styles.subMenu}>
                <Link
                  href="/analisis/rrss"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  📱 Redes Sociales
                </Link>
                <Link
                  href="/analisis/radar"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  🎧 Radar Artistas
                </Link>
                <Link
                  href="/analisis/eventos"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  🎪 Eventos
                </Link>
                <Link
                  href="/analisis/prensa"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  📰 Notas de prensa
                </Link>
                <Link
                  href="/analisis/plataformas"
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  🎵 Rendimiento Plataformas
                </Link>
              </div>
            )}
          </div>

          <Link href="/equipo" className={styles.link} onClick={handleLinkClick}>
            👥 Equipo
          </Link>
          
          <Link href="/blog" className={styles.link} onClick={handleLinkClick}>
            📝 Blog
          </Link>
          <Link href="/comunicados" className={styles.link} onClick={handleLinkClick}>
            📢 Comunicados
          </Link>
          <Link href="/epk" className={styles.link} onClick={handleLinkClick}>
            📦 EPK
          </Link>
          <Link href="/notas" className={styles.link} onClick={handleLinkClick}>
            📝 Notas
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
                  <div className={styles.userDetails}>
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
