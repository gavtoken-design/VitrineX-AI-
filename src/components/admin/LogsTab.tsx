import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { AdminLog } from '../../types';

interface LogsTabProps {
    logs: AdminLog[];
    onRefresh: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onRefresh }) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">📋 Logs do Sistema</h2>
                <button
                    onClick={onRefresh}
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
    );
};
