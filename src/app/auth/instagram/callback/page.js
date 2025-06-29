"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocialMedia } from '../../../../contexts/SocialMediaContext';

export default function InstagramCallback() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Procesando conexión con Instagram...');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleInstagramCallback } = useSocialMedia();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Obtener código de autorización de los parámetros de URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorReason = searchParams.get('error_reason');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(`${error}: ${errorDescription || errorReason || 'Error desconocido'}`);
        }

        if (!code) {
          throw new Error('Código de autorización no recibido');
        }

        setMessage('Intercambiando código por token de acceso...');
        
        // Manejar el callback a través del contexto
        await handleInstagramCallback(code);
        
        setStatus('success');
        setMessage('¡Instagram conectado exitosamente!');
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push('/analisis/rrss');
        }, 2000);
        
      } catch (error) {
        console.error('Error in Instagram callback:', error);
        setStatus('error');
        setMessage(`Error: ${error.message}`);
        
        // Redirigir después de 5 segundos en caso de error
        setTimeout(() => {
          router.push('/analisis/rrss');
        }, 5000);
      }
    };

    processCallback();
  }, [searchParams, handleInstagramCallback, router]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Ícono de estado */}
        <div style={{ marginBottom: '20px', fontSize: '48px' }}>
          {status === 'processing' && '⏳'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>
        
        {/* Título */}
        <h1 style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: status === 'error' ? '#dc2626' : '#1f2937'
        }}>
          {status === 'processing' && 'Conectando Instagram'}
          {status === 'success' && '¡Conectado!'}
          {status === 'error' && 'Error de Conexión'}
        </h1>
        
        {/* Mensaje */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        
        {/* Loader para estado de procesamiento */}
        {status === 'processing' && (
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        )}
        
        {/* Botón para volver en caso de error */}
        {status === 'error' && (
          <button
            onClick={() => router.push('/analisis/rrss')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Volver a Redes Sociales
          </button>
        )}
        
        {/* Mensaje de redirección */}
        {(status === 'success' || status === 'error') && (
          <p style={{
            marginTop: '16px',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            Redirigiendo automáticamente...
          </p>
        )}
      </div>
      
      {/* CSS para animación */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
