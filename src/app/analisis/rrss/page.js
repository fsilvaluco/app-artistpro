"use client";

import { useState, useEffect } from "react";
import { useSession } from "../../../contexts/SessionContext";
import { useArtist } from "../../../contexts/ArtistContext";
import { useSocialMedia } from "../../../contexts/SocialMediaContext";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import Sidebar from "../../../components/Sidebar";
import SocialMediaConnections from "../../../components/SocialMediaConnections";
import { PERMISSIONS } from "../../../utils/roles";
import styles from "./page.module.css";

export default function RRSSPage() {
  const { getUserData } = useSession();
  const { getCurrentArtist } = useArtist();
  const { 
    instagramProfile, 
    instagramMedia, 
    isConnected,
    loading: socialLoading 
  } = useSocialMedia();
  
  const [activeTab, setActiveTab] = useState('connections');
  
  const userData = getUserData();
  const currentArtist = getCurrentArtist();

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <Sidebar />
        
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>📱 Análisis de Redes Sociales</h1>
            <p>Conecta y analiza el rendimiento de tus redes sociales</p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'connections' ? styles.active : ''}`}
              onClick={() => setActiveTab('connections')}
            >
              🔗 Conexiones
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveTab('analytics')}
              disabled={!isConnected('instagram')}
            >
              📊 Análisis
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'content' ? styles.active : ''}`}
              onClick={() => setActiveTab('content')}
              disabled={!isConnected('instagram')}
            >
              📸 Contenido
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'connections' && (
              <SocialMediaConnections />
            )}

            {activeTab === 'analytics' && (
              <PermissionGuard 
                permission={PERMISSIONS.ANALYTICS_VIEW}
                showDisabled={true}
                fallback={
                  <div className={styles.permissionFallback}>
                    <span>📊 Análisis no disponible</span>
                    <p>No tienes permisos para ver análisis detallados</p>
                  </div>
                }
              >
                <div className={styles.analyticsSection}>
                  {isConnected('instagram') ? (
                    <>
                      <h2>📊 Métricas de Instagram</h2>
                      
                      {instagramProfile && (
                        <div className={styles.metricsGrid}>
                          <div className={styles.metricCard}>
                            <h3>Publicaciones</h3>
                            <div className={styles.metricValue}>
                              {formatNumber(instagramProfile.media_count)}
                            </div>
                          </div>
                          
                          <div className={styles.metricCard}>
                            <h3>Tipo de Cuenta</h3>
                            <div className={styles.metricValue}>
                              {instagramProfile.account_type}
                            </div>
                          </div>
                          
                          <div className={styles.metricCard}>
                            <h3>Usuario</h3>
                            <div className={styles.metricValue}>
                              @{instagramProfile.username}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className={styles.infoBox}>
                        <h4>💡 Próximamente</h4>
                        <p>
                          Estamos trabajando en métricas avanzadas como engagement, 
                          alcance, impresiones y análisis de audiencia. Para obtener 
                          estas métricas, necesitarás una cuenta de Instagram Business.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      <span>🔗</span>
                      <h3>Conecta Instagram para ver análisis</h3>
                      <p>Ve a la pestaña "Conexiones" para conectar tu cuenta</p>
                    </div>
                  )}
                </div>
              </PermissionGuard>
            )}

            {activeTab === 'content' && (
              <PermissionGuard 
                permission={PERMISSIONS.ANALYTICS_VIEW}
                showDisabled={true}
                fallback={
                  <div className={styles.permissionFallback}>
                    <span>📸 Contenido no disponible</span>
                    <p>No tienes permisos para ver el contenido</p>
                  </div>
                }
              >
                <div className={styles.contentSection}>
                  {isConnected('instagram') && instagramMedia.length > 0 ? (
                    <>
                      <h2>📸 Contenido Reciente de Instagram</h2>
                      
                      <div className={styles.contentGrid}>
                        {instagramMedia.map((media) => (
                          <div key={media.id} className={styles.contentCard}>
                            <div className={styles.mediaContainer}>
                              <img
                                src={media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url}
                                alt={media.caption?.substring(0, 50) || 'Instagram post'}
                                className={styles.mediaImage}
                              />
                              <div className={styles.mediaType}>
                                {media.media_type === 'VIDEO' ? '🎥' : '📷'}
                              </div>
                            </div>
                            
                            <div className={styles.contentInfo}>
                              <p className={styles.caption}>
                                {media.caption ? 
                                  media.caption.length > 100 ? 
                                    media.caption.substring(0, 100) + '...' : 
                                    media.caption
                                  : 'Sin descripción'
                                }
                              </p>
                              
                              <div className={styles.contentMeta}>
                                <span>{new Date(media.timestamp).toLocaleDateString('es-ES')}</span>
                                <a 
                                  href={media.permalink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={styles.viewButton}
                                >
                                  Ver en Instagram
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      <span>📸</span>
                      <h3>
                        {isConnected('instagram') ? 
                          'No hay contenido disponible' : 
                          'Conecta Instagram para ver contenido'
                        }
                      </h3>
                      <p>
                        {isConnected('instagram') ? 
                          'No se encontró contenido reciente en tu cuenta' :
                          'Ve a la pestaña "Conexiones" para conectar tu cuenta'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </PermissionGuard>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
