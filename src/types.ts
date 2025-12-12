
export interface TranscriptionSegment {
  text: string;
  isFinal: boolean;
}

// Define BusinessProfile interface
export interface BusinessProfile {
  name: string;
  industry: string;
  targetAudience: string;
  visualStyle: string;
}

// Define UserProfile interface
export interface UserProfile {
  id: string;
  email: string;
  name?: string; // Added name property
  plan: 'free' | 'premium';
  businessProfile: BusinessProfile;
  status?: 'active' | 'blocked'; // Added status for admin control
}

// Define Post interface
export interface Post {
  id: string;
  userId: string;
  content_text: string;
  image_url?: string;
  createdAt: string; // ISO date string
  tags?: string[];
}

// Define Ad interface
export interface Ad {
  id: string;
  userId: string;
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'Google' | 'Pinterest';
  headline: string;
  copy: string;
  media_url?: string;
  createdAt: string; // ISO date string
}

// Define Campaign interface
export interface Campaign {
  id: string;
  userId: string;
  name: string;
  type: string; // e.g., 'general', 'product_launch'
  posts: Post[];
  ads: Ad[];
  video_url?: string;
  timeline: string;
  createdAt: string; // ISO date string
}

// NOVO: Interface para metadados de grounding
export interface GroundingMetadata {
  groundingChunks: Array<{ web?: { uri: string; title: string }; maps?: { uri: string; title: string } }>;
  groundingSupports: Array<{
    segment: { startIndex: number; endIndex: number; text: string };
    groundingChunkIndices: number[];
  }>;
}

// Define Trend interface
export interface Trend {
  id: string;
  userId: string;
  query: string;
  score: number; // e.g., viral score
  data: string; // summary of the trend
  sources?: Array<{ uri: string; title: string }>;
  groundingMetadata?: GroundingMetadata; // NOVO
  createdAt: string; // ISO date string
}

// Define LibraryItem interface
export interface LibraryItem {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text' | 'post' | 'ad' | 'audio'; // Added 'audio' type
  file_url: string;
  thumbnail_url?: string; // For images/videos
  tags: string[];
  name: string;
  createdAt: string; // ISO date string
}

// Define ScheduleEntry interface
export interface ScheduleEntry {
  id: string;
  userId: string;
  datetime: string; // ISO date string for scheduling
  platform: string; // e.g., 'Instagram', 'Facebook'
  contentId: string; // Reference to LibraryItem ID or Post/Ad ID
  contentType: 'post' | 'ad' | 'audio' | 'video' | 'image' | 'text'; // Added types for content
  status: 'scheduled' | 'published' | 'failed';
}

// Define ChatMessage interface for Chatbot
export interface ChatMessage {
  role: 'user' | 'model' | 'tool';
  text: string;
  timestamp: string; // ISO date string
  toolCall?: {
    name: string;
    args: any;
  };
}

// NOVO: Interface para a resposta de consulta RAG do backend
export interface KnowledgeBaseQueryResponse {
  resposta: string;
  arquivos_usados: string[];
  trechos_referenciados: string[];
  confianca: number;
}

// NOVO: DTOs do Backend para comunicação
export interface OrganizationResponseDto {
  id: string;
  name: string;
  fileSearchStoreName?: string; // Opcional, nome da loja File Search associada
}

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER'; // Assumindo enum Role do Prisma

export interface OrganizationMembership {
  organization: OrganizationResponseDto;
  role: Role;
}

export interface LoginResponseDto {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  organizations: OrganizationMembership[];
}

// Admin Interfaces
export interface AdminLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  module: string;
  message: string;
  userId?: string;
}

export interface AdminConfig {
  modules: {
    [key: string]: boolean;
  };
  system: {
    maintenanceMode: boolean;
    debugLevel: string;
    globalRateLimit: number;
  };
}

// Client Configuration (per-user settings controlled by admin)
export interface ClientConfig {
  userId: string;
  apiAccess: {
    enabled: boolean;
    geminiEnabled: boolean;
    rateLimit?: number; // requests per minute
    lastApiCall?: string;
  };
  modules: {
    [key: string]: boolean; // Which modules this client can access
  };
  metadata: {
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// App Notification System
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  createdAt: string;
  createdBy: string; // Admin user ID
  expiresAt?: string; // Optional expiration
  isActive: boolean;
  targetUsers?: string[]; // Empty = all users
}

// File Distribution System
export interface FileDistribution {
  id: string;
  fileName: string;
  fileType: string; // pdf, zip, txt, doc, ebook, etc.
  fileSize: number; // in bytes
  fileUrl: string; // Base64 or URL
  description?: string;
  uploadedBy: string; // Admin user ID
  uploadedAt: string;
  targetType: 'all' | 'specific'; // All users or specific users
  targetUsers?: string[]; // User IDs if specific
  targetIPs?: string[]; // IP addresses if specific
  expiresAt?: string; // Optional expiration
  isActive: boolean;
  downloadCount: number;
  tags?: string[];
}

export interface FileDownloadLog {
  id: string;
  fileId: string;
  userId: string;
  userIP: string;
  downloadedAt: string;
  userAgent?: string;
}

// Extend Window interface for Electron and AI Studio
declare global {
  // FIX: Define AIStudio and IElectronAPI interfaces explicitly inside global scope to avoid module conflicts
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface IElectronAPI {
    saveFile: (imageUrl: string, fileName: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  }

  interface Window {
    electronAPI?: IElectronAPI;
    aistudio?: AIStudio;
  }
}
