import Image from "next/image";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { useState } from "react";

export default function Sidebar({ children, theme, setTheme }) {
  const [open, setOpen] = useState({ analisis: true });
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <Image src="/next.svg" alt="ArtistPro logo" width={36} height={36} />
          <span className={styles.logoText}>ArtistPro</span>
        </div>
        <nav className={styles.nav}>
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
          <Link href="/inicio" className={styles.link}>
            Inicio
          </Link>
          <Link href="/proyectos" className={styles.link}>
            Proyectos
          </Link>
          <Link href="/kanban" className={styles.link}>
            Kanban
          </Link>
          <Link href="/equipo" className={styles.link}>
            Equipo
          </Link>
          <Link href="/notas" className={styles.link}>
            Notas
          </Link>
          <Link href="/permisos" className={styles.link}>
            Permisos
          </Link>
          <Link href="/salud-mental" className={styles.link}>
            Salud Mental
          </Link>
          <Link href="/radar" className={styles.link}>
            Radar
          </Link>
          <Link href="/epk" className={styles.link}>
            Kit de Prensa (EPK)
          </Link>
          <Link href="/comunicados" className={styles.link}>
            Comunicados
          </Link>
          <Link href="/blog" className={styles.link}>
            Blog
          </Link>
        </nav>
        <div className={styles.themeSection}>
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
