
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
      'AdStudio': false,
      'TrendHunter': true,
      'CreativeStudio': true,
      'Chatbot': false,
      'SmartScheduler': true,
    },
    metadata: { notes: 'Free tier - limited features', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
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

const addLog = (level: AdminLog['level'], module: string, message: string, userId?: string) => {
  logs.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    userId,
  });
};

export const adminService = {
  authenticate: async (pin: string): Promise<boolean> => {
    // Simula validação de PIN (Em prod, isso seria hash validated no backend)
    await new Promise(r => setTimeout(r, 800));
    return pin === '1984'; // PIN Mestre
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
        'AdStudio': userData.plan === 'premium',
        'TrendHunter': true,
        'CreativeStudio': true,
        'Chatbot': userData.plan === 'premium',
        'SmartScheduler': true,
      },
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    };

    clientConfigs.push(defaultConfig);

    addLog('INFO', 'ClientMgmt', `Novo cliente criado: ${newUser.email} (${newUser.id})`);

    return newUser;
  },

  updateClient: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };

    addLog('INFO', 'ClientMgmt', `Cliente atualizado: ${mockUsers[userIndex].email} (${userId})`);

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
    addLog('WARN', 'ConfigMgmt', `Configuração do cliente ${user?.email || userId} foi atualizada.`);

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

    return newNotification;
  },

  updateNotification: async (id: string, updates: Partial<AppNotification>): Promise<AppNotification | null> => {
    const index = appNotifications.findIndex(n => n.id === id);
    if (index === -1) return null;

    appNotifications[index] = { ...appNotifications[index], ...updates };

    addLog('INFO', 'NotificationSys', `Notificação atualizada: ${id}`);

    return appNotifications[index];
  },

  deleteNotification: async (id: string): Promise<boolean> => {
    const index = appNotifications.findIndex(n => n.id === id);
    if (index === -1) return false;

    const notification = appNotifications[index];
    appNotifications.splice(index, 1);

    addLog('INFO', 'NotificationSys', `Notificação deletada: "${notification.title}"`);

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

    return newFile;
  },

  updateFile: async (id: string, updates: Partial<FileDistribution>): Promise<FileDistribution | null> => {
    const index = fileDistributions.findIndex(f => f.id === id);
    if (index === -1) return null;

    fileDistributions[index] = { ...fileDistributions[index], ...updates };

    addLog('INFO', 'FileMgmt', `Arquivo "${fileDistributions[index].fileName}" atualizado`);

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
