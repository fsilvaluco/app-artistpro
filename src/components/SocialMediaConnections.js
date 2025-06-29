"use client";

import { useState } from 'react';
import { useSocialMedia } from '../contexts/SocialMediaContext';
import { SOCIAL_PROVIDERS } from '../utils/socialMediaApi';
import styles from './SocialMediaConnections.module.css';

const SocialMediaConnections = () => {
  const {
    connectedAccounts,
    loading,
    instagramProfile,
    instagramMedia,
    connectInstagram,
    disconnectAccount,
    syncSocialData,
    isConnected,
    getAccountInfo
  } = useSocialMedia();

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await syncSocialData();
    setSyncing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Nunca';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Conexiones de Redes Sociales</h2>
        <p>Conecta tus cuentas de redes sociales para analizar tu rendimiento</p>
      </div>

      {/* Instagram */}
      <div className={styles.providerCard}>
        <div className={styles.providerHeader}>
          <div className={styles.providerInfo}>
            <div className={styles.providerIcon}>
              <span>📸</span>
            </div>
            <div>
              <h3>Instagram</h3>
              <p>Conecta tu cuenta de Instagram para análisis y métricas</p>
            </div>
          </div>
          
          <div className={styles.providerActions}>
            {isConnected(SOCIAL_PROVIDERS.INSTAGRAM) ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing || loading}
                  className={`${styles.button} ${styles.secondary}`}
                >
                  {syncing ? '🔄 Sincronizando...' : '🔄 Sincronizar'}
                </button>
                <button
                  onClick={() => disconnectAccount(SOCIAL_PROVIDERS.INSTAGRAM)}
                  disabled={loading}
                  className={`${styles.button} ${styles.danger}`}
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={connectInstagram}
                disabled={loading}
                className={`${styles.button} ${styles.primary}`}
              >
                {loading ? 'Conectando...' : 'Conectar Instagram'}
              </button>
            )}
          </div>
        </div>

        {/* Información de cuenta conectada */}
        {isConnected(SOCIAL_PROVIDERS.INSTAGRAM) && instagramProfile && (
          <div className={styles.accountInfo}>
            <div className={styles.accountDetails}>
              <div className={styles.accountStat}>
                <span className={styles.label}>Usuario:</span>
                <span className={styles.value}>@{instagramProfile.username}</span>
              </div>
              <div className={styles.accountStat}>
                <span className={styles.label}>Tipo de cuenta:</span>
                <span className={styles.value}>{instagramProfile.account_type}</span>
              </div>
              <div className={styles.accountStat}>
                <span className={styles.label}>Publicaciones:</span>
                <span className={styles.value}>{formatNumber(instagramProfile.media_count)}</span>
              </div>
              <div className={styles.accountStat}>
                <span className={styles.label}>Última sincronización:</span>
                <span className={styles.value}>
                  {formatDate(connectedAccounts.instagram?.lastSyncAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Vista previa de medios */}
        {isConnected(SOCIAL_PROVIDERS.INSTAGRAM) && instagramMedia.length > 0 && (
          <div className={styles.mediaPreview}>
            <h4>Publicaciones Recientes</h4>
            <div className={styles.mediaGrid}>
              {instagramMedia.slice(0, 6).map((media) => (
                <div key={media.id} className={styles.mediaItem}>
                  <img
                    src={media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url}
                    alt={media.caption?.substring(0, 50) || 'Instagram post'}
                    className={styles.mediaImage}
                  />
                  <div className={styles.mediaOverlay}>
                    <span className={styles.mediaType}>
                      {media.media_type === 'VIDEO' ? '🎥' : '📷'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Facebook (placeholder) */}
      <div className={styles.providerCard}>
        <div className={styles.providerHeader}>
          <div className={styles.providerInfo}>
            <div className={styles.providerIcon}>
              <span>📘</span>
            </div>
            <div>
              <h3>Facebook</h3>
              <p>Conecta tu página de Facebook (próximamente)</p>
            </div>
          </div>
          
          <div className={styles.providerActions}>
            <button
              disabled
              className={`${styles.button} ${styles.disabled}`}
            >
              Próximamente
            </button>
          </div>
        </div>
      </div>

      {/* Twitter (placeholder) */}
      <div className={styles.providerCard}>
        <div className={styles.providerHeader}>
          <div className={styles.providerInfo}>
            <div className={styles.providerIcon}>
              <span>🐦</span>
            </div>
            <div>
              <h3>Twitter / X</h3>
              <p>Conecta tu cuenta de Twitter (próximamente)</p>
            </div>
          </div>
          
          <div className={styles.providerActions}>
            <button
              disabled
              className={`${styles.button} ${styles.disabled}`}
            >
              Próximamente
            </button>
          </div>
        </div>
      </div>

      {/* TikTok (placeholder) */}
      <div className={styles.providerCard}>
        <div className={styles.providerHeader}>
          <div className={styles.providerInfo}>
            <div className={styles.providerIcon}>
              <span>🎵</span>
            </div>
            <div>
              <h3>TikTok</h3>
              <p>Conecta tu cuenta de TikTok (próximamente)</p>
            </div>
          </div>
          
          <div className={styles.providerActions}>
            <button
              disabled
              className={`${styles.button} ${styles.disabled}`}
            >
              Próximamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaConnections;
