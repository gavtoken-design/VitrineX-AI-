import React from 'react';
import {
    UsersIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    ShieldCheckIcon,
    BanknotesIcon,
    SparklesIcon,
    EyeIcon,
    ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import { MetricCard } from './Shared';
import { UserProfile, AdminLog, AppNotification } from '../../types';
import { GlobalUsageData } from '../../services/core/usageTracker';

interface DashboardTabProps {
    users: UserProfile[];
    activeUsers: number;
    blockedUsers: number;
    premiumUsers: number;
    usageSummary: { textRequests: number; imageRequests: number; videoRequests: number; totalCost: number };
    logs: AdminLog[];
    notifications: AppNotification[];
    activeNotifications: number;
    onResetUsage: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
    users,
    activeUsers,
    blockedUsers,
    premiumUsers,
    usageSummary,
    logs,
    notifications,
    activeNotifications,
    onResetUsage
}) => {
    return (
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
                    <button onClick={onResetUsage} className="text-xs text-red-500 hover:text-red-400">Resetar Global</button>
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
    );
};
