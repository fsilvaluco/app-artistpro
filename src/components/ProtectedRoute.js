"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../contexts/SessionContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Si no hay usuario y ya terminó de cargar, redirigir al login
      router.push("/");
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--bg, #ffffff)',
        color: 'var(--text, #000000)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: 32,
          background: 'var(--card, #ffffff)',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border, #e1e5e9)'
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid var(--border, #e1e5e9)',
            borderTop: '4px solid var(--primary, #007bff)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ 
            margin: 0, 
            fontSize: 16, 
            fontWeight: 500,
            color: 'var(--text, #000000)' 
          }}>
            Verificando autenticación...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Si hay usuario, renderizar el contenido protegido
  return children;
}
