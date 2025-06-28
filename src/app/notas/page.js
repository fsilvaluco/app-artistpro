"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import ProtectedRoute from "../../components/ProtectedRoute";
import PermissionGuard from "../../components/PermissionGuard";
import { PERMISSIONS } from "../../utils/roles";
import styles from "./page.module.css";

export default function NotasPage() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.NOTES_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver las notas.</p>
          </div>
        }
      >
        <Sidebar>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>📝 Notas y Documentos</h1>
              <PermissionGuard permission={PERMISSIONS.NOTES_CREATE} showDisabled={true}>
                <button className={styles.addButton}>
                  ➕ Nueva Nota
                </button>
              </PermissionGuard>
            </div>

            <div className={styles.content}>
              <div className={styles.placeholder}>
                <div className={styles.icon}>📝</div>
                <h2>Sistema de Notas y Documentos</h2>
                <p>Esta sección contendrá:</p>
                <ul>
                  <li>Notas de reuniones y llamadas</li>
                  <li>Ideas creativas y conceptos</li>
                  <li>Documentos importantes del artista</li>
                  <li>Contratos y acuerdos</li>
                  <li>Feedback y revisiones</li>
                  <li>Planes estratégicos</li>
                  <li>Colaboración en tiempo real</li>
                  <li>Historial de versiones</li>
                </ul>
                <p className={styles.note}>
                  <strong>Próximamente:</strong> Editor colaborativo con rich text y archivos adjuntos
                </p>
              </div>
            </div>
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
