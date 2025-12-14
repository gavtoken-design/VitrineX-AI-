
import { UserProfile, LoginResponseDto, OrganizationMembership } from '../types';
import { MOCK_API_DELAY } from '../constants';
import { getUserProfile } from './dbService';

const BACKEND_URL = 'http://localhost:3000'; // Exemplo para desenvolvimento

let currentUserId: string | null = 'mock-user-123'; // Default to mock for initial load/demo
let currentUserProfile: UserProfile | null = null;

// Initialize with a default mock organization
let currentUserOrganizations: OrganizationMembership[] = [
  {
    organization: {
      id: 'mock-org-default',
      name: 'Minha Organização',
      fileSearchStoreName: undefined
    },
    role: 'ADMIN'
  }
];

// Mock getAuthToken
const getAuthToken = async (): Promise<string> => {
  return 'mock-auth-token';
};

const loginWithGoogle = async (): Promise<UserProfile> => {
  console.log('Initiating Mock Google login...');

  // Simular delay de login
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Fallback: Create a local profile based on Mock data
  const mockUser = {
    uid: 'mock-user-123',
    email: 'demo@vitrinex.ai',
    displayName: 'Usuário Demo'
  }

  currentUserId = mockUser.uid;

  currentUserProfile = {
    id: mockUser.uid,
    email: mockUser.email,
    name: mockUser.displayName,
    plan: 'premium',
    businessProfile: {
      name: 'Minha Empresa', industry: 'Marketing Digital', targetAudience: 'Pequenas e Médias Empresas', visualStyle: 'moderno'
    },
  };

  console.log('User logged in successfully (MOCKED):', currentUserId);
  return currentUserProfile;
};

const logout = async (): Promise<void> => {
  console.log('Logging out (MOCKED)...');
  currentUserId = null;
  currentUserProfile = null;
  console.log('User logged out.');
};

const getCurrentUser = (): UserProfile | null => {
  // Synchronous getter for current state
  // If you need async, keep logic to load
  return currentUserProfile || {
    id: 'mock-user-123',
    email: 'jean@vitrinex.ai',
    name: 'Jean Owner',
    plan: 'premium',
    businessProfile: { name: 'VitrineX', industry: 'Tech', targetAudience: 'B2B', visualStyle: 'Modern' }
  } as UserProfile;
};


const getActiveOrganization = (): OrganizationMembership | undefined => {
  return currentUserOrganizations.length > 0 ? currentUserOrganizations[0] : undefined;
};

export const authService = {
  loginWithGoogle,
  logout,
  getCurrentUser,
  getAuthToken,
  getActiveOrganization
};

// Export individual functions for backward compatibility if needed, 
// but preferring the object export now.
export { getAuthToken, getActiveOrganization, getCurrentUser };
