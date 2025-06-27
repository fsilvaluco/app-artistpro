import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  where 
} from "firebase/firestore";
import { db } from "../app/firebase";
import { sampleArtists, createSampleData } from "./sampleData";

// Función para limpiar datos sin artistId
export const cleanOrphanedData = async (userId) => {
  try {
    console.log("🧹 Iniciando limpieza de datos huérfanos...");
    
    // Limpiar proyectos sin artistId
    const projectsQuery = query(
      collection(db, "projects"),
      where("userId", "==", userId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    
    let orphanedProjects = 0;
    for (const docSnapshot of projectsSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.artistId) {
        await deleteDoc(doc(db, "projects", docSnapshot.id));
        orphanedProjects++;
        console.log(`🗑️ Eliminado proyecto huérfano: ${data.title}`);
      }
    }
    
    // Limpiar tareas sin artistId
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    
    let orphanedTasks = 0;
    for (const docSnapshot of tasksSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.artistId) {
        await deleteDoc(doc(db, "tasks", docSnapshot.id));
        orphanedTasks++;
        console.log(`🗑️ Eliminada tarea huérfana: ${data.title}`);
      }
    }
    
    console.log(`✅ Limpieza completada: ${orphanedProjects} proyectos y ${orphanedTasks} tareas eliminados`);
    return { orphanedProjects, orphanedTasks };
  } catch (error) {
    console.error("❌ Error en limpieza de datos:", error);
    throw error;
  }
};

// Función para crear artistas de muestra si no existen
export const createSampleArtists = async () => {
  try {
    console.log("🎨 Verificando artistas existentes...");
    
    const artistsSnapshot = await getDocs(collection(db, "artists"));
    const existingArtists = artistsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (existingArtists.length === 0) {
      console.log("🎨 No hay artistas, creando artistas de muestra...");
      
      const createdArtists = [];
      for (const artistData of sampleArtists) {
        const docRef = await addDoc(collection(db, "artists"), {
          ...artistData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        createdArtists.push({ id: docRef.id, ...artistData });
        console.log(`✅ Artista creado: ${artistData.name}`);
      }
      
      return createdArtists;
    } else {
      console.log(`ℹ️ Ya existen ${existingArtists.length} artistas`);
      return existingArtists;
    }
  } catch (error) {
    console.error("❌ Error creando artistas:", error);
    throw error;
  }
};

// Función para poblar datos para un artista específico
export const populateDataForArtist = async (userId, artistId) => {
  try {
    console.log(`📊 Poblando datos para artista ${artistId}...`);
    
    // Verificar si ya hay datos para este artista
    const projectsQuery = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      where("artistId", "==", artistId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    
    if (projectsSnapshot.empty) {
      // Crear datos de muestra para este artista
      const result = await createSampleData(db, userId, artistId);
      console.log(`✅ Datos poblados para artista ${artistId}`);
      return result;
    } else {
      console.log(`ℹ️ El artista ${artistId} ya tiene datos`);
      return { success: true, message: "El artista ya tiene datos" };
    }
  } catch (error) {
    console.error("❌ Error poblando datos:", error);
    throw error;
  }
};

// Función completa de migración y setup inicial
export const setupDatabase = async (userId) => {
  try {
    console.log("🚀 Iniciando setup completo de la base de datos...");
    
    // 1. Limpiar datos huérfanos
    await cleanOrphanedData(userId);
    
    // 2. Crear artistas de muestra si no existen
    const artists = await createSampleArtists();
    
    // 3. Poblar datos para cada artista
    for (const artist of artists) {
      await populateDataForArtist(userId, artist.id);
    }
    
    console.log("🎉 Setup de base de datos completado exitosamente");
    return { success: true, artists };
  } catch (error) {
    console.error("❌ Error en setup de base de datos:", error);
    return { success: false, error: error.message };
  }
};

// Función para verificar la integridad de los datos
export const verifyDataIntegrity = async (userId) => {
  try {
    console.log("🔍 Verificando integridad de datos...");
    
    // Verificar proyectos
    const projectsQuery = query(
      collection(db, "projects"),
      where("userId", "==", userId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    
    let projectsWithoutArtist = 0;
    let projectsByArtist = {};
    
    projectsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.artistId) {
        projectsWithoutArtist++;
      } else {
        projectsByArtist[data.artistId] = (projectsByArtist[data.artistId] || 0) + 1;
      }
    });
    
    // Verificar tareas
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    
    let tasksWithoutArtist = 0;
    let tasksByArtist = {};
    
    tasksSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.artistId) {
        tasksWithoutArtist++;
      } else {
        tasksByArtist[data.artistId] = (tasksByArtist[data.artistId] || 0) + 1;
      }
    });
    
    const report = {
      projects: {
        total: projectsSnapshot.docs.length,
        withoutArtist: projectsWithoutArtist,
        byArtist: projectsByArtist
      },
      tasks: {
        total: tasksSnapshot.docs.length,
        withoutArtist: tasksWithoutArtist,
        byArtist: tasksByArtist
      }
    };
    
    console.log("📊 Reporte de integridad:", report);
    return report;
  } catch (error) {
    console.error("❌ Error verificando integridad:", error);
    throw error;
  }
};
