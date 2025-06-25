"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../app/firebase";
import { useSession } from "./SessionContext";

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

  // Cargar proyectos del usuario
  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, "projects"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  // Cargar tareas del usuario
  const loadTasks = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, "tasks"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([loadProjects(), loadTasks()]).finally(() => {
        setLoading(false);
      });
    } else {
      setProjects([]);
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  // CRUD para Proyectos
  const createProject = async (projectData) => {
    if (!user) throw new Error("Usuario no autenticado");
    
    try {
      const docRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const newProject = {
        id: docRef.id,
        ...projectData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        )
      );
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      // También eliminar tareas asociadas al proyecto
      const projectTasks = tasks.filter(task => task.projectId === projectId);
      for (const task of projectTasks) {
        await deleteTask(task.id);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };

  // CRUD para Tareas
  const createTask = async (taskData) => {
    if (!user) throw new Error("Usuario no autenticado");
    
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        userId: user.uid,
        status: taskData.status || "todo",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const newTask = {
        id: docRef.id,
        ...taskData,
        userId: user.uid,
        status: taskData.status || "todo",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setTasks(prev => prev.filter(task => task.id !== taskId));
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
