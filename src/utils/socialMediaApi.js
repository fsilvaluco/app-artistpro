// APIs de Redes Sociales - Instagram, Facebook, etc.

// Configuración de Instagram Basic Display API
const INSTAGRAM_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID,
  CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
  REDIRECT_URI: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/auth/instagram/callback',
  SCOPE: 'user_profile,user_media',
  BASE_URL: 'https://api.instagram.com',
  GRAPH_URL: 'https://graph.instagram.com'
};

// URLs de autenticación
export const getInstagramAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_CONFIG.CLIENT_ID,
    redirect_uri: INSTAGRAM_CONFIG.REDIRECT_URI,
    scope: INSTAGRAM_CONFIG.SCOPE,
    response_type: 'code'
  });
  
  return `${INSTAGRAM_CONFIG.BASE_URL}/oauth/authorize?${params.toString()}`;
};

// Intercambiar código por token de acceso
export const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch(`${INSTAGRAM_CONFIG.BASE_URL}/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CONFIG.CLIENT_ID,
        client_secret: INSTAGRAM_CONFIG.CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_CONFIG.REDIRECT_URI,
        code: code
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // El token de corta duración necesita ser intercambiado por uno de larga duración
    return await exchangeShortTokenForLongToken(data.access_token);
    
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

// Intercambiar token de corta duración por uno de larga duración (60 días)
export const exchangeShortTokenForLongToken = async (shortToken) => {
  try {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: INSTAGRAM_CONFIG.CLIENT_SECRET,
      access_token: shortToken
    });

    const response = await fetch(`${INSTAGRAM_CONFIG.GRAPH_URL}/access_token?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error exchanging short token for long token:', error);
    throw error;
  }
};

// Refrescar token de larga duración (antes de que expire)
export const refreshLongLivedToken = async (accessToken) => {
  try {
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: accessToken
    });

    const response = await fetch(`${INSTAGRAM_CONFIG.GRAPH_URL}/refresh_access_token?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Obtener información del perfil del usuario
export const getUserProfile = async (accessToken) => {
  try {
    const params = new URLSearchParams({
      fields: 'id,username,account_type,media_count',
      access_token: accessToken
    });

    const response = await fetch(`${INSTAGRAM_CONFIG.GRAPH_URL}/me?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Obtener medios del usuario (fotos/videos)
export const getUserMedia = async (accessToken, limit = 25) => {
  try {
    const params = new URLSearchParams({
      fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
      limit: limit.toString(),
      access_token: accessToken
    });

    const response = await fetch(`${INSTAGRAM_CONFIG.GRAPH_URL}/me/media?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error getting user media:', error);
    throw error;
  }
};

// Obtener insights de un post específico (solo para cuentas de negocio)
export const getMediaInsights = async (mediaId, accessToken) => {
  try {
    const params = new URLSearchParams({
      metric: 'impressions,reach,likes,comments,saves,shares',
      access_token: accessToken
    });

    const response = await fetch(`${INSTAGRAM_CONFIG.GRAPH_URL}/${mediaId}/insights?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error getting media insights:', error);
    throw error;
  }
};

// Validar token de acceso
export const validateToken = async (accessToken) => {
  try {
    const response = await fetch(`${INSTAGRAM_CONFIG.GRAPH_URL}/me?access_token=${accessToken}`);
    return response.ok;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Obtener información de un medio específico
export const getMediaDetails = async (mediaId, accessToken) => {
  try {
    const params = new URLSearchParams({
      fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count',
      access_token: accessToken
    });

    const response = await fetch(`${INSTAGRAM_CONFIG.GRAPH_URL}/${mediaId}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error getting media details:', error);
    throw error;
  }
};

// Funciones auxiliares para manejar errores de API
export const handleApiError = (error) => {
  if (error.response) {
    // Error de respuesta de la API
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return 'Solicitud inválida. Verifica los parámetros.';
      case 401:
        return 'Token de acceso inválido o expirado.';
      case 403:
        return 'Acceso denegado. Verifica los permisos.';
      case 429:
        return 'Límite de rate exceeded. Intenta más tarde.';
      case 500:
        return 'Error interno del servidor de Instagram.';
      default:
        return `Error ${status}: ${data?.error?.message || 'Error desconocido'}`;
    }
  }
  
  return error.message || 'Error de conexión';
};

// Configuración para otros proveedores (Facebook, Twitter, TikTok, etc.)
export const SOCIAL_PROVIDERS = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube'
};

// Clase principal para manejar múltiples redes sociales
export class SocialMediaManager {
  constructor() {
    this.providers = new Map();
  }

  // Registrar un proveedor de red social
  registerProvider(name, config) {
    this.providers.set(name, config);
  }

  // Obtener configuración de un proveedor
  getProvider(name) {
    return this.providers.get(name);
  }

  // Conectar con una red social
  async connect(provider, credentials) {
    const config = this.getProvider(provider);
    if (!config) {
      throw new Error(`Proveedor ${provider} no configurado`);
    }

    // Aquí implementarías la lógica específica para cada proveedor
    switch (provider) {
      case SOCIAL_PROVIDERS.INSTAGRAM:
        return await this.connectInstagram(credentials);
      default:
        throw new Error(`Proveedor ${provider} no soportado aún`);
    }
  }

  async connectInstagram(credentials) {
    // Implementar conexión específica de Instagram
    return {
      provider: SOCIAL_PROVIDERS.INSTAGRAM,
      connected: true,
      profile: await getUserProfile(credentials.accessToken)
    };
  }
}

// Exportar instancia singleton
export const socialMediaManager = new SocialMediaManager();
