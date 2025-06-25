import { collection, addDoc } from "firebase/firestore";

// Datos de muestra para artistas
// Este archivo contiene estructuras de ejemplo para la base de datos

export const sampleArtists = [
  {
    name: "Luna Martínez",
    genre: "Pop Latino",
    description: "Artista emergente con influencias pop y ritmos latinos",
    avatar: null,
    email: "luna@example.com",
    website: "https://lunamartinez.com",
    socialMedia: {
      instagram: "@lunamartinez",
      youtube: "LunaMartinezMusic",
      spotify: "Luna Martinez"
    },
    status: "active",
    createdAt: new Date()
  },
  {
    name: "Andrés Vega",
    genre: "Rock Alternativo",
    description: "Músico indie con sonidos experimentales y letras profundas",
    avatar: null,
    email: "andres@example.com",
    website: "https://andresvega.music",
    socialMedia: {
      instagram: "@andresvegarock",
      youtube: "AndresVegaMusic",
      spotify: "Andrés Vega"
    },
    status: "active",
    createdAt: new Date()
  },
  {
    name: "Sofía Restrepo",
    genre: "R&B/Soul",
    description: "Vocalista con estilo R&B contemporáneo y toques de soul clásico",
    avatar: null,
    email: "sofia@example.com",
    website: "https://sofiarestrepo.com",
    socialMedia: {
      instagram: "@sofiarestrepomx",
      youtube: "SofiaRestrepoOfficial",
      spotify: "Sofia Restrepo"
    },
    status: "active",
    createdAt: new Date()
  }
];

export const sampleProjects = [
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
  },
  {
    title: "Video Musical - Estrella Fugaz",
    description: "Producción audiovisual para el primer sencillo del álbum",
    category: "video",
    priority: "medium",
    status: "in_progress",
    startDate: new Date("2025-01-15"),
    dueDate: new Date("2025-02-28"),
    budget: 8000,
    progress: 70
  }
];

export const sampleTasks = [
  // Tareas para el álbum
  {
    title: "Grabación de voces principales",
    description: "Sesión de grabación en estudio para todas las pistas vocales",
    category: "recording",
    status: "in_progress",
    priority: "high",
    startDate: new Date("2025-01-10"),
    dueDate: new Date("2025-01-25"),
    estimatedHours: 20,
    assignedTo: null // Se asignará al crear
  },
  {
    title: "Mezcla y masterización",
    description: "Postproducción de audio para todas las pistas del álbum",
    category: "production",
    status: "todo",
    priority: "high",
    startDate: new Date("2025-02-01"),
    dueDate: new Date("2025-02-20"),
    estimatedHours: 30,
    assignedTo: null
  },
  {
    title: "Diseño de portada del álbum",
    description: "Creación del arte visual para la portada y materiales promocionales",
    category: "design",
    status: "completed",
    priority: "medium",
    startDate: new Date("2024-12-15"),
    dueDate: new Date("2025-01-05"),
    estimatedHours: 15,
    assignedTo: null
  },
  // Tareas para la gira
  {
    title: "Reserva de venues",
    description: "Contactar y reservar espacios para los conciertos de la gira",
    category: "booking",
    status: "todo",
    priority: "high",
    startDate: new Date("2025-01-20"),
    dueDate: new Date("2025-02-10"),
    estimatedHours: 25,
    assignedTo: null
  },
  {
    title: "Contratación de equipo técnico",
    description: "Seleccionar y contratar sound engineers y técnicos de luces",
    category: "team",
    status: "todo",
    priority: "medium",
    startDate: new Date("2025-02-15"),
    dueDate: new Date("2025-03-01"),
    estimatedHours: 10,
    assignedTo: null
  },
  // Tareas para el video
  {
    title: "Preproducción del video",
    description: "Storyboard, locaciones y planificación de la producción",
    category: "planning",
    status: "completed",
    priority: "high",
    startDate: new Date("2025-01-01"),
    dueDate: new Date("2025-01-10"),
    estimatedHours: 12,
    assignedTo: null
  },
  {
    title: "Día de rodaje",
    description: "Filmación completa del video musical en locación",
    category: "production",
    status: "in_progress",
    priority: "high",
    startDate: new Date("2025-01-20"),
    dueDate: new Date("2025-01-22"),
    estimatedHours: 16,
    assignedTo: null
  },
  // Tareas independientes
  {
    title: "Actualización del sitio web",
    description: "Rediseño y actualización del sitio web oficial del artista",
    category: "digital",
    status: "todo",
    priority: "low",
    startDate: new Date("2025-02-01"),
    dueDate: new Date("2025-03-15"),
    estimatedHours: 20,
    assignedTo: null,
    projectId: null // Tarea independiente
  },
  {
    title: "Campaña en redes sociales",
    description: "Estrategia de contenido para Instagram, TikTok y YouTube",
    category: "marketing",
    status: "in_progress",
    priority: "medium",
    startDate: new Date("2025-01-01"),
    dueDate: new Date("2025-06-30"),
    estimatedHours: 40,
    assignedTo: null,
    projectId: null // Tarea independiente
  }
];

// Función helper para crear datos de muestra
export const createSampleData = async (db, userId, artistId) => {
  try {
    // Crear proyectos de muestra
    const projectPromises = sampleProjects.map(async (projectData) => {
      const docRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        userId,
        artistId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...projectData };
    });

    const createdProjects = await Promise.all(projectPromises);

    // Crear tareas de muestra (asociadas a proyectos y independientes)
    const taskPromises = sampleTasks.map(async (taskData, index) => {
      let projectId = null;
      
      // Asociar algunas tareas a proyectos
      if (index < 3) {
        projectId = createdProjects[0].id; // Álbum
      } else if (index >= 3 && index < 5) {
        projectId = createdProjects[1].id; // Gira
      } else if (index >= 5 && index < 7) {
        projectId = createdProjects[2].id; // Video
      }
      // Las últimas tareas quedan como independientes (projectId = null)

      const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        userId,
        artistId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...taskData };
    });

    await Promise.all(taskPromises);

    console.log("✅ Datos de muestra creados exitosamente");
    return { success: true, message: "Datos de muestra creados" };
  } catch (error) {
    console.error("❌ Error creando datos de muestra:", error);
    return { success: false, error: error.message };
  }
};
