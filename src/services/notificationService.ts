
// Notification Service - Sistema de Notificações do Navegador

/**
 * Solicita permissão para enviar notificações
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('⚠️ Este navegador não suporta notificações');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        console.warn('⚠️ Permissão de notificações negada pelo usuário');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Erro ao solicitar permissão de notificações:', error);
        return false;
    }
};

/**
 * Verifica se notificações estão habilitadas
 */
export const areNotificationsEnabled = (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Envia uma notificação
 */
export const sendNotification = (
    title: string,
    options?: NotificationOptions
): Notification | null => {
    if (!areNotificationsEnabled()) {
        console.warn('⚠️ Notificações não estão habilitadas');
        return null;
    }

    try {
        const notification = new Notification(title, {
            icon: '/logo.png',
            badge: '/badge.png',
            ...options,
        });

        // Auto-fechar após 5 segundos
        setTimeout(() => {
            notification.close();
        }, 5000);

        return notification;
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        return null;
    }
};

/**
 * Notifica quando um post é publicado com sucesso
 */
export const notifyPostPublished = (
    platform: string,
    contentName: string
): void => {
    sendNotification('✅ Postagem Publicada!', {
        body: `Seu conteúdo "${contentName}" foi publicado no ${platform}`,
        icon: '/logo.png',
        tag: 'post-published',
    });
};

/**
 * Notifica quando um post falha
 */
export const notifyPostFailed = (
    platform: string,
    contentName: string,
    error?: string
): void => {
    sendNotification('❌ Falha na Publicação', {
        body: `Erro ao publicar "${contentName}" no ${platform}${error ? `: ${error}` : ''}`,
        icon: '/logo.png',
        tag: 'post-failed',
    });
};

/**
 * Notifica quando um post está próximo (5 minutos antes)
 */
export const notifyPostUpcoming = (
    platform: string,
    contentName: string,
    minutesUntil: number
): void => {
    sendNotification('⏰ Postagem Agendada em Breve', {
        body: `"${contentName}" será publicado no ${platform} em ${minutesUntil} minuto(s)`,
        icon: '/logo.png',
        tag: 'post-upcoming',
    });
};

/**
 * Notifica quando um agendamento é criado
 */
export const notifyScheduleCreated = (
    platform: string,
    datetime: string
): void => {
    const date = new Date(datetime);
    const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    sendNotification('📅 Agendamento Criado', {
        body: `Postagem agendada para ${formattedDate} às ${formattedTime} no ${platform}`,
        icon: '/logo.png',
        tag: 'schedule-created',
    });
};

/**
 * Notifica quando um agendamento é cancelado
 */
export const notifyScheduleCancelled = (
    platform: string
): void => {
    sendNotification('🗑️ Agendamento Cancelado', {
        body: `Agendamento do ${platform} foi cancelado`,
        icon: '/logo.png',
        tag: 'schedule-cancelled',
    });
};

/**
 * Solicita permissão ao carregar a aplicação
 */
export const initializeNotifications = async (): Promise<void> => {
    const hasPermission = await requestNotificationPermission();

    if (hasPermission) {
        console.log('✅ Notificações habilitadas');
    } else {
        console.log('ℹ️ Notificações desabilitadas');
    }
};
