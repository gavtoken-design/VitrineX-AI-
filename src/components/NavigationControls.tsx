import React from 'react';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '../hooks/useNavigate';

interface NavigationControlsProps {
    className?: string;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ className = '' }) => {
    const { activeModule, navigateTo } = useNavigate();

    const handleBack = () => {
        // Logic: If in a sub-module or specific view, go back to Dashboard.
        // Ideally, this should use a real history stack, but for this SPA, Dashboard is the "Home".
        if (activeModule !== 'Dashboard') {
            navigateTo('Dashboard');
        }
    };

    const handleRefresh = () => {
        // Hard refresh to reload the app completely, clearing potential React state bugs
        window.location.reload();
    };

    // Only show Back button if not on Dashboard
    const showBack = activeModule !== 'Dashboard';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showBack && (
                <button
                    onClick={handleBack}
                    className="p-2 rounded-lg bg-surface hover:bg-background border border-border text-muted hover:text-title transition-colors shadow-sm"
                    title="Voltar ao Início"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
            )}
            <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-surface hover:bg-background border border-border text-muted hover:text-title transition-colors shadow-sm"
                title="Atualizar Aplicativo"
            >
                <ArrowPathIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default NavigationControls;
