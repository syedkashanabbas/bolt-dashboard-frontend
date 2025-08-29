'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to the Platform',
    message: 'Your account has been successfully created. Start exploring the dashboard!',
    type: 'success',
    read: false,
    createdAt: '2024-01-15T10:00:00Z',
    userId: '2',
    organizationId: 'techcorp',
  },
  {
    id: '2',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM UTC.',
    type: 'warning',
    read: false,
    createdAt: '2024-01-15T09:30:00Z',
    userId: '2',
  },
  {
    id: '3',
    title: 'New Feature Available',
    message: 'Check out the new analytics dashboard in the Reports section.',
    type: 'info',
    read: true,
    createdAt: '2024-01-14T16:00:00Z',
    userId: '2',
    organizationId: 'techcorp',
  },
  {
    id: '4',
    title: 'Security Alert',
    message: 'Unusual login activity detected. Please review your account security.',
    type: 'error',
    read: false,
    createdAt: '2024-01-14T14:30:00Z',
    userId: '2',
    organizationId: 'techcorp',
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      // Load notifications from localStorage
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      } else {
        // Use mock data for the user
        const userNotifications = mockNotifications.filter(n => n.userId === user.id);
        setNotifications(userNotifications);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && notifications.length > 0) {
      // Save to localStorage
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

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