#!/bin/bash

# Script de despliegue semi-automático con Git pull
# Este script se ejecuta en el servidor para actualizar desde GitHub

echo "🚀 ArtistPro - Despliegue Automático"
echo "======================================"

# Configuración
REPO_URL="https://github.com/fsilvaluco/app-artistpro.git"
PROJECT_DIR="/home/username/artistpro"  # Ajustar según SiteGround
WEB_DIR="/home/username/public_html"    # Ajustar según SiteGround

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📂 Preparando directorios...${NC}"

# Crear directorio del proyecto si no existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}📥 Clonando repositorio...${NC}"
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
else
    echo -e "${YELLOW}🔄 Actualizando desde GitHub...${NC}"
    cd $PROJECT_DIR
    git pull origin main
fi

# Verificar si hay cambios
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Código actualizado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al actualizar código${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi

echo -e "${YELLOW}🔨 Creando build de producción...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Creando .htaccess...${NC}"
cat > out/.htaccess << 'EOF'
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</filesMatch>
EOF

echo -e "${YELLOW}🚀 Desplegando archivos...${NC}"

# Hacer backup del directorio web actual
if [ -d "$WEB_DIR" ]; then
    BACKUP_DIR="/home/username/backups/artistpro_$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}💾 Creando backup en $BACKUP_DIR...${NC}"
    mkdir -p /home/username/backups
    cp -r $WEB_DIR $BACKUP_DIR
fi

# Limpiar directorio web (mantener archivos importantes)
find $WEB_DIR -name "*.html" -delete
find $WEB_DIR -name "*.js" -delete
find $WEB_DIR -name "*.css" -delete
find $WEB_DIR -name "*.json" -delete

# Copiar nuevos archivos
echo -e "${YELLOW}📤 Copiando archivos al directorio web...${NC}"
cp -r out/* $WEB_DIR/

# Establecer permisos correctos
chmod -R 755 $WEB_DIR
find $WEB_DIR -type f -exec chmod 644 {} \;

echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Tu sitio está disponible en: https://artistpro.app${NC}"

# Mostrar resumen
echo ""
echo "📊 Resumen del despliegue:"
echo "=========================="
echo "📅 Fecha: $(date)"
echo "📂 Directorio: $WEB_DIR"
echo "🔗 Repositorio: $REPO_URL"
echo "🏷️  Commit: $(git rev-parse --short HEAD)"
echo "💬 Mensaje: $(git log -1 --pretty=%B)"
