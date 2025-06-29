"use client";

import { useState } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useArtist } from "../../contexts/ArtistContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import PermissionGuard from "../../components/PermissionGuard";
import Sidebar from "../../components/Sidebar";
import ActivityLog from "../../components/ActivityLog";
import { PERMISSIONS } from "../../utils/roles";
import styles from "./page.module.css";

export default function ActividadPageWrapper() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.TEAM_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver las actividades del equipo.</p>
          </div>
        }
      >
        <ActividadPage />
      </PermissionGuard>
    </ProtectedRoute>
  );
}

function ActividadPage() {
  const { getUserData } = useSession();
  const { getCurrentArtist, getCurrentArtistId } = useArtist();
  
  const userData = getUserData();
  const currentArtist = getCurrentArtist();
  const artistId = getCurrentArtistId();

  return (
    <Sidebar>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1>📈 Actividad del Equipo</h1>
            <p>Registro completo de todas las acciones realizadas en {currentArtist?.name || 'este proyecto'}</p>
          </div>
        </div>

        <div className={styles.content}>
          {!artistId ? (
            <div className={styles.noArtist}>
              <div className={styles.noArtistIcon}>🎨</div>
              <h2>Selecciona un artista</h2>
              <p>Para ver las actividades, primero debes seleccionar un artista en el selector.</p>
            </div>
          ) : (
            <div className={styles.activityContainer}>
              <ActivityLog 
                artistId={artistId}
                maxItems={100}
                showFilters={true}
                compact={false}
              />
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
