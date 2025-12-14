
// Scheduler Worker - Execução Automática de Posts Agendados
import { getScheduleEntries, updateScheduleEntry } from './core/dbService';
import { ScheduleEntry } from '../types';

let workerInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Callback para quando um post é publicado
 */
type PublishCallback = (entry: ScheduleEntry) => void;
let onPublishCallback: PublishCallback | null = null;

/**
 * Callback para quando um post falha
 */
type FailCallback = (entry: ScheduleEntry, error: Error) => void;
let onFailCallback: FailCallback | null = null;

/**
 * Simula a publicação de um post
 * Em produção, aqui você integraria com APIs reais (Instagram, Facebook, etc.)
 */
const publishPost = async (entry: ScheduleEntry): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Simular delay de API (500ms - 2s)
        const delay = Math.random() * 1500 + 500;

        setTimeout(() => {
            // Simular 95% de sucesso
            const success = Math.random() > 0.05;

            if (success) {
                console.log(`✅ Post publicado com sucesso:`, {
                    id: entry.id,
                    platform: entry.platform,
                    contentId: entry.contentId,
                    datetime: entry.datetime,
                });
                resolve();
            } else {
                console.error(`❌ Falha ao publicar post:`, entry.id);
                reject(new Error('Falha na API da plataforma'));
            }
        }, delay);
    });
};

/**
 * Verifica e publica posts agendados
 */
const checkAndPublishScheduledPosts = async (userId: string): Promise<void> => {
    try {
        const now = new Date();
        const scheduledPosts = await getScheduleEntries(userId);

        // Filtrar apenas posts com status 'scheduled'
        const pendingPosts = scheduledPosts.filter(
            (entry) => entry.status === 'scheduled'
        );

        for (const entry of pendingPosts) {
            const scheduledDate = new Date(entry.datetime);

            // Se passou da hora agendada, publicar
            if (scheduledDate <= now) {
                console.log(`⏰ Hora de publicar:`, entry.id);

                try {
                    // Tentar publicar
                    await publishPost(entry);

                    // Atualizar status para 'published'
                    await updateScheduleEntry(entry.id, {
                        status: 'published',
                    });

                    // Chamar callback de sucesso
                    if (onPublishCallback) {
                        onPublishCallback(entry);
                    }

                    console.log(`✅ Status atualizado para 'published':`, entry.id);
                } catch (error) {
                    // Atualizar status para 'failed'
                    await updateScheduleEntry(entry.id, {
                        status: 'failed',
                    });

                    // Chamar callback de falha
                    if (onFailCallback) {
                        onFailCallback(entry, error as Error);
                    }

                    console.error(`❌ Status atualizado para 'failed':`, entry.id, error);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao verificar posts agendados:', error);
    }
};

/**
 * Inicia o worker de agendamento
 */
export const startSchedulerWorker = (
    userId: string,
    onPublish?: PublishCallback,
    onFail?: FailCallback
): void => {
    if (isRunning) {
        console.warn('⚠️ Worker já está rodando');
        return;
    }

    console.log('🚀 Iniciando Scheduler Worker...');

    // Salvar callbacks
    onPublishCallback = onPublish || null;
    onFailCallback = onFail || null;

    // Verificar imediatamente
    checkAndPublishScheduledPosts(userId);

    // Verificar a cada 1 minuto (60000ms)
    workerInterval = setInterval(() => {
        checkAndPublishScheduledPosts(userId);
    }, 60000);

    isRunning = true;
    console.log('✅ Scheduler Worker iniciado (verificação a cada 1 minuto)');
};

/**
 * Para o worker de agendamento
 */
export const stopSchedulerWorker = (): void => {
    if (workerInterval) {
        clearInterval(workerInterval);
        workerInterval = null;
        isRunning = false;
        onPublishCallback = null;
        onFailCallback = null;
        console.log('🛑 Scheduler Worker parado');
    }
};

/**
 * Verifica se o worker está rodando
 */
export const isWorkerRunning = (): boolean => {
    return isRunning;
};

/**
 * Força verificação imediata (útil para testes)
 */
export const forceCheck = async (userId: string): Promise<void> => {
    console.log('🔄 Forçando verificação imediata...');
    await checkAndPublishScheduledPosts(userId);
};
