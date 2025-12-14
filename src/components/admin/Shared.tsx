import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// --- Shared Components for Admin Panel ---

interface NavButtonProps {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: number;
}

export const NavButton: React.FC<NavButtonProps> = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded text-sm transition-all ${active ? 'bg-gray-800 text-white border-l-2 border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
    >
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            {label}
        </div>
        {badge !== undefined && badge > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
        )}
    </button>
);

interface MetricCardProps {
    title: string;
    value: number | string;
    icon: any;
    color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-900/20 border-blue-900 text-blue-400',
        green: 'bg-green-900/20 border-green-900 text-green-400',
        red: 'bg-red-900/20 border-red-900 text-red-400',
        purple: 'bg-purple-900/20 border-purple-900 text-purple-400',
        yellow: 'bg-yellow-900/20 border-yellow-900 text-yellow-500', // Added yellow support
    } as Record<string, string>;

    return (
        <div className={`${colorClasses[color] || colorClasses.blue} border rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8" />
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <p className="text-sm uppercase tracking-wider opacity-80">{title}</p>
        </div>
    );
};

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);
