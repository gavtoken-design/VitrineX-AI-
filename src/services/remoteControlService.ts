
export interface SystemStatus {
    active: boolean;
    message: string;
    minVersion: string;
}

const STATUS_URL = './status.json';

export const remoteControlService = {
    checkStatus: async (): Promise<SystemStatus> => {
        try {
            // Adiciona timestamp para evitar cache do navegador
            const response = await fetch(`${STATUS_URL}?t=${Date.now()}`);
            if (!response.ok) {
                // Se falhar o fetch (ex: offline), assume que está ativo para não bloquear usuário sem internet
                return { active: true, message: '', minVersion: '0.0.0' };
            }
            return await response.json();
        } catch (error) {
            console.warn('Falha ao verificar status remoto:', error);
            return { active: true, message: '', minVersion: '0.0.0' };
        }
    }
};
