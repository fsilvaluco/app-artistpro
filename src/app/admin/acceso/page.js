"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../../contexts/SessionContext";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import PermissionGuard from "../../../components/PermissionGuard";
import { PERMISSIONS } from "../../../utils/roles";
import { 
  isInitialAdmin,
  grantInitialAdminAccess,
  getUserAccessibleArtists,
  createArtistRequest,
  approveArtistRequest,
  REQUEST_STATUS
} from "../../../utils/artistRequests";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./page.module.css";

export default function AdminAcceso() {
  const [userEmail, setUserEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);
  
  const { user, isAuthenticated } = useSession();
  const router = useRouter();

  // Cargar usuarios y artistas
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      
      // Cargar artistas
      const artistsSnapshot = await getDocs(collection(db, "artists"));
      const artistsData = [];
      artistsSnapshot.forEach((doc) => {
        artistsData.push({ id: doc.id, ...doc.data() });
      });
      setArtists(artistsData);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // Otorgar acceso de administrador inicial
  const handleGrantInitialAdmin = async () => {
    if (!userEmail.trim()) {
      alert("Por favor ingresa un email");
      return;
    }

    try {
      setGrantLoading(true);
      
      // Buscar usuario por email
      const foundUser = users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase());
      if (!foundUser) {
        alert("Usuario no encontrado");
        return;
      }

      console.log("🔑 Otorgando acceso de administrador a:", userEmail);
      const grantedAccess = await grantInitialAdminAccess(
        foundUser.id, 
        foundUser.email, 
        foundUser.name || foundUser.displayName || 'Usuario'
      );
      
      alert(`✅ Acceso otorgado a ${grantedAccess.length} artistas para ${userEmail}`);
      setUserEmail('');
      
    } catch (error) {
      console.error("Error al otorgar acceso:", error);
      alert("Error al otorgar acceso: " + error.message);
    } finally {
      setGrantLoading(false);
    }
  };

  // Otorgar acceso específico a un artista
  const handleGrantSpecificAccess = async () => {
    if (!selectedUserId || !selectedArtistId) {
      alert("Por favor selecciona usuario y artista");
      return;
    }

    try {
      setGrantLoading(true);
      
      const selectedUser = users.find(u => u.id === selectedUserId);
      const selectedArtist = artists.find(a => a.id === selectedArtistId);
      
      if (!selectedUser || !selectedArtist) {
        alert("Usuario o artista no válido");
        return;
      }

      // Crear solicitud
      const request = await createArtistRequest(
        selectedUser.id,
        selectedUser.email,
        selectedUser.name || selectedUser.displayName || 'Usuario',
        selectedArtist.id,
        selectedArtist.name,
        'Acceso otorgado por administrador'
      );

      // Aprobar inmediatamente
      await approveArtistRequest(request.id, user.uid);
      
      alert(`✅ Acceso otorgado a "${selectedUser.email}" para el artista "${selectedArtist.name}"`);
      setSelectedUserId('');
      setSelectedArtistId('');
      
    } catch (error) {
      console.error("Error al otorgar acceso específico:", error);
      alert("Error: " + error.message);
    } finally {
      setGrantLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    
    // Verificar que sea administrador inicial
    if (!isInitialAdmin(user?.email)) {
      alert("No tienes permisos para acceder a esta sección");
      router.push('/inicio');
      return;
    }
    
    loadData();
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated() || !isInitialAdmin(user?.email)) {
    return null;
  }

  return (
    <PermissionGuard 
      superAdminOnly={true}
      fallback={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Acceso Denegado</h1>
          <p>Solo los super administradores pueden gestionar accesos.</p>
        </div>
      }
    >
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
        <div className={styles.header}>
          <h1>Gestión de Acceso</h1>
          <button 
            onClick={loadData}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? 'Cargando...' : '🔄 Actualizar'}
          </button>
        </div>

        {/* Otorgar acceso de administrador inicial */}
        <div className={styles.section}>
          <h2>Otorgar Acceso de Administrador</h2>
          <p>Otorga acceso a todos los artistas (solo para administradores de confianza)</p>
          
          <div className={styles.form}>
            <input
              type="email"
              placeholder="Email del usuario"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className={styles.input}
            />
            <button
              onClick={handleGrantInitialAdmin}
              disabled={grantLoading || !userEmail.trim()}
              className={styles.primaryButton}
            >
              {grantLoading ? 'Procesando...' : '🔑 Otorgar Acceso Total'}
            </button>
          </div>
        </div>

        {/* Otorgar acceso específico */}
        <div className={styles.section}>
          <h2>Otorgar Acceso Específico</h2>
          <p>Otorga acceso a un artista específico</p>
          
          <div className={styles.form}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccionar Usuario</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.email} - {user.name || user.displayName || 'Sin nombre'}
                </option>
              ))}
            </select>
            
            <select
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccionar Artista</option>
              {artists.map(artist => (
                <option key={artist.id} value={artist.id}>
                  {artist.name || 'Sin nombre'}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleGrantSpecificAccess}
              disabled={grantLoading || !selectedUserId || !selectedArtistId}
              className={styles.secondaryButton}
            >
              {grantLoading ? 'Procesando...' : '✅ Otorgar Acceso'}
            </button>
          </div>
        </div>

        {/* Información */}
        <div className={styles.info}>
          <h3>ℹ️ Información</h3>
          <ul>
            <li><strong>Administradores iniciales:</strong> Tienen acceso automático a todos los artistas</li>
            <li><strong>Acceso específico:</strong> Solo para el artista seleccionado</li>
            <li><strong>El usuario debe existir:</strong> El usuario debe haberse registrado previamente en la app</li>
          </ul>
        </div>
      </main>
    </div>
    </PermissionGuard>
  );
}
