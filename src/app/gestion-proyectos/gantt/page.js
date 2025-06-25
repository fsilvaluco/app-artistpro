'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useSession } from '../../../contexts/SessionContext';
import { useUsers } from '../../../contexts/UserContext';
import CategoryBadge from '../../../components/CategoryBadge';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { CATEGORIES_ARRAY } from '../../../utils/categories';
import styles from './page.module.css';

export default function GanttPage() {
  const { user } = useSession();
  const { 
    tasks, 
    projects, 
    loading,
    getProjectsWithCalculatedDates 
  } = useProject();
  
  const { 
    getUserName,
    users 
  } = useUsers();

  const [theme, setTheme] = useState('system');
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [viewMode, setViewMode] = useState('months'); // 'days', 'weeks', 'months'
  const [selectedPeriod, setSelectedPeriod] = useState(6); // meses a mostrar
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyWithDates, setOnlyWithDates] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Seguir la posición del mouse para el tooltip
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (hoveredItem) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredItem]);

  // Calcular el rango de fechas para el Gantt
  const dateRange = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1); // Un mes atrás
    
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + selectedPeriod); // selectedPeriod meses adelante
    
    return { startDate, endDate };
  }, [selectedPeriod]);

  // Generar columnas de tiempo basadas en el modo de vista
  const timeColumns = useMemo(() => {
    const columns = [];
    const { startDate, endDate } = dateRange;
    const current = new Date(startDate);

    while (current <= endDate) {
      if (viewMode === 'months') {
        columns.push({
          date: new Date(current),
          label: current.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          key: `${current.getFullYear()}-${current.getMonth()}`
        });
        current.setMonth(current.getMonth() + 1);
      } else if (viewMode === 'weeks') {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(current.getDate() + 6);
        
        columns.push({
          date: new Date(current),
          label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
          key: `week-${current.getTime()}`
        });
        current.setDate(current.getDate() + 7);
      } else { // days
        columns.push({
          date: new Date(current),
          label: current.getDate().toString(),
          key: current.toISOString().split('T')[0]
        });
        current.setDate(current.getDate() + 1);
      }
    }
    
    return columns;
  }, [dateRange, viewMode]);

  // Agrupar tareas por proyecto (usando proyectos con fechas calculadas) con filtros aplicados
  const projectsWithTasks = useMemo(() => {
    const projectsWithDates = getProjectsWithCalculatedDates();
    
    return projectsWithDates
      .filter(project => {
        // Filtro de búsqueda
        if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filtro de categoría
        if (selectedCategory && project.category !== selectedCategory) {
          return false;
        }
        
        // Filtro de fechas
        if (onlyWithDates && (!project.startDate || !project.dueDate)) {
          return false;
        }
        
        return true;
      })
      .map(project => {
        // Filtrar tareas del proyecto
        const filteredTasks = tasks.filter(task => {
          if (task.projectId !== project.id) return false;
          
          // Filtro de búsqueda
          if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          
          // Filtro de categoría
          if (selectedCategory && task.category !== selectedCategory) {
            return false;
          }
          
          // Filtro de estado
          if (selectedStatus && task.status !== selectedStatus) {
            return false;
          }
          
          // Filtro de encargado
          if (selectedAssignee && task.assignedTo !== selectedAssignee) {
            return false;
          }
          
          // Filtro de fechas
          if (onlyWithDates && (!task.startDate || !task.dueDate)) {
            return false;
          }
          
          return true;
        });
        
        return {
          ...project,
          tasks: filteredTasks
        };
      })
      .filter(project => project.tasks.length > 0 || !searchTerm); // Solo mostrar proyectos con tareas si hay filtros
  }, [projects, tasks, getProjectsWithCalculatedDates, searchTerm, selectedCategory, selectedStatus, selectedAssignee, onlyWithDates]);

  // Tareas independientes (sin proyecto) con filtros aplicados
  const independentTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.projectId) return false;
      
      // Filtro de búsqueda
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro de categoría
      if (selectedCategory && task.category !== selectedCategory) {
        return false;
      }
      
      // Filtro de estado
      if (selectedStatus && task.status !== selectedStatus) {
        return false;
      }
      
      // Filtro de encargado
      if (selectedAssignee && task.assignedTo !== selectedAssignee) {
        return false;
      }
      
      // Filtro de fechas
      if (onlyWithDates && (!task.startDate || !task.dueDate)) {
        return false;
      }
      
      return true;
    });
  }, [tasks, searchTerm, selectedCategory, selectedStatus, selectedAssignee, onlyWithDates]);

  // Función para calcular la posición y ancho de las barras
  const calculateBarStyle = (startDate, dueDate) => {
    if (!startDate && !dueDate) return { display: 'none' };
    
    const { startDate: rangeStart, endDate: rangeEnd } = dateRange;
    const totalDuration = rangeEnd.getTime() - rangeStart.getTime();
    
    const itemStart = startDate ? new Date(startDate) : new Date(rangeStart);
    const itemEnd = dueDate ? new Date(dueDate) : new Date(itemStart.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días por defecto
    
    // Calcular posición de inicio (%)
    const startOffset = Math.max(0, (itemStart.getTime() - rangeStart.getTime()) / totalDuration * 100);
    
    // Calcular ancho (%)
    const endOffset = Math.min(100, (itemEnd.getTime() - rangeStart.getTime()) / totalDuration * 100);
    const width = Math.max(1, endOffset - startOffset);
    
    return {
      left: `${startOffset}%`,
      width: `${width}%`
    };
  };

  // Función para obtener el color de la barra según el estado
  const getBarColor = (item, isProject = false) => {
    if (isProject) {
      return '#6366f1'; // Azul para proyectos
    }
    
    // Colores según estado de la tarea
    const statusColors = {
      'todo': '#6b7280',
      'in_progress': '#f59e0b',
      'completed': '#10b981'
    };
    
    return statusColors[item.status] || '#6b7280';
  };

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return 'Sin fecha';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para calcular progreso
  const calculateProgress = (item) => {
    if (item.status === 'completed') return 100;
    if (item.status === 'in_progress') {
      // Si tiene fechas, calcular progreso basado en tiempo transcurrido
      if (item.startDate && item.dueDate) {
        const now = new Date();
        const start = new Date(item.startDate);
        const end = new Date(item.dueDate);
        const total = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        return Math.min(Math.max((elapsed / total) * 100, 0), 90); // Max 90% si no está completado
      }
      return 50; // Progreso por defecto para en proceso
    }
    return 0;
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedAssignee('');
    setOnlyWithDates(false);
  };

  // Función para alternar expansión de proyectos
  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Función para expandir/contraer todos los proyectos
  const toggleAllProjects = () => {
    if (expandedProjects.size === projectsWithTasks.length) {
      setExpandedProjects(new Set());
    } else {
      setExpandedProjects(new Set(projectsWithTasks.map(p => p.id)));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Sidebar theme={theme} setTheme={setTheme}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando vista Gantt...</p>
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Sidebar theme={theme} setTheme={setTheme}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Vista Gantt</h1>
            <div className={styles.headerControls}>
              <div className={styles.controls}>
                <div className={styles.controlGroup}>
                  <label>Vista:</label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className={styles.select}
                  >
                    <option value="months">Meses</option>
                    <option value="weeks">Semanas</option>
                    <option value="days">Días</option>
                  </select>
                </div>
                
                <div className={styles.controlGroup}>
                  <label>Período:</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    className={styles.select}
                  >
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                    <option value={24}>24 meses</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${styles.button} ${styles.filterButton} ${showFilters ? styles.active : ''}`}
                >
                  🔍 Filtros
                </button>
                <button
                  onClick={toggleAllProjects}
                  className={`${styles.button} ${styles.expandButton}`}
                >
                  {expandedProjects.size === projectsWithTasks.length ? '📁 Contraer Todo' : '📂 Expandir Todo'}
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filtersHeader}>
                <h3>Filtros</h3>
                <button onClick={clearFilters} className={styles.clearButton}>
                  Limpiar filtros
                </button>
              </div>
              
              <div className={styles.filtersGrid}>
                <div className={styles.filterGroup}>
                  <label>Buscar:</label>
                  <input
                    type="text"
                    placeholder="Buscar proyectos y actividades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                
                <div className={styles.filterGroup}>
                  <label>Categoría:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Todas las categorías</option>
                    {CATEGORIES_ARRAY.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.emoji} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label>Estado:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Todos los estados</option>
                    <option value="todo">Por hacer</option>
                    <option value="in_progress">En proceso</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label>Encargado:</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Todos los encargados</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.displayName || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={onlyWithDates}
                      onChange={(e) => setOnlyWithDates(e.target.checked)}
                      className={styles.checkbox}
                    />
                    Solo con fechas
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className={styles.ganttContainer}>
            {/* Cabecera de tiempo */}
            <div className={styles.ganttHeader}>
              <div className={styles.taskColumn}>
                <div className={styles.columnHeader}>Elemento</div>
              </div>
              <div className={styles.timelineColumn}>
                <div className={styles.timeHeader}>
                  {timeColumns.map(column => (
                    <div key={column.key} className={styles.timeCell}>
                      {column.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido del Gantt */}
            <div className={styles.ganttContent}>
              {/* Proyectos con sus tareas */}
              {projectsWithTasks.map(project => (
                <div key={project.id} className={styles.projectGroup}>
                  {/* Fila del proyecto */}
                  <div className={styles.ganttRow}>
                    <div className={styles.taskInfo}>
                      <button
                        onClick={() => toggleProject(project.id)}
                        className={styles.expandButton}
                      >
                        {expandedProjects.has(project.id) ? '▼' : '▶'}
                      </button>
                      <div className={styles.taskDetails}>
                        <div className={styles.taskTitle}>📁 {project.title}</div>
                        <div className={styles.taskMeta}>
                          {project.category && (
                            <CategoryBadge 
                              categoryId={project.category} 
                              variant="light" 
                              size="small"
                            />
                          )}
                          <span className={styles.taskCount}>
                            {project.tasks.length} actividades
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.timeline}>
                      <div 
                        className={`${styles.ganttBar} ${styles.projectBar} ${selectedItem?.id === project.id ? styles.selected : ''}`}
                        style={{
                          ...calculateBarStyle(project.startDate, project.dueDate),
                          backgroundColor: getBarColor(project, true)
                        }}
                        onMouseEnter={() => setHoveredItem({
                          type: 'project',
                          id: project.id,
                          title: project.title,
                          startDate: project.startDate,
                          dueDate: project.dueDate,
                          category: project.category,
                          taskCount: project.tasks.length
                        })}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => setSelectedItem(selectedItem?.id === project.id ? null : {
                          type: 'project',
                          id: project.id,
                          ...project
                        })}
                      >
                        <div className={styles.barLabel}>
                          {project.title}
                        </div>
                        <div 
                          className={styles.progressBar}
                          style={{ 
                            width: `${calculateProgress(project)}%`,
                            backgroundColor: 'rgba(255, 255, 255, 0.3)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tareas del proyecto (si está expandido) */}
                  {expandedProjects.has(project.id) && project.tasks.map(task => (
                    <div key={task.id} className={`${styles.ganttRow} ${styles.taskRow}`}>
                      <div className={styles.taskInfo}>
                        <div className={styles.taskIndent}></div>
                        <div className={styles.taskDetails}>
                          <div className={styles.taskTitle}>📋 {task.title}</div>
                          <div className={styles.taskMeta}>
                            {task.category && (
                              <CategoryBadge 
                                categoryId={task.category} 
                                variant="light" 
                                size="small"
                              />
                            )}
                            {task.assignedTo && (
                              <span className={styles.assignedUser}>
                                👤 {getUserName(task.assignedTo)}
                              </span>
                            )}
                            <span className={`${styles.statusBadge} ${styles[task.status]}`}>
                              {task.status === 'todo' ? 'Por hacer' : 
                               task.status === 'in_progress' ? 'En proceso' : 'Completado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.timeline}>
                        <div 
                          className={styles.ganttBar}
                          style={{
                            ...calculateBarStyle(task.startDate, task.dueDate),
                            backgroundColor: getBarColor(task)
                          }}
                        >
                          <div className={styles.barLabel}>
                            {task.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Tareas independientes */}
              {independentTasks.length > 0 && (
                <div className={styles.projectGroup}>
                  <div className={styles.sectionHeader}>
                    <h3>Actividades Independientes</h3>
                  </div>
                  {independentTasks.map(task => (
                    <div key={task.id} className={styles.ganttRow}>
                      <div className={styles.taskInfo}>
                        <div className={styles.taskDetails}>
                          <div className={styles.taskTitle}>📋 {task.title}</div>
                          <div className={styles.taskMeta}>
                            {task.category && (
                              <CategoryBadge 
                                categoryId={task.category} 
                                variant="light" 
                                size="small"
                              />
                            )}
                            {task.assignedTo && (
                              <span className={styles.assignedUser}>
                                👤 {getUserName(task.assignedTo)}
                              </span>
                            )}
                            <span className={`${styles.statusBadge} ${styles[task.status]}`}>
                              {task.status === 'todo' ? 'Por hacer' : 
                               task.status === 'in_progress' ? 'En proceso' : 'Completado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.timeline}>
                        <div 
                          className={`${styles.ganttBar} ${styles.taskBar} ${selectedItem?.id === task.id ? styles.selected : ''}`}
                          style={{
                            ...calculateBarStyle(task.startDate, task.dueDate),
                            backgroundColor: getBarColor(task)
                          }}
                          onMouseEnter={() => setHoveredItem({
                            type: 'task',
                            id: task.id,
                            title: task.title,
                            startDate: task.startDate,
                            dueDate: task.dueDate,
                            category: task.category,
                            status: task.status,
                            assignedTo: task.assignedTo,
                            description: task.description
                          })}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => setSelectedItem(selectedItem?.id === task.id ? null : {
                            type: 'task',
                            id: task.id,
                            ...task
                          })}
                        >
                          <div className={styles.barLabel}>
                            {task.title}
                          </div>
                          <div 
                            className={styles.progressBar}
                            style={{ 
                              width: `${calculateProgress(task)}%`,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Estado vacío */}
              {projectsWithTasks.length === 0 && independentTasks.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No hay proyectos ni actividades para mostrar en el Gantt</p>
                  <p>Crea algunos proyectos y actividades con fechas para visualizarlos aquí</p>
                </div>
              )}
            </div>
          </div>

          {/* Tooltip */}
          {hoveredItem && (
            <div className={styles.tooltip} style={{ left: mousePosition.x + 10, top: mousePosition.y + 10 }}>
              <div className={styles.tooltipHeader}>
                <span className={styles.tooltipType}>
                  {hoveredItem.type === 'project' ? '📁 Proyecto' : '📋 Actividad'}
                </span>
                <span className={styles.tooltipTitle}>{hoveredItem.title}</span>
              </div>
              <div className={styles.tooltipContent}>
                <div className={styles.tooltipDates}>
                  <span>📅 {formatDate(hoveredItem.startDate)} - {formatDate(hoveredItem.dueDate)}</span>
                </div>
                {hoveredItem.category && (
                  <div className={styles.tooltipCategory}>
                    <CategoryBadge categoryId={hoveredItem.category} variant="light" size="small" />
                  </div>
                )}
                {hoveredItem.status && (
                  <div className={styles.tooltipStatus}>
                    <span className={`${styles.statusBadge} ${styles[hoveredItem.status]}`}>
                      {hoveredItem.status === 'todo' ? 'Por hacer' : 
                       hoveredItem.status === 'in_progress' ? 'En proceso' : 'Completado'}
                    </span>
                  </div>
                )}
                {hoveredItem.assignedTo && (
                  <div className={styles.tooltipAssignee}>
                    👤 {getUserName(hoveredItem.assignedTo)}
                  </div>
                )}
                {hoveredItem.taskCount !== undefined && (
                  <div className={styles.tooltipTaskCount}>
                    📊 {hoveredItem.taskCount} actividades
                  </div>
                )}
                {hoveredItem.description && (
                  <div className={styles.tooltipDescription}>
                    {hoveredItem.description}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel de detalles */}
          {selectedItem && (
            <div className={styles.detailsPanel}>
              <div className={styles.detailsHeader}>
                <h3>
                  {selectedItem.type === 'project' ? '📁' : '📋'} {selectedItem.title}
                </h3>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className={styles.closeButton}
                >
                  ✖
                </button>
              </div>
              <div className={styles.detailsContent}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <label>Fecha de inicio:</label>
                    <span>{formatDate(selectedItem.startDate)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Fecha límite:</label>
                    <span>{formatDate(selectedItem.dueDate)}</span>
                  </div>
                  {selectedItem.category && (
                    <div className={styles.detailItem}>
                      <label>Categoría:</label>
                      <CategoryBadge categoryId={selectedItem.category} variant="light" size="small" />
                    </div>
                  )}
                  {selectedItem.status && (
                    <div className={styles.detailItem}>
                      <label>Estado:</label>
                      <span className={`${styles.statusBadge} ${styles[selectedItem.status]}`}>
                        {selectedItem.status === 'todo' ? 'Por hacer' : 
                         selectedItem.status === 'in_progress' ? 'En proceso' : 'Completado'}
                      </span>
                    </div>
                  )}
                  {selectedItem.assignedTo && (
                    <div className={styles.detailItem}>
                      <label>Encargado:</label>
                      <span>👤 {getUserName(selectedItem.assignedTo)}</span>
                    </div>
                  )}
                  {selectedItem.type === 'project' && selectedItem.tasks && (
                    <div className={styles.detailItem}>
                      <label>Actividades:</label>
                      <span>{selectedItem.tasks.length} actividades</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <label>Progreso:</label>
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBarFull}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${calculateProgress(selectedItem)}%` }}
                        />
                      </div>
                      <span>{Math.round(calculateProgress(selectedItem))}%</span>
                    </div>
                  </div>
                </div>
                {selectedItem.description && (
                  <div className={styles.detailDescription}>
                    <label>Descripción:</label>
                    <p>{selectedItem.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div className={styles.legend}>
            <h4>Leyenda:</h4>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#6366f1' }}></div>
                <span>Proyectos</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#6b7280' }}></div>
                <span>Por hacer</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></div>
                <span>En proceso</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
                <span>Completado</span>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}
