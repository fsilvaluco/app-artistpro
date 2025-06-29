#!/bin/bash

# Script de despliegue para SiteGround
echo "🚀 Iniciando despliegue..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Ejecutar build de producción
echo "🔨 Ejecutando build..."
npm run build

# Copiar archivos estáticos a la carpeta correcta
echo "📁 Copiando archivos..."
cp -r .next/static .next/standalone/
cp -r public .next/standalone/

echo "✅ Despliegue completado!"
