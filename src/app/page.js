"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export default function Home() {
  // Función para login con Google
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("¡Login exitoso!");
      // Aquí podrías redirigir o actualizar estado
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        {/* --- AGREGA TU BOTÓN AQUÍ --- */}
        <button onClick={loginWithGoogle} style={{margin: '16px 0', padding: '12px 24px', fontSize: '16px', borderRadius: '6px', cursor: 'pointer'}}>
          Iniciar sesión con Google
        </button>
        {/* --- FIN BOTÓN --- */}

        <div className={styles.ctas}>
          {/* ... tus links ... */}
        </div>
      </main>
      <footer className={styles.footer}>
        {/* ... tus links ... */}
      </footer>
    </div>
  );
}
