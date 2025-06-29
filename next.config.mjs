/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Para permitir el build en producción ignorando warnings
    ignoreDuringBuilds: true,
  },
  // Configuración para EasyPanel/VPS (modo server)
  images: {
    unoptimized: true
  },
  // Remover output estático para VPS
  // output: 'export' // Comentado para VPS
};

export default nextConfig;
