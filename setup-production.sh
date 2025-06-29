#!/bin/bash

# Script de configuración post-deployment para SiteGround
# Ejecutar este script después del primer deploy

echo "🚀 Configurando ArtistPro en SiteGround..."

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm ci
fi

# Ejecutar build de producción
echo "🔨 Ejecutando build de producción..."
npm run build

# Verificar que el archivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  ADVERTENCIA: Archivo .env.local no encontrado"
    echo "🔧 Copia el archivo .env.production.example a .env.local y configura las variables"
fi

# Verificar permisos de archivos
echo "🔐 Verificando permisos..."
chmod 644 .env.local 2>/dev/null || echo "⚠️  No se pudo configurar permisos de .env.local"

# Limpiar caché si existe
if [ -d ".next" ]; then
    echo "🧹 Limpiando caché de Next.js..."
    rm -rf .next/cache
fi

echo "✅ Configuración completada!"
echo ""
echo "📋 Tareas pendientes:"
echo "1. Configurar variables de entorno en .env.local"
echo "2. Rotar API Key de Firebase"
echo "3. Verificar que el dominio apunta al directorio correcto"
echo "4. Probar la aplicación en el navegador"

exit 0
