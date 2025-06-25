import styles from "./ProjectSelector.module.css";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../app/firebase";

// Selector de artista/proyecto para usuarios con acceso a uno o más proyectos
export default function ProjectSelector({ user, onSelect }) {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchArtists() {
      const querySnapshot = await getDocs(collection(db, "artists"));
      const artists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(artists);
    }
    fetchArtists();
  }, []);

  return (
    <div className={styles.selector}>
      {/* Botón avatar tipo Google login */}
      <button className={styles.avatarBtn} onClick={() => setOpen(o => !o)}>
        {/* Si hay foto del proyecto, mostrarla. Si no, inicial. */}
        <span className={styles.avatar}>
          {projects[0]?.avatar ? (
            <img src={projects[0].avatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />
          ) : (
            projects[0]?.name?.[0] || "A"
          )}
        </span>
      </button>
      {/* Menú desplegable de proyectos (por implementar) */}
      {open && (
        <div className={styles.dropdown}>
          {projects.map(project => (
            <div
              key={project.id}
              className={styles.dropdownItem}
              onClick={() => { setOpen(false); onSelect?.(project); }}
            >
              {project.avatar ? (
                <img src={project.avatar} alt="avatar" style={{ width: 28, height: 28, borderRadius: "50%", marginRight: 8 }} />
              ) : (
                <span className={styles.avatarSmall}>{project.name?.[0] || "A"}</span>
              )}
              {project.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
