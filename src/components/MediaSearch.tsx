
import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface MediaSearchProps {
    onSearch: (query: string, filters: MediaSearchFilters) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export interface MediaSearchFilters {
    orientation?: 'landscape' | 'portrait' | 'square' | 'all';
    color?: string;
    orderBy?: 'relevant' | 'latest' | 'popular';
}

const MediaSearch: React.FC<MediaSearchProps> = ({
    onSearch,
    isLoading = false,
    placeholder = 'Buscar imagens e vídeos...',
}) => {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<MediaSearchFilters>({
        orientation: 'all',
        color: '',
        orderBy: 'relevant',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim(), filters);
        }
    };

    const handleClearFilters = () => {
        setFilters({
            orientation: 'all',
            color: '',
            orderBy: 'relevant',
        });
    };

    const hasActiveFilters = filters.orientation !== 'all' || filters.color || filters.orderBy !== 'relevant';

    return (
        <div className="w-full">
            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            disabled={isLoading}
                        />
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${showFilters || hasActiveFilters
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                            }`}
                    >
                        <FunnelIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Filtros</span>
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                        )}
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Buscando...</span>
                            </div>
                        ) : (
                            'Buscar'
                        )}
                    </button>
                </div>
            </form>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Filtros de Busca</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <XMarkIcon className="w-4 h-4" />
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Orientation Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                                Orientação
                            </label>
                            <select
                                value={filters.orientation}
                                onChange={(e) => setFilters({ ...filters, orientation: e.target.value as any })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">Todas</option>
                                <option value="landscape">Paisagem</option>
                                <option value="portrait">Retrato</option>
                                <option value="square">Quadrado</option>
                            </select>
                        </div>

                        {/* Color Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                                Cor Predominante
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { value: '', label: 'Todas', color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500' },
                                    { value: 'red', label: 'Vermelho', color: 'bg-red-500' },
                                    { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
                                    { value: 'yellow', label: 'Amarelo', color: 'bg-yellow-500' },
                                    { value: 'green', label: 'Verde', color: 'bg-green-500' },
                                    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
                                    { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
                                    { value: 'black', label: 'Preto', color: 'bg-black border border-gray-600' },
                                    { value: 'white', label: 'Branco', color: 'bg-white border border-gray-600' },
                                ].map((colorOption) => (
                                    <button
                                        key={colorOption.value}
                                        type="button"
                                        onClick={() => setFilters({ ...filters, color: colorOption.value })}
                                        className={`w-8 h-8 rounded-full ${colorOption.color} ${filters.color === colorOption.value
                                                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                                                : 'opacity-70 hover:opacity-100'
                                            } transition-all`}
                                        title={colorOption.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Order By Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                                Ordenar Por
                            </label>
                            <select
                                value={filters.orderBy}
                                onChange={(e) => setFilters({ ...filters, orderBy: e.target.value as any })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            >
                                <option value="relevant">Mais Relevante</option>
                                <option value="latest">Mais Recente</option>
                                <option value="popular">Mais Popular</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaSearch;
