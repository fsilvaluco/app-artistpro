#!/bin/bash

# Script de despliegue para SiteGround
# Uso: ./deploy-to-siteground.sh

echo "🚀 Iniciando despliegue de ArtistPro..."

# Hacer build de producción
echo "📦 Creando build de producción..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build. Abortando despliegue."
    exit 1
fi

echo "✅ Build completado exitosamente"

# Crear archivo de despliegue
echo "📝 Creando archivos de despliegue..."

# Crear archivo .htaccess para Next.js en Apache
cat > .htaccess << 'EOF'
# Next.js Static Export Configuration
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

echo "✅ Archivos de configuración creados"

# Instrucciones para el usuario
echo ""
echo "🎯 SIGUIENTE PASO: Subir archivos a SiteGround"
echo ""
echo "Archivos a subir al File Manager de SiteGround:"
echo "   📁 out/ (toda la carpeta del build)"
echo "   📄 .htaccess"
echo "   📄 index.html (temporal)"
echo "   📄 package.json"
echo ""
echo "🔗 O configura Git en SiteGround apuntando a:"
echo "   Repository: https://github.com/fsilvaluco/app-artistpro.git"
echo "   Branch: main"
echo ""
echo "⚙️ No olvides configurar las variables de entorno en SiteGround:"
echo "   - NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "   - NEXT_PUBLIC_FIREBASE_APP_ID"
echo "   - INSTAGRAM_APP_ID"
echo "   - INSTAGRAM_APP_SECRET"
echo ""
echo "🎉 Listo para desplegar!"
