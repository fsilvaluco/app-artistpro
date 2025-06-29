'use client';

import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { useUsers } from '../../contexts/UserContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import Sidebar from '../../components/Sidebar';
import { PERMISSIONS } from '../../utils/roles';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './page.module.css';

export default function AdminPage() {
  const { getUserData } = useSession();
  const { users, loading: usersLoading } = useUsers();
  const { isAdmin, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'artists', 'analytics'
  const [showCreateArtistModal, setShowCreateArtistModal] = useState(false);
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
                  <h2>Artistas</h2>
                  <button 
                    className={styles.createBtn}
                    onClick={() => setShowCreateArtistModal(true)}
                  >
                    + Crear Artista
                  </button>
                </div>

                <div className={styles.artistsGrid}>
                  {artists.map(artist => (
                    <div key={artist.id} className={styles.artistCard}>
                      <div className={styles.artistHeader}>
                        <h3>{artist.name}</h3>
                        <div className={styles.artistActions}>
                          <button 
                            className={`${styles.statusToggle} ${artist.isActive ? styles.active : styles.inactive}`}
                            onClick={() => toggleArtistStatus(artist.id, artist.isActive)}
                          >
                            {artist.isActive ? '✓' : '✕'}
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => deleteArtist(artist.id)}
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
                            {artist.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </p>
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
        </div>
    </Sidebar>
  );
}
