"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PermissionGuard from "../../../components/PermissionGuard";
import { useProject } from "../../../contexts/ProjectContext";
import { useSession } from "../../../contexts/SessionContext";
import { PERMISSIONS } from "../../../utils/roles";
import { 
  CATEGORIES_ARRAY, 
  getCategoryColor, 
  getCategoryLightColor, 
  getCategoryName, 
  getCategoryEmoji 
} from "../../../utils/categories";

export default function ProyectosPageWrapper() {
  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.PROJECTS_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver los proyectos.</p>
          </div>
        }
      >
        <ProyectosPage />
      </PermissionGuard>
    </ProtectedRoute>
  );
}

function ProyectosPage() {
  const [theme, setTheme] = useState("system");
  const { getUserData } = useSession();
  const userData = getUserData();

  return (
    <Sidebar theme={theme} setTheme={setTheme}>
      <Proyectos userData={userData} />
    </Sidebar>
  );
}

function Proyectos({ userData }) {
  const { 
    projects, 
    loading, 
    createProject, 
    updateProject, 
    deleteProject,
    getProjectStats 
  } = useProject();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    dueDate: ""
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    try {
      await createProject(newProject);
      setNewProject({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        dueDate: ""
      });
      setShowCreateForm(false);
    } catch (error) {
      alert("Error al crear el proyecto: " + error.message);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!editingProject.title.trim()) return;

    try {
      await updateProject(editingProject.id, {
        title: editingProject.title,
        description: editingProject.description,
        category: editingProject.category,
        priority: editingProject.priority,
        dueDate: editingProject.dueDate
      });
      setEditingProject(null);
    } catch (error) {
      alert("Error al actualizar el proyecto: " + error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto? También se eliminarán todas las tareas asociadas.")) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        alert("Error al eliminar el proyecto: " + error.message);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#28a745";
      default: return "#6c757d";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "high": "#dc3545",
      "medium": "#ffc107", 
      "low": "#28a745"
    };
    return colors[category] || "#6c757d";
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <p>Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 32,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            margin: 0,
            color: 'var(--text)' 
          }}>
            Proyectos
          </h1>
          <p style={{ 
            color: 'var(--text2)', 
            margin: '8px 0 0 0' 
          }}>
            Gestiona tus proyectos musicales y objetivos grandes
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '12px 24px',
            background: 'var(--primary, #007bff)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#0056b3'}
          onMouseOut={(e) => e.target.style.background = 'var(--primary, #007bff)'}
        >
          + Nuevo Proyecto
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div style={{
          background: 'var(--card)',
          padding: 24,
          borderRadius: 12,
          border: '1px solid var(--border)',
          marginBottom: 24
        }}>
          <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Crear Nuevo Proyecto</h3>
          <form onSubmit={handleCreateProject}>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                  Título del Proyecto *
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="ej: Crecer en RRSS"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                  Categoría
                </label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES_ARRAY.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                Descripción
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe los objetivos y alcance del proyecto..."
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                  Prioridad
                </label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={newProject.dueDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, dueDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: 'var(--primary, #007bff)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Crear Proyecto
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: 'var(--text2)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de proyectos */}
      {projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 64,
          color: 'var(--text2)'
        }}>
          <h3>No tienes proyectos aún</h3>
          <p>Crea tu primer proyecto para comenzar a organizar tus objetivos musicales</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {projects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <div
                key={project.id}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 20,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: 'var(--text)',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}>
                    {project.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: '1px solid var(--danger, #dc3545)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: 'var(--danger, #dc3545)'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {project.category && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: getCategoryColor(project.category),
                    color: 'white',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 12
                  }}>
                    <span>{getCategoryEmoji(project.category)}</span>
                    <span>{getCategoryName(project.category)}</span>
                  </div>
                )}

                {project.description && (
                  <p style={{
                    color: 'var(--text2)',
                    margin: '8px 0',
                    lineHeight: 1.5
                  }}>
                    {project.description}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: getPriorityColor(project.priority)
                      }}
                    />
                    <span style={{ 
                      fontSize: 12, 
                      color: 'var(--text2)',
                      textTransform: 'capitalize'
                    }}>
                      Prioridad {project.priority}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: 'var(--text2)' 
                  }}>
                    {stats.completed}/{stats.total} tareas ({stats.progress}%)
                  </div>
                </div>

                {/* Barra de progreso */}
                <div style={{
                  width: '100%',
                  height: 6,
                  background: 'var(--bg-secondary, #f1f1f1)',
                  borderRadius: 3,
                  marginTop: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${stats.progress}%`,
                    height: '100%',
                    background: stats.progress === 100 ? '#28a745' : 'var(--primary, #007bff)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                {project.dueDate && (
                  <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: 'var(--text2)'
                  }}>
                    📅 Fecha límite: {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edición */}
      {editingProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card)',
            padding: 24,
            borderRadius: 12,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Editar Proyecto</h3>
            <form onSubmit={handleEditProject}>
              {/* Aquí iría el mismo formulario que para crear, pero con editingProject */}
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                    Título del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      background: 'var(--bg)',
                      color: 'var(--text)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                    Categoría
                  </label>
                  <select
                    value={editingProject.category || ""}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      background: 'var(--bg)',
                      color: 'var(--text)'
                    }}                    >
                      <option value="">Seleccionar categoría</option>
                      {CATEGORIES_ARRAY.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.emoji} {category.name}
                        </option>
                      ))}
                    </select>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text)' }}>
                  Descripción
                </label>
                <textarea
                  value={editingProject.description || ""}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: 'var(--primary, #007bff)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: 'var(--text2)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
