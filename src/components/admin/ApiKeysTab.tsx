import React from 'react';
import { ServerIcon } from '@heroicons/react/24/outline';
import { ClientConfig, UserProfile } from '../../types';

interface ApiKeysTabProps {
    clientConfigs: ClientConfig[];
    users: UserProfile[];
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({
    clientConfigs,
    users
}) => {
    return (
        <>
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
    );
};
