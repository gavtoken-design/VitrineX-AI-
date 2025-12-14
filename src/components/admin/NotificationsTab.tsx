import React from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import { AppNotification } from '../../types';

interface NotificationsTabProps {
    notifications: AppNotification[];
    onOpenCreateModal: () => void;
    onToggleStatus: (id: string) => void;
    onDelete: (id: string) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
    notifications,
    onOpenCreateModal,
    onToggleStatus,
    onDelete
}) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">🔔 Sistema de Notificações</h2>
                <button
                    onClick={onOpenCreateModal}
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
                                    onClick={() => onToggleStatus(notif.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold ${notif.isActive
                                        ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40'
                                        : 'bg-green-900/20 text-green-400 hover:bg-green-900/40'
                                        }`}
                                >
                                    {notif.isActive ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                    onClick={() => onDelete(notif.id)}
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
    );
};
