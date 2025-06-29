"use client";

import { useState, useEffect } from "react";
import { getActivityLog, getFilteredActivityLog, formatActivityMessage, ACTIVITY_DESCRIPTIONS } from "../utils/activityLogger";
import styles from "./ActivityLog.module.css";

export default function ActivityLog({ artistId, maxItems = 20, showFilters = true, compact = false }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener categorías únicas
  const categories = ['all', ...new Set(Object.values(ACTIVITY_DESCRIPTIONS).map(desc => desc.category))];

  const loadActivities = async () => {
    if (!artistId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const filters = {
        limitCount: maxItems
      };
      
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      const activityData = await getFilteredActivityLog(artistId, filters);
      setActivities(activityData);
      
    } catch (error) {
      console.error('Error cargando actividades:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [artistId, selectedCategory, maxItems]);

  // Filtrar actividades por término de búsqueda
  const filteredActivities = activities.filter(activity => {
    if (!searchTerm) return true;
    
    const message = formatActivityMessage(activity);
    const userName = activity.userName || activity.userEmail || '';
    
    return message.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (date) => {
    if (!date) return 'Fecha desconocida';
    
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return activityDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: activityDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {showFilters && !compact && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="category-filter">Categoría:</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.select}
            >
              <option value="all">Todas las categorías</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="search-filter">Buscar:</label>
            <input
              id="search-filter"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en actividades..."
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

      <div className={styles.activityList}>
        {filteredActivities.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay actividades que mostrar</p>
            {selectedCategory !== 'all' || searchTerm ? (
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className={styles.clearFilters}
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const description = ACTIVITY_DESCRIPTIONS[activity.type];
            const message = formatActivityMessage(activity);
            
            return (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {activity.emoji || description?.emoji || '📌'}
                </div>
                
                <div className={styles.activityContent}>
                  <div className={styles.activityMessage}>
                    {message}
                  </div>
                  
                  <div className={styles.activityMeta}>
                    <span className={styles.activityUser}>
                      {activity.userName || activity.userEmail}
                    </span>
                    
                    {activity.category && (
                      <span className={styles.activityCategory}>
                        {activity.category}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={styles.activityTime}>
                  <div className={styles.activityDate}>
                    {formatDate(activity.createdAt)}
                  </div>
                  {!compact && (
                    <div className={styles.activityTimeDetail}>
                      {formatTime(activity.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!compact && filteredActivities.length >= maxItems && (
        <div className={styles.loadMore}>
          <p>Mostrando las {maxItems} actividades más recientes</p>
        </div>
      )}
    </div>
  );
}
