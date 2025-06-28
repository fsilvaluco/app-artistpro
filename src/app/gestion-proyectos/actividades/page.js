'use client';

import { useState, useEffect } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useSession } from '../../../contexts/SessionContext';
import { useUsers } from '../../../contexts/UserContext';
import CategoryBadge from '../../../components/CategoryBadge';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import PermissionGuard from '../../../components/PermissionGuard';
import { CATEGORIES_ARRAY } from '../../../utils/categories';
import { PERMISSIONS } from '../../../utils/roles';
import styles from './page.module.css';

const TASK_STATUSES = {
  TODO: { id: 'todo', name: 'Por Hacer', color: '#6b7280' },
  IN_PROGRESS: { id: 'in_progress', name: 'En Proceso', color: '#f59e0b' },
  COMPLETED: { id: 'completed', name: 'Completado', color: '#10b981' }
};

const TASK_PRIORITIES = {
  LOW: { id: 'low', name: 'Baja', color: '#6b7280' },
  MEDIUM: { id: 'medium', name: 'Media', color: '#f59e0b' },
  HIGH: { id: 'high', name: 'Alta', color: '#ef4444' },
  URGENT: { id: 'urgent', name: 'Urgente', color: '#dc2626' }
};

export default function ActivitiesPage() {
  const { user } = useSession();
  const { 
    tasks, 
    projects, 
    loading, 
    createTask, 
    updateTask, 
    deleteTask,
    getTasksByProject,
    getIndependentTasks 
  } = useProject();
  
  const { 
    users, 
    loading: usersLoading, 
    getActiveUsers, 
    getUserName 
  } = useUsers();

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState('system');

  // Obtener usuarios activos
  const activeUsers = getActiveUsers();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'todo',
    projectId: '',
    startDate: '',
    startTime: '',
    dueDate: '',
    dueTime: '',
    assignedTo: '',
    estimatedHours: ''
  });

  useEffect(() => {
    if (editingTask) {
      // Separar fecha y hora para startDate
      const startDateTime = editingTask.startDate ? new Date(editingTask.startDate) : null;
      const startDateStr = startDateTime ? startDateTime.toISOString().split('T')[0] : '';
      const startTimeStr = startDateTime ? startDateTime.toTimeString().slice(0, 5) : '';
      
      // Separar fecha y hora para dueDate
      const dueDateTime = editingTask.dueDate ? new Date(editingTask.dueDate) : null;
      const dueDateStr = dueDateTime ? dueDateTime.toISOString().split('T')[0] : '';
      const dueTimeStr = dueDateTime ? dueDateTime.toTimeString().slice(0, 5) : '';

      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        category: editingTask.category || '',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'todo',
        projectId: editingTask.projectId || '',
        startDate: startDateStr,
        startTime: startTimeStr,
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
        assignedTo: editingTask.assignedTo || '',
        estimatedHours: editingTask.estimatedHours || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'todo',
        projectId: '',
        startDate: '',
        startTime: '',
        dueDate: '',
        dueTime: '',
        assignedTo: '',
        estimatedHours: ''
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    try {
      // Combinar fecha y hora para startDate
      let startDateTime = null;
      if (formData.startDate && formData.startTime) {
        startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      } else if (formData.startDate) {
        startDateTime = new Date(`${formData.startDate}T00:00`).toISOString();
      }

      // Combinar fecha y hora para dueDate
      let dueDateTime = null;
      if (formData.dueDate && formData.dueTime) {
        dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString();
      } else if (formData.dueDate) {
        dueDateTime = new Date(`${formData.dueDate}T23:59`).toISOString();
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        projectId: formData.projectId || null,
        startDate: startDateTime,
        dueDate: dueDateTime,
        assignedTo: formData.assignedTo || null,
        userId: user.uid,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        updatedAt: new Date().toISOString()
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        taskData.createdAt = new Date().toISOString();
        await createTask(taskData);
      }

      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'todo',
        projectId: '',
        startDate: '',
        startTime: '',
        dueDate: '',
        dueTime: '',
        assignedTo: '',
        estimatedHours: ''
      });
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      alert('Error al guardar la tarea');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        alert('Error al eliminar la tarea');
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterProject !== 'all') {
      if (filterProject === 'independent' && task.projectId) return false;
      if (filterProject !== 'independent' && task.projectId !== filterProject) return false;
    }
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading || usersLoading) {
    return (
      <ProtectedRoute>
        <Sidebar theme={theme} setTheme={setTheme}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando actividades...</p>
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PermissionGuard 
        permission={PERMISSIONS.PROJECTS_VIEW}
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para ver las actividades.</p>
          </div>
        }
      >
        <Sidebar theme={theme} setTheme={setTheme}>
        <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión de Actividades</h1>
        <PermissionGuard permission={PERMISSIONS.PROJECTS_CREATE} showDisabled={true}>
          <button
            onClick={() => setShowModal(true)}
            className={styles.addButton}
          >
            ➕ Nueva Actividad
          </button>
        </PermissionGuard>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="Buscar actividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos los estados</option>
            {Object.values(TASK_STATUSES).map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos los proyectos</option>
            <option value="independent">Tareas independientes</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas las categorías</option>
            {CATEGORIES_ARRAY.map(category => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Tareas */}
      <div className={styles.tasksList}>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay actividades que coincidan con los filtros seleccionados</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
            const status = TASK_STATUSES[task.status] || TASK_STATUSES.TODO;
            const priority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.MEDIUM;

            return (
              <div key={task.id} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  <div className={styles.taskActions}>
                    <PermissionGuard permission={PERMISSIONS.PROJECTS_EDIT} showDisabled={true}>
                      <button
                        onClick={() => handleEdit(task)}
                        className={styles.editButton}
                        title="Editar tarea"
                      >
                        ✏️
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.PROJECTS_DELETE} showDisabled={true}>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className={styles.deleteButton}
                        title="Eliminar tarea"
                      >
                        🗑️
                      </button>
                    </PermissionGuard>
                  </div>
                </div>

                {task.description && (
                  <p className={styles.taskDescription}>{task.description}</p>
                )}

                <div className={styles.taskMeta}>
                  <div className={styles.badges}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: status.color }}
                    >
                      {status.name}
                    </span>
                    
                    <span
                      className={styles.priorityBadge}
                      style={{ backgroundColor: priority.color }}
                    >
                      {priority.name}
                    </span>

                    {task.category && (
                      <CategoryBadge 
                        categoryId={task.category} 
                        variant="light" 
                        size="small"
                      />
                    )}
                  </div>

                  <div className={styles.taskInfo}>
                    {project && (
                      <span className={styles.projectName}>
                        📁 {project.title}
                      </span>
                    )}
                    
                    {task.assignedTo && (
                      <span className={styles.assignedTo}>
                        👤 {getUserName(task.assignedTo)}
                      </span>
                    )}
                    
                    {task.startDate && (
                      <span className={styles.startDate}>
                        🚀 {new Date(task.startDate).toLocaleString()}
                      </span>
                    )}
                    
                    {task.dueDate && (
                      <span className={styles.dueDate}>
                        📅 {new Date(task.dueDate).toLocaleString()}
                      </span>
                    )}
                    
                    {task.estimatedHours && (
                      <span className={styles.estimatedHours}>
                        ⏱️ {task.estimatedHours}h
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Crear/Editar Tarea */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingTask ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Título *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Categoría</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Seleccionar categoría</option>
                    {CATEGORIES_ARRAY.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.emoji} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="priority">Prioridad</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={styles.select}
                  >
                    {Object.values(TASK_PRIORITIES).map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="status">Estado</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={styles.select}
                  >
                    {Object.values(TASK_STATUSES).map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="projectId">Proyecto (opcional)</label>
                  <select
                    id="projectId"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Tarea independiente</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="startDate">Fecha de inicio</label>
                  <input
                    type="date"
                    id="startDate" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="startTime">Hora de inicio</label>
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="dueDate">Fecha límite</label>
                  <input
                    type="date"
                    id="dueDate" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="dueTime">Hora límite</label>
                  <input
                    type="time"
                    id="dueTime"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="assignedTo">Encargado</label>
                  <select
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Sin asignar</option>
                    {activeUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.displayName || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="estimatedHours">Horas estimadas</label>
                  <input
                    type="number"
                    id="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    min="0"
                    step="0.5"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                  }}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingTask ? 'Actualizar' : 'Crear'} Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </Sidebar>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
