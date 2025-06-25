"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../contexts/SessionContext";

export default function Home() {
  const [theme, setTheme] = useState("system");
  const router = useRouter();
  const { user, loading } = useSession();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      router.push("/inicio");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      document.body.dataset.theme = mq.matches ? "dark" : "light";
      const handler = (e) => {
        document.body.dataset.theme = e.matches ? "dark" : "light";
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      document.body.dataset.theme = theme;
    }
  }, [theme]);

  // Función para login con Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // La redirección se maneja automáticamente por el useEffect
    } catch (error) {
      console.error("Error en el login:", error);
      alert(`Error en el login: ${error.message}`);
    }
  };

  // Mostrar loading si aún está verificando la sesión
  if (loading) {
    return (
      <div className={styles.page} style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'var(--bg, #ffffff)' 
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
            color: 'var(--text, #000000)', 
            margin: 0, 
            fontSize: 16, 
            fontWeight: 500 
          }}>
            Cargando...
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

  // No mostrar la página de login si el usuario ya está autenticado
  if (user) {
    return null;
  }
  return (
    <div className={styles.page} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)' }}>
      <header style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image src="/next.svg" alt="ArtistPro logo" width={40} height={40} />
        <span style={{ fontWeight: 700, fontSize: 28, letterSpacing: 1, color: 'var(--text)' }}>ArtistPro</span>
        <select
          aria-label="Tema"
          value={theme}
          onChange={e => setTheme(e.target.value)}
          style={{ marginLeft: 16, borderRadius: 4, border: '1px solid #ccc', padding: '4px 8px', background: 'var(--bg)', color: 'var(--text)' }}
        >
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="system">Sistema</option>
        </select>
      </header>
      <main style={{ width: 340, background: 'var(--card)', borderRadius: 8, boxShadow: '0 2px 16px #0001', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, color: 'var(--text)' }}>La nueva era de la gestión musical</h2>
        <p style={{ color: 'var(--text2)', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
          Organiza, crea y evoluciona con <b>ArtistPro</b> by Katarsis.
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            marginBottom: 12,
            padding: '10px 0',
            borderRadius: 4,
            border: '1px solid #222',
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} style={{ marginRight: 8 }} />
          Continuar con Google
        </button>
        {/* Aquí más adelante se agregarán otros botones de login */}
      </main>
    </div>
  );
}
