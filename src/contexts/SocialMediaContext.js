"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getInstagramAuthUrl, 
  exchangeCodeForToken, 
  getUserProfile, 
  getUserMedia,
  validateToken,
  refreshLongLivedToken,
  SOCIAL_PROVIDERS 
} from '../utils/socialMediaApi';
import { useSession } from './SessionContext';
import { useArtist } from './ArtistContext';
import { useNotification } from './NotificationContext';

// Firebase imports para guardar tokens
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../app/firebase';

const SocialMediaContext = createContext();

export const useSocialMedia = () => {
  const context = useContext(SocialMediaContext);
  if (!context) {
    throw new Error('useSocialMedia must be used within a SocialMediaProvider');
  }
  return context;
};

export const SocialMediaProvider = ({ children }) => {
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [instagramProfile, setInstagramProfile] = useState(null);
  const [instagramMedia, setInstagramMedia] = useState([]);
  
  const { getUserData } = useSession();
  const { getCurrentArtistId } = useArtist();
  const { showSuccess, showError } = useNotification();
  
  const userData = getUserData();
  const artistId = getCurrentArtistId();

  // Cargar conexiones existentes al montar el componente
  useEffect(() => {
    if (userData?.uid && artistId) {
      loadConnectedAccounts();
    }
  }, [userData?.uid, artistId]);

  // Cargar cuentas conectadas desde Firebase
  const loadConnectedAccounts = async () => {
    if (!userData?.uid || !artistId) return;

    try {
      setLoading(true);
      
      const socialAccountsRef = doc(db, 'artists', artistId, 'socialAccounts', userData.uid);
      const socialAccountsDoc = await getDoc(socialAccountsRef);
      
      if (socialAccountsDoc.exists()) {
        const accounts = socialAccountsDoc.data();
        setConnectedAccounts(accounts);
        
        // Si hay cuenta de Instagram, cargar perfil y medios
        if (accounts.instagram?.accessToken) {
          await loadInstagramData(accounts.instagram.accessToken);
        }
      }
    } catch (error) {
      console.error('Error loading connected accounts:', error);
      showError('Error cargando cuentas conectadas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos de Instagram
  const loadInstagramData = async (accessToken) => {
    try {
      // Validar token antes de usar
      const isValid = await validateToken(accessToken);
      if (!isValid) {
        showError('Token de Instagram expirado');
        await disconnectAccount(SOCIAL_PROVIDERS.INSTAGRAM);
        return;
      }

      // Cargar perfil
      const profile = await getUserProfile(accessToken);
      setInstagramProfile(profile);

      // Cargar medios recientes
      const media = await getUserMedia(accessToken, 12);
      setInstagramMedia(media.data || []);
      
    } catch (error) {
      console.error('Error loading Instagram data:', error);
      showError('Error cargando datos de Instagram');
    }
  };

  // Iniciar conexión con Instagram
  const connectInstagram = () => {
    if (!userData?.uid || !artistId) {
      showError('Debes estar autenticado y tener un artista seleccionado');
      return;
    }

    const authUrl = getInstagramAuthUrl();
    
    // Guardar estado para verificar después del callback
    localStorage.setItem('instagram_auth_state', JSON.stringify({
      userId: userData.uid,
      artistId: artistId,
      timestamp: Date.now()
    }));
    
    // Redirigir a Instagram para autorización
    window.location.href = authUrl;
  };

  // Manejar callback de Instagram (llamar desde la página de callback)
  const handleInstagramCallback = async (code) => {
    try {
      setLoading(true);
      
      // Verificar estado guardado
      const savedState = localStorage.getItem('instagram_auth_state');
      if (!savedState) {
        throw new Error('Estado de autenticación no encontrado');
      }
      
      const state = JSON.parse(savedState);
      
      // Verificar que no haya pasado mucho tiempo (10 minutos)
      if (Date.now() - state.timestamp > 10 * 60 * 1000) {
        throw new Error('Sesión de autenticación expirada');
      }
      
      // Intercambiar código por token
      const tokenData = await exchangeCodeForToken(code);
      
      // Obtener perfil del usuario
      const profile = await getUserProfile(tokenData.access_token);
      
      // Guardar conexión en Firebase
      const connectionData = {
        provider: SOCIAL_PROVIDERS.INSTAGRAM,
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        profile: profile,
        connectedAt: serverTimestamp(),
        lastSyncAt: serverTimestamp()
      };
      
      await saveAccountConnection(SOCIAL_PROVIDERS.INSTAGRAM, connectionData);
      
      // Actualizar estado local
      setConnectedAccounts(prev => ({
        ...prev,
        instagram: connectionData
      }));
      
      setInstagramProfile(profile);
      
      // Cargar medios iniciales
      await loadInstagramData(tokenData.access_token);
      
      // Limpiar estado temporal
      localStorage.removeItem('instagram_auth_state');
      
      showSuccess(`Instagram conectado como @${profile.username}`);
      
    } catch (error) {
      console.error('Error handling Instagram callback:', error);
      showError('Error conectando Instagram: ' + error.message);
      localStorage.removeItem('instagram_auth_state');
    } finally {
      setLoading(false);
    }
  };

  // Guardar conexión de cuenta en Firebase
  const saveAccountConnection = async (provider, connectionData) => {
    if (!userData?.uid || !artistId) return;

    try {
      const socialAccountsRef = doc(db, 'artists', artistId, 'socialAccounts', userData.uid);
      
      await setDoc(socialAccountsRef, {
        [provider]: connectionData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
    } catch (error) {
      console.error('Error saving account connection:', error);
      throw error;
    }
  };

  // Desconectar cuenta
  const disconnectAccount = async (provider) => {
    if (!userData?.uid || !artistId) return;

    try {
      setLoading(true);
      
      const socialAccountsRef = doc(db, 'artists', artistId, 'socialAccounts', userData.uid);
      
      // Actualizar en Firebase (remover el proveedor)
      const currentData = connectedAccounts;
      delete currentData[provider];
      
      await setDoc(socialAccountsRef, currentData);
      
      // Actualizar estado local
      setConnectedAccounts(currentData);
      
      // Limpiar datos específicos del proveedor
      if (provider === SOCIAL_PROVIDERS.INSTAGRAM) {
        setInstagramProfile(null);
        setInstagramMedia([]);
      }
      
      showSuccess(`${provider} desconectado correctamente`);
      
    } catch (error) {
      console.error('Error disconnecting account:', error);
      showError('Error desconectando cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar token de Instagram
  const refreshInstagramToken = async () => {
    const instagramAccount = connectedAccounts.instagram;
    if (!instagramAccount?.accessToken) return;

    try {
      const newTokenData = await refreshLongLivedToken(instagramAccount.accessToken);
      
      const updatedConnection = {
        ...instagramAccount,
        accessToken: newTokenData.access_token,
        expiresIn: newTokenData.expires_in,
        lastRefreshAt: serverTimestamp()
      };
      
      await saveAccountConnection(SOCIAL_PROVIDERS.INSTAGRAM, updatedConnection);
      
      setConnectedAccounts(prev => ({
        ...prev,
        instagram: updatedConnection
      }));
      
      console.log('Instagram token refreshed successfully');
      
    } catch (error) {
      console.error('Error refreshing Instagram token:', error);
      // Si falla el refresh, desconectar la cuenta
      await disconnectAccount(SOCIAL_PROVIDERS.INSTAGRAM);
    }
  };

  // Sincronizar datos de redes sociales
  const syncSocialData = async () => {
    try {
      setLoading(true);
      
      // Sincronizar Instagram si está conectado
      if (connectedAccounts.instagram?.accessToken) {
        await loadInstagramData(connectedAccounts.instagram.accessToken);
        
        // Actualizar timestamp de última sincronización
        const updatedConnection = {
          ...connectedAccounts.instagram,
          lastSyncAt: serverTimestamp()
        };
        
        await saveAccountConnection(SOCIAL_PROVIDERS.INSTAGRAM, updatedConnection);
      }
      
      showSuccess('Datos sincronizados correctamente');
      
    } catch (error) {
      console.error('Error syncing social data:', error);
      showError('Error sincronizando datos');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si una cuenta está conectada
  const isConnected = (provider) => {
    return !!connectedAccounts[provider]?.accessToken;
  };

  // Obtener información de una cuenta conectada
  const getAccountInfo = (provider) => {
    return connectedAccounts[provider]?.profile || null;
  };

  const value = {
    // Estado
    connectedAccounts,
    loading,
    instagramProfile,
    instagramMedia,
    
    // Funciones de conexión
    connectInstagram,
    handleInstagramCallback,
    disconnectAccount,
    
    // Funciones de datos
    loadInstagramData,
    syncSocialData,
    refreshInstagramToken,
    
    // Funciones de utilidad
    isConnected,
    getAccountInfo,
    
    // Recargar conexiones
    loadConnectedAccounts
  };

  return (
    <SocialMediaContext.Provider value={value}>
      {children}
    </SocialMediaContext.Provider>
  );
};

export default SocialMediaProvider;
