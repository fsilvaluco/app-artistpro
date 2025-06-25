"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import styles from "./inicio.module.css";

export default function InicioPageWrapper() {
  const [theme, setTheme] = useState("system");
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
  return (
    <Sidebar theme={theme} setTheme={setTheme}>
      <Inicio />
    </Sidebar>
  );
}

function Inicio() {
  // Aquí se mostrará el resumen del artista/proyecto
  return (
    <div className={styles.inicio}>
      <h1>Bienvenido a ArtistPro</h1>
      <p>Aquí verás el resumen de tu actividad, proyectos y equipo.</p>
      {/* Más adelante se agregará información dinámica */}
    </div>
  );
}
