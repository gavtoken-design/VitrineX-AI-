import React from 'react';
import {
    DocumentArrowUpIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    TrashIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import { FileDistribution } from '../../types';

interface FilesTabProps {
    files: FileDistribution[];
    onOpenUploadModal: () => void;
    onToggleStatus: (id: string) => void;
    onDelete: (id: string, fileName: string) => void;
    onViewStats: (file: FileDistribution) => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({
    files,
    onOpenUploadModal,
    onToggleStatus,
    onDelete,
    onViewStats
}) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">📁 Distribuição de Arquivos</h2>
                <button
                    onClick={onOpenUploadModal}
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
                                </div>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onToggleStatus(file.id)}
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
                                            onClick={() => onViewStats(file)}
                                            className="p-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 rounded transition-colors"
                                            title="Ver Estatísticas"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(file.id, file.fileName)}
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
    );
};
