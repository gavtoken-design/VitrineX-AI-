
import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { AdminLog, UserProfile, AdminConfig, ClientConfig, AppNotification, FileDistribution } from '../types';
import { getGlobalUsageSummary, getAllUsageStats, GlobalUsageData, resetAllUsageStats } from '../services/core/usageTracker';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheckIcon,
  UsersIcon,
  CommandLineIcon,
  CpuChipIcon,
  KeyIcon,
  BellIcon,
  FolderIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

// Components
import { NavButton, Modal } from '../components/admin/Shared';
import { DashboardTab } from '../components/admin/DashboardTab';
import { ClientsTab } from '../components/admin/ClientsTab';
import { NotificationsTab } from '../components/admin/NotificationsTab';
import { FilesTab } from '../components/admin/FilesTab';
import { ApiKeysTab } from '../components/admin/ApiKeysTab';
import { SystemTab } from '../components/admin/SystemTab';
import { LogsTab } from '../components/admin/LogsTab';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingClient, setEditingClient] = useState<UserProfile | null>(null);
  const [selectedClientConfig, setSelectedClientConfig] = useState<ClientConfig | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <ShieldCheckIcon className="w-4 h-4" /> SISTEMA OPERACIONAL
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
              {activeTab === 'dashboard' && (
                <DashboardTab
                  users={users}
                  activeUsers={activeUsers}
                  blockedUsers={blockedUsers}
                  premiumUsers={premiumUsers}
                  usageSummary={usageSummary}
                  logs={logs}
                  notifications={notifications}
                  activeNotifications={activeNotifications}
                  onResetUsage={() => { resetAllUsageStats(); refreshData(); }}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsTab
                  users={users}
                  clientConfigs={clientConfigs}
                  allUserStats={allUserStats}
                  onAddClient={() => setShowClientModal(true)}
                  onOpenConfig={openClientConfig}
                  onForceLogout={handleForceLogout}
                  onBlockUser={handleBlockUser}
                  onDeleteClient={handleDeleteClient}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab
                  notifications={notifications}
                  onOpenCreateModal={() => setShowNotificationModal(true)}
                  onToggleStatus={handleToggleNotification}
                  onDelete={handleDeleteNotification}
                />
              )}

              {activeTab === 'files' && (
                <FilesTab
                  files={files}
                  onOpenUploadModal={() => setShowFileModal(true)}
                  onToggleStatus={handleToggleFile}
                  onDelete={handleDeleteFile}
                  onViewStats={handleViewFileStats}
                />
              )}

              {activeTab === 'apikeys' && (
                <ApiKeysTab
                  clientConfigs={clientConfigs}
                  users={users}
                />
              )}

              {activeTab === 'system' && (
                <SystemTab
                  config={config}
                  onToggleModule={toggleModule}
                  onBackup={handleBackup}
                  onRefresh={refreshData}
                />
              )}

              {activeTab === 'logs' && (
                <LogsTab
                  logs={logs}
                  onRefresh={refreshData}
                />
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

export default AdminConsole;
