"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useAccess } from "../../contexts/AccessContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { createArtistRequest, getUserRequests, REQUEST_STATUS } from "../../utils/artistRequests";
import styles from "./page.module.css";

export default function ArtistRequestPage() {
  const [artists, setArtists] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const { getUserData, isAuthenticated } = useSession();
  const { hasAccess, refreshAccess } = useAccess();
  const router = useRouter();
  const userData = getUserData();

  // Función para ir al flujo guiado
  const goToGuidedFlow = () => {
    console.log("🚀 Iniciando navegación al flujo guiado...");
    console.log("Router:", router);
    try {
      router.push('/solicitud-acceso-flujo');
      console.log("✅ Navegación iniciada correctamente");
    } catch (error) {
      console.error("❌ Error en navegación:", error);
    }
  };

  // Redirigir si ya tiene acceso
  useEffect(() => {
    console.log("🔐 Estado de acceso:", {
      isAuthenticated: isAuthenticated(),
      hasAccess,
      userData: userData?.uid ? "Usuario autenticado" : "No autenticado"
    });
    
    if (isAuthenticated() && hasAccess) {
      console.log("↩️ Redirigiendo a inicio (usuario ya tiene acceso)");
      router.push('/inicio');
    }
  }, [isAuthenticated, hasAccess, router]);

  useEffect(() => {
    if (userData?.uid) {
      loadData();
    }
  }, [userData?.uid]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar artistas disponibles
      const artistsQuery = query(collection(db, "artists"), orderBy("name"));
      const artistsSnapshot = await getDocs(artistsQuery);
      const artistsData = [];
      
      artistsSnapshot.forEach((doc) => {
        artistsData.push({ id: doc.id, ...doc.data() });
      });
      
      setArtists(artistsData);
      
      // Cargar solicitudes del usuario
      const requests = await getUserRequests(userData.uid);
      setUserRequests(requests);
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist => 
    artist.name?.toLowerCase().includes(search.toLowerCase()) ||
    artist.genre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleArtistSelect = (artist) => {
    // Verificar si ya tiene solicitud para este artista
    const existingRequest = userRequests.find(req => 
      req.artistId === artist.id && req.status === REQUEST_STATUS.PENDING
    );
    
    if (existingRequest) {
      alert("Ya tienes una solicitud pendiente para este artista");
      return;
    }
    
    setSelectedArtist(artist);
    setShowForm(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!selectedArtist || !userData) return;
    
    try {
      setSubmitting(true);
      
      await createArtistRequest(
        userData.uid,
        userData.email,
        userData.displayName || userData.email,
        selectedArtist.id,
        selectedArtist.name,
        message
      );
      
      // Recargar solicitudes y verificar acceso
      await loadData();
      refreshAccess(); // Actualizar estado de acceso
      
      // Limpiar formulario
      setShowForm(false);
      setSelectedArtist(null);
      setMessage("");
      
      alert("¡Solicitud enviada! Espera la aprobación del administrador del artista.");
      
    } catch (error) {
      console.error("Error submitting request:", error);
      alert(error.message || "Error al enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING: return '#f59e0b';
      case REQUEST_STATUS.APPROVED: return '#10b981';
      case REQUEST_STATUS.REJECTED: return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING: return 'Pendiente';
      case REQUEST_STATUS.APPROVED: return 'Aprobada';
      case REQUEST_STATUS.REJECTED: return 'Rechazada';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    console.log("⏳ Página en estado de loading...");
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  // Redirigir si no está autenticado
  if (!isAuthenticated()) {
    console.log("❌ Usuario no autenticado, redirigiendo a login");
    router.push('/');
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎨 Solicitar Acceso a Artista</h1>
        <p>Para usar ArtistPro, necesitas solicitar acceso a un artista. El administrador del artista debe aprobar tu solicitud.</p>
        
        {/* Botón para flujo guiado */}
        <div className={styles.guidedFlowSection}>
          <div className={styles.guidedFlowCard}>
            <div className={styles.guidedFlowIcon}>✨</div>
            <div className={styles.guidedFlowContent}>
              <h3>Experiencia Guiada</h3>
              <p>Te recomendamos usar nuestro asistente paso a paso para solicitar acceso de manera más sencilla.</p>
            </div>
            <button 
              onClick={(e) => {
                console.log("🖱️ Botón clickeado", e);
                goToGuidedFlow();
              }}
              className={styles.guidedFlowButton}
            >
              Iniciar Proceso Guiado
            </button>
          </div>
        </div>

        {hasAccess && (
          <div className={styles.hasAccessNotice}>
            ✅ Ya tienes acceso a artistas. <button onClick={() => router.push('/inicio')} className={styles.goToAppButton}>Ir a la app</button>
          </div>
        )}
        
        <div className={styles.divider}>
          <span>O usa el método tradicional</span>
        </div>
      </div>

      {/* Solicitudes existentes */}
      {userRequests.length > 0 && (
        <div className={styles.existingRequests}>
          <h2>📋 Tus Solicitudes</h2>
          <div className={styles.requestsList}>
            {userRequests.map(request => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <h3>{request.artistName}</h3>
                  <p className={styles.requestDate}>
                    Solicitado: {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                  </p>
                  {request.message && <p className={styles.requestMessage}>"{request.message}"</p>}
                </div>
                <div 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(request.status) }}
                >
                  {getStatusText(request.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buscador de artistas */}
      <div className={styles.searchSection}>
        <h2>🔍 Buscar Artista</h2>
        <input
          type="text"
          placeholder="Buscar por nombre de artista o género..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Lista de artistas */}
      <div className={styles.artistsList}>
        {filteredArtists.length === 0 ? (
          <div className={styles.noResults}>
            <p>No se encontraron artistas</p>
          </div>
        ) : (
          <div className={styles.artistsGrid}>
            {filteredArtists.map(artist => {
              const hasPendingRequest = userRequests.some(req => 
                req.artistId === artist.id && req.status === REQUEST_STATUS.PENDING
              );
              const hasApprovedRequest = userRequests.some(req => 
                req.artistId === artist.id && req.status === REQUEST_STATUS.APPROVED
              );
              
              return (
                <div 
                  key={artist.id} 
                  className={`${styles.artistCard} ${hasPendingRequest ? styles.pending : ''} ${hasApprovedRequest ? styles.approved : ''}`}
                  onClick={() => !hasPendingRequest && !hasApprovedRequest && handleArtistSelect(artist)}
                >
                  <div className={styles.artistInfo}>
                    <h3>{artist.name}</h3>
                    {artist.genre && <p className={styles.genre}>{artist.genre}</p>}
                    {artist.description && <p className={styles.description}>{artist.description}</p>}
                  </div>
                  
                  {hasApprovedRequest ? (
                    <div className={styles.approvedLabel}>✅ Acceso Aprobado</div>
                  ) : hasPendingRequest ? (
                    <div className={styles.pendingLabel}>⏳ Solicitud Pendiente</div>
                  ) : (
                    <div className={styles.requestButton}>📝 Solicitar Acceso</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Solicitar acceso a {selectedArtist?.name}</h3>
              <button onClick={() => setShowForm(false)} className={styles.closeButton}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Artista seleccionado:</label>
                <div className={styles.selectedArtist}>
                  <strong>{selectedArtist?.name}</strong>
                  {selectedArtist?.genre && <span> - {selectedArtist.genre}</span>}
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Mensaje (opcional):</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explica brevemente por qué necesitas acceso a este artista..."
                  rows={4}
                  className={styles.textarea}
                />
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={styles.submitButton}
                >
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
