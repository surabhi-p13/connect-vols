
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Mock data for development
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'volunteer',
  skills: ['Teaching', 'Gardening', 'Cooking'],
  location: 'New York, NY',
  bio: 'Passionate about helping others.',
  profileImage: 'https://i.pravatar.cc/150?img=1',
  hoursContributed: 45,
  projectsCompleted: 8,
  badges: [
    {
      id: '1',
      name: 'First Timer',
      description: 'Completed first volunteer project',
      imageUrl: '/badges/first-timer.png',
      earnedAt: '2023-01-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Team Player',
      description: 'Participated in 5 group projects',
      imageUrl: '/badges/team-player.png',
      earnedAt: '2023-03-22T00:00:00Z',
    },
  ],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
