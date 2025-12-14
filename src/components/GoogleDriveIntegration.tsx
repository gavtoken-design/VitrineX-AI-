
import React, { useState, useEffect } from 'react';
import { googleDriveService, DriveFile } from '../services/googleDriveService';
import {
    CloudArrowUpIcon,
    CloudArrowDownIcon,
    FolderIcon,
    TrashIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

export interface GoogleDriveIntegrationProps {
    onFileUploaded?: (fileUrl: string) => void;
    autoUploadFiles?: File[];
    folderName?: string;
}

const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({
    onFileUploaded,
    autoUploadFiles,
    folderName = 'VitrineX Criativos',
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

    const { addToast } = useToast();

    useEffect(() => {
        checkConnection();
    }, []);

    useEffect(() => {
        if (autoUploadFiles && autoUploadFiles.length > 0 && isConnected) {
            handleUploadMultiple(autoUploadFiles);
        }
    }, [autoUploadFiles, isConnected]);

    const checkConnection = () => {
        const connected = googleDriveService.isAuthorized();
        setIsConnected(connected);
        if (connected) {
            loadUserInfo();
            loadFiles();
        }
    };

    const handleConnect = async () => {
        try {
            setIsLoading(true);
            await googleDriveService.authorize();
            setIsConnected(true);
            await loadUserInfo();
            await loadFiles();

            addToast({
                type: 'success',
                message: 'Conectado ao Google Drive com sucesso!',
            });
        } catch (error) {
            console.error('Erro ao conectar:', error);
            addToast({
                type: 'error',
                message: 'Erro ao conectar ao Google Drive. Tente novamente.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = () => {
        googleDriveService.disconnect();
        setIsConnected(false);
        setUserInfo(null);
        setFiles([]);

        addToast({
            type: 'info',
            message: 'Desconectado do Google Drive.',
        });
    };

    const loadUserInfo = async () => {
        try {
            const info = await googleDriveService.getUserInfo();
            setUserInfo(info);
        } catch (error) {
            console.error('Erro ao carregar info do usuário:', error);
        }
    };

    const loadFiles = async () => {
        try {
            setIsLoading(true);
            const driveFiles = await googleDriveService.listFiles(folderName);
            setFiles(driveFiles);
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
            addToast({
                type: 'error',
                message: 'Erro ao carregar arquivos do Drive.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        const filesArray = Array.from(selectedFiles);
        await handleUploadMultiple(filesArray);
    };

    const handleUploadMultiple = async (filesToUpload: File[]) => {
        try {
            setIsLoading(true);
            setUploadProgress({ current: 0, total: filesToUpload.length });

            const results = await googleDriveService.uploadMultipleFiles(
                filesToUpload,
                folderName,
                (current, total) => {
                    setUploadProgress({ current, total });
                }
            );

            setUploadProgress(null);
            await loadFiles();

            addToast({
                type: 'success',
                message: `${results.length} arquivo(s) enviado(s) com sucesso!`,
            });

            // Notificar callback se fornecido
            if (onFileUploaded && results.length > 0) {
                results.forEach(result => onFileUploaded(result.webViewLink));
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            addToast({
                type: 'error',
                message: 'Erro ao enviar arquivos. Tente novamente.',
            });
        } finally {
            setIsLoading(false);
            setUploadProgress(null);
        }
    };

    const handleDownload = async (file: DriveFile) => {
        try {
            await googleDriveService.downloadFile(file.id, file.name);
            addToast({
                type: 'success',
                message: `Arquivo "${file.name}" baixado!`,
            });
        } catch (error) {
            console.error('Erro ao baixar:', error);
            addToast({
                type: 'error',
                message: 'Erro ao baixar arquivo.',
            });
        }
    };

    const handleDelete = async (file: DriveFile) => {
        if (!confirm(`Deseja realmente deletar "${file.name}"?`)) return;

        try {
            await googleDriveService.deleteFile(file.id);
            await loadFiles();
            addToast({
                type: 'success',
                message: 'Arquivo deletado com sucesso!',
            });
        } catch (error) {
            console.error('Erro ao deletar:', error);
            addToast({
                type: 'error',
                message: 'Erro ao deletar arquivo.',
            });
        }
    };

    const formatFileSize = (bytes: string): string => {
        const size = parseInt(bytes);
        if (isNaN(size)) return '0 B';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    if (!isConnected) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <CloudArrowUpIcon className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Conectar ao Google Drive</h3>
                <p className="text-gray-400 mb-6">
                    Salve seus criativos automaticamente no seu Google Drive pessoal
                </p>
                <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Conectando...
                        </>
                    ) : (
                        <>
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            Conectar com Google
                        </>
                    )}
                </button>
                <p className="text-xs text-gray-600 mt-4">
                    Seus arquivos ficam seguros no seu próprio Drive
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Google Drive Conectado</h3>
                        {userInfo && (
                            <p className="text-gray-400 text-sm">{userInfo.email}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadFiles}
                        disabled={isLoading}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Atualizar"
                    >
                        <ArrowPathIcon className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleDisconnect}
                        className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded text-sm transition-colors"
                    >
                        Desconectar
                    </button>
                </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="p-4 bg-blue-900/20 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-400">Enviando arquivos...</span>
                        <span className="text-sm text-blue-400">
                            {uploadProgress.current} / {uploadProgress.total}
                        </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Upload Button */}
            <div className="p-4 border-b border-gray-800">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Enviar Arquivos para o Drive
                    <input
                        type="file"
                        multiple
                        onChange={handleUpload}
                        className="hidden"
                        disabled={isLoading}
                    />
                </label>
            </div>

            {/* Files List */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase">
                        Pasta: {folderName}
                    </h4>
                    <span className="text-xs text-gray-600">
                        {files.length} arquivo(s)
                    </span>
                </div>

                {files.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                        <FolderIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum arquivo ainda</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {formatFileSize(file.size)} · {new Date(file.modifiedTime).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                        title="Baixar"
                                    >
                                        <CloudArrowDownIcon className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <a
                                        href={file.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                        title="Abrir no Drive"
                                    >
                                        <FolderIcon className="w-4 h-4 text-green-400" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                        title="Deletar"
                                    >
                                        <TrashIcon className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleDriveIntegration;
