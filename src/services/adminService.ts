
import { AdminLog, UserProfile, AdminConfig, ClientConfig, AppNotification, FileDistribution, FileDownloadLog } from '../types';

// Mock Data Logs
let logs: AdminLog[] = [
  { id: '1', timestamp: new Date().toISOString(), level: 'INFO', module: 'System', message: 'Inicialização do sistema concluída.' },
  { id: '2', timestamp: new Date(Date.now() - 100000).toISOString(), level: 'WARN', module: 'GeminiAPI', message: 'Latência alta detectada na região us-central1.' },
  { id: '3', timestamp: new Date(Date.now() - 500000).toISOString(), level: 'INFO', module: 'Auth', message: 'Usuário mock-user-123 realizou login.' },
];

let globalConfig: AdminConfig = {
  modules: {
    'ContentGenerator': true,
    'AdStudio': true,
    'TrendHunter': true,
    'CreativeStudio': true,
    'Chatbot': true,
  },
  system: {
    maintenanceMode: false,
    debugLevel: 'verbose',
    globalRateLimit: 1000,
  }
};

// Mock Data Users (Persistente em memória durante a sessão)
let mockUsers: UserProfile[] = [
  { id: 'mock-user-123', email: 'jean@vitrinex.ai', name: 'Jean Owner', plan: 'premium', status: 'active', businessProfile: { name: 'VitrineX', industry: 'Tech', targetAudience: 'B2B', visualStyle: 'Modern' } },
  { id: 'user-2', email: 'client@example.com', name: 'Client A', plan: 'free', status: 'active', businessProfile: { name: 'Loja A', industry: 'Retail', targetAudience: 'B2C', visualStyle: 'Classic' } },
  { id: 'user-3', email: 'spammer@bot.com', name: 'Spam Bot', plan: 'free', status: 'blocked', businessProfile: { name: 'Spam', industry: 'None', targetAudience: 'All', visualStyle: 'None' } },
];

// Client Configurations (per-user settings)
let clientConfigs: ClientConfig[] = [
  {
    userId: 'mock-user-123',
    apiAccess: { enabled: true, geminiEnabled: true, rateLimit: 1000 },
    modules: {
      'ContentGenerator': true,
      'AdStudio': true,
      'TrendHunter': true,
      'CreativeStudio': true,
      'Chatbot': true,
      'SmartScheduler': true,
    },
    metadata: { notes: 'Owner account - full access', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    userId: 'user-2',
    apiAccess: { enabled: true, geminiEnabled: true, rateLimit: 100 },
    modules: {
      'ContentGenerator': true,
      'AdStudio': true,
      'TrendHunter': true,
      'CreativeStudio': true,
      'Chatbot': true,
      'SmartScheduler': true,
    },
    metadata: { notes: 'Free tier - unlocked features', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    userId: 'user-3',
    apiAccess: { enabled: false, geminiEnabled: false, rateLimit: 0 },
    modules: {
      'ContentGenerator': false,
      'AdStudio': false,
      'TrendHunter': false,
      'CreativeStudio': false,
      'Chatbot': false,
      'SmartScheduler': false,
    },
    metadata: { notes: 'BLOCKED - Spam activity detected', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  }
];

// App Notifications
let appNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Bem-vindo ao VitrineX AI!',
    message: 'Explore todas as funcionalidades da plataforma e crie conteúdo incrível com IA.',
    type: 'announcement',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'admin',
    isActive: true,
  }
];

// File Distribution System
let fileDistributions: FileDistribution[] = [
  {
    id: 'file-1',
    fileName: 'Guia_Completo_VitrineX.pdf',
    fileType: 'pdf',
    fileSize: 2048000, // 2MB
    fileUrl: 'data:application/pdf;base64,mock-base64-data',
    description: 'Guia completo de uso da plataforma VitrineX AI',
    uploadedBy: 'admin',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    targetType: 'all',
    isActive: true,
    downloadCount: 15,
    tags: ['tutorial', 'guia'],
  },
];

let fileDownloadLogs: FileDownloadLog[] = [];

const ADMIN_STORAGE_KEY = 'vitrinex_admin_data';

// Helper to load/save admin data
const loadAdminData = () => {
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merging with defaults to ensure structure validity if schema changes
      return {
        logs: parsed.logs || [],
        users: parsed.users || mockUsers, // Fallback to mock if empty/invalid
        clientConfigs: parsed.clientConfigs || clientConfigs,
        notifications: parsed.notifications || appNotifications,
        files: parsed.files || fileDistributions,
        fileDownloadLogs: parsed.fileDownloadLogs || fileDownloadLogs,
        globalConfig: parsed.globalConfig || globalConfig
      };
    }
  } catch (e) {
    console.warn('Failed to load admin data from storage', e);
  }
  return null;
};

