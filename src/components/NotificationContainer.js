"use client";

import { useNotification } from '../contexts/NotificationContext';
import styles from './NotificationContainer.module.css';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className={styles.container}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onRemove }) {
  const { type, title, message, actions = [] } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'progress':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.icon}>{getIcon()}</span>
          <span className={styles.title}>{title}</span>
          <button 
            className={styles.closeButton}
            onClick={onRemove}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
        {message && (
          <div className={styles.message}>{message}</div>
        )}
        {actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action, index) => (
              <button
                key={index}
                className={`${styles.actionButton} ${styles[action.type || 'default']}`}
                onClick={() => {
                  action.onClick?.();
                  if (action.closeOnClick !== false) {
                    onRemove();
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {type === 'progress' && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      )}
    </div>
  );
}
