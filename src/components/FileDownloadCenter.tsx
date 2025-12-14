import React from 'react';
import { useAvailableFiles } from '../hooks/useAvailableFiles';
import {
    DocumentTextIcon,
    ArrowDownTrayIcon,
    FolderIcon,
    DocumentIcon,
    PhotoIcon,
    SpeakerWaveIcon,
    FilmIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from '../contexts/ToastContext';

const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt'].includes(type)) return DocumentTextIcon;
    if (['jpg', 'png', 'jpeg', 'gif'].includes(type)) return PhotoIcon;
    if (['mp3', 'wav'].includes(type)) return SpeakerWaveIcon;
    if (['mp4', 'mov'].includes(type)) return FilmIcon;
    if (['zip', 'rar'].includes(type)) return FolderIcon;
    return DocumentIcon;
};

const FileDownloadCenter: React.FC = () => {
    const { files, loading, logDownload } = useAvailableFiles();
    const { addToast } = useToast();

    const handleDownload = async (file: any) => {
        try {
            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = file.fileUrl;
            link.download = file.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Log the action
            await logDownload(file.id);

            addToast({ type: 'success', message: `Download de ${file.fileName} iniciado!` });
        } catch (error) {
            addToast({ type: 'error', message: 'Erro ao baixar arquivo.' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center p-8 bg-surface border border-dashed border-border rounded-xl">
                <FolderIcon className="w-12 h-12 mx-auto text-muted mb-3 opacity-50" />
                <p className="text-muted font-medium">Nenhum arquivo disponível para você no momento.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(file => {
                const Icon = getFileIcon(file.fileType);
                return (
                    <div key={file.id} className="bg-surface border border-border rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-muted bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {file.fileType}
                            </span>
                        </div>

                        <h3 className="font-bold text-title mb-1 line-clamp-1" title={file.fileName}>
                            {file.fileName}
                        </h3>

                        {file.description && (
                            <p className="text-xs text-muted mb-4 line-clamp-2 min-h-[2.5em]">
                                {file.description}
                            </p>
                        )}

                        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                            <div className="flex gap-1 flex-wrap">
                                {file.tags && file.tags.map((tag: string, idx: number) => (
                                    <span key={idx} className="text-[10px] text-muted bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <button
                                onClick={() => handleDownload(file)}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Baixar
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FileDownloadCenter;
