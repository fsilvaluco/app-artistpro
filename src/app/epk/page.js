"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import ProtectedRoute from "../../components/ProtectedRoute";
import PermissionGuard from "../../components/PermissionGuard";
import { PERMISSIONS } from "../../utils/roles";
import styles from "./page.module.css";

export default function EPKPage() {
  const [theme, setTheme] = useState("system");

  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.EPK_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver el EPK.</p>
          </div>
        }
      >
        <Sidebar theme={theme} setTheme={setTheme}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>📋 Electronic Press Kit (EPK)</h1>
              <PermissionGuard permission={PERMISSIONS.EPK_EDIT}>
                <button className={styles.addButton}>
                  ✏️ Editar EPK
                </button>
              </PermissionGuard>
            </div>

            <div className={styles.content}>
              <div className={styles.placeholder}>
                <div className={styles.icon}>📋</div>
                <h2>Electronic Press Kit</h2>
                <p>El EPK digital contendrá:</p>
                <ul>
                  <li>Biografía del artista</li>
                  <li>Fotos de alta resolución</li>
                  <li>Discografía completa</li>
                  <li>Videos musicales y actuaciones</li>
                  <li>Reseñas de prensa</li>
                  <li>Información de contacto</li>
                  <li>Datos técnicos para venues</li>
                  <li>Rider técnico y hospitalidad</li>
                </ul>
                <p className={styles.note}>
                  <strong>Próximamente:</strong> Constructor visual de EPK con exportación PDF
                </p>
              </div>
            </div>
          </div>
        </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
