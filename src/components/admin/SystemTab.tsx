import React from 'react';
import {
    PowerIcon,
    ServerIcon,
    ArchiveBoxIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AdminConfig } from '../../types';

interface SystemTabProps {
    config: AdminConfig | null;
    onToggleModule: (moduleKey: string) => void;
    onBackup: () => void;
    onRefresh: () => void;
}

export const SystemTab: React.FC<SystemTabProps> = ({
    config,
    onToggleModule,
    onBackup,
    onRefresh
}) => {
    if (!config) return null;

    return (
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
                                    onClick={() => onToggleModule(key)}
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
                            onClick={onBackup}
                            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded transition-colors"
                        >
                            <ArchiveBoxIcon className="w-5 h-5" /> Executar Backup Manual
                        </button>
                        <button
                            onClick={onRefresh}
                            className="w-full flex items-center justify-center gap-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 py-3 rounded transition-colors border border-blue-900"
                        >
                            <ArrowPathIcon className="w-5 h-5" /> Recarregar Dados
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
