/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Para permitir el build en producción ignorando warnings
    ignoreDuringBuilds: true,
  },
  // Configuración para despliegue estático
  images: {
    unoptimized: true
  }
};

export default nextConfig;
