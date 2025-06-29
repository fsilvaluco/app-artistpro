# Configuración de Git Deployment en SiteGround

## Pasos completados
✅ Repositorio en GitHub creado
✅ Código subido y protegido
✅ Variables de entorno migradas
✅ Script de despliegue creado

## Configuración en SiteGround

### 1. Acceso a Git Deployment
- Panel SiteGround → Site Tools → Devs → Git

### 2. Configuración del repositorio
```
Repository URL: https://github.com/fsilvaluco/app-artistpro.git
Branch: main
Repository Path: /public_html (o tu directorio preferido)
Repository Name: app-artistpro
```

### 3. Autenticación
**Opción recomendada: Personal Access Token**
- GitHub → Settings → Developer settings → Personal access tokens
- Generar token con permisos `repo`
- Usar como contraseña en SiteGround

### 4. Variables de entorno
Después del primer deploy, configurar `.env.local` en el servidor con:
- Nueva API Key de Firebase (rotada)
- Credenciales de Instagram/Facebook
- URL de producción: https://artistpro.app

### 5. Build automático
Configurar comando post-deployment:
```bash
npm ci && npm run build
```

### 6. Dominio
- Verificar que el dominio apunta al directorio correcto
- Configurar Document Root si es necesario

## Tareas críticas pendientes

### 🔴 URGENTE: Seguridad
1. **Rotar API Key de Firebase**
   - Ir a Firebase Console
   - Generar nueva API Key
   - Actualizar `.env.local` en servidor
   - Revocar la API Key anterior

2. **Configurar variables de entorno en producción**
   - Usar `.env.production.example` como referencia
   - NO subir credenciales reales a Git

### 🟡 IMPORTANTE: Testing
1. **Probar integración de Instagram en producción**
   - Verificar URLs de callback
   - Probar flujo completo de autenticación
   - Validar permisos de Meta for Developers

2. **Verificar funcionalidad completa**
   - Autenticación de usuarios
   - Gestión de equipo y permisos
   - Dashboard y análisis

### 🟢 OPCIONAL: Optimización
1. **Configurar auto-deployment**
   - Push automático desde GitHub
   - Notificaciones de deploy

2. **Monitoreo y logs**
   - Configurar alertas
   - Revisar logs de errores

## Comandos útiles

### En el servidor (después del deploy)
```bash
# Ejecutar configuración post-deployment
bash setup-production.sh

# Verificar build
npm run build

# Verificar variables de entorno
cat .env.local
```

### En local (para actualizaciones)
```bash
# Hacer cambios y pushear
git add .
git commit -m "Descripción del cambio"
git push origin main

# En SiteGround: Pull automático o manual
```

## Contacto y soporte
- Documentación SiteGround: https://www.siteground.com/kb/
- Soporte técnico disponible 24/7
- Panel de control: https://my.siteground.com/

---
**Estado actual**: Listo para configurar Git Deployment en SiteGround
**Siguiente paso**: Seguir la guía paso a paso arriba

# Guía de Despliegue - ArtistPro

## 🎯 Opción 1: Despliegue Automático con Git (Recomendado)

### Paso 1: Preparar SiteGround para Git

**Problema común:** SiteGround no detecta el proyecto para configurar Git.

**Solución:** Subir archivos temporales para que SiteGround detecte el proyecto:

1. **Sube manualmente estos archivos al File Manager:**
   ```
   📄 index.html (página temporal)
   📄 package.json
   📄 README_SITE.md
   ```

2. **Una vez subidos, ve a Git en tu panel de SiteGround**
3. **Configura el repositorio:**
   - Repository URL: `https://github.com/fsilvaluco/app-artistpro.git`
   - Branch: `main`
   - Path: `/` (raíz del dominio)

### Paso 2: Configurar Variables de Entorno

En el panel de SiteGround → **Environment Variables**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_nueva_api_key_rotada
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=artistpro-2024.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=artistpro-2024
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=artistpro-2024.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
INSTAGRAM_APP_ID=tu_instagram_app_id
INSTAGRAM_APP_SECRET=tu_instagram_app_secret
```

### Paso 3: Configurar Build Automático

1. **En SiteGround → Git → Build Settings:**
   ```bash
   # Install dependencies
   npm install
   
   # Build for production
   npm run build
   
   # Copy build files
   cp -r out/* ./
   cp .htaccess ./
   ```

## 🎯 Opción 2: Despliegue Manual

### Usando el Script Automático

```powershell
# Ejecutar script de despliegue
.\deploy-to-siteground.ps1
```

Esto creará:
- Build de producción en `/out`
- Archivo `.htaccess` para Apache
- Instrucciones detalladas

### Pasos Manuales

1. **Crear build:**
   ```bash
   npm run build
   ```

2. **Subir al File Manager de SiteGround:**
   - Todo el contenido de `/out`
   - Archivo `.htaccess`
   - Archivos de configuración

## 🔧 Configuración Post-Despliegue

### 1. Verificar URLs en Meta Developer

Actualiza en [Meta for Developers](https://developers.facebook.com/apps/):

```
Valid OAuth Redirect URIs:
- https://artistpro.app/auth/instagram/callback

Privacy Policy URL: https://artistpro.app/privacy
Terms of Service URL: https://artistpro.app/terms
Data Deletion Instructions URL: https://artistpro.app/data-deletion
```

### 2. Configurar DNS (si es necesario)

Si usas subdominio:
```
Type: CNAME
Name: www
Target: artistpro.app
```

### 3. Verificar SSL

- Activar SSL en SiteGround
- Forzar redirección HTTPS

## 🔍 Verificación

1. **Visita:** `https://artistpro.app`
2. **Prueba login:** Funcionalidad básica
3. **Prueba Instagram:** Conexión de redes sociales
4. **Verifica errores:** Console del navegador

## ⚠️ Seguridad IMPORTANTE

### ⚠️ Rotar API Key de Firebase

**URGENTE:** La API key de Firebase fue expuesta en commits anteriores.

1. **Ve a Firebase Console → Project Settings → General**
2. **En "Web API Key" haz clic en "Regenerate"**
3. **Actualiza `.env.local` y variables de SiteGround**
4. **No confirmes el cambio hasta tener la nueva key configurada**

### Buenas Prácticas

- ✅ Variables de entorno protegidas
- ✅ `.env*` en `.gitignore`
- ✅ URLs legales configuradas
- ⚠️ API Key debe ser rotada
- ✅ Dominio real configurado

## 🆘 Troubleshooting

Si hay problemas, consulta `TROUBLESHOOTING.md` para soluciones comunes.

---
✅ **Status:** Listo para despliegue  
⚠️ **Pendiente:** Rotar API Key de Firebase
