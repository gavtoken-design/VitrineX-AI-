
// Google Drive Integration Service
// Documentação: https://developers.google.com/drive/api/v3/about-sdk

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink: string;
    thumbnailLink?: string;
}

export interface DriveUploadResult {
    id: string;
    name: string;
    webViewLink: string;
    webContentLink: string;
}

class GoogleDriveService {
    private tokenClient: any = null;
    private accessToken: string | null = null;
    private gapiInited = false;
    private gisInited = false;

    /**
     * Inicializa a Google API
     */
    async initialize(): Promise<void> {
        if (this.gapiInited && this.gisInited) return;

        return new Promise((resolve, reject) => {
            // Load Google API Script
            if (!document.getElementById('google-api-script')) {
                const script = document.createElement('script');
                script.id = 'google-api-script';
                script.src = 'https://apis.google.com/js/api.js';
                script.onload = () => this.initializeGapi().then(resolve).catch(reject);
                script.onerror = reject;
                document.body.appendChild(script);
            } else {
                this.initializeGapi().then(resolve).catch(reject);
            }

            // Load Google Identity Services Script
            if (!document.getElementById('google-gsi-script')) {
                const gsiScript = document.createElement('script');
                gsiScript.id = 'google-gsi-script';
                gsiScript.src = 'https://accounts.google.com/gsi/client';
                gsiScript.onload = () => this.initializeGis();
                document.body.appendChild(gsiScript);
            } else {
                this.initializeGis();
            }
        });
    }

    private async initializeGapi(): Promise<void> {
        return new Promise((resolve, reject) => {
            (window as any).gapi.load('client', async () => {
                try {
                    await (window as any).gapi.client.init({
                        apiKey: GOOGLE_API_KEY,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                    });
                    this.gapiInited = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    private initializeGis(): void {
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
        });
        this.gisInited = true;
    }

    /**
     * Solicita autorização do usuário
     */
    async authorize(): Promise<void> {
        await this.initialize();

        return new Promise((resolve, reject) => {
            try {
                this.tokenClient.callback = (response: any) => {
                    if (response.error !== undefined) {
                        reject(response);
                    } else {
                        this.accessToken = response.access_token;
                        localStorage.setItem('google_drive_token', response.access_token);
                        resolve();
                    }
                };

                if (this.accessToken === null) {
                    this.tokenClient.requestAccessToken({ prompt: 'consent' });
                } else {
                    this.tokenClient.requestAccessToken({ prompt: '' });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Verifica se está autorizado
     */
    isAuthorized(): boolean {
        return this.accessToken !== null || localStorage.getItem('google_drive_token') !== null;
    }

    /**
     * Desconecta do Google Drive
     */
    disconnect(): void {
        this.accessToken = null;
        localStorage.removeItem('google_drive_token');

        if ((window as any).google?.accounts?.oauth2) {
            (window as any).google.accounts.oauth2.revoke(this.accessToken, () => {
                console.log('Token revogado');
            });
        }
    }

    /**
     * Faz upload de arquivo para o Google Drive
     */
    async uploadFile(
        file: File,
        folderName: string = 'VitrineX Criativos'
    ): Promise<DriveUploadResult> {
        if (!this.isAuthorized()) {
            await this.authorize();
        }

        try {
            // 1. Criar ou encontrar pasta
            const folderId = await this.getOrCreateFolder(folderName);

            // 2. Upload do arquivo
            const metadata = {
                name: file.name,
                mimeType: file.type,
                parents: [folderId],
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.accessToken || localStorage.getItem('google_drive_token')}`,
                    },
                    body: form,
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao fazer upload');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    }

    /**
     * Upload de múltiplos arquivos
     */
    async uploadMultipleFiles(
        files: File[],
        folderName: string = 'VitrineX Criativos',
        onProgress?: (current: number, total: number) => void
    ): Promise<DriveUploadResult[]> {
        const results: DriveUploadResult[] = [];

        for (let i = 0; i < files.length; i++) {
            const result = await this.uploadFile(files[i], folderName);
            results.push(result);

            if (onProgress) {
                onProgress(i + 1, files.length);
            }
        }

        return results;
    }

    /**
     * Obtém ou cria uma pasta
     */
    private async getOrCreateFolder(folderName: string): Promise<string> {
        try {
            // Buscar pasta existente
            const response = await (window as any).gapi.client.drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
                fields: 'files(id, name)',
            });

            if (response.result.files && response.result.files.length > 0) {
                return response.result.files[0].id;
            }

            // Criar nova pasta
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };

            const folder = await (window as any).gapi.client.drive.files.create({
                resource: folderMetadata,
                fields: 'id',
            });

            return folder.result.id;
        } catch (error) {
            console.error('Erro ao criar/buscar pasta:', error);
            throw error;
        }
    }

    /**
     * Lista arquivos da pasta
     */
    async listFiles(folderName: string = 'VitrineX Criativos'): Promise<DriveFile[]> {
        if (!this.isAuthorized()) {
            await this.authorize();
        }

        try {
            const folderId = await this.getOrCreateFolder(folderName);

            const response = await (window as any).gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink)',
                orderBy: 'modifiedTime desc',
            });

            return response.result.files || [];
        } catch (error) {
            console.error('Erro ao listar arquivos:', error);
            throw error;
        }
    }

    /**
     * Deleta um arquivo
     */
    async deleteFile(fileId: string): Promise<void> {
        if (!this.isAuthorized()) {
            await this.authorize();
        }

        try {
            await (window as any).gapi.client.drive.files.delete({
                fileId: fileId,
            });
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            throw error;
        }
    }

    /**
     * Baixa um arquivo
     */
    async downloadFile(fileId: string, fileName: string): Promise<void> {
        if (!this.isAuthorized()) {
            await this.authorize();
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken || localStorage.getItem('google_drive_token')}`,
                    },
                }
            );

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            throw error;
        }
    }

    /**
     * Obtém informações do usuário
     */
    async getUserInfo(): Promise<{ name: string; email: string; picture: string }> {
        if (!this.isAuthorized()) {
            await this.authorize();
        }

        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${this.accessToken || localStorage.getItem('google_drive_token')}`,
                },
            });

            return response.json();
        } catch (error) {
            console.error('Erro ao obter info do usuário:', error);
            throw error;
        }
    }
}

export const googleDriveService = new GoogleDriveService();
