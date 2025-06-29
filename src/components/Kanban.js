'use client';

import { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useSession } from '../contexts/SessionContext';
import styles from './Kanban.module.css';

// Componente Kanban completo con drag & drop
export default function Kanban() {
  const { tasks, loading, updateTask, createTask } = useProject();
  const { user } = useSession();
  const [localTasks, setLocalTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedTaskForNotes, setSelectedTaskForNotes] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: ''
  });

  const statusColumns = [
    { id: 'todo', name: 'Por Hacer', color: '#6b7280' },
    { id: 'in_progress', name: 'En Proceso', color: '#f59e0b' },
    { id: 'completed', name: 'Completado', color: '#10b981' },
    { id: 'discarded', name: 'Descartado', color: '#ef4444' }
  ];

  const priorities = {
    low: { name: 'Baja', color: '#6b7280' },
    medium: { name: 'Media', color: '#f59e0b' },
    high: { name: 'Alta', color: '#ef4444' },
    urgent: { name: 'Urgente', color: '#dc2626' }
  };

  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando kanban...</p>
      </div>
    );
  }

  const getTasksByStatus = (status) => {
    return localTasks.filter(task => task.status === status);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== newStatus) {
      // Actualizar localmente primero para UI responsiva
      const updatedTasks = localTasks.map(task =>
        task.id === draggedTask.id
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      );
      setLocalTasks(updatedTasks);

      // Actualizar en la base de datos
      try {
        await updateTask(draggedTask.id, { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error actualizando tarea:', error);
        // Revertir cambio local si falla
        setLocalTasks(localTasks);
      }
    }
    
    setDraggedTask(null);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        ...newTask,
        status: newTaskColumn,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.uid || user?.email
      };

      await createTask(taskData);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: ''
      });
      setShowNewTaskModal(false);
      setNewTaskColumn('');
    } catch (error) {
      console.error('Error creando tarea:', error);
    }
  };

  const openNewTaskModal = (columnId) => {
    setNewTaskColumn(columnId);
    setShowNewTaskModal(true);
  };

  const handleTaskClick = (task) => {
    if (editingTask?.id === task.id) {
      // Si ya está editando, guardar cambios
      saveTaskChanges();
    } else {
      // Empezar a editar
      setEditingTask({ ...task });
    }
  };

  const saveTaskChanges = async () => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        assignedTo: editingTask.assignedTo,
        updatedAt: new Date().toISOString()
      });

      // Actualizar estado local
      setLocalTasks(prev => prev.map(task => 
        task.id === editingTask.id ? { ...task, ...editingTask } : task
      ));
      
      setEditingTask(null);
    } catch (error) {
      console.error('Error guardando cambios:', error);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const handleEditChange = (field, value) => {
    setEditingTask(prev => ({ ...prev, [field]: value }));
  };

  const openNotesModal = (task, e) => {
    e.stopPropagation();
    setSelectedTaskForNotes(task);
    setShowNotesModal(true);
    setNewNote('');
  };

  const addProgressNote = async () => {
    if (!newNote.trim() || !selectedTaskForNotes) return;

    try {
      const note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        author: user?.displayName || user?.email || 'Usuario',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const currentNotes = selectedTaskForNotes.progressNotes || [];
      const updatedNotes = [...currentNotes, note];

      await updateTask(selectedTaskForNotes.id, {
        progressNotes: updatedNotes,
        updatedAt: new Date().toISOString()
      });

      // Actualizar estado local
      setLocalTasks(prev => prev.map(task => 
        task.id === selectedTaskForNotes.id 
          ? { ...task, progressNotes: updatedNotes }
          : task
      ));

      setNewNote('');
      setShowNotesModal(false);
      setSelectedTaskForNotes(null);
    } catch (error) {
      console.error('Error agregando nota:', error);
    }
  };

  return (
    <div className={styles.kanbanContainer}>
      <div className={styles.kanbanHeader}>
        <h2>Gestión de Tareas - Kanban</h2>
        <div className={styles.kanbanStats}>
          <span>Total: {localTasks.length} tareas</span>
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        {statusColumns.map(column => (
          <div 
            key={column.id} 
            className={styles.column}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div 
              className={styles.columnHeader}
              style={{ borderTopColor: column.color }}
            >
              <h3>{column.name}</h3>
              <div className={styles.columnActions}>
                <span className={styles.taskCount}>
                  {getTasksByStatus(column.id).length}
                </span>
                <button 
                  className={styles.addTaskBtn}
                  onClick={() => openNewTaskModal(column.id)}
                  title="Agregar tarea"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className={styles.columnContent}>
              {getTasksByStatus(column.id).map(task => (
                <div 
                  key={task.id} 
                  className={`${styles.taskCard} ${editingTask?.id === task.id ? styles.editing : ''}`}
                  draggable={!editingTask || editingTask.id !== task.id}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => handleTaskClick(task)}
                >
                  {editingTask?.id === task.id ? (
                    // Modo edición
                    <div className={styles.editForm}>
                      <input
                        type="text"
                        value={editingTask.title}
                        onChange={(e) => handleEditChange('title', e.target.value)}
                        className={styles.editInput}
                        placeholder="Título de la tarea"
                        autoFocus
                      />
                      
                      <textarea
                        value={editingTask.description || ''}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                        className={styles.editTextarea}
                        placeholder="Descripción"
                        rows={2}
                      />
                      
                      <div className={styles.editRow}>
                        <select
                          value={editingTask.priority}
                          onChange={(e) => handleEditChange('priority', e.target.value)}
                          className={styles.editSelect}
                        >
                          {Object.entries(priorities).map(([key, priority]) => (
                            <option key={key} value={key}>{priority.name}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          value={editingTask.assignedTo || ''}
                          onChange={(e) => handleEditChange('assignedTo', e.target.value)}
                          className={styles.editInput}
                          placeholder="Asignado a"
                        />
                      </div>
                      
                      <div className={styles.editActions}>
                        <button 
                          className={styles.saveBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            saveTaskChanges();
                          }}
                        >
                          ✓ Guardar
                        </button>
                        <button 
                          className={styles.cancelBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                        >
                          ✕ Cancelar
                        </button>
                        <button 
                          className={styles.notesBtn}
                          onClick={(e) => openNotesModal(task, e)}
                        >
                          📝 Notas
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo vista
                    <>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <span 
                          className={styles.priorityBadge}
                          style={{ 
                            backgroundColor: priorities[task.priority]?.color || '#6b7280',
                            color: 'white'
                          }}
                        >
                          {priorities[task.priority]?.name || task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className={styles.taskDescription}>{task.description}</p>
                      )}
                      
                      <div className={styles.taskMeta}>
                        {task.assignedTo && (
                          <div className={styles.assignee}>
                            👤 {task.assignedTo}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className={styles.dueDate}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {task.progressNotes && task.progressNotes.length > 0 && (
                        <div className={styles.notesIndicator}>
                          📝 {task.progressNotes.length} nota{task.progressNotes.length > 1 ? 's' : ''}
                        </div>
                      )}
                      
                      <div className={styles.taskActions}>
                        <button 
                          className={styles.notesBtn}
                          onClick={(e) => openNotesModal(task, e)}
                          title="Agregar nota de avance"
                        >
                          📝 Nota
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {getTasksByStatus(column.id).length === 0 && (
                <div className={styles.emptyColumn}>
                  <p>No hay tareas en {column.name.toLowerCase()}</p>
                  <button 
                    className={styles.emptyAddBtn}
                    onClick={() => openNewTaskModal(column.id)}
                  >
                    Agregar primera tarea
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nueva tarea */}
      {showNewTaskModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Nueva Tarea</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowNewTaskModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Título *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Nombre de la tarea"
                  autoFocus
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Descripción</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Descripción detallada de la tarea"
                  rows={3}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Prioridad</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    {Object.entries(priorities).map(([key, priority]) => (
                      <option key={key} value={key}>{priority.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Asignado a</label>
                  <input
                    type="text"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    placeholder="Nombre o email"
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowNewTaskModal(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.createBtn}
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
              >
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para notas de progreso */}
      {showNotesModal && selectedTaskForNotes && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Notas de Progreso - {selectedTaskForNotes.title}</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowNotesModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Mostrar notas existentes */}
              {selectedTaskForNotes.progressNotes && selectedTaskForNotes.progressNotes.length > 0 && (
                <div className={styles.existingNotes}>
                  <h4>Historial de Notas:</h4>
                  <div className={styles.notesList}>
                    {selectedTaskForNotes.progressNotes
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map(note => (
                        <div key={note.id} className={styles.noteItem}>
                          <div className={styles.noteHeader}>
                            <span className={styles.noteAuthor}>👤 {note.author}</span>
                            <span className={styles.noteTimestamp}>
                              {new Date(note.timestamp).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className={styles.noteText}>{note.text}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Agregar nueva nota */}
              <div className={styles.newNoteSection}>
                <h4>Agregar Nueva Nota:</h4>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Describe el progreso, cambios, observaciones..."
                  rows={4}
                  className={styles.noteTextarea}
                  autoFocus
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowNotesModal(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.createBtn}
                onClick={addProgressNote}
                disabled={!newNote.trim()}
              >
                Agregar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
