import Image from "next/image";
import styles from "./Sidebar.module.css";
import Link from "next/link";

export default function Sidebar({ children, theme, setTheme }) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <Image src="/next.svg" alt="ArtistPro logo" width={36} height={36} />
          <span className={styles.logoText}>ArtistPro</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/inicio" className={styles.link}>Inicio</Link>
          <Link href="/proyectos" className={styles.link}>Proyectos</Link>
          <Link href="/kanban" className={styles.link}>Kanban</Link>
          <Link href="/equipo" className={styles.link}>Equipo</Link>
          <Link href="/notas" className={styles.link}>Notas</Link>
          <Link href="/permisos" className={styles.link}>Permisos</Link>
        </nav>
        <div className={styles.themeSection}>
          <label htmlFor="theme-select" className={styles.themeLabel}>Tema</label>
          <select
            id="theme-select"
            value={theme}
            onChange={e => setTheme(e.target.value)}
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
