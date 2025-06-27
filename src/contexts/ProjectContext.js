"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "./SessionContext";
import { useArtist } from "./ArtistContext";
import {
  createNestedProject,
  getNestedProjects,
  updateNestedProject,
  deleteNestedProject,
  createNestedTask,
  getNestedTasks,
  updateNestedTask,
  deleteNestedTask
} from "../utils/nestedStructure";

// Crear el contexto
const ProjectContext = createContext(null);

// Exportar el contexto para uso directo
export { ProjectContext };

// Hook personalizado para usar el contexto
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject debe ser usado dentro de ProjectProvider");
  }
  return context;
};

// Provider del contexto
export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSession();
  const { getCurrentArtistId, selectedArtist } = useArtist();

  // Cargar proyectos del artista seleccionado (estructura anidada)
  const loadProjects = async () => {
    if (!user) {
      console.log("❌ Sin usuario autenticado");
      setProjects([]);
      return;
    }
    
    const artistId = getCurrentArtistId();
    console.log("📂 Cargando proyectos para artista:", artistId);
    if (!artistId) {
      console.log("❌ No hay artistId, cancelando carga de proyectos");
      setProjects([]);
      return;
    }
    
    try {
      const projectsData = await getNestedProjects(artistId, user.uid);
      console.log("📂 Proyectos cargados:", projectsData.length, "para artista:", artistId);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading nested projects:", error);
      setProjects([]);
    }
  };

  // Cargar tareas del artista seleccionado (estructura anidada)
  const loadTasks = async () => {
    if (!user) {
      console.log("❌ Sin usuario autenticado");
      setTasks([]);
      return;
    }
    
    const artistId = getCurrentArtistId();
    console.log("📋 Cargando tareas para artista:", artistId);
    if (!artistId) {
      console.log("❌ No hay artistId, cancelando carga de tareas");
      setTasks([]);
      return;
    }
    
    try {
      const tasksData = await getNestedTasks(artistId, user.uid);
      console.log("📋 Tareas cargadas:", tasksData.length, "para artista:", artistId);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading nested tasks:", error);
      setTasks([]);
    }
  };

  // Cargar datos cuando el usuario o artista cambie
  useEffect(() => {
    if (user && selectedArtist) {
      console.log("🔄 Recargando datos por cambio de usuario/artista");
      setLoading(true);
      // Limpiar datos anteriores inmediatamente
      setProjects([]);
      setTasks([]);
      
      Promise.all([loadProjects(), loadTasks()]).finally(() => {
        setLoading(false);
      });
    } else {
      console.log("❌ Sin usuario o artista, limpiando datos");
      setProjects([]);
      setTasks([]);
      setLoading(false);
    }
  }, [user, selectedArtist]);

  // Escuchar cambios de artista
  useEffect(() => {
    const handleArtistChange = () => {
      console.log("🎨 Evento de cambio de artista detectado");
      if (user && selectedArtist) {
        console.log("🔄 Recargando datos por cambio de artista");
        setLoading(true);
        // Limpiar datos anteriores inmediatamente
        setProjects([]);
        setTasks([]);
        
        Promise.all([loadProjects(), loadTasks()]).finally(() => {
          setLoading(false);
        });
      }
    };

    const handleUserLogout = () => {
      console.log("🚪 Evento de logout detectado, limpiando datos");
      setProjects([]);
      setTasks([]);
      setLoading(false);
    };

    window.addEventListener('artistChanged', handleArtistChange);
    window.addEventListener('userLogout', handleUserLogout);
    
    return () => {
      window.removeEventListener('artistChanged', handleArtistChange);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, [user, selectedArtist]);

  // CRUD para Proyectos (estructura anidada)
  const createProject = async (projectData) => {
    if (!user) throw new Error("Usuario no autenticado");
    
    const artistId = getCurrentArtistId();
    if (!artistId) throw new Error("No hay artista seleccionado");
    
    try {
      console.log("🆕 Creando proyecto para artista:", artistId);
      const newProject = await createNestedProject(artistId, user.uid, projectData);
      setProjects(prev => [newProject, ...prev]);
      console.log("✅ Proyecto creado:", newProject.title);
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    const artistId = getCurrentArtistId();
    if (!artistId) throw new Error("No hay artista seleccionado");
    
    try {
      await updateNestedProject(artistId, projectId, updates);
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        )
      );
      console.log("✅ Proyecto actualizado:", projectId);
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    const artistId = getCurrentArtistId();
    if (!artistId) throw new Error("No hay artista seleccionado");
    
    try {
      await deleteNestedProject(artistId, projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      // También eliminar tareas asociadas del estado local
      setTasks(prev => prev.filter(task => task.projectId !== projectId));
      console.log("✅ Proyecto eliminado:", projectId);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };

  // CRUD para Tareas (estructura anidada)
  const createTask = async (taskData) => {
    if (!user) throw new Error("Usuario no autenticado");
    
    const artistId = getCurrentArtistId();
    if (!artistId) throw new Error("No hay artista seleccionado");
    
    try {
      console.log("🆕 Creando tarea para artista:", artistId);
      const newTask = await createNestedTask(artistId, user.uid, taskData);
      setTasks(prev => [newTask, ...prev]);
      console.log("✅ Tarea creada:", newTask.title);
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    const artistId = getCurrentArtistId();
    if (!artistId) throw new Error("No hay artista seleccionado");
    
    try {
      await updateNestedTask(artistId, taskId, updates);
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      );
      console.log("✅ Tarea actualizada:", taskId);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    const artistId = getCurrentArtistId();
    if (!artistId) throw new Error("No hay artista seleccionado");
    
    try {
      await deleteNestedTask(artistId, taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      console.log("✅ Tarea eliminada:", taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  // Funciones utilitarias
  const getProjectById = (projectId) => {
    return projects.find(project => project.id === projectId);
  };

  const getTasksByProject = (projectId) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getIndependentTasks = () => {
    return tasks.filter(task => !task.projectId);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getProjectStats = (projectId) => {
    const projectTasks = getTasksByProject(projectId);
    const completed = projectTasks.filter(task => task.status === "completed").length;
    const total = projectTasks.length;
    return {
      total,
      completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Calcular fechas de proyecto basadas en sus tareas
  const getProjectDates = (projectId) => {
    const projectTasks = getTasksByProject(projectId);
    if (projectTasks.length === 0) return { startDate: null, endDate: null };

    const taskDates = projectTasks
      .filter(task => task.startDate || task.dueDate)
      .map(task => ({
        start: task.startDate ? new Date(task.startDate) : null,
        end: task.dueDate ? new Date(task.dueDate) : null
      }));

    if (taskDates.length === 0) return { startDate: null, endDate: null };

    const startDates = taskDates.map(d => d.start).filter(Boolean);
    const endDates = taskDates.map(d => d.end).filter(Boolean);

    return {
      startDate: startDates.length > 0 ? new Date(Math.min(...startDates)) : null,
      endDate: endDates.length > 0 ? new Date(Math.max(...endDates)) : null
    };
  };

  // Obtener proyectos con fechas calculadas
  const getProjectsWithCalculatedDates = () => {
    return projects.map(project => {
      const calculatedDates = getProjectDates(project.id);
      return {
        ...project,
        // Usar fechas del proyecto si existen, sino usar las calculadas
        startDate: project.startDate || calculatedDates.startDate?.toISOString(),
        dueDate: project.dueDate || calculatedDates.endDate?.toISOString()
      };
    });
  };

  const value = {
    // Estados
    projects,
    tasks,
    loading,
    
    // CRUD Proyectos
    createProject,
    updateProject,
    deleteProject,
    
    // CRUD Tareas
    createTask,
    updateTask,
    deleteTask,
    
    // Utilidades
    getProjectById,
    getTasksByProject,
    getIndependentTasks,
    getTasksByStatus,
    getProjectStats,
    getProjectDates,
    getProjectsWithCalculatedDates,
    
    // Recargar datos
    loadProjects,
    loadTasks
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
