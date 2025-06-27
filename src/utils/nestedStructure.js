import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  orderBy,
  serverTimestamp,
  getDoc 
} from "firebase/firestore";
import { db } from "../app/firebase";

// Funciones para la nueva estructura anidada: artists/{artistId}/projects y artists/{artistId}/tasks

// CRUD para Proyectos (estructura anidada)
export const createNestedProject = async (artistId, userId, projectData) => {
  if (!artistId) throw new Error("No hay artista seleccionado");
  if (!userId) throw new Error("Usuario no autenticado");
  
  try {
    const docRef = await addDoc(collection(db, "artists", artistId, "projects"), {
      ...projectData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...projectData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error creating nested project:", error);
    throw error;
  }
};

export const getNestedProjects = async (artistId, userId) => {
  if (!artistId) return [];
  
  try {
    const q = query(
      collection(db, "artists", artistId, "projects"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const projects = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filtrar por userId como seguridad adicional
      if (data.userId === userId) {
        projects.push({ id: doc.id, ...data });
      }
    });
    
    return projects;
  } catch (error) {
    console.error("Error loading nested projects:", error);
    return [];
  }
};

export const updateNestedProject = async (artistId, projectId, updates) => {
  try {
    const projectRef = doc(db, "artists", artistId, "projects", projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating nested project:", error);
    throw error;
  }
};

export const deleteNestedProject = async (artistId, projectId) => {
  try {
    await deleteDoc(doc(db, "artists", artistId, "projects", projectId));
    
    // También eliminar tareas asociadas al proyecto
    const tasksQuery = collection(db, "artists", artistId, "tasks");
    const tasksSnapshot = await getDocs(tasksQuery);
    
    const deletePromises = [];
    tasksSnapshot.forEach((taskDoc) => {
      const taskData = taskDoc.data();
      if (taskData.projectId === projectId) {
        deletePromises.push(deleteDoc(doc(db, "artists", artistId, "tasks", taskDoc.id)));
      }
    });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting nested project:", error);
    throw error;
  }
};

// CRUD para Tareas (estructura anidada)
export const createNestedTask = async (artistId, userId, taskData) => {
  if (!artistId) throw new Error("No hay artista seleccionado");
  if (!userId) throw new Error("Usuario no autenticado");
  
  try {
    const docRef = await addDoc(collection(db, "artists", artistId, "tasks"), {
      ...taskData,
      userId: userId,
      status: taskData.status || "todo",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...taskData,
      userId,
      status: taskData.status || "todo",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error("Error creating nested task:", error);
    throw error;
  }
};

export const getNestedTasks = async (artistId, userId) => {
  if (!artistId) return [];
  
  try {
    const q = query(
      collection(db, "artists", artistId, "tasks"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filtrar por userId como seguridad adicional
      if (data.userId === userId) {
        tasks.push({ id: doc.id, ...data });
      }
    });
    
    return tasks;
  } catch (error) {
    console.error("Error loading nested tasks:", error);
    return [];
  }
};

export const updateNestedTask = async (artistId, taskId, updates) => {
  try {
    const taskRef = doc(db, "artists", artistId, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating nested task:", error);
    throw error;
  }
};

export const deleteNestedTask = async (artistId, taskId) => {
  try {
    await deleteDoc(doc(db, "artists", artistId, "tasks", taskId));
  } catch (error) {
    console.error("Error deleting nested task:", error);
    throw error;
  }
};

// Función para migrar de estructura plana a anidada
export const migrateToNestedStructure = async (userId) => {
  try {
    console.log("🔄 Iniciando migración a estructura anidada...");
    
    // 1. Obtener todos los artistas
    const artistsSnapshot = await getDocs(collection(db, "artists"));
    const artists = artistsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 2. Para cada artista, migrar sus proyectos y tareas
    for (const artist of artists) {
      console.log(`📁 Migrando datos para artista: ${artist.name} (${artist.id})`);
      
      // Migrar proyectos
      const projectsQuery = query(
        collection(db, "projects"),
        // where("artistId", "==", artist.id),
        // where("userId", "==", userId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      
      let migratedProjects = 0;
      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();
        if (projectData.artistId === artist.id && projectData.userId === userId) {
          // Crear en estructura anidada
          await addDoc(collection(db, "artists", artist.id, "projects"), {
            title: projectData.title,
            description: projectData.description,
            category: projectData.category,
            priority: projectData.priority,
            status: projectData.status,
            startDate: projectData.startDate,
            dueDate: projectData.dueDate,
            budget: projectData.budget,
            progress: projectData.progress,
            userId: projectData.userId,
            createdAt: projectData.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Eliminar de estructura plana
          await deleteDoc(doc(db, "projects", projectDoc.id));
          migratedProjects++;
        }
      }
      
      // Migrar tareas
      const tasksQuery = query(
        collection(db, "tasks")
        // where("artistId", "==", artist.id),
        // where("userId", "==", userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      
      let migratedTasks = 0;
      for (const taskDoc of tasksSnapshot.docs) {
        const taskData = taskDoc.data();
        if (taskData.artistId === artist.id && taskData.userId === userId) {
          // Crear en estructura anidada
          await addDoc(collection(db, "artists", artist.id, "tasks"), {
            title: taskData.title,
            description: taskData.description,
            category: taskData.category,
            status: taskData.status,
            priority: taskData.priority,
            startDate: taskData.startDate,
            dueDate: taskData.dueDate,
            estimatedHours: taskData.estimatedHours,
            assignedTo: taskData.assignedTo,
            projectId: taskData.projectId,
            userId: taskData.userId,
            createdAt: taskData.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Eliminar de estructura plana
          await deleteDoc(doc(db, "tasks", taskDoc.id));
          migratedTasks++;
        }
      }
      
      console.log(`✅ Artista ${artist.name}: ${migratedProjects} proyectos, ${migratedTasks} tareas migradas`);
    }
    
    console.log("🎉 Migración completada exitosamente");
    return { success: true, message: "Migración completada" };
  } catch (error) {
    console.error("❌ Error en migración:", error);
    return { success: false, error: error.message };
  }
};

// Función para poblar datos de muestra en estructura anidada
export const populateNestedSampleData = async (userId, artistId) => {
  try {
    console.log(`📊 Poblando datos anidados para artista ${artistId}...`);
    
    // Verificar si ya hay datos
    const projectsSnapshot = await getDocs(collection(db, "artists", artistId, "projects"));
    if (!projectsSnapshot.empty) {
      console.log(`ℹ️ El artista ${artistId} ya tiene datos`);
      return { success: true, message: "El artista ya tiene datos" };
    }
    
    // Datos de muestra para proyectos
    const sampleProjects = [
      {
        title: "Nuevo Álbum - Corazón de Fuego",
        description: "Producción del primer álbum completo con 12 tracks originales",
        category: "album",
        priority: "high",
        status: "in_progress",
        startDate: new Date("2024-12-01"),
        dueDate: new Date("2025-03-15"),
        budget: 15000,
        progress: 45
      },
      {
        title: "Gira Nacional 2025",
        description: "Planificación y organización de gira por 8 ciudades principales",
        category: "tour",
        priority: "high",
        status: "todo",
        startDate: new Date("2025-02-01"),
        dueDate: new Date("2025-06-30"),
        budget: 50000,
        progress: 10
      }
    ];
    
    // Crear proyectos
    const createdProjects = [];
    for (const projectData of sampleProjects) {
      const project = await createNestedProject(artistId, userId, projectData);
      createdProjects.push(project);
    }
    
    // Datos de muestra para tareas
    const sampleTasks = [
      {
        title: "Grabación de voces principales",
        description: "Sesión de grabación en estudio para todas las pistas vocales",
        category: "recording",
        status: "in_progress",
        priority: "high",
        startDate: new Date("2025-01-10"),
        dueDate: new Date("2025-01-25"),
        estimatedHours: 20,
        projectId: createdProjects[0]?.id // Álbum
      },
      {
        title: "Reserva de venues",
        description: "Contactar y reservar espacios para los conciertos de la gira",
        category: "booking",
        status: "todo",
        priority: "high",
        startDate: new Date("2025-01-20"),
        dueDate: new Date("2025-02-10"),
        estimatedHours: 25,
        projectId: createdProjects[1]?.id // Gira
      },
      {
        title: "Actualización del sitio web",
        description: "Rediseño y actualización del sitio web oficial del artista",
        category: "digital",
        status: "todo",
        priority: "low",
        startDate: new Date("2025-02-01"),
        dueDate: new Date("2025-03-15"),
        estimatedHours: 20,
        projectId: null // Tarea independiente
      }
    ];
    
    // Crear tareas
    for (const taskData of sampleTasks) {
      await createNestedTask(artistId, userId, taskData);
    }
    
    console.log(`✅ Datos poblados para artista ${artistId}`);
    return { success: true, message: "Datos de muestra creados" };
  } catch (error) {
    console.error("❌ Error poblando datos anidados:", error);
    return { success: false, error: error.message };
  }
};
