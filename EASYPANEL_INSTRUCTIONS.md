# 🚀 Instrucciones para Desplegar ArtistPro en EasyPanel

## 📋 Checklist Pre-Deploy

### ✅ 1. VPS Configurado
- [ ] VPS creado en Hostinger
- [ ] Ubuntu 22.04 LTS instalado  
- [ ] IP del VPS obtenida
- [ ] Acceso SSH funcionando

### ✅ 2. EasyPanel Instalado
Ejecuta en tu VPS:
```bash
curl -sSL https://get.easypanel.io | sh
```

### ✅ 3. DNS Configurado
En tu proveedor de dominio:
```
artistpro.app → A → TU_IP_VPS
www.artistpro.app → A → TU_IP_VPS
```

## 🎯 Pasos en EasyPanel (Panel Web)

### 1. Acceder a EasyPanel
- URL: `http://TU_IP_VPS:3000`
- Crear cuenta de administrador

### 2. Crear Nuevo Proyecto
1. **Click "Create Project"**
2. **Project Name:** `artistpro`
3. **Repository:** `https://github.com/fsilvaluco/app-artistpro`
4. **Branch:** `main`
5. **Auto Deploy:** ✅ Enabled

### 3. Configurar Build Settings
```
Build Command: npm run build
Start Command: npm start
Install Command: npm ci
Port: 3000
```

### 4. Variables de Entorno
En EasyPanel → Environment Variables:

```
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=[tu_nueva_api_key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=artistpro-2024.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=artistpro-2024
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=artistpro-2024.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[tu_sender_id]
NEXT_PUBLIC_FIREBASE_APP_ID=[tu_app_id]
INSTAGRAM_APP_ID=[tu_instagram_app_id]
INSTAGRAM_APP_SECRET=[tu_instagram_app_secret]
```

### 5. Configurar Dominio
1. **Add Domain:** `artistpro.app`
2. **SSL:** ✅ Auto (Let's Encrypt)
3. **Add Domain:** `www.artistpro.app` 
4. **Redirect to:** `artistpro.app`

### 6. Deploy!
- Click **"Deploy"**
- Esperar build (2-5 minutos)
- ✅ ¡Listo!

## 🔧 Post-Deploy

### 1. Verificar Deploy
- ✅ `https://artistpro.app` carga
- ✅ SSL funcionando (candado verde)
- ✅ Login funciona
- ✅ No errores en console

### 2. Configurar Meta URLs
En Meta Developer Console:
```
Valid OAuth Redirect URIs: https://artistpro.app/auth/instagram/callback
Privacy Policy URL: https://artistpro.app/privacy
Terms of Service URL: https://artistpro.app/terms
Data Deletion URL: https://artistpro.app/data-deletion
```

### 3. Workflow de Desarrollo
```bash
# Desarrollo local
npm run dev

# Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"

# Deploy automático
git push origin main
# ↑ EasyPanel detecta el push y despliega automáticamente
```

## 📊 Monitoreo

### Logs en Tiempo Real
- EasyPanel → Logs → View Live Logs
- Errores y debug info en tiempo real

### Métricas
- CPU/Memory usage
- Request count
- Response times

### Alerts
- Configurar notificaciones por email/Slack
- Downtime detection
- Resource usage alerts

## 🆘 Troubleshooting

### Build Fails
1. Check logs en EasyPanel
2. Verificar variables de entorno
3. Verificar sintaxis en package.json

### App No Carga
1. Verificar puerto 3000
2. Check DNS propagation
3. Verificar SSL certificate

### Instagram No Funciona
1. Verificar callback URL en Meta
2. Check variables INSTAGRAM_* 
3. Verificar permisos de la app

## ⚡ Ventajas vs SiteGround

- ✅ Deploy en 5 minutos vs horas
- ✅ Git workflow automático
- ✅ Variables de entorno seguras
- ✅ SSL automático
- ✅ Logs en tiempo real
- ✅ Mejor rendimiento
- ✅ Menos costo

## 🎉 ¡Éxito!

Una vez completado:
- ✅ ArtistPro funcionando en `https://artistpro.app`
- ✅ Deploy automático en cada git push
- ✅ Monitoreo y logs profesionales
- ✅ Escalabilidad lista para crecer
