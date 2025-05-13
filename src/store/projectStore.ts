
import { create } from 'zustand';
import { Project } from '../types';

interface ProjectState {
  projects: Project[];
  filteredProjects: Project[];
  isLoading: boolean;
  error: string | null;
  filters: {
    location: string;
    skills: string[];
    category: string;
    status: string;
  };
  setProjects: (projects: Project[]) => void;
  setFilters: (filters: Partial<ProjectState['filters']>) => void;
  applyToProject: (projectId: string) => void;
  resetFilters: () => void;
}

// Mock data for development
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Community Garden Cleanup',
    description:
      'Help us clean up and prepare the community garden for the spring planting season. Tasks include weeding, clearing debris, and preparing soil.',
    organization: 'Green Thumb Initiative',
    skills: ['Gardening', 'Physical Labor'],
    location: 'Central Park, New York',
    coordinates: [-73.9654, 40.7829],
    startDate: '2023-05-15T09:00:00Z',
    endDate: '2023-05-15T15:00:00Z',
    status: 'open',
    volunteersNeeded: 10,
    volunteersApplied: 4,
    imageUrl: 'https://images.unsplash.com/photo-1598901865264-4f19f07a5a9c',
    category: 'Environment',
  },
  {
    id: '2',
    title: 'Food Bank Distribution',
    description:
      'Assist in sorting, packing, and distributing food items to families in need. No experience necessary.',
    organization: 'City Food Bank',
    skills: ['Organization', 'Customer Service'],
    location: 'Downtown Community Center',
    coordinates: [-73.9841, 40.7484],
    startDate: '2023-05-20T10:00:00Z',
    endDate: '2023-05-20T14:00:00Z',
    status: 'open',
    volunteersNeeded: 15,
    volunteersApplied: 7,
    imageUrl: 'https://images.unsplash.com/photo-1593113630400-ea4288922497',
    category: 'Food Security',
  },
  {
    id: '3',
    title: 'After-School Tutoring',
    description:
      'Provide academic support to elementary school students in math and reading. Previous teaching experience preferred.',
    organization: 'Bright Futures Education',
    skills: ['Teaching', 'Patience'],
    location: 'Lincoln Elementary School',
    coordinates: [-73.9764, 40.7663],
    startDate: '2023-05-15T15:00:00Z',
    endDate: '2023-05-15T17:00:00Z',
    status: 'open',
    volunteersNeeded: 8,
    volunteersApplied: 3,
    imageUrl: 'https://images.unsplash.com/photo-1580894732930-0babd100d356',
    category: 'Education',
  },
  {
    id: '4',
    title: 'Senior Home Visits',
    description:
      'Engage with seniors through conversation, games, and activities to provide companionship and reduce isolation.',
    organization: 'Silver Care',
    skills: ['Empathy', 'Communication'],
    location: 'Sunshine Senior Living',
    coordinates: [-74.0060, 40.7128],
    startDate: '2023-05-22T13:00:00Z',
    endDate: '2023-05-22T16:00:00Z',
    status: 'open',
    volunteersNeeded: 12,
    volunteersApplied: 8,
    imageUrl: 'https://images.unsplash.com/photo-1516307365426-bea591f05011',
    category: 'Health',
  },
  {
    id: '5',
    title: 'Beach Cleanup Initiative',
    description:
      'Join our team in removing trash and plastic waste from local beaches to protect marine life and keep our shorelines clean.',
    organization: 'Ocean Guardians',
    skills: ['Physical Labor', 'Environmental Awareness'],
    location: 'Rockaway Beach',
    coordinates: [-73.8570, 40.5834],
    startDate: '2023-05-27T08:00:00Z',
    endDate: '2023-05-27T12:00:00Z',
    status: 'open',
    volunteersNeeded: 20,
    volunteersApplied: 11,
    imageUrl: 'https://images.unsplash.com/photo-1618477202872-2c8a0dbda2c0',
    category: 'Environment',
  },
  {
    id: '6',
    title: 'Homeless Shelter Meal Service',
    description:
      'Prepare and serve meals at the local homeless shelter. Help create a welcoming environment for shelter residents.',
    organization: 'Hope House',
    skills: ['Cooking', 'Service'],
    location: 'Hope House Shelter',
    coordinates: [-73.9845, 40.7424],
    startDate: '2023-05-18T17:00:00Z',
    endDate: '2023-05-18T20:00:00Z',
    status: 'open',
    volunteersNeeded: 8,
    volunteersApplied: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541802645635-11f2286a7482',
    category: 'Food Security',
  }
];

export const useProjectStore = create<ProjectState>((set) => ({
  projects: mockProjects,
  filteredProjects: mockProjects,
  isLoading: false,
  error: null,
  filters: {
    location: '',
    skills: [],
    category: '',
    status: 'open',
  },
  setProjects: (projects) => set({ projects, filteredProjects: projects }),
  setFilters: (newFilters) =>
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      
      // Apply filters to projects
      const filtered = state.projects.filter((project) => {
        // Filter by location if specified
        if (updatedFilters.location && !project.location.toLowerCase().includes(updatedFilters.location.toLowerCase())) {
          return false;
        }
        
        // Filter by skills if any are selected
        if (updatedFilters.skills.length > 0 && 
            !updatedFilters.skills.some(skill => project.skills.includes(skill))) {
          return false;
        }
        
        // Filter by category if specified
        if (updatedFilters.category && project.category !== updatedFilters.category) {
          return false;
        }
        
        // Filter by status if specified
        if (updatedFilters.status && project.status !== updatedFilters.status) {
          return false;
        }
        
        return true;
      });
      
      return {
        filters: updatedFilters,
        filteredProjects: filtered,
      };
    }),
  applyToProject: (projectId) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              volunteersApplied: project.volunteersApplied + 1,
            }
          : project
      ),
      filteredProjects: state.filteredProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              volunteersApplied: project.volunteersApplied + 1,
            }
          : project
      ),
    })),
  resetFilters: () =>
    set((state) => ({
      filters: {
        location: '',
        skills: [],
        category: '',
        status: 'open',
      },
      filteredProjects: state.projects,
    })),
}));
