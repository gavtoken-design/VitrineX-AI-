
import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { AdminLog, UserProfile, AdminConfig, ClientConfig, AppNotification, FileDistribution } from '../types';
import { getGlobalUsageSummary, getAllUsageStats, GlobalUsageData, resetAllUsageStats } from '../services/usageTracker';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheckIcon,
  ServerIcon,
  UsersIcon,
  CommandLineIcon,
  CpuChipIcon,
  LockClosedIcon,
  PowerIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  NoSymbolIcon,
  ArrowRightStartOnRectangleIcon,
  HandRaisedIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  KeyIcon,
  XMarkIcon,
  MegaphoneIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FolderIcon,
  BanknotesIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

type TabType = 'dashboard' | 'clients' | 'notifications' | 'files' | 'apikeys' | 'system' | 'logs';

const AdminConsole: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Data States
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clientConfigs, setClientConfigs] = useState<ClientConfig[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [files, setFiles] = useState<FileDistribution[]>([]);
  const [usageSummary, setUsageSummary] = useState({ textRequests: 0, imageRequests: 0, videoRequests: 0, totalCost: 0 });
  const [allUserStats, setAllUserStats] = useState<GlobalUsageData>({});
  const [loadingData, setLoadingData] = useState(false);

  // Modal States
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [editingClient, setEditingClient] = useState<UserProfile | null>(null);
  const [selectedClientConfig, setSelectedClientConfig] = useState<ClientConfig | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileDistribution | null>(null);

  // Form States
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'free' as 'free' | 'premium',
    businessName: '',
    industry: '',
  });

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'announcement',
    expiresAt: '',
  });

  const [fileForm, setFileForm] = useState({
    fileName: '',
    fileType: '',
    description: '',
    targetType: 'all' as 'all' | 'specific',
    targetUsers: [] as string[],
    targetIPs: '',
    expiresAt: '',
    tags: '',
  });

  const [uploadedFileData, setUploadedFileData] = useState<string>('');

  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const isValid = await adminService.authenticate(pin);
      if (isValid) {
        setIsAuthenticated(true);
        loadDashboardData();
        addToast({ type: 'success', message: 'Sessão Mestra Iniciada' });
      } else {
        addToast({ type: 'error', message: 'PIN Inválido. Acesso Negado.' });
        setPin('');
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao autenticar.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cfg, lgs, usrs, configs, notifs, fls] = await Promise.all([
        adminService.getConfig(),
        adminService.getLogs(),
        adminService.getUsers(),
        adminService.getAllClientConfigs(),
        adminService.getNotifications(),
        adminService.getFiles(),
      ]);
      setConfig(cfg);
      setLogs(lgs);
      setUsers(usrs);
      setClientConfigs(configs);
      setNotifications(notifs);
      setClientConfigs(configs);
      setNotifications(notifs);
      setFiles(fls);
      setUsageSummary(getGlobalUsageSummary());
      setAllUserStats(getAllUsageStats());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const refreshData = async () => {
    const [newLogs, newUsers, newConfigs, newNotifs, newFiles] = await Promise.all([
      adminService.getLogs(),
      adminService.getUsers(),
      adminService.getAllClientConfigs(),
      adminService.getNotifications(),
      adminService.getFiles(),
    ]);
    setLogs(newLogs);
    setUsers(newUsers);
    setClientConfigs(newConfigs);
    setNotifications(newNotifs);
    setFiles(newFiles);
    setUsageSummary(getGlobalUsageSummary());
    setAllUserStats(getAllUsageStats());
  };

  const toggleModule = async (moduleKey: string) => {
    if (!config) return;
    const newModules = { ...config.modules, [moduleKey]: !config.modules[moduleKey] };
    try {
      await adminService.updateConfig({ modules: newModules });
      setConfig(prev => prev ? { ...prev, modules: newModules } : null);
      addToast({ type: 'info', message: `Módulo ${moduleKey} ${newModules[moduleKey] ? 'Ativado' : 'Desativado'}` });
      refreshData();
    } catch (err) {
      addToast({ type: 'error', message: 'Falha ao atualizar configuração.' });
    }
  };

  const handleBlockUser = async (userId: string, currentStatus?: string) => {
    const isBlocking = currentStatus !== 'blocked';
    const action = isBlocking ? 'BLOQUEAR' : 'DESBLOQUEAR';

    if (confirm(`ATENÇÃO: Tem certeza que deseja ${action} o usuário ${userId}?`)) {
      await adminService.blockUser(userId);
      addToast({ type: isBlocking ? 'warning' : 'success', message: `Usuário ${isBlocking ? 'bloqueado' : 'desbloqueado'} com sucesso.` });
      refreshData();
    }
  };

  const handleForceLogout = async (userId: string, email: string) => {
    if (confirm(`Desconectar forçadamente ${email}? O usuário perderá a sessão atual.`)) {
      await adminService.disconnectUser(userId);
      addToast({ type: 'success', message: `Sessão de ${email} encerrada.` });
      refreshData();
    }
  };

  const handleBackup = async () => {
    addToast({ type: 'info', message: 'Iniciando backup criptografado...' });
    const filename = await adminService.createBackup();
    addToast({ type: 'success', message: `Backup ${filename} enviado para Drive Seguro.` });
  };

  // Client Management
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createClient({
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        plan: clientForm.plan,
        businessProfile: {
          name: clientForm.businessName,
          industry: clientForm.industry,
          targetAudience: 'General',
          visualStyle: 'Modern',
        },
      });
      addToast({ type: 'success', message: 'Cliente criado com sucesso!' });
      setShowClientModal(false);
      setClientForm({ name: '', email: '', phone: '', plan: 'free', businessName: '', industry: '' });
      refreshData();
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao criar cliente.' });
    }
  };

  const handleDeleteClient = async (userId: string, email: string) => {
    if (confirm(`ATENÇÃO: Deletar permanentemente o cliente ${email}? Esta ação não pode ser desfeita!`)) {
      const success = await adminService.deleteClient(userId);
      if (success) {
        addToast({ type: 'success', message: 'Cliente deletado com sucesso.' });
        refreshData();
      }
    }
  };

  const handleToggleClientApi = async (userId: string, currentEnabled: boolean) => {
    await adminService.toggleClientApiAccess(userId, !currentEnabled);
    addToast({ type: 'info', message: `API ${!currentEnabled ? 'liberada' : 'bloqueada'}` });
    refreshData();
  };

  const handleToggleClientModule = async (userId: string, moduleName: string, currentEnabled: boolean) => {
    await adminService.toggleClientModule(userId, moduleName, !currentEnabled);
    addToast({ type: 'info', message: `Módulo ${moduleName} ${!currentEnabled ? 'habilitado' : 'desabilitado'}` });
    refreshData();
  };

  // Notification Management
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createNotification({
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        createdBy: 'admin',
        isActive: true,
        expiresAt: notificationForm.expiresAt || undefined,
      });
      addToast({ type: 'success', message: 'Notificação enviada para todos os usuários!' });
      setShowNotificationModal(false);
      setNotificationForm({ title: '', message: '', type: 'info', expiresAt: '' });
      refreshData();
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao criar notificação.' });
    }
  };

  const handleToggleNotification = async (id: string) => {
    await adminService.toggleNotificationStatus(id);
    refreshData();
  };

  const handleDeleteNotification = async (id: string) => {
    if (confirm('Deletar esta notificação?')) {
      await adminService.deleteNotification(id);
      addToast({ type: 'success', message: 'Notificação deletada.' });
      refreshData();
    }
  };

  // File Management
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileForm(prev => ({
      ...prev,
      fileName: file.name,
      fileType: file.name.split('.').pop() || 'unknown',
    }));

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileData) {
      addToast({ type: 'error', message: 'Por favor, selecione um arquivo.' });
      return;
    }

    try {
      const targetUsers = fileForm.targetType === 'specific' ? fileForm.targetUsers : undefined;
      const targetIPs = fileForm.targetType === 'specific' && fileForm.targetIPs
        ? fileForm.targetIPs.split(',').map(ip => ip.trim())
        : undefined;
      const tags = fileForm.tags ? fileForm.tags.split(',').map(t => t.trim()) : undefined;

      await adminService.uploadFile({
        fileName: fileForm.fileName,
        fileType: fileForm.fileType,
        fileSize: uploadedFileData.length,
        fileUrl: uploadedFileData,
        description: fileForm.description,
        uploadedBy: 'admin',
        targetType: fileForm.targetType,
        targetUsers,
        targetIPs,
        expiresAt: fileForm.expiresAt || undefined,
        isActive: true,
        tags,
      });

      addToast({ type: 'success', message: `Arquivo "${fileForm.fileName}" enviado com sucesso!` });
      setShowFileModal(false);
      setFileForm({
        fileName: '',
        fileType: '',
        description: '',
        targetType: 'all',
        targetUsers: [],
        targetIPs: '',
        expiresAt: '',
        tags: '',
      });
      setUploadedFileData('');
      refreshData();
    } catch (err) {
      addToast({ type: 'error', message: 'Erro ao enviar arquivo.' });
    }
  };

  const handleDeleteFile = async (id: string, fileName: string) => {
    if (confirm(`ATENÇÃO: Deletar permanentemente o arquivo "${fileName}"? Esta ação não pode ser desfeita!`)) {
      const success = await adminService.deleteFile(id);
      if (success) {
        addToast({ type: 'success', message: 'Arquivo deletado com sucesso.' });
        refreshData();
      }
    }
  };

  const handleToggleFile = async (id: string) => {
    await adminService.toggleFileStatus(id);
    refreshData();
  };

  const handleViewFileStats = async (file: FileDistribution) => {
    const stats = await adminService.getFileStats(file.id);
    alert(`Estatísticas de "${file.fileName}":\n\nTotal de Downloads: ${stats.totalDownloads}\nUsuários Únicos: ${stats.uniqueUsers}\nIPs Únicos: ${stats.uniqueIPs}\nÚltimo Download: ${stats.lastDownload ? new Date(stats.lastDownload).toLocaleString() : 'Nunca'}`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const toggleUserSelection = (userId: string) => {
    setFileForm(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
    }));
  };

  const openClientConfig = (userId: string) => {
    const config = clientConfigs.find(c => c.userId === userId);
    setSelectedClientConfig(config || null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono text-green-500">
        <div className="w-full max-w-md border border-green-800 p-8 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.1)] bg-gray-900">
          <div className="flex justify-center mb-6">
            <ShieldCheckIcon className="w-16 h-16 text-green-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 tracking-widest uppercase">VitrineX Master Control</h1>
          <p className="text-xs text-center text-green-700 mb-8">ACESSO RESTRITO. TODAS AS TENTATIVAS SÃO LOGADAS.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase mb-2">Código de Acesso (PIN)</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-black border border-green-700 text-green-400 p-3 rounded focus:outline-none focus:border-green-400 text-center tracking-[0.5em] text-xl"
                autoFocus
                placeholder="••••"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-green-900/30 hover:bg-green-800/50 text-green-400 border border-green-700 py-3 rounded uppercase font-bold tracking-wider transition-all disabled:opacity-50"
            >
              {authLoading ? 'Verificando Credenciais...' : 'Autenticar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Dashboard Metrics
  const activeUsers = users.filter(u => u.status === 'active').length;
  const blockedUsers = users.filter(u => u.status === 'blocked').length;
  const premiumUsers = users.filter(u => u.plan === 'premium').length;
  const activeNotifications = notifications.filter(n => n.isActive).length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-mono flex flex-col">
      {/* Top Bar */}
      <header className="bg-black border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
          <span className="font-bold text-lg tracking-wider text-gray-100">MASTER CONTROL ROOM</span>
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">v2.5.0-admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-green-500 flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4" /> SISTEMA OPERACIONAL
          </span>
          <button
            onClick={() => { setIsAuthenticated(false); setPin(''); }}
            className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded border border-red-900 transition-colors uppercase"
          >
            Encerrar Sessão
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <nav className="p-4 space-y-2 flex-1">
            <NavButton icon={ChartBarIcon} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavButton icon={UsersIcon} label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
            <NavButton icon={BellIcon} label="Notificações" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={activeNotifications} />
            <NavButton icon={FolderIcon} label="Arquivos" active={activeTab === 'files'} onClick={() => setActiveTab('files')} badge={files.filter(f => f.isActive).length} />
            <NavButton icon={KeyIcon} label="API Keys" active={activeTab === 'apikeys'} onClick={() => setActiveTab('apikeys')} />
            <NavButton icon={CpuChipIcon} label="Sistema" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
            <NavButton icon={CommandLineIcon} label="Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="bg-black p-3 rounded border border-gray-800 mb-2">
              <p className="text-[10px] uppercase text-gray-500 mb-1">Status do Drive Seguro</p>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Sincronizado
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-black p-8">
          {loadingData ? (
            <div className="flex items-center justify-center h-full text-green-500">
              <LoadingSpinner className="w-8 h-8 mr-2" /> Carregando dados...
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">

              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">📊 Dashboard</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Total de Clientes" value={users.length} icon={UsersIcon} color="blue" />
                    <MetricCard title="Clientes Ativos" value={activeUsers} icon={CheckCircleIcon} color="green" />
                    <MetricCard title="Clientes Bloqueados" value={blockedUsers} icon={NoSymbolIcon} color="red" />
                    <MetricCard title="Planos Premium" value={premiumUsers} icon={ShieldCheckIcon} color="purple" />
                    <MetricCard title="Custo Estimado (Global)" value={`$${usageSummary.totalCost.toFixed(4)}`} icon={BanknotesIcon} color="yellow" />
                  </div>

                  {/* API Usage Breakdown */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm uppercase font-bold text-gray-400">Consumo de IA (Global)</h3>
                      <button onClick={() => { resetAllUsageStats(); refreshData(); }} className="text-xs text-red-500 hover:text-red-400">Resetar Global</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs">Text / Chat</p>
                          <p className="text-xl font-bold text-white">{usageSummary.textRequests}</p>
                        </div>
                        <SparklesIcon className="w-8 h-8 text-blue-500 opacity-50" />
                      </div>
                      <div className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs">Imagens Geradas</p>
                          <p className="text-xl font-bold text-white">{usageSummary.imageRequests}</p>
                        </div>
                        <EyeIcon className="w-8 h-8 text-purple-500 opacity-50" />
                      </div>
                      <div className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs">Vídeos</p>
                          <p className="text-xl font-bold text-white">{usageSummary.videoRequests}</p>
                        </div>
                        <ArrowRightStartOnRectangleIcon className="w-8 h-8 text-orange-500 opacity-50" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Atividade Recente</h3>
                      <div className="space-y-3">
                        {logs.slice(0, 5).map(log => (
                          <div key={log.id} className="flex items-start gap-3 text-xs">
                            <span className={`px-2 py-0.5 rounded font-bold ${log.level === 'INFO' ? 'bg-blue-900/20 text-blue-400' :
                              log.level === 'WARN' ? 'bg-yellow-900/20 text-yellow-400' :
                                'bg-red-900/20 text-red-400'
                              }`}>{log.level}</span>
                            <span className="text-gray-400 flex-1">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Notificações Ativas</h3>
                      <div className="space-y-3">
                        {notifications.filter(n => n.isActive).slice(0, 5).map(notif => (
                          <div key={notif.id} className="bg-black p-3 rounded border border-gray-800">
                            <p className="text-sm font-bold text-white">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.message.substring(0, 60)}...</p>
                          </div>
                        ))}
                        {activeNotifications === 0 && (
                          <p className="text-xs text-gray-600 text-center py-4">Nenhuma notificação ativa</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CLIENTS TAB */}
              {activeTab === 'clients' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">👥 Gerenciamento de Clientes</h2>
                    <button
                      onClick={() => setShowClientModal(true)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" /> Adicionar Cliente
                    </button>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="bg-black text-gray-500 uppercase text-xs font-bold">
                        <tr>
                          <th className="px-6 py-4">Cliente</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">API Costs (Hoje / Total)</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {users.map(user => {
                          const userConfig = clientConfigs.find(c => c.userId === user.id);
                          return (
                            <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-medium text-white">{user.name}</div>
                                <div className="text-xs text-gray-600">{user.email}</div>
                                {user.phone && <div className="text-[10px] text-gray-500 mt-0.5">{user.phone}</div>}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`flex items-center gap-1.5 text-xs ${user.status === 'active' ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-gray-500">Hoje:</span>
                                    <span className="text-green-400 font-bold">
                                      ${(allUserStats[user.id]?.dailyCost || 0).toFixed(4)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Total:</span>
                                    <span className="text-gray-300">
                                      ${(allUserStats[user.id]?.totalCost || 0).toFixed(4)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openClientConfig(user.id)}
                                    className="p-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 rounded transition-colors"
                                    title="Configurar Módulos"
                                  >
                                    <CpuChipIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleForceLogout(user.id, user.email)}
                                    className="p-1.5 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 rounded transition-colors"
                                    title="Desconectar"
                                  >
                                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBlockUser(user.id, user.status)}
                                    className="p-1.5 bg-orange-900/20 hover:bg-orange-900/40 text-orange-400 rounded transition-colors"
                                    title={user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                  >
                                    {user.status === 'blocked' ? <HandRaisedIcon className="w-4 h-4" /> : <NoSymbolIcon className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClient(user.id, user.email)}
                                    className="p-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                                    title="Deletar"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">🔔 Sistema de Notificações</h2>
                    <button
                      onClick={() => setShowNotificationModal(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      <MegaphoneIcon className="w-5 h-5" /> Criar Notificação
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`bg-gray-900 border rounded-lg p-6 ${notif.isActive ? 'border-green-800' : 'border-gray-800 opacity-50'
                        }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-white">{notif.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${notif.type === 'info' ? 'bg-blue-900/20 text-blue-400' :
                                notif.type === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                                  notif.type === 'success' ? 'bg-green-900/20 text-green-400' :
                                    'bg-purple-900/20 text-purple-400'
                                }`}>
                                {notif.type}
                              </span>
                              {notif.isActive && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-900/20 text-green-400">
                                  ATIVA
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 mb-3">{notif.message}</p>
                            <div className="flex gap-4 text-xs text-gray-600">
                              <span>Criada: {new Date(notif.createdAt).toLocaleString()}</span>
                              {notif.expiresAt && <span>Expira: {new Date(notif.expiresAt).toLocaleString()}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleNotification(notif.id)}
                              className={`px-3 py-1.5 rounded text-xs font-bold ${notif.isActive
                                ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40'
                                : 'bg-green-900/20 text-green-400 hover:bg-green-900/40'
                                }`}
                            >
                              {notif.isActive ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => handleDeleteNotification(notif.id)}
                              className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded text-xs font-bold"
                            >
                              Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* FILES TAB */}
              {activeTab === 'files' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">📁 Distribuição de Arquivos</h2>
                    <button
                      onClick={() => setShowFileModal(true)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      <DocumentArrowUpIcon className="w-5 h-5" /> Upload de Arquivo
                    </button>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="bg-black text-gray-500 uppercase text-xs font-bold">
                        <tr>
                          <th className="px-6 py-4">Arquivo</th>
                          <th className="px-6 py-4">Tipo</th>
                          <th className="px-6 py-4">Tamanho</th>
                          <th className="px-6 py-4">Distribuição</th>
                          <th className="px-6 py-4">Downloads</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {files.map(file => (
                          <tr key={file.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                                <div>
                                  <div className="font-medium text-white">{file.fileName}</div>
                                  {file.description && (
                                    <div className="text-xs text-gray-600">{file.description.substring(0, 50)}...</div>
                                  )}
                                  {file.tags && file.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {file.tags.map((tag, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px]">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded text-xs font-bold uppercase">
                                {file.fileType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                              {formatFileSize(file.fileSize)}
                            </td>
                            <td className="px-6 py-4">
                              {file.targetType === 'all' ? (
                                <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded text-xs font-bold">
                                  TODOS
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-orange-900/20 text-orange-400 rounded text-xs font-bold">
                                  ESPECÍFICO ({file.targetUsers?.length || 0} users)
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-bold text-white">{file.downloadCount}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleFile(file.id)}
                                className={`px-2 py-1 rounded text-xs font-bold ${file.isActive
                                  ? 'bg-green-900/20 text-green-400 border border-green-900'
                                  : 'bg-red-900/20 text-red-400 border border-red-900'
                                  }`}
                              >
                                {file.isActive ? 'Ativo' : 'Inativo'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewFileStats(file)}
                                  className="p-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 rounded transition-colors"
                                  title="Ver Estatísticas"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file.id, file.fileName)}
                                  className="p-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                                  title="Deletar"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {files.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                              <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>Nenhum arquivo enviado ainda.</p>
                              <p className="text-xs mt-1">Clique em "Upload de Arquivo" para começar.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* API KEYS TAB */}
              {activeTab === 'apikeys' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">🔑 Gerenciamento de API Keys</h2>
                  <h2 className="text-2xl font-bold text-white mb-6">🔑 Gerenciamento de API Keys</h2>

                  {/* GLOBAL KEYS SECTION */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ServerIcon className="w-5 h-5 text-purple-500" /> Chaves Globais do Sistema
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Standard Key */}
                      <div className="bg-black p-4 rounded border border-gray-800">
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Chave Padrão (Gemini Flash/Pro)</label>
                        <input
                          type="password"
                          className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded text-sm mb-3"
                          placeholder="AIzaSy..."
                          defaultValue={localStorage.getItem('vitrinex_gemini_api_key') || ''}
                          id="global_std_key"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById('global_std_key') as HTMLInputElement).value;
                            localStorage.setItem('vitrinex_gemini_api_key', val);
                            alert('Chave Padrão Salva!');
                          }}
                          className="w-full bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 py-2 rounded text-xs font-bold transition-colors"
                        >
                          Salvar Padrão
                        </button>
                      </div>

                      {/* Vertex Key */}
                      <div className="bg-black p-4 rounded border border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs uppercase font-bold text-purple-500">Chave Vertex / High-End</label>
                          <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 rounded">Opcional</span>
                        </div>
                        <input
                          type="password"
                          className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded text-sm mb-3"
                          placeholder="AIzaSy..."
                          defaultValue={localStorage.getItem('vitrinex_vertex_api_key') || ''}
                          id="global_vertex_key"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById('global_vertex_key') as HTMLInputElement).value;
                            localStorage.setItem('vitrinex_vertex_api_key', val);
                            alert('Chave Vertex Salva!');
                          }}
                          className="w-full bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 py-2 rounded text-xs font-bold transition-colors"
                        >
                          Salvar Vertex
                        </button>
                      </div>

                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <p className="text-gray-400 mb-4">Visualize e gerencie os limites dos clientes.</p>
                    <div className="space-y-4">
                      {clientConfigs.map(config => {
                        const user = users.find(u => u.id === config.userId);
                        return (
                          <div key={config.userId} className="bg-black p-4 rounded border border-gray-800 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-white">{user?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-600">Rate Limit: {config.apiAccess.rateLimit} req/min</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${config.apiAccess.geminiEnabled
                                ? 'bg-green-900/20 text-green-400'
                                : 'bg-gray-800 text-gray-500'
                                }`}>
                                Gemini: {config.apiAccess.geminiEnabled ? 'ON' : 'OFF'}
                              </span>
                              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs">
                                Testar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* SYSTEM TAB */}
              {activeTab === 'system' && config && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">⚙️ Configurações do Sistema</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-sm uppercase font-bold text-gray-400 mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
                        <PowerIcon className="w-4 h-4" /> Controle de Módulos Globais
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(config.modules).map(([key, isEnabled]) => (
                          <div key={key} className="flex items-center justify-between bg-black p-4 rounded border border-gray-800">
                            <span className="text-sm font-medium text-gray-300">{key}</span>
                            <button
                              onClick={() => toggleModule(key)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-700'
                                }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-sm uppercase font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <ServerIcon className="w-4 h-4" /> Ações do Sistema
                      </h3>
                      <div className="space-y-3">
                        <button
                          onClick={handleBackup}
                          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded transition-colors"
                        >
                          <ArchiveBoxIcon className="w-5 h-5" /> Executar Backup Manual
                        </button>
                        <button
                          onClick={refreshData}
                          className="w-full flex items-center justify-center gap-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 py-3 rounded transition-colors border border-blue-900"
                        >
                          <ArrowPathIcon className="w-5 h-5" /> Recarregar Dados
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* LOGS TAB */}
              {activeTab === 'logs' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">📋 Logs do Sistema</h2>
                    <button
                      onClick={refreshData}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      <ArrowPathIcon className="w-5 h-5" /> Atualizar
                    </button>
                  </div>
                  <div className="bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs h-[600px] overflow-y-auto">
                    {logs.map((log) => (
                      <div key={log.id} className="mb-2 flex gap-3 hover:bg-gray-900/50 p-2 rounded">
                        <span className="text-gray-600 shrink-0 w-36">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className={`shrink-0 w-16 font-bold ${log.level === 'INFO' ? 'text-blue-400' :
                          log.level === 'WARN' ? 'text-yellow-400' :
                            log.level === 'ERROR' ? 'text-red-500' :
                              'text-purple-400'
                          }`}>
                          [{log.level}]
                        </span>
                        <span className="text-gray-500 shrink-0 w-28 uppercase text-[10px]">[{log.module}]</span>
                        <span className="text-gray-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}
        </main>
      </div>

      {/* CLIENT MODAL */}
      {showClientModal && (
        <Modal title="Adicionar Novo Cliente" onClose={() => setShowClientModal(false)}>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <Input
              id="clientName"
              label="Nome Completo"
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              required
            />
            <Input
              id="clientEmail"
              label="Email"
              type="email"
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              required
            />
            <Input
              id="clientPhone"
              label="Telefone / WhatsApp"
              value={clientForm.phone}
              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              placeholder="+55 11 99999-9999"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plano</label>
              <select
                value={clientForm.plan}
                onChange={(e) => setClientForm({ ...clientForm, plan: e.target.value as 'free' | 'premium' })}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <Input
              id="businessName"
              label="Nome do Negócio"
              value={clientForm.businessName}
              onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
            />
            <Input
              id="industry"
              label="Indústria"
              value={clientForm.industry}
              onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
            />
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
              >
                Criar Cliente
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* NOTIFICATION MODAL */}
      {showNotificationModal && (
        <Modal title="Criar Nova Notificação" onClose={() => setShowNotificationModal(false)}>
          <form onSubmit={handleCreateNotification} className="space-y-4">
            <Input
              id="notifTitle"
              label="Título"
              value={notificationForm.title}
              onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
              required
              placeholder="Ex: Nova Funcionalidade Disponível!"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem</label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                required
                rows={4}
                placeholder="Digite a mensagem que será exibida para todos os usuários..."
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
              <select
                value={notificationForm.type}
                onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <Input
              id="notifExpires"
              label="Data de Expiração (Opcional)"
              type="datetime-local"
              value={notificationForm.expiresAt}
              onChange={(e) => setNotificationForm({ ...notificationForm, expiresAt: e.target.value })}
            />
            <div className="bg-blue-900/20 border border-blue-900 rounded p-4">
              <p className="text-xs text-blue-400 font-bold mb-2">PREVIEW:</p>
              <div className="bg-black p-3 rounded">
                <p className="text-sm font-bold text-white">{notificationForm.title || 'Título da Notificação'}</p>
                <p className="text-xs text-gray-400 mt-1">{notificationForm.message || 'Mensagem da notificação...'}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors font-bold"
              >
                📢 Enviar para Todos
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FILE UPLOAD MODAL */}
      {showFileModal && (
        <Modal title="Upload de Arquivo" onClose={() => setShowFileModal(false)}>
          <form onSubmit={handleCreateFile} className="space-y-4">
            <div className="bg-purple-900/20 border border-purple-900 rounded p-4">
              <p className="text-xs text-purple-400">
                Envie arquivos (PDF, ZIP, TXT, DOC, etc.) para seus clientes. Escolha se quer enviar para todos ou para clientes específicos.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Selecionar Arquivo</label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.zip,.txt,.doc,.docx,.epub,.mobi"
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                required
              />
              {fileForm.fileName && (
                <p className="text-xs text-green-400 mt-2">✓ Arquivo selecionado: {fileForm.fileName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
              <textarea
                value={fileForm.description}
                onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                rows={3}
                placeholder="Descreva o conteúdo do arquivo..."
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={fileForm.tags}
                onChange={(e) => setFileForm({ ...fileForm, tags: e.target.value })}
                placeholder="Ex: ebook, tutorial, marketing"
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Distribuição</label>
              <select
                value={fileForm.targetType}
                onChange={(e) => setFileForm({ ...fileForm, targetType: e.target.value as 'all' | 'specific' })}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded"
              >
                <option value="all">Todos os Usuários</option>
                <option value="specific">Clientes Específicos</option>
              </select>
            </div>

            {fileForm.targetType === 'specific' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Selecionar Clientes</label>
                  <div className="bg-gray-800 border border-gray-700 rounded p-3 max-h-40 overflow-y-auto space-y-2">
                    {users.map(user => (
                      <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={fileForm.targetUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-white">{user.name} ({user.email})</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {fileForm.targetUsers.length} cliente(s) selecionado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IPs Específicos (opcional)</label>
                  <input
                    type="text"
                    value={fileForm.targetIPs}
                    onChange={(e) => setFileForm({ ...fileForm, targetIPs: e.target.value })}
                    placeholder="Ex: 192.168.1.1, 10.0.0.5"
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separe múltiplos IPs por vírgula</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data de Expiração (Opcional)</label>
              <input
                type="datetime-local"
                value={fileForm.expiresAt}
                onChange={(e) => setFileForm({ ...fileForm, expiresAt: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!uploadedFileData}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📤 Enviar Arquivo
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CLIENT CONFIG MODAL */}
      {selectedClientConfig && (
        <Modal
          title={`Configurar Módulos - ${users.find(u => u.id === selectedClientConfig.userId)?.name}`}
          onClose={() => setSelectedClientConfig(null)}
        >
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-900 rounded p-4 mb-4">
              <p className="text-xs text-blue-400">
                Habilite ou desabilite módulos específicos para este cliente.
              </p>
            </div>
            {Object.entries(selectedClientConfig.modules).map(([moduleName, isEnabled]) => (
              <div key={moduleName} className="flex items-center justify-between bg-gray-800 p-4 rounded">
                <span className="text-sm font-medium text-white">{moduleName}</span>
                <button
                  onClick={() => handleToggleClientModule(selectedClientConfig.userId, moduleName, isEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setSelectedClientConfig(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors mt-4"
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper Components
const NavButton: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void; badge?: number }> = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded text-sm transition-all ${active ? 'bg-gray-800 text-white border-l-2 border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
      }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      {label}
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

const MetricCard: React.FC<{ title: string; value: number | string; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-900 text-blue-400',
    green: 'bg-green-900/20 border-green-900 text-green-400',
    red: 'bg-red-900/20 border-red-900 text-red-400',
    purple: 'bg-purple-900/20 border-purple-900 text-purple-400',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm uppercase tracking-wider opacity-80">{title}</p>
    </div>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

export default AdminConsole;
