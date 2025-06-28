"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import { PERMISSIONS } from "../../../utils/roles";
import styles from "./page.module.css";

export default function AnalisisPrensaPage() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.ANALYTICS_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el análisis de prensa.</p>
          </div>
        }
      >
        <Sidebar>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>📰 Análisis de Prensa</h1>
              <PermissionGuard permission={PERMISSIONS.ANALYTICS_EXPORT}>
                <button className={styles.addButton}>
                  📥 Exportar Datos
                </button>
              </PermissionGuard>
            </div>

            <div className={styles.content}>
              <div className={styles.placeholder}>
                <div className={styles.icon}>📰</div>
                <h2>Análisis de Cobertura de Prensa</h2>
                <p>Esta sección contendrá:</p>
                <ul>
                  <li>Menciones en medios de comunicación</li>
                  <li>Análisis de sentimiento de reseñas</li>
                  <li>Alcance y impacto mediático</li>
                  <li>Cobertura por región y medio</li>
                  <li>Tracking de comunicados de prensa</li>
                  <li>Métricas de engagement en artículos</li>
                  <li>Influencers y bloggers musicales</li>
                  <li>ROI de campañas de PR</li>
                </ul>
                <p className={styles.note}>
                  <strong>Próximamente:</strong> Monitoreo automático de menciones y alertas
                </p>
              </div>
            </div>
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