const saveAdminData = () => {
  try {
    const data = {
      logs: logs.slice(0, 50), // Keep only last 50 logs to save space
      users: mockUsers,
      clientConfigs,
      notifications: appNotifications,
      files: fileDistributions,
      fileDownloadLogs,
      globalConfig
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save admin data', e);
  }
};

const savedData = loadAdminData();

// Initialize data from storage or defaults
if (savedData) {
  // We only overwrite if we found saved data, otherwise we look at the consts defined above
  if (savedData.users.length > 0) mockUsers = savedData.users;
  if (savedData.clientConfigs.length > 0) clientConfigs = savedData.clientConfigs;
  if (savedData.notifications.length > 0) appNotifications = savedData.notifications;
  if (savedData.files.length > 0) fileDistributions = savedData.files;
  if (savedData.fileDownloadLogs.length > 0) fileDownloadLogs = savedData.fileDownloadLogs;
  if (savedData.globalConfig) globalConfig = savedData.globalConfig;
}

const addLog = (level: AdminLog['level'], module: string, message: string, userId?: string) => {
  logs.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    userId,
  });
  saveAdminData(); // Persist on log change (and usually other changes happen with logs)
};

export const adminService = {
  authenticate: async (pin: string): Promise<boolean> => {
    // Simula validação de PIN (Em prod, isso seria hash validated no backend)
    await new Promise(r => setTimeout(r, 800));
    return pin === '150897'; // PIN Mestre mudado pelo usuário
  },

  getLogs: async (): Promise<AdminLog[]> => {
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getConfig: async (): Promise<AdminConfig> => {
    return { ...globalConfig };
  },

  updateConfig: async (newConfig: Partial<AdminConfig>): Promise<AdminConfig> => {
    globalConfig = { ...globalConfig, ...newConfig };
    addLog('WARN', 'Admin', 'Configuração global alterada pelo Administrador.');
    saveAdminData();
    return globalConfig;
  },

  getUsers: async (): Promise<UserProfile[]> => {
    return [...mockUsers];
  },

  blockUser: async (userId: string): Promise<void> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const newStatus = mockUsers[userIndex].status === 'blocked' ? 'active' : 'blocked';
      mockUsers[userIndex] = { ...mockUsers[userIndex], status: newStatus as 'active' | 'blocked' };

      addLog(
        newStatus === 'blocked' ? 'CRITICAL' : 'INFO',
        'UserMgmt',
        `Usuário ${mockUsers[userIndex].email} (${userId}) foi alterado para ${newStatus.toUpperCase()}.`
      );
      saveAdminData();
    }
  },

  disconnectUser: async (userId: string): Promise<void> => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      addLog('WARN', 'AuthSecurity', `Sessão do usuário ${user.email} encerrada forçadamente (Force Logout).`);
    }
  },

  createBackup: async (): Promise<string> => {
    await new Promise(r => setTimeout(r, 1500));
    return `backup_v1_${Date.now()}.enc`;
  },

  // ============ CLIENT MANAGEMENT ============

  createClient: async (userData: Omit<UserProfile, 'id'>): Promise<UserProfile> => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      ...userData,
      status: 'active',
    };

    mockUsers.push(newUser);

    // Create default client config
    const defaultConfig: ClientConfig = {
      userId: newUser.id,
      apiAccess: { enabled: true, geminiEnabled: true, rateLimit: userData.plan === 'premium' ? 1000 : 100 },
      modules: {
        'ContentGenerator': true,
        'AdStudio': true, // Auto-unlocked
        'TrendHunter': true,
        'CreativeStudio': true,
        'Chatbot': true, // Auto-unlocked
        'SmartScheduler': true,
      },
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    };

    clientConfigs.push(defaultConfig);

    addLog('INFO', 'ClientMgmt', `Novo cliente criado: ${newUser.email} (${newUser.id})`);

    saveAdminData();
    return newUser;
  },

  updateClient: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };

    addLog('INFO', 'ClientMgmt', `Cliente atualizado: ${mockUsers[userIndex].email} (${userId})`);

    saveAdminData();
    return mockUsers[userIndex];
  },

  deleteClient: async (userId: string): Promise<boolean> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = mockUsers[userIndex];
    mockUsers.splice(userIndex, 1);

    // Remove client config
    const configIndex = clientConfigs.findIndex(c => c.userId === userId);
    if (configIndex !== -1) {
      clientConfigs.splice(configIndex, 1);
    }

    addLog('CRITICAL', 'ClientMgmt', `Cliente DELETADO: ${user.email} (${userId})`);

    saveAdminData();
    return true;
  },

  // ============ CLIENT CONFIG MANAGEMENT ============

  getClientConfig: async (userId: string): Promise<ClientConfig | null> => {
    const config = clientConfigs.find(c => c.userId === userId);
    return config ? { ...config } : null;
  },

  getAllClientConfigs: async (): Promise<ClientConfig[]> => {
    return [...clientConfigs];
  },

  updateClientConfig: async (userId: string, updates: Partial<ClientConfig>): Promise<ClientConfig | null> => {
    const configIndex = clientConfigs.findIndex(c => c.userId === userId);
    if (configIndex === -1) return null;

    clientConfigs[configIndex] = {
      ...clientConfigs[configIndex],
      ...updates,
      metadata: {
        ...clientConfigs[configIndex].metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString(),
      }
    };

    const user = mockUsers.find(u => u.id === userId);
    return clientConfigs[configIndex];
  },

  toggleClientApiAccess: async (userId: string, enabled: boolean): Promise<void> => {
    const configIndex = clientConfigs.findIndex(c => c.userId === userId);
    if (configIndex !== -1) {
      clientConfigs[configIndex].apiAccess.enabled = enabled;
      clientConfigs[configIndex].metadata.updatedAt = new Date().toISOString();

      const user = mockUsers.find(u => u.id === userId);
      addLog(
        enabled ? 'INFO' : 'WARN',
        'APIMgmt',
        `Acesso à API ${enabled ? 'LIBERADO' : 'BLOQUEADO'} para ${user?.email || userId}`
      );
      saveAdminData();
    }
  },

  toggleClientModule: async (userId: string, moduleName: string, enabled: boolean): Promise<void> => {
    const configIndex = clientConfigs.findIndex(c => c.userId === userId);
    if (configIndex !== -1) {
      clientConfigs[configIndex].modules[moduleName] = enabled;
      clientConfigs[configIndex].metadata.updatedAt = new Date().toISOString();

      const user = mockUsers.find(u => u.id === userId);
      addLog(
        'INFO',
        'ModuleMgmt',
        `Módulo ${moduleName} ${enabled ? 'HABILITADO' : 'DESABILITADO'} para ${user?.email || userId}`
      );
      saveAdminData();
    }
  },

  // ============ NOTIFICATION SYSTEM ============

  getNotifications: async (): Promise<AppNotification[]> => {
    return [...appNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getActiveNotifications: async (): Promise<AppNotification[]> => {
    const now = new Date();
    return appNotifications.filter(n => {
      if (!n.isActive) return false;
      if (n.expiresAt && new Date(n.expiresAt) < now) return false;
      return true;
    });
  },

  createNotification: async (notification: Omit<AppNotification, 'id' | 'createdAt'>): Promise<AppNotification> => {
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...notification,
    };

    appNotifications.unshift(newNotification);

    addLog('INFO', 'NotificationSys', `Nova notificação criada: "${newNotification.title}"`);

    saveAdminData();
    return newNotification;
  },

  updateNotification: async (id: string, updates: Partial<AppNotification>): Promise<AppNotification | null> => {
    const index = appNotifications.findIndex(n => n.id === id);
    if (index === -1) return null;

    appNotifications[index] = { ...appNotifications[index], ...updates };

    addLog('INFO', 'NotificationSys', `Notificação atualizada: ${id}`);

    saveAdminData();
    return appNotifications[index];
  },

  deleteNotification: async (id: string): Promise<boolean> => {
    const index = appNotifications.findIndex(n => n.id === id);
    if (index === -1) return false;

    const notification = appNotifications[index];
    appNotifications.splice(index, 1);

    addLog('INFO', 'NotificationSys', `Notificação deletada: "${notification.title}"`);

    saveAdminData();
    return true;
  },

  toggleNotificationStatus: async (id: string): Promise<void> => {
    const index = appNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      appNotifications[index].isActive = !appNotifications[index].isActive;

      addLog(
        'INFO',
        'NotificationSys',
        `Notificação ${appNotifications[index].isActive ? 'ATIVADA' : 'DESATIVADA'}: "${appNotifications[index].title}"`
      );
      saveAdminData();
    }
  },

  // ============ FILE DISTRIBUTION SYSTEM ============

  getFiles: async (): Promise<FileDistribution[]> => {
    return [...fileDistributions].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  getActiveFiles: async (): Promise<FileDistribution[]> => {
    const now = new Date();
    return fileDistributions.filter(f => {
      if (!f.isActive) return false;
      if (f.expiresAt && new Date(f.expiresAt) < now) return false;
      return true;
    });
  },

  getFilesForUser: async (userId: string, userIP?: string): Promise<FileDistribution[]> => {
    const now = new Date();
    return fileDistributions.filter(f => {
      if (!f.isActive) return false;
      if (f.expiresAt && new Date(f.expiresAt) < now) return false;

      // If targetType is 'all', show to everyone
      if (f.targetType === 'all') return true;

      // If specific, check if user ID or IP matches
      if (f.targetUsers && f.targetUsers.includes(userId)) return true;
      if (f.targetIPs && userIP && f.targetIPs.includes(userIP)) return true;

      return false;
    });
  },

  uploadFile: async (fileData: Omit<FileDistribution, 'id' | 'uploadedAt' | 'downloadCount'>): Promise<FileDistribution> => {
    const newFile: FileDistribution = {
      id: `file-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      ...fileData,
    };

    fileDistributions.unshift(newFile);

    const targetInfo = newFile.targetType === 'all'
      ? 'TODOS os usuários'
      : `${newFile.targetUsers?.length || 0} usuários específicos`;

    addLog('INFO', 'FileMgmt', `Arquivo "${newFile.fileName}" enviado para ${targetInfo}`);

    saveAdminData();
    return newFile;
  },

  updateFile: async (id: string, updates: Partial<FileDistribution>): Promise<FileDistribution | null> => {
    const index = fileDistributions.findIndex(f => f.id === id);
    if (index === -1) return null;

    fileDistributions[index] = { ...fileDistributions[index], ...updates };

    addLog('INFO', 'FileMgmt', `Arquivo "${fileDistributions[index].fileName}" atualizado`);

    saveAdminData();
    return fileDistributions[index];
  },

  deleteFile: async (id: string): Promise<boolean> => {
    const index = fileDistributions.findIndex(f => f.id === id);
    if (index === -1) return false;

    const file = fileDistributions[index];
    fileDistributions.splice(index, 1);

    // Remove related download logs
    fileDownloadLogs = fileDownloadLogs.filter(log => log.fileId !== id);

    addLog('WARN', 'FileMgmt', `Arquivo "${file.fileName}" DELETADO`);

    saveAdminData();
    return true;
  },

  toggleFileStatus: async (id: string): Promise<void> => {
    const index = fileDistributions.findIndex(f => f.id === id);
    if (index !== -1) {
      fileDistributions[index].isActive = !fileDistributions[index].isActive;

      addLog(
        'INFO',
        'FileMgmt',
        `Arquivo "${fileDistributions[index].fileName}" ${fileDistributions[index].isActive ? 'ATIVADO' : 'DESATIVADO'}`
      );
      saveAdminData();
    }
  },

  logFileDownload: async (fileId: string, userId: string, userIP: string, userAgent?: string): Promise<void> => {
    const downloadLog: FileDownloadLog = {
      id: `download-${Date.now()}`,
      fileId,
      userId,
      userIP,
      downloadedAt: new Date().toISOString(),
      userAgent,
    };

    fileDownloadLogs.push(downloadLog);

    // Increment download count
    const fileIndex = fileDistributions.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      fileDistributions[fileIndex].downloadCount++;
    }

    const user = mockUsers.find(u => u.id === userId);
    const file = fileDistributions.find(f => f.id === fileId);

    addLog(
      'INFO',
      'FileDownload',
      `${user?.email || userId} baixou "${file?.fileName || fileId}" de IP ${userIP}`
    );
    saveAdminData();
  },

  getFileDownloadLogs: async (fileId?: string): Promise<FileDownloadLog[]> => {
    if (fileId) {
      return fileDownloadLogs.filter(log => log.fileId === fileId);
    }
    return [...fileDownloadLogs].sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
  },

  getFileStats: async (fileId: string): Promise<{
    totalDownloads: number;
    uniqueUsers: number;
    uniqueIPs: number;
    lastDownload?: string;
  }> => {
    const logs = fileDownloadLogs.filter(log => log.fileId === fileId);
    const uniqueUsers = new Set(logs.map(log => log.userId)).size;
    const uniqueIPs = new Set(logs.map(log => log.userIP)).size;
    const lastDownload = logs.length > 0
      ? logs.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())[0].downloadedAt
      : undefined;

    return {
      totalDownloads: logs.length,
      uniqueUsers,
      uniqueIPs,
      lastDownload,
    };
  },
};
