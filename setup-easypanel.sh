# Script de instalación para EasyPanel
# Ejecutar en tu VPS como root

#!/bin/bash
echo "🚀 Instalando EasyPanel en tu VPS..."

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar EasyPanel
curl -sSL https://get.easypanel.io | sh

echo "✅ EasyPanel instalado!"
echo "🌐 Accede a: http://TU_IP_VPS:3000"
echo "📧 Configura tu cuenta de administrador"
