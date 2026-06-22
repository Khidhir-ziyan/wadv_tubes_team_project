import { useState } from 'react';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  id: string;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: Notification['type'], message: string, duration = 5000) => {
    const id = `notification_${Date.now()}_${Math.random()}`;
    const notification: Notification = { type, message, id };

    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  };
};