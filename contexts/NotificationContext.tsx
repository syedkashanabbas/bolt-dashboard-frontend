'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '@/lib/api'; // 👈 use your wrapper

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId: string;
  organizationId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'userId'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // fetch from backend
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;

      try {
        const data = await apiFetch("/api/audit"); // 👈 backend filtering by role
        const logs = data.logs || [];

        // Map audit logs -> notifications
        const mapped: Notification[] = logs.map((log: any) => ({
          id: String(log.id),
          title: `${log.action} on ${log.entity}`,
          message: `${log.userName} performed ${log.action} on ${log.entity} (ID: ${log.entity_id})`,
          type: log.action === "CREATE" ? "success" 
              : log.action === "UPDATE" ? "info" 
              : log.action === "DELETE" ? "error" 
              : "warning",
          read: false, // backend doesn’t track read yet
          createdAt: log.created_at,
          userId: String(log.user_id),
          organizationId: user.organizationId,
        }));

        setNotifications(mapped);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchLogs();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      userId: user.id,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
