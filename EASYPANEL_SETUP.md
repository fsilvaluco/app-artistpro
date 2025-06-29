# Configuración para EasyPanel - ArtistPro

## 🚀 Deploy Automático con EasyPanel

### 1. Configuración del Proyecto
```yaml
# easypanel.yml
services:
  - name: artistpro
    type: app
    source:
      type: github
      repo: fsilvaluco/app-artistpro
      branch: main
    build:
      type: nixpacks
      command: npm run build
    deploy:
      replicas: 1
      command: npm start
    domains:
      - artistpro.app
      - www.artistpro.app
    env:
      - NODE_ENV=production
      - NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
      - NEXT_PUBLIC_FIREBASE_APP_ID=${FIREBASE_APP_ID}
      - INSTAGRAM_APP_ID=${INSTAGRAM_APP_ID}
      - INSTAGRAM_APP_SECRET=${INSTAGRAM_APP_SECRET}
```

### 2. Ventajas Inmediatas

#### ✅ **Git Integration:**
- Push to main = Deploy automático
- Rollback en 1 click
- Preview deployments

#### ✅ **SSL Automático:**
- Let's Encrypt integrado
- Renovación automática
- HTTPS forzado

#### ✅ **Variables de Entorno:**
- Panel web fácil
- Encriptación automática
- Sin archivos .env expuestos

#### ✅ **Monitoring:**
- Logs en tiempo real
- Métricas de performance
- Alertas automáticas

#### ✅ **Escalabilidad:**
- Auto-scaling disponible
- Load balancing
- CDN integrado

### 3. Proceso de Migración

#### Paso 1: VPS Setup
1. Crear VPS en Hostinger
2. Instalar EasyPanel
3. Configurar dominio artistpro.app

#### Paso 2: Deploy
1. Conectar GitHub repo
2. Configurar variables de entorno
3. Deploy automático

#### Paso 3: Testing
1. Verificar funcionalidad
2. Probar Instagram integration
3. Configurar monitoring

### 4. Comandos Post-Deploy

```bash
# Ver logs
easypanel logs artistpro

# Restart aplicación
easypanel restart artistpro

# Scale aplicación
easypanel scale artistpro --replicas=2

# Backup base de datos
easypanel backup create
```

### 5. Workflow Desarrollo

```bash
# Local development
npm run dev

# Commit changes
git add .
git commit -m "feat: nueva funcionalidad"

# Deploy automático
git push origin main
# ↑ Esto ya despliega automáticamente en production
```

## 🔧 Configuraciones Adicionales

### Database (si necesitas)
```yaml
services:
  - name: postgres
    type: postgres
    version: 15
    env:
      - POSTGRES_DB=artistpro
      - POSTGRES_USER=artistpro_user
```

### Redis (para cache)
```yaml
services:
  - name: redis
    type: redis
    version: 7
```

## 📊 Beneficios vs SiteGround

| Característica | SiteGround | EasyPanel VPS |
|---------------|------------|---------------|
| Node.js Support | ❌ | ✅ |
| Git Deploy | ❌ | ✅ |
| Environment Variables | ❌ | ✅ |
| SSL Automático | ✅ | ✅ |
| Database | ❌ | ✅ |
| Real-time Logs | ❌ | ✅ |
| Auto-scaling | ❌ | ✅ |
| Cost | $$$$ | $$ |

## 🎯 Recomendación

**EasyPanel es la mejor opción para ArtistPro** porque:

1. **Soporte nativo** para Next.js
2. **Git workflow** natural
3. **Variables de entorno** seguras
4. **Mejor precio/rendimiento**
5. **Escalabilidad real**
6. **Experiencia de desarrollo** superior
