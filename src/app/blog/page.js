"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import ProtectedRoute from "../../components/ProtectedRoute";
import PermissionGuard from "../../components/PermissionGuard";
import { PERMISSIONS } from "../../utils/roles";
import styles from "./page.module.css";

export default function BlogPage() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.BLOG_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el blog.</p>
          </div>
        }
      >
        <Sidebar>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>📝 Blog & Comunicados</h1>
              <PermissionGuard permission={PERMISSIONS.BLOG_CREATE} showDisabled={true}>
                <button className={styles.addButton}>
                  ➕ Nueva Entrada
                </button>
              </PermissionGuard>
            </div>

            <div className={styles.content}>
              <div className={styles.placeholder}>
                <div className={styles.icon}>📝</div>
                <h2>Sistema de Blog</h2>
                <p>Esta sección contendrá:</p>
                <ul>
                  <li>Entradas de blog</li>
                  <li>Comunicados de prensa</li>
                  <li>Noticias del artista</li>
                  <li>Actualizaciones y anuncios</li>
                </ul>
                <p className={styles.note}>
                  <strong>Próximamente:</strong> Sistema completo de gestión de contenidos
                </p>
              </div>
            </div>
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
