
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'admin' | 'coordinator';
  skills: string[];
  location?: string;
  bio?: string;
  profileImage?: string;
  hoursContributed?: number;
  projectsCompleted?: number;
  badges?: Badge[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  organization: string;
  skills: string[];
  location: string;
  coordinates?: [number, number]; // [longitude, latitude]
  startDate: string;
  endDate: string;
  status: 'open' | 'ongoing' | 'completed';
  volunteersNeeded: number;
  volunteersApplied: number;
  imageUrl?: string;
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: string;
}

export interface Application {
  id: string;
  projectId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
