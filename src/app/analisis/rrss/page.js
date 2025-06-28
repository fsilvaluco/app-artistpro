"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import { PERMISSIONS } from "../../../utils/roles";
import styles from "./page.module.css";

export default function AnalisisRRSSPage() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.ANALYTICS_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el análisis de redes sociales.</p>
          </div>
        }
      >
        <Sidebar>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>📱 Análisis de Redes Sociales</h1>
              <PermissionGuard permission={PERMISSIONS.ANALYTICS_EXPORT}>
                <button className={styles.addButton}>
                  📥 Exportar Datos
                </button>
              </PermissionGuard>
            </div>

            <div className={styles.content}>
              <div className={styles.placeholder}>
                <div className={styles.icon}>📱</div>
                <h2>Análisis de Redes Sociales</h2>
                <p>Esta sección contendrá:</p>
                <ul>
                  <li>Métricas de Instagram, TikTok, Twitter, Facebook</li>
                  <li>Engagement rate y interacciones</li>
                  <li>Crecimiento de seguidores</li>
                  <li>Análisis de contenido más popular</li>
                  <li>Horarios óptimos de publicación</li>
                  <li>Demografía de audiencia</li>
                  <li>Análisis de hashtags y tendencias</li>
                  <li>ROI de campañas publicitarias</li>
                </ul>
                <p className={styles.note}>
                  <strong>Próximamente:</strong> Dashboard unificado con APIs de redes sociales
                </p>
              </div>
            </div>
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
