"use client";

import { useState } from "react";
import { useSession } from "../../../contexts/SessionContext";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import Sidebar from "../../../components/Sidebar";
import { PERMISSIONS } from "../../../utils/roles";
import { 
  setupDatabase, 
  cleanOrphanedData, 
  verifyDataIntegrity,
  createSampleArtists,
  populateDataForArtist
} from "../../../utils/dataMigration";
import { 
  migrateToNestedStructure,
  populateNestedSampleData 
} from "../../../utils/nestedStructure";
import { populateTeamSampleData } from "../../../utils/teamManagement";
import styles from "./page.module.css";

export default function AdminPageWrapper() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        superAdminOnly={true}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>Solo los super administradores pueden acceder a la gestión de base de datos.</p>
          </div>
        }
      >
        <AdminPage />
      </PermissionGuard>
    </ProtectedRoute>
  );
}

function AdminPage() {
  const [theme, setTheme] = useState("system");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [report, setReport] = useState(null);
  const { getUserData } = useSession();
  const userData = getUserData();

  const addResult = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { message, type, timestamp }]);
  };

  const handleSetupDatabase = async () => {
    if (!userData) return;
    
    setLoading(true);
    setResults([]);
    
    try {
      addResult("🚀 Iniciando setup completo de la base de datos...", "info");
      const result = await setupDatabase(userData.uid);
      
      if (result.success) {
        addResult("✅ Setup completado exitosamente", "success");
        addResult(`🎨 Artistas disponibles: ${result.artists.length}`, "success");
      } else {
        addResult(`❌ Error en setup: ${result.error}`, "error");
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanOrphanedData = async () => {
    if (!userData) return;
    
    setLoading(true);
    
    try {
      addResult("🧹 Limpiando datos huérfanos...", "info");
      const result = await cleanOrphanedData(userData.uid);
      addResult(`✅ Limpieza completada: ${result.orphanedProjects} proyectos y ${result.orphanedTasks} tareas eliminados`, "success");
    } catch (error) {
      addResult(`❌ Error en limpieza: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    if (!userData) return;
    
    setLoading(true);
    
    try {
      addResult("🔍 Verificando integridad de datos...", "info");
      const result = await verifyDataIntegrity(userData.uid);
      setReport(result);
      addResult("✅ Verificación completada", "success");
    } catch (error) {
      addResult(`❌ Error en verificación: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArtists = async () => {
    setLoading(true);
    
    try {
      addResult("🎨 Creando artistas de muestra...", "info");
      const artists = await createSampleArtists();
      addResult(`✅ Artistas disponibles: ${artists.length}`, "success");
    } catch (error) {
      addResult(`❌ Error creando artistas: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateToNested = async () => {
    if (!userData) return;
    
    setLoading(true);
    
    try {
      addResult("🔄 Migrando a estructura anidada...", "info");
      const result = await migrateToNestedStructure(userData.uid);
      
      if (result.success) {
        addResult("✅ Migración a estructura anidada completada", "success");
      } else {
        addResult(`❌ Error en migración: ${result.error}`, "error");
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateNestedData = async () => {
    if (!userData) return;
    
    setLoading(true);
    
    try {
      addResult("📊 Poblando datos en estructura anidada...", "info");
      
      // Obtener artistas y poblar datos para cada uno
      const artists = await createSampleArtists();
      for (const artist of artists) {
        const result = await populateNestedSampleData(userData.uid, artist.id);
        if (result.success) {
          addResult(`✅ Datos poblados para ${artist.name}`, "success");
        }
      }
    } catch (error) {
      addResult(`❌ Error poblando datos: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateTeamData = async () => {
    if (!userData) return;
    
    setLoading(true);
    
    try {
      addResult("👥 Poblando equipos en estructura anidada...", "info");
      
      // Obtener artistas y poblar equipo para cada uno
      const artists = await createSampleArtists();
      for (const artist of artists) {
        const result = await populateTeamSampleData(userData.uid, artist.id);
        if (result.success) {
          addResult(`✅ Equipo poblado para ${artist.name}`, "success");
        }
      }
    } catch (error) {
      addResult(`❌ Error poblando equipos: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setReport(null);
  };

  return (
    <Sidebar theme={theme} setTheme={setTheme}>
      <div className={styles.admin}>
        <div className={styles.header}>
          <h1>🔧 Administración de Base de Datos</h1>
          <p>Herramientas para migrar, limpiar y verificar los datos de la aplicación</p>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionGroup}>
            <h2>🚀 Setup Completo</h2>
            <p>Ejecuta una migración completa: limpia datos huérfanos, crea artistas y puebla datos de muestra.</p>
            <button 
              onClick={handleSetupDatabase}
              disabled={loading}
              className={`${styles.button} ${styles.primary}`}
            >
              {loading ? "Ejecutando..." : "Setup Completo"}
            </button>
          </div>

          <div className={styles.actionGroup}>
            <h2>🧹 Limpieza</h2>
            <p>Elimina proyectos y tareas sin artistId (datos huérfanos).</p>
            <button 
              onClick={handleCleanOrphanedData}
              disabled={loading}
              className={`${styles.button} ${styles.warning}`}
            >
              {loading ? "Limpiando..." : "Limpiar Datos Huérfanos"}
            </button>
          </div>

          <div className={styles.actionGroup}>
            <h2>🎨 Artistas</h2>
            <p>Crea artistas de muestra si no existen.</p>
            <button 
              onClick={handleCreateArtists}
              disabled={loading}
              className={`${styles.button} ${styles.secondary}`}
            >
              {loading ? "Creando..." : "Crear Artistas de Muestra"}
            </button>
          </div>

          <div className={styles.actionGroup}>
            <h2>🏗️ Migrar a Estructura Anidada</h2>
            <p>Migra de la estructura plana (projects, tasks) a la estructura anidada (artists/ID/projects, artists/ID/tasks).</p>
            <button 
              onClick={handleMigrateToNested}
              disabled={loading}
              className={`${styles.button} ${styles.info}`}
            >
              {loading ? "Migrando..." : "Migrar a Estructura Anidada"}
            </button>
          </div>

          <div className={styles.actionGroup}>
            <h2>📊 Poblar Datos Anidados</h2>
            <p>Crea datos de muestra en la nueva estructura anidada para todos los artistas.</p>
            <button 
              onClick={handlePopulateNestedData}
              disabled={loading}
              className={`${styles.button} ${styles.secondary}`}
            >
              {loading ? "Poblando..." : "Poblar Datos en Estructura Anidada"}
            </button>
          </div>

          <div className={styles.actionGroup}>
            <h2>👥 Poblar Equipos</h2>
            <p>Crea miembros de equipo de muestra en la nueva estructura anidada para todos los artistas.</p>
            <button 
              onClick={handlePopulateTeamData}
              disabled={loading}
              className={`${styles.button} ${styles.secondary}`}
            >
              {loading ? "Poblando..." : "Poblar Equipos en Estructura Anidada"}
            </button>
          </div>
        </div>

        {(results.length > 0 || report) && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h2>📊 Resultados</h2>
              <button onClick={clearResults} className={styles.clearButton}>
                Limpiar
              </button>
            </div>

            {results.length > 0 && (
              <div className={styles.logs}>
                {results.map((result, index) => (
                  <div key={index} className={`${styles.log} ${styles[result.type]}`}>
                    <span className={styles.timestamp}>{result.timestamp}</span>
                    <span className={styles.message}>{result.message}</span>
                  </div>
                ))}
              </div>
            )}

            {report && (
              <div className={styles.report}>
                <h3>📈 Reporte de Integridad</h3>
                
                <div className={styles.reportSection}>
                  <h4>📂 Proyectos</h4>
                  <ul>
                    <li>Total: {report.projects.total}</li>
                    <li>Sin artista: {report.projects.withoutArtist}</li>
                    <li>Por artista:</li>
                    <ul>
                      {Object.entries(report.projects.byArtist).map(([artistId, count]) => (
                        <li key={artistId}>{artistId}: {count} proyectos</li>
                      ))}
                    </ul>
                  </ul>
                </div>

                <div className={styles.reportSection}>
                  <h4>📋 Tareas</h4>
                  <ul>
                    <li>Total: {report.tasks.total}</li>
                    <li>Sin artista: {report.tasks.withoutArtist}</li>
                    <li>Por artista:</li>
                    <ul>
                      {Object.entries(report.tasks.byArtist).map(([artistId, count]) => (
                        <li key={artistId}>{artistId}: {count} tareas</li>
                      ))}
                    </ul>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Sidebar>
  );
}
