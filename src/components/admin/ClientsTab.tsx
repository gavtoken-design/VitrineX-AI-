import React from 'react';
import {
    PlusIcon,
    CpuChipIcon,
    ArrowRightStartOnRectangleIcon,
    HandRaisedIcon,
    NoSymbolIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { UserProfile, ClientConfig } from '../../types';
import { GlobalUsageData } from '../../services/core/usageTracker';

interface ClientsTabProps {
    users: UserProfile[];
    clientConfigs: ClientConfig[];
    allUserStats: GlobalUsageData;
    onAddClient: () => void;
    onOpenConfig: (userId: string) => void;
    onForceLogout: (userId: string, email: string) => void;
    onBlockUser: (userId: string, currentStatus: string) => void;
    onDeleteClient: (userId: string, email: string) => void;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
    users,
    clientConfigs,
    allUserStats,
    onAddClient,
    onOpenConfig,
    onForceLogout,
    onBlockUser,
    onDeleteClient
}) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">👥 Gerenciamento de Clientes</h2>
                <button
                    onClick={onAddClient}
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
                            // const userConfig = clientConfigs.find(c => c.userId === user.id); // Not currently used directly in loop but good to have constraint
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
                                                onClick={() => onOpenConfig(user.id)}
                                                className="p-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 rounded transition-colors"
                                                title="Configurar Módulos"
                                            >
                                                <CpuChipIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onForceLogout(user.id, user.email)}
                                                className="p-1.5 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 rounded transition-colors"
                                                title="Desconectar"
                                            >
                                                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onBlockUser(user.id, user.status)}
                                                className="p-1.5 bg-orange-900/20 hover:bg-orange-900/40 text-orange-400 rounded transition-colors"
                                                title={user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                            >
                                                {user.status === 'blocked' ? <HandRaisedIcon className="w-4 h-4" /> : <NoSymbolIcon className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => onDeleteClient(user.id, user.email)}
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
    );
};
