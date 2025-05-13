
import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Mock data for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    message: 'Your application for "Community Garden Cleanup" has been approved!',
    type: 'success',
    read: false,
    createdAt: '2023-05-12T14:30:00Z',
    link: '/projects/1',
  },
  {
    id: '2',
    userId: '1',
    message: 'New project "Beach Cleanup Initiative" matches your skills',
    type: 'info',
    read: false,
    createdAt: '2023-05-11T09:15:00Z',
    link: '/projects/5',
  },
  {
    id: '3',
    userId: '1',
    message: 'Don\'t forget your volunteering session tomorrow at 9AM',
    type: 'info',
    read: true,
    createdAt: '2023-05-10T18:45:00Z',
    link: '/dashboard',
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
  isLoading: false,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
