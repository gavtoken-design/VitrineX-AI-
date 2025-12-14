import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { getCurrentUser } from '../services/authService';
import { FileDistribution } from '../types';

export const useAvailableFiles = () => {
    const [files, setFiles] = useState<FileDistribution[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFiles = useCallback(async () => {
        setLoading(true);
        try {
            const user = await getCurrentUser();
            const userId = user?.id || 'mock-user-123'; // Fallback

            // In a real app, we would get the IP from a service or the backend
            const mockIP = '127.0.0.1';

            const availableFiles = await adminService.getFilesForUser(userId, mockIP);
            setFiles(availableFiles);
        } catch (error) {
            console.error("Error loading files:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const logDownload = async (fileId: string) => {
        try {
            const user = await getCurrentUser();
            const userId = user?.id || 'mock-user-123';
            await adminService.logFileDownload(fileId, userId, '127.0.0.1', navigator.userAgent);

            // Update local state to reflect new download count if necessary
            // (Though adminService.getFilesForUser might not return realtime counts unless refreshed)
            loadFiles();
        } catch (error) {
            console.error("Error logging download:", error);
        }
    };

    return {
        files,
        loading,
        refresh: loadFiles,
        logDownload
    };
};
