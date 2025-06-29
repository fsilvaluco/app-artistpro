'use client';

import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { useUsers } from '../../contexts/UserContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAccess } from '../../contexts/AccessContext';
import Sidebar from '../../components/Sidebar';
import { PERMISSIONS } from '../../utils/roles';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { syncArtistNameInRequests } from '../../utils/artistRequests';
import styles from './page.module.css';

export default function AdminPage() {
  const { getUserData } = useSession();
  const { users, loading: usersLoading } = useUsers();
  const { isAdmin, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const { refreshAccess } = useAccess();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'artists', 'analytics', 'maintenance', 'settings'
  const [showCreateArtistModal, setShowCreateArtistModal] = useState(false);
  const [showEditArtistModal, setShowEditArtistModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [newArtist, setNewArtist] = useState({
    name: '',
    email: '',
    genre: '',
    country: '',
    description: '',
    socialMedia: {
      instagram: '',
      spotify: '',
      youtube: '',
      tiktok: ''
    }
  });

  const userData = getUserData();

  // Cargar artistas
  const loadArtists = async () => {
    try {
      setLoading(true);
      const artistsRef = collection(db, 'artists');
      const snapshot = await getDocs(artistsRef);
      const artistsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArtists(artistsData);
    } catch (error) {
      console.error('Error cargando artistas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  // Crear nuevo artista
  const handleCreateArtist = async (e) => {
    e.preventDefault();
    if (!newArtist.name.trim()) return;

    try {
      const artistData = {
        ...newArtist,
        createdAt: new Date().toISOString(),
        createdBy: userData?.uid || userData?.email,
        isActive: true,
        teamMembers: [],
        projects: [],
        stats: {
          totalProjects: 0,
          totalTasks: 0,
          completedTasks: 0
        }
      };

      await addDoc(collection(db, 'artists'), artistData);
      
      // Reset form
      setNewArtist({
        name: '',
        email: '',
        genre: '',
        country: '',
        description: '',
        socialMedia: {
          instagram: '',
          spotify: '',
          youtube: '',
          tiktok: ''
        }
      });
      setShowCreateArtistModal(false);
      
      // Reload artists
      loadArtists();
    } catch (error) {
      console.error('Error creando artista:', error);
    }
  };

  // Abrir modal de edición
  const handleEditArtist = (artist) => {
    setEditingArtist({
      ...artist,
      socialMedia: artist.socialMedia || {
        instagram: '',
        spotify: '',
        youtube: '',
        tiktok: ''
      }
    });
    setShowEditArtistModal(true);
  };

  // Guardar cambios del artista editado
  const handleUpdateArtist = async (e) => {
    e.preventDefault();
    if (!editingArtist?.name?.trim()) return;

    try {
      const { id, ...artistData } = editingArtist;
      
      // Obtener el nombre anterior para comparar
      const artistsRef = collection(db, 'artists');
      const snapshot = await getDocs(artistsRef);
      const currentArtist = snapshot.docs.find(doc => doc.id === id);
      const oldName = currentArtist?.data()?.name;
      
      // Actualizar el artista
      await updateDoc(doc(db, 'artists', id), {
        ...artistData,
        updatedAt: new Date().toISOString(),
        updatedBy: userData?.uid || userData?.email
      });
      
      // Si el nombre cambió, sincronizar en artistRequests
      if (oldName && oldName !== artistData.name) {
        console.log(`🔄 Nombre del artista cambió de "${oldName}" a "${artistData.name}"`);
        await syncArtistNameInRequests(id, artistData.name);
        console.log('✅ Sincronización completada');
      }
      
      setShowEditArtistModal(false);
      setEditingArtist(null);
      
      // Reload artists
      loadArtists();
      
      // Refrescar contextos si el nombre cambió
      if (oldName && oldName !== artistData.name && refreshAccess) {
        refreshAccess();
      }
      
      // Mostrar mensaje de éxito
      if (oldName && oldName !== artistData.name) {
        alert(`✅ Artista actualizado y nombre sincronizado en todo el sistema`);
      }
    } catch (error) {
      console.error('Error actualizando artista:', error);
      alert('Error actualizando artista: ' + error.message);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setShowEditArtistModal(false);
    setEditingArtist(null);
  };

  // Toggle estado del artista
  const toggleArtistStatus = async (artistId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'artists', artistId), {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      loadArtists();
    } catch (error) {
      console.error('Error actualizando estado del artista:', error);
    }
  };

  // Función para manejar la subida del logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.includes('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 2MB permitido');
      return;
    }

    try {
      setLogoUploading(true);
      
      // Convertir archivo a base64 para almacenar en localStorage
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoData = {
          data: event.target.result,
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: Date.now()
        };
        
        // Guardar en localStorage
        localStorage.setItem('artistpro_logo', JSON.stringify(logoData));
        
        // Emitir evento para que todos los componentes se actualicen
        window.dispatchEvent(new CustomEvent('logoChanged', { detail: logoData }));
        
        alert('✅ Logo actualizado correctamente!\n\nEl nuevo logo aparecerá en toda la aplicación.');
        setLogoUploading(false);
      };
      
      reader.onerror = () => {
        alert('Error al leer el archivo');
        setLogoUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error subiendo logo:', error);
      alert('Error al subir el logo: ' + error.message);
      setLogoUploading(false);
    }
  };

  // Función para restaurar logo por defecto
  const handleRestoreDefaultLogo = () => {
    if (confirm('¿Estás seguro de que quieres restaurar el logo por defecto?')) {
      localStorage.removeItem('artistpro_logo');
      window.dispatchEvent(new CustomEvent('logoChanged', { detail: null }));
      alert('✅ Logo restaurado al valor por defecto');
    }
  };

  // Función para manejar la subida del favicon
  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo (favicon debe ser ICO, PNG o SVG pequeño)
    if (!file.type.includes('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 1MB para favicon)
    if (file.size > 1 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 1MB permitido para favicons');
      return;
    }

    // Recomendar tamaño para favicon
    if (file.size > 100 * 1024) {
      if (!confirm('El archivo es grande para un favicon (>100KB). Se recomienda usar imágenes más pequeñas para mejor rendimiento. ¿Continuar?')) {
        return;
      }
    }

    try {
      setFaviconUploading(true);
      
      // Convertir archivo a base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const faviconData = {
          data: event.target.result,
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: Date.now()
        };
        
        // Guardar en localStorage
        localStorage.setItem('artistpro_favicon', JSON.stringify(faviconData));
        
        // Actualizar favicon en el documento
        updateFaviconInDocument(faviconData.data);
        
        // Emitir evento para notificar cambio
        window.dispatchEvent(new CustomEvent('faviconChanged', { detail: faviconData }));
        
        alert('✅ Favicon actualizado correctamente!\n\nEl nuevo favicon aparecerá en la pestaña del navegador.');
        setFaviconUploading(false);
      };
      
      reader.onerror = () => {
        alert('Error al leer el archivo');
        setFaviconUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error subiendo favicon:', error);
      alert('Error al subir el favicon: ' + error.message);
      setFaviconUploading(false);
    }
  };

  // Función para actualizar el favicon en el documento
  const updateFaviconInDocument = (faviconUrl) => {
    try {
      // Remover favicon existente
      const existingFavicon = document.querySelector('link[rel*="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Crear nuevo elemento de favicon
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/x-icon';
      newFavicon.href = faviconUrl;
      
      // Agregar al head
      document.head.appendChild(newFavicon);
      
      console.log('✅ Favicon actualizado en el documento');
    } catch (error) {
      console.error('Error actualizando favicon en documento:', error);
    }
  };

  // Función para restaurar favicon por defecto
  const handleRestoreDefaultFavicon = () => {
    if (confirm('¿Estás seguro de que quieres restaurar el favicon por defecto?')) {
      localStorage.removeItem('artistpro_favicon');
      
      // Restaurar favicon por defecto
      updateFaviconInDocument('/favicon.ico');
      
      window.dispatchEvent(new CustomEvent('faviconChanged', { detail: null }));
      alert('✅ Favicon restaurado al valor por defecto');
    }
  };

  // Función para obtener el favicon actual
  const getCurrentFavicon = () => {
    try {
      const faviconData = localStorage.getItem('artistpro_favicon');
      return faviconData ? JSON.parse(faviconData) : null;
    } catch (error) {
      console.error('Error obteniendo favicon actual:', error);
      return null;
    }
  };

  const currentFavicon = getCurrentFavicon();

  // Aplicar favicon personalizado al cargar la página
  useEffect(() => {
    const favicon = getCurrentFavicon();
    if (favicon) {
      updateFaviconInDocument(favicon.data);
    }
  }, []);

  // Función para obtener el logo actual
  const getCurrentLogo = () => {
    try {
      const logoData = localStorage.getItem('artistpro_logo');
      return logoData ? JSON.parse(logoData) : null;
    } catch (error) {
      console.error('Error obteniendo logo actual:', error);
      return null;
    }
  };

  const currentLogo = getCurrentLogo();

  // Función para sincronizar nombres de artistas en todo el sistema
  const syncAllArtistNames = async () => {
    try {
      setCleanupLoading(true);
      console.log('🔄 Iniciando sincronización de nombres de artistas...');
      
      // Obtener todos los artistas
      const artistsRef = collection(db, 'artists');
      const artistsSnapshot = await getDocs(artistsRef);
      
      let totalSynced = 0;
      
      for (const artistDoc of artistsSnapshot.docs) {
        const artistData = artistDoc.data();
        const artistId = artistDoc.id;
        
        try {
          const synced = await syncArtistNameInRequests(artistId, artistData.name);
          totalSynced += synced;
        } catch (error) {
          console.error(`Error sincronizando artista ${artistData.name}:`, error);
        }
      }
      
      console.log(`✅ Sincronización completada. Total de registros actualizados: ${totalSynced}`);
      
      // Refrescar contextos para mostrar los cambios inmediatamente
      if (refreshAccess) {
        console.log('🔄 Refrescando contextos...');
        refreshAccess();
      }
      
      alert(`Sincronización completada!\n\nNombres sincronizados en ${totalSynced} registros de solicitudes.\n\nAhora los nombres deberían aparecer actualizados en toda la aplicación.`);
      
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      alert('Error durante la sincronización: ' + error.message);
    } finally {
      setCleanupLoading(false);
    }
  };
  const cleanupDuplicateRequests = async () => {
    try {
      setCleanupLoading(true);
      console.log('🧹 Iniciando limpieza de duplicados...');
      
      // Obtener todas las solicitudes de artistas
      const requestsRef = collection(db, 'artistRequests');
      const snapshot = await getDocs(requestsRef);
      
      // Agrupar por userId + artistId para encontrar duplicados
      const requestsByUserArtist = new Map();
      const allRequests = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const key = `${data.userId}-${data.artistId}`;
        allRequests.push({ id: doc.id, ...data });
        
        if (!requestsByUserArtist.has(key)) {
          requestsByUserArtist.set(key, []);
        }
        requestsByUserArtist.get(key).push({ id: doc.id, ...data });
      });
      
      // Encontrar y eliminar duplicados
      let duplicatesFound = 0;
      let duplicatesRemoved = 0;
      
      for (const [key, requests] of requestsByUserArtist) {
        if (requests.length > 1) {
          duplicatesFound += requests.length - 1;
          console.log(`🔍 Encontrados ${requests.length} duplicados para ${key}`);
          
          // Mantener el más reciente y eliminar el resto
          const sortedRequests = requests.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
            return bTime.getTime() - aTime.getTime();
          });
          
          // Eliminar todos excepto el primero (más reciente)
          for (let i = 1; i < sortedRequests.length; i++) {
            try {
              await deleteDoc(doc(db, 'artistRequests', sortedRequests[i].id));
              duplicatesRemoved++;
              console.log(`🗑️ Eliminado duplicado: ${sortedRequests[i].id}`);
            } catch (error) {
              console.error('Error eliminando duplicado:', error);
            }
          }
        }
      }
      
      console.log(`✅ Limpieza completada. Duplicados encontrados: ${duplicatesFound}, eliminados: ${duplicatesRemoved}`);
      alert(`Limpieza completada!\n\nDuplicados encontrados: ${duplicatesFound}\nDuplicados eliminados: ${duplicatesRemoved}`);
      
    } catch (error) {
      console.error('Error durante la limpieza:', error);
      alert('Error durante la limpieza: ' + error.message);
    } finally {
      setCleanupLoading(false);
    }
  };

  // Eliminar artista
  const deleteArtist = async (artistId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artista? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'artists', artistId));
      loadArtists();
    } catch (error) {
      console.error('Error eliminando artista:', error);
    }
  };

  // VERIFICACIONES CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  
  // Verificar acceso de administrador
  if (permissionsLoading) {
    return (
      <Sidebar>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Verificando permisos...</p>
        </div>
      </Sidebar>
    );
  }

  if (!isAdmin() && !isSuperAdmin()) {
    return (
      <Sidebar>
        <div className={styles.adminContainer}>
          <div className={styles.accessDenied}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para acceder al panel de administración.</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  if (loading || usersLoading) {
    return (
      <Sidebar>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando panel de administración...</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className={styles.adminContainer}>
          <div className={styles.header}>
            <h1>Panel de Administración</h1>
            <p>Gestión de usuarios, artistas y sistema</p>
          </div>

          {/* Tabs de navegación */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Usuarios ({users.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'artists' ? styles.active : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              🎵 Artistas ({artists.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analíticas
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'maintenance' ? styles.active : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              🔧 Mantenimiento
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Configuración
            </button>
          </div>

          {/* Contenido de las tabs */}
          <div className={styles.tabContent}>
            {activeTab === 'users' && (
              <div className={styles.usersSection}>
                <div className={styles.sectionHeader}>
                  <h2>Usuarios Registrados</h2>
                  <div className={styles.stats}>
                    <span>Total: {users.length}</span>
                  </div>
                </div>

                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <div>Usuario</div>
                    <div>Email</div>
                    <div>Rol</div>
                    <div>Último acceso</div>
                    <div>Estado</div>
                    <div>Acciones</div>
                  </div>
                  {users.map(user => (
                    <div key={user.id} className={styles.tableRow}>
                      <div className={styles.userInfo}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className={styles.avatar} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {(user.displayName || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{user.displayName || 'Sin nombre'}</span>
                      </div>
                      <div>{user.email}</div>
                      <div>
                        <span className={styles.roleBadge}>
                          {user.role || 'Usuario'}
                        </span>
                      </div>
                      <div>
                        {user.lastLoginAt ? 
                          new Date(user.lastLoginAt).toLocaleDateString() : 
                          'Nunca'
                        }
                      </div>
                      <div>
                        <span className={`${styles.statusBadge} ${user.isActive !== false ? styles.active : styles.inactive}`}>
                          {user.isActive !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn}>Ver</button>
                        <button className={styles.actionBtn}>Editar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'artists' && (
              <div className={styles.artistsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Gestión de Artistas</h2>
                  <button 
                    className={styles.createBtn}
                    onClick={() => setShowCreateArtistModal(true)}
                  >
                    + Crear Artista
                  </button>
                </div>

                <div className={styles.infoBox}>
                  <h4>📋 Estados de Artistas:</h4>
                  <ul>
                    <li><strong>✓ Activo:</strong> Artista disponible para proyectos, aparece en selectores, puede recibir tareas</li>
                    <li><strong>✕ Inactivo:</strong> Artista pausado temporalmente, no aparece en selectores, conserva historial</li>
                  </ul>
                </div>

                <div className={styles.artistsGrid}>
                  {artists.map(artist => (
                    <div key={artist.id} className={styles.artistCard}>
                      <div className={styles.artistHeader}>
                        <h3>{artist.name}</h3>
                        <div className={styles.artistActions}>
                          <button 
                            className={styles.editBtn}
                            onClick={() => handleEditArtist(artist)}
                            title="Editar artista"
                          >
                            ✏️
                          </button>
                          <button 
                            className={`${styles.statusToggle} ${artist.isActive ? styles.active : styles.inactive}`}
                            onClick={() => toggleArtistStatus(artist.id, artist.isActive)}
                            title={artist.isActive ? 'Desactivar artista' : 'Activar artista'}
                          >
                            {artist.isActive ? '✓' : '✕'}
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => deleteArtist(artist.id)}
                            title="Eliminar artista"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.artistInfo}>
                        <p><strong>Email:</strong> {artist.email}</p>
                        <p><strong>Género:</strong> {artist.genre || 'No especificado'}</p>
                        <p><strong>País:</strong> {artist.country || 'No especificado'}</p>
                        <p><strong>Estado:</strong> 
                          <span className={`${styles.statusBadge} ${artist.isActive ? styles.active : styles.inactive}`}>
                            {artist.isActive ? '✓ Activo (Disponible)' : '✕ Inactivo (Pausado)'}
                          </span>
                        </p>
                        {!artist.isActive && (
                          <p className={styles.statusNote}>
                            <small>⚠️ Artista pausado: No aparece en selectores ni acepta nuevos proyectos</small>
                          </p>
                        )}
                      </div>

                      <div className={styles.artistStats}>
                        <div className={styles.stat}>
                          <span>Proyectos</span>
                          <strong>{artist.stats?.totalProjects || 0}</strong>
                        </div>
                        <div className={styles.stat}>
                          <span>Tareas</span>
                          <strong>{artist.stats?.totalTasks || 0}</strong>
                        </div>
                        <div className={styles.stat}>
                          <span>Completadas</span>
                          <strong>{artist.stats?.completedTasks || 0}</strong>
                        </div>
                      </div>

                      <div className={styles.artistMeta}>
                        <small>Creado: {new Date(artist.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className={styles.analyticsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Analíticas del Sistema</h2>
                </div>

                <div className={styles.analyticsGrid}>
                  <div className={styles.analyticsCard}>
                    <h3>Usuarios</h3>
                    <div className={styles.bigNumber}>{users.length}</div>
                    <p>Total registrados</p>
                  </div>

                  <div className={styles.analyticsCard}>
                    <h3>Artistas</h3>
                    <div className={styles.bigNumber}>{artists.length}</div>
                    <p>Total creados</p>
                  </div>

                  <div className={styles.analyticsCard}>
                    <h3>Artistas Activos</h3>
                    <div className={styles.bigNumber}>
                      {artists.filter(a => a.isActive).length}
                    </div>
                    <p>Actualmente activos</p>
                  </div>

                  <div className={styles.analyticsCard}>
                    <h3>Total Proyectos</h3>
                    <div className={styles.bigNumber}>
                      {artists.reduce((sum, artist) => sum + (artist.stats?.totalProjects || 0), 0)}
                    </div>
                    <p>En todos los artistas</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className={styles.maintenanceSection}>
                <div className={styles.sectionHeader}>
                  <h2>Herramientas de Mantenimiento</h2>
                  <p>Utilidades para mantener la integridad de los datos</p>
                </div>

                <div className={styles.maintenanceTools}>
                  <div className={styles.toolCard}>
                    <h3>🧹 Limpiar Duplicados</h3>
                    <p>Elimina solicitudes de acceso duplicadas que pueden causar errores en la interfaz.</p>
                    <button 
                      className={`${styles.primaryBtn} ${cleanupLoading ? styles.loading : ''}`}
                      onClick={cleanupDuplicateRequests}
                      disabled={cleanupLoading}
                    >
                      {cleanupLoading ? 'Limpiando...' : 'Ejecutar Limpieza'}
                    </button>
                  </div>

                  <div className={styles.toolCard}>
                    <h3>� Sincronizar Nombres</h3>
                    <p>Actualiza los nombres de artistas en todo el sistema cuando se han modificado.</p>
                    <button 
                      className={`${styles.primaryBtn} ${cleanupLoading ? styles.loading : ''}`}
                      onClick={syncAllArtistNames}
                      disabled={cleanupLoading}
                    >
                      {cleanupLoading ? 'Sincronizando...' : 'Sincronizar Nombres'}
                    </button>
                  </div>

                  <div className={styles.toolCard}>
                    <h3>�📊 Verificar Integridad</h3>
                    <p>Verifica la consistencia de los datos entre artistas y solicitudes.</p>
                    <button 
                      className={styles.secondaryBtn}
                      disabled={loading}
                    >
                      Verificar Datos
                    </button>
                  </div>

                  <div className={styles.toolCard}>
                    <h3>🔄 Recargar Caché</h3>
                    <p>Fuerza la recarga de todos los datos del sistema.</p>
                    <button 
                      className={styles.secondaryBtn}
                      onClick={() => window.location.reload()}
                    >
                      Recargar Sistema
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Configuración del Sistema</h2>
                  <p>Personaliza la apariencia y configuración de ArtistPro</p>
                </div>

                <div className={styles.settingsGrid}>
                  <div className={styles.settingCard}>
                    <h3>🎨 Logo de la Aplicación</h3>
                    <p>Sube un logo personalizado que aparecerá en toda la aplicación (Sidebar, Login, etc.)</p>
                    
                    <div className={styles.logoPreview}>
                      <div className={styles.previewLabel}>Vista previa actual:</div>
                      <div className={styles.logoContainer}>
                        {currentLogo ? (
                          <img 
                            src={currentLogo.data} 
                            alt="Logo actual" 
                            className={styles.previewLogo}
                          />
                        ) : (
                          <img 
                            src="/artistpro-logo.png" 
                            alt="Logo por defecto" 
                            className={styles.previewLogo}
                          />
                        )}
                        <div className={styles.logoInfo}>
                          {currentLogo ? (
                            <>
                              <span className={styles.logoName}>{currentLogo.name}</span>
                              <span className={styles.logoSize}>{(currentLogo.size / 1024).toFixed(1)} KB</span>
                            </>
                          ) : (
                            <span className={styles.logoName}>Logo por defecto</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.logoControls}>
                      <div className={styles.uploadSection}>
                        <label className={styles.uploadLabel}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={logoUploading}
                            className={styles.fileInput}
                          />
                          <span className={`${styles.uploadBtn} ${logoUploading ? styles.loading : ''}`}>
                            {logoUploading ? '📤 Subiendo...' : '📤 Subir Nuevo Logo'}
                          </span>
                        </label>
                        <div className={styles.uploadHint}>
                          Formatos: JPG, PNG, SVG, GIF | Máximo: 2MB
                        </div>
                      </div>

                      {currentLogo && (
                        <button 
                          className={styles.secondaryBtn}
                          onClick={handleRestoreDefaultLogo}
                          disabled={logoUploading}
                        >
                          🔄 Restaurar Logo por Defecto
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.settingCard}>
                    <h3>🌐 Favicon del Sitio</h3>
                    <p>Sube un favicon personalizado que aparecerá en la pestaña del navegador (16x16, 32x32 recomendado)</p>
                    
                    <div className={styles.logoPreview}>
                      <div className={styles.previewLabel}>Favicon actual:</div>
                      <div className={styles.logoContainer}>
                        {currentFavicon ? (
                          <img 
                            src={currentFavicon.data} 
                            alt="Favicon actual" 
                            className={styles.faviconPreview}
                          />
                        ) : (
                          <img 
                            src="/favicon.ico" 
                            alt="Favicon por defecto" 
                            className={styles.faviconPreview}
                          />
                        )}
                        <div className={styles.logoInfo}>
                          {currentFavicon ? (
                            <>
                              <span className={styles.logoName}>{currentFavicon.name}</span>
                              <span className={styles.logoSize}>{(currentFavicon.size / 1024).toFixed(1)} KB</span>
                            </>
                          ) : (
                            <span className={styles.logoName}>Favicon por defecto</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.logoControls}>
                      <div className={styles.uploadSection}>
                        <label className={styles.uploadLabel}>
                          <input
                            type="file"
                            accept="image/*,.ico"
                            onChange={handleFaviconUpload}
                            disabled={faviconUploading}
                            className={styles.fileInput}
                          />
                          <span className={`${styles.uploadBtn} ${faviconUploading ? styles.loading : ''}`}>
                            {faviconUploading ? '🌐 Subiendo...' : '🌐 Subir Nuevo Favicon'}
                          </span>
                        </label>
                        <div className={styles.uploadHint}>
                          Formatos: ICO, PNG, SVG | Tamaño recomendado: 16x16, 32x32 | Máximo: 1MB
                        </div>
                      </div>

                      {currentFavicon && (
                        <button 
                          className={styles.secondaryBtn}
                          onClick={handleRestoreDefaultFavicon}
                          disabled={faviconUploading}
                        >
                          🔄 Restaurar Favicon por Defecto
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.settingCard}>
                    <h3>🔧 Configuración Avanzada</h3>
                    <p>Configuraciones adicionales del sistema (próximamente)</p>
                    
                    <div className={styles.comingSoon}>
                      <span>🚧 Funciones adicionales en desarrollo...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal para crear artista */}
          {showCreateArtistModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h3>Crear Nuevo Artista</h3>
                  <button 
                    className={styles.closeBtn}
                    onClick={() => setShowCreateArtistModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateArtist} className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Nombre del Artista *</label>
                    <input
                      type="text"
                      value={newArtist.name}
                      onChange={(e) => setNewArtist({...newArtist, name: e.target.value})}
                      placeholder="Nombre artístico"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={newArtist.email}
                      onChange={(e) => setNewArtist({...newArtist, email: e.target.value})}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Género Musical</label>
                      <input
                        type="text"
                        value={newArtist.genre}
                        onChange={(e) => setNewArtist({...newArtist, genre: e.target.value})}
                        placeholder="Pop, Rock, Reggaeton..."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>País</label>
                      <input
                        type="text"
                        value={newArtist.country}
                        onChange={(e) => setNewArtist({...newArtist, country: e.target.value})}
                        placeholder="Chile, Colombia..."
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Descripción</label>
                    <textarea
                      value={newArtist.description}
                      onChange={(e) => setNewArtist({...newArtist, description: e.target.value})}
                      placeholder="Breve descripción del artista..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.socialMediaSection}>
                    <h4>Redes Sociales</h4>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Instagram</label>
                        <input
                          type="text"
                          value={newArtist.socialMedia.instagram}
                          onChange={(e) => setNewArtist({
                            ...newArtist, 
                            socialMedia: {...newArtist.socialMedia, instagram: e.target.value}
                          })}
                          placeholder="@usuario"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Spotify</label>
                        <input
                          type="text"
                          value={newArtist.socialMedia.spotify}
                          onChange={(e) => setNewArtist({
                            ...newArtist, 
                            socialMedia: {...newArtist.socialMedia, spotify: e.target.value}
                          })}
                          placeholder="URL de Spotify"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <button 
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setShowCreateArtistModal(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className={styles.createBtn}
                      disabled={!newArtist.name.trim()}
                    >
                      Crear Artista
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para editar artista */}
          {showEditArtistModal && editingArtist && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h3>Editar Artista: {editingArtist.name}</h3>
                  <button 
                    className={styles.closeBtn}
                    onClick={handleCancelEdit}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUpdateArtist} className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Nombre del Artista *</label>
                    <input
                      type="text"
                      value={editingArtist.name}
                      onChange={(e) => setEditingArtist({...editingArtist, name: e.target.value})}
                      placeholder="Nombre artístico"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={editingArtist.email || ''}
                      onChange={(e) => setEditingArtist({...editingArtist, email: e.target.value})}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Género Musical</label>
                      <input
                        type="text"
                        value={editingArtist.genre || ''}
                        onChange={(e) => setEditingArtist({...editingArtist, genre: e.target.value})}
                        placeholder="Pop, Rock, Reggaeton..."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>País</label>
                      <input
                        type="text"
                        value={editingArtist.country || ''}
                        onChange={(e) => setEditingArtist({...editingArtist, country: e.target.value})}
                        placeholder="Chile, Colombia..."
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Descripción</label>
                    <textarea
                      value={editingArtist.description || ''}
                      onChange={(e) => setEditingArtist({...editingArtist, description: e.target.value})}
                      placeholder="Breve descripción del artista..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Estado</label>
                    <div className={styles.statusOptions}>
                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          name="status"
                          checked={editingArtist.isActive === true}
                          onChange={() => setEditingArtist({...editingArtist, isActive: true})}
                        />
                        <span className={styles.radioLabel}>
                          ✓ Activo (Disponible para proyectos y tareas)
                        </span>
                      </label>
                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          name="status"
                          checked={editingArtist.isActive === false}
                          onChange={() => setEditingArtist({...editingArtist, isActive: false})}
                        />
                        <span className={styles.radioLabel}>
                          ✕ Inactivo (Oculto en selectores, sin nuevos proyectos)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.socialMediaSection}>
                    <h4>Redes Sociales</h4>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Instagram</label>
                        <input
                          type="text"
                          value={editingArtist.socialMedia?.instagram || ''}
                          onChange={(e) => setEditingArtist({
                            ...editingArtist, 
                            socialMedia: {...editingArtist.socialMedia, instagram: e.target.value}
                          })}
                          placeholder="@usuario"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Spotify</label>
                        <input
                          type="text"
                          value={editingArtist.socialMedia?.spotify || ''}
                          onChange={(e) => setEditingArtist({
                            ...editingArtist, 
                            socialMedia: {...editingArtist.socialMedia, spotify: e.target.value}
                          })}
                          placeholder="URL de Spotify"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>YouTube</label>
                        <input
                          type="text"
                          value={editingArtist.socialMedia?.youtube || ''}
                          onChange={(e) => setEditingArtist({
                            ...editingArtist, 
                            socialMedia: {...editingArtist.socialMedia, youtube: e.target.value}
                          })}
                          placeholder="URL de YouTube"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>TikTok</label>
                        <input
                          type="text"
                          value={editingArtist.socialMedia?.tiktok || ''}
                          onChange={(e) => setEditingArtist({
                            ...editingArtist, 
                            socialMedia: {...editingArtist.socialMedia, tiktok: e.target.value}
                          })}
                          placeholder="@usuario"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <button 
                      type="button"
                      className={styles.cancelBtn}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className={styles.primaryBtn}
                      disabled={!editingArtist.name?.trim()}
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
    </Sidebar>
  );
}
