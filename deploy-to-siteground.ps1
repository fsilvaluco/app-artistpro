# Script de despliegue para SiteGround (PowerShell)
# Uso: .\deploy-to-siteground.ps1

Write-Host "🚀 Iniciando despliegue de ArtistPro..." -ForegroundColor Green

# Hacer build de producción
Write-Host "📦 Creando build de producción..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build. Abortando despliegue." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completado exitosamente" -ForegroundColor Green

# Crear archivo .htaccess para Apache
Write-Host "📝 Creando archivos de despliegue..." -ForegroundColor Yellow

$htaccessContent = @"
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
"@

$htaccessContent | Out-File -FilePath ".htaccess" -Encoding UTF8

Write-Host "✅ Archivos de configuración creados" -ForegroundColor Green

# Instrucciones para el usuario
Write-Host ""
Write-Host "🎯 SIGUIENTE PASO: Subir archivos a SiteGround" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivos a subir al File Manager de SiteGround:" -ForegroundColor White
Write-Host "   📁 out/ (toda la carpeta del build)" -ForegroundColor Gray
Write-Host "   📄 .htaccess" -ForegroundColor Gray
Write-Host "   📄 index.html (temporal)" -ForegroundColor Gray
Write-Host "   📄 package.json" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 O configura Git en SiteGround apuntando a:" -ForegroundColor White
Write-Host "   Repository: https://github.com/fsilvaluco/app-artistpro.git" -ForegroundColor Gray
Write-Host "   Branch: main" -ForegroundColor Gray
Write-Host ""
Write-Host "⚙️ No olvides configurar las variables de entorno en SiteGround:" -ForegroundColor Yellow
Write-Host "   - NEXT_PUBLIC_FIREBASE_API_KEY" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_FIREBASE_APP_ID" -ForegroundColor Gray
Write-Host "   - INSTAGRAM_APP_ID" -ForegroundColor Gray
Write-Host "   - INSTAGRAM_APP_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Listo para desplegar!" -ForegroundColor Green
