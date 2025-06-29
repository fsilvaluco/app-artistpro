# Configuración de APIs de Redes Sociales

## Instagram Basic Display API

### 1. Crear una aplicación en Facebook for Developers

1. Ve a [Facebook for Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación
3. Agrega el producto "Instagram Basic Display"

### 2. Configurar la aplicación

**Configuración básica:**
- App Name: ArtistPro
- App Type: Consumer
- Business Use Case: Other

**Instagram Basic Display:**
- Valid OAuth Redirect URIs:
  - `http://localhost:3000/auth/instagram/callback` (desarrollo)
  - `https://yourdomain.com/auth/instagram/callback` (producción)

### 3. Obtener credenciales

En la sección "Instagram Basic Display" encontrarás:
- **Instagram App ID** (NEXT_PUBLIC_INSTAGRAM_CLIENT_ID)
- **Instagram App Secret** (INSTAGRAM_CLIENT_SECRET)

### 4. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa:

```env
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=tu_instagram_app_id
INSTAGRAM_CLIENT_SECRET=tu_instagram_app_secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
```

### 5. Funcionalidades disponibles

Con Instagram Basic Display API puedes obtener:
- ✅ Perfil del usuario (username, account_type, media_count)
- ✅ Medios (fotos/videos con metadata básica)
- ❌ Métricas detalladas (likes, comments, reach, impressions)

Para métricas avanzadas necesitas:
- Instagram Business Account
- Facebook Page conectada
- Instagram Graph API (más complejo de configurar)

### 6. Limitaciones de desarrollo

En modo desarrollo, solo puedes:
- Usar tu propia cuenta de Instagram
- Invitar hasta 5 usuarios de prueba
- Acceso limitado a datos

Para producción necesitas solicitar revisión de la app.

## Próximas APIs a integrar

### Facebook Pages API
- Métricas de páginas de Facebook
- Posts y su rendimiento
- Insights de audiencia

### Twitter API v2
- Tweets y métricas
- Followers y engagement
- Análisis de hashtags

### TikTok for Developers
- Videos y estadísticas
- Perfil y followers
- Engagement metrics

### YouTube Data API v3
- Canal y videos
- Analytics y métricas
- Comentarios y engagement

## Estructura de datos en Firebase

```
artists/
  {artistId}/
    socialAccounts/
      {userId}/
        instagram: {
          provider: "instagram",
          accessToken: "...",
          tokenType: "bearer",
          expiresIn: 5183944,
          profile: {
            id: "...",
            username: "...",
            account_type: "PERSONAL|BUSINESS",
            media_count: 123
          },
          connectedAt: timestamp,
          lastSyncAt: timestamp
        }
        facebook: { ... }
        twitter: { ... }
```

## Flujo de autenticación

1. Usuario hace clic en "Conectar Instagram"
2. Se guarda estado temporal en localStorage
3. Redirección a Instagram OAuth
4. Instagram redirige a `/auth/instagram/callback`
5. Se intercambia código por token
6. Se obtiene token de larga duración (60 días)
7. Se guarda conexión en Firebase
8. Se cargan datos iniciales del perfil

## Manejo de errores comunes

### Token expirado
- Los tokens de Instagram expiran en 60 días
- Implementar refresh automático
- Notificar al usuario si falla

### Rate limiting
- Instagram: 200 requests/hour por token
- Implementar cache y polling inteligente
- Mostrar límites al usuario

### Permisos denegados
- Usuario puede denegar permisos
- Manejar gracefully con mensajes claros
- Permitir reintento

## Testing

Para probar la integración:

1. Configura una app de Instagram en desarrollo
2. Usa tu propia cuenta personal
3. Invita usuarios de prueba si necesario
4. Verifica el flujo completo de conexión
5. Prueba la sincronización de datos
6. Maneja casos de error

## Despliegue a producción

Para producción necesitas:

1. Completar la revisión de la app en Facebook
2. Configurar dominios autorizados
3. Actualizar URLs de callback
4. Configurar variables de entorno de producción
5. Implementar logs y monitoreo
6. Configurar alertas para errores de API
