import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { adminService } from '../services/adminService';
import { AppNotification } from '../types';
import { authService } from '../services/authService';

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [readIds, setReadIds] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const user = authService.getCurrentUser();

    // Load read state from local storage
    useEffect(() => {
        const saved = localStorage.getItem('vitrinex_read_notifications');
        if (saved) {
            setReadIds(JSON.parse(saved));
        }
    }, []);

    // Fetch active notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const allActive = await adminService.getActiveNotifications();
            // Filter for current user if targetUsers is specified
            const relevant = allActive.filter(n =>
                !n.targetUsers || n.targetUsers.length === 0 || (user && n.targetUsers.includes(user.id))
            );
            setNotifications(relevant);
        };

        fetchNotifications();
        // Poll every minute for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!readIds.includes(id)) {
            const newReadIds = [...readIds, id];
            setReadIds(newReadIds);
            localStorage.setItem('vitrinex_read_notifications', JSON.stringify(newReadIds));
        }
    };

    const handleMarkAllRead = () => {
        const allIds = notifications.map(n => n.id);
        const uniqueIds = Array.from(new Set([...readIds, ...allIds]));
        setReadIds(uniqueIds);
        localStorage.setItem('vitrinex_read_notifications', JSON.stringify(uniqueIds));
    };

    const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-muted hover:bg-background transition-colors relative"
                title="Notificações"
            >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in origin-top-right">
                    <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 backdrop-blur-sm">
                        <h3 className="font-bold text-title flex items-center gap-2">
                            <BellIcon className="w-4 h-4 text-primary" />
                            Notificações
                            {unreadCount > 0 && (
                                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
                                    {unreadCount} nova(s)
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted">
                                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Nenhuma notificação no momento.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map(notif => {
                                    const isRead = readIds.includes(notif.id);
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-background transition-colors relative group ${!isRead ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${notif.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                        notif.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                                            notif.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                    }`}>
                                                    {notif.type}
                                                </span>
                                                <span className="text-[10px] text-muted">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h4 className={`text-sm font-bold mb-1 ${!isRead ? 'text-primary' : 'text-title'}`}>
                                                {notif.title}
                                            </h4>
                                            <p className="text-xs text-body leading-relaxed">
                                                {notif.message}
                                            </p>

                                            {!isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                    className="absolute bottom-2 right-2 p-1.5 rounded-full bg-surface shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-primary"
                                                    title="Marcar como lida"
                                                >
                                                    <XMarkIcon className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
