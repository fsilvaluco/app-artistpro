"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../../contexts/SessionContext";
import { useProject } from "../../../contexts/ProjectContext";
import { useArtist } from "../../../contexts/ArtistContext";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import Sidebar from "../../../components/Sidebar";
import { PERMISSIONS } from "../../../utils/roles";
import { verifyDataIntegrity } from "../../../utils/dataMigration";
import { grantInitialAdminAccess, isInitialAdmin } from "../../../utils/artistRequests";
import styles from "./page.module.css";

export default function DebugPageWrapper() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        superAdminOnly={true}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>Solo los super administradores pueden acceder al panel de debug.</p>
          </div>
        }
      >
        <DebugPage />
      </PermissionGuard>
    </ProtectedRoute>
  );
}

function DebugPage() {
  const [theme, setTheme] = useState("system");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const { getUserData } = useSession();
  const { projects, tasks, loading: projectLoading } = useProject();
  const { artists, selectedArtist, getCurrentArtistId } = useArtist();
  
  const userData = getUserData();
  const currentArtistId = getCurrentArtistId();

  const handleVerifyData = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const result = await verifyDataIntegrity(userData.uid);
      setReport(result);
    } catch (error) {
      console.error("Error verificando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Otorgar acceso inicial a administradores
  const handleGrantInitialAccess = async () => {
    try {
      setLoading(true);
      setMessage("");
      
      const userData = getUserData();
      if (!userData) {
        setMessage("Error: No hay usuario autenticado");
        return;
      }

      console.log("🔑 Verificando acceso inicial para:", userData.email);
      
      if (!isInitialAdmin(userData.email)) {
        setMessage(`El usuario ${userData.email} no está en la lista de administradores iniciales`);
        return;
      }

      const grantedAccess = await grantInitialAdminAccess(
        userData.uid, 
        userData.email, 
        userData.displayName || 'Admin'
      );

      if (grantedAccess.length > 0) {
        setMessage(`✅ Acceso otorgado a ${grantedAccess.length} artistas: ${grantedAccess.map(a => a.name).join(', ')}`);
        
        // Refrescar contextos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage("ℹ️ El usuario ya tenía acceso a todos los artistas");
      }
      
    } catch (error) {
      console.error("Error otorgando acceso inicial:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      handleVerifyData();
    }
  }, [userData]);

  return (
    <Sidebar theme={theme} setTheme={setTheme}>
      <div className={styles.debug}>
        <div className={styles.header}>
          <h1>🐛 Debug de Sistema</h1>
          <p>Información de estado y debugging del sistema</p>
        </div>

        <div className={styles.sections}>
          {/* Estado actual */}
          <div className={styles.section}>
            <h2>📊 Estado Actual</h2>
            <div className={styles.info}>
              <p><strong>Usuario:</strong> {userData?.email || 'No autenticado'}</p>
              <p><strong>User ID:</strong> {userData?.uid || 'N/A'}</p>
              <p><strong>Artista seleccionado:</strong> {selectedArtist?.name || 'Ninguno'}</p>
              <p><strong>Artist ID:</strong> {currentArtistId || 'N/A'}</p>
              <p><strong>Artistas disponibles:</strong> {artists.length}</p>
              <p><strong>Proyectos visibles:</strong> {projects.length}</p>
              <p><strong>Tareas visibles:</strong> {tasks.length}</p>
              <p><strong>Cargando proyectos:</strong> {projectLoading ? 'Sí' : 'No'}</p>
            </div>
          </div>

          {/* Artistas */}
          <div className={styles.section}>
            <h2>🎨 Artistas</h2>
            <div className={styles.items}>
              {artists.map(artist => (
                <div key={artist.id} className={`${styles.item} ${selectedArtist?.id === artist.id ? styles.selected : ''}`}>
                  <h3>{artist.name}</h3>
                  <p>ID: {artist.id}</p>
                  <p>Género: {artist.genre}</p>
                  <p>Estado: {artist.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proyectos */}
          <div className={styles.section}>
            <h2>📂 Proyectos Visibles</h2>
            <div className={styles.items}>
              {projects.map(project => (
                <div key={project.id} className={styles.item}>
                  <h3>{project.title}</h3>
                  <p>ID: {project.id}</p>
                  <p>User ID: {project.userId}</p>
                  <p>Artist ID: {project.artistId}</p>
                  <p>Estado: {project.status}</p>
                  <p>Categoría: {project.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tareas */}
          <div className={styles.section}>
            <h2>📋 Tareas Visibles</h2>
            <div className={styles.items}>
              {tasks.map(task => (
                <div key={task.id} className={styles.item}>
                  <h3>{task.title}</h3>
                  <p>ID: {task.id}</p>
                  <p>User ID: {task.userId}</p>
                  <p>Artist ID: {task.artistId}</p>
                  <p>Project ID: {task.projectId || 'Independiente'}</p>
                  <p>Estado: {task.status}</p>
                  <p>Categoría: {task.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reporte de integridad */}
          {report && (
            <div className={styles.section}>
              <h2>🔍 Reporte de Integridad</h2>
              <div className={styles.report}>
                <div className={styles.reportItem}>
                  <h3>📂 Proyectos en Base de Datos</h3>
                  <p>Total: {report.projects.total}</p>
                  <p>Sin artistId: {report.projects.withoutArtist}</p>
                  <div className={styles.artistBreakdown}>
                    <h4>Por artista:</h4>
                    {Object.entries(report.projects.byArtist).map(([artistId, count]) => (
                      <p key={artistId}>• {artistId}: {count} proyectos</p>
                    ))}
                  </div>
                </div>

                <div className={styles.reportItem}>
                  <h3>📋 Tareas en Base de Datos</h3>
                  <p>Total: {report.tasks.total}</p>
                  <p>Sin artistId: {report.tasks.withoutArtist}</p>
                  <div className={styles.artistBreakdown}>
                    <h4>Por artista:</h4>
                    {Object.entries(report.tasks.byArtist).map(([artistId, count]) => (
                      <p key={artistId}>• {artistId}: {count} tareas</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acceso de Administradores */}
          <div className={styles.section}>
            <h2>🔑 Acceso de Administradores</h2>
            <p>Gestionar acceso inicial para administradores del sistema.</p>
            
            <div className={styles.buttonGroup}>
              <button 
                onClick={handleGrantInitialAccess}
                disabled={loading}
                className={styles.button}
              >
                {loading ? 'Procesando...' : '🔓 Otorgar Acceso Inicial a Admins'}
              </button>
            </div>
            
            {message && (
              <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                {message}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button 
              onClick={handleVerifyData}
              disabled={loading}
              className={styles.button}
            >
              {loading ? "Verificando..." : "🔄 Actualizar Reporte"}
            </button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
