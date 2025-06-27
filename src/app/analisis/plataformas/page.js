"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import { PERMISSIONS } from "../../../utils/roles";
import styles from "./page.module.css";

export default function AnalisisPlataformasPage() {
  const [theme, setTheme] = useState("system");

  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.ANALYTICS_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el análisis de plataformas.</p>
          </div>
        }
      >
        <Sidebar theme={theme} setTheme={setTheme}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>🎵 Análisis de Plataformas</h1>
              <PermissionGuard permission={PERMISSIONS.ANALYTICS_EXPORT}>
                <button className={styles.addButton}>
                  📥 Exportar Datos
                </button>
              </PermissionGuard>
            </div>

            <div className={styles.content}>
              <div className={styles.placeholder}>
                <div className={styles.icon}>🎵</div>
                <h2>Análisis de Plataformas Musicales</h2>
                <p>Esta sección contendrá:</p>
                <ul>
                  <li>Estadísticas de Spotify, Apple Music, YouTube</li>
                  <li>Reproducciones por plataforma y canción</li>
                  <li>Crecimiento de seguidores y listeners</li>
                  <li>Análisis demográfico de audiencia</li>
                  <li>Rankings y posiciones en charts</li>
                  <li>Ingresos por streaming</li>
                  <li>Comparativas de rendimiento</li>
                  <li>Tendencias y proyecciones</li>
                </ul>
                <p className={styles.note}>
                  <strong>Próximamente:</strong> Integración directa con APIs de plataformas
                </p>
              </div>
            </div>
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
