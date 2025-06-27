"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import { PERMISSIONS } from "../../../utils/roles";
import styles from "./page.module.css";

export default function AnalisisEventosPage() {
  const [theme, setTheme] = useState("system");

  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.ANALYTICS_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el análisis de eventos.</p>
          </div>
        }
      >
        <Sidebar theme={theme} setTheme={setTheme}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>📊 Análisis de Eventos</h1>
              <PermissionGuard permission={PERMISSIONS.ANALYTICS_EXPORT}>
                <button className={styles.addButton}>
                  📥 Exportar Datos
                </button>
              </PermissionGuard>
            </div>

            <div className={styles.content}>
              <div className={styles.placeholder}>
                <div className={styles.icon}>📊</div>
                <h2>Análisis de Eventos y Shows</h2>
                <p>Esta sección contendrá:</p>
                <ul>
                  <li>Métricas de asistencia a eventos</li>
                  <li>Análisis de ventas de entradas</li>
                  <li>Rendimiento por venue y ciudad</li>
                  <li>Comparativas entre shows</li>
                  <li>ROI de tours y giras</li>
                  <li>Feedback y ratings de audiencia</li>
                  <li>Análisis de merchandise</li>
                  <li>Datos demográficos de asistentes</li>
                </ul>
                <p className={styles.note}>
                  <strong>Próximamente:</strong> Dashboard interactivo con gráficos en tiempo real
                </p>
              </div>
            </div>
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
