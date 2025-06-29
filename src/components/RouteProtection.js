"use client";

import { useEffect, useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { useAccess } from "../contexts/AccessContext";
import { useRouter, usePathname } from "next/navigation";

export default function RouteProtection({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading: sessionLoading, isAuthenticated } = useSession();
  const { hasAccess, loading: accessLoading, accessChecked } = useAccess();
  const router = useRouter();
  const pathname = usePathname();

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/privacy', '/terms', '/data-deletion'];
  
  // Rutas que requieren autenticación pero no acceso a artista
  const authOnlyRoutes = ['/solicitar-acceso'];

  useEffect(() => {
    // Esperar a que se complete la verificación de sesión y acceso
    if (sessionLoading || accessLoading || !accessChecked) {
      return;
    }

    const currentPath = pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);
    const isAuthOnlyRoute = authOnlyRoutes.includes(currentPath);
    
    console.log("🛡️ RouteProtection - Verificando ruta:", currentPath);
    console.log("🛡️ Usuario autenticado:", isAuthenticated());
    console.log("🛡️ Tiene acceso:", hasAccess);
    console.log("🛡️ Es ruta pública:", isPublicRoute);
    console.log("🛡️ Es ruta solo auth:", isAuthOnlyRoute);

    // Si no está autenticado y no es una ruta pública
    if (!isAuthenticated() && !isPublicRoute) {
      console.log("❌ Usuario no autenticado, redirigiendo al login");
      router.push('/');
      setIsChecking(false);
      return;
    }

    // Si está autenticado pero no tiene acceso y no está en una ruta permitida
    if (isAuthenticated() && !hasAccess && !isPublicRoute && !isAuthOnlyRoute) {
      console.log("❌ Usuario sin acceso a artistas, redirigiendo a solicitar-acceso");
      router.push('/solicitar-acceso');
      setIsChecking(false);
      return;
    }

    // Si tiene acceso y está en la página de solicitar acceso, redirigir a inicio
    if (isAuthenticated() && hasAccess && currentPath === '/solicitar-acceso') {
      console.log("✅ Usuario con acceso en solicitar-acceso, redirigiendo a inicio");
      router.push('/inicio');
      setIsChecking(false);
      return;
    }

    console.log("✅ Acceso permitido a la ruta");
    setIsChecking(false);
  }, [
    sessionLoading, 
    accessLoading, 
    accessChecked, 
    isAuthenticated, 
    hasAccess, 
    pathname, 
    router
  ]);

  // Mostrar loading mientras se verifica
  if (sessionLoading || accessLoading || !accessChecked || isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Verificando acceso...
      </div>
    );
  }

  return children;
}
