
import React, { useState } from 'react';
import { MediaImage, MediaVideo } from '../services/mediaService';
import {
    ArrowDownTrayIcon,
    HeartIcon,
    EyeIcon,
    XMarkIcon,
    CheckCircleIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export interface MediaGalleryProps {
    items: (MediaImage | MediaVideo)[];
    type: 'image' | 'video';
    isLoading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    onSelect?: (item: MediaImage | MediaVideo) => void;
    selectedItems?: string[];
    showSelection?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
    items,
    type,
    isLoading = false,
    onLoadMore,
    hasMore = false,
    onSelect,
    selectedItems = [],
    showSelection = false,
}) => {
    const [previewItem, setPreviewItem] = useState<MediaImage | MediaVideo | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const toggleFavorite = (id: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(id)) {
            newFavorites.delete(id);
        } else {
            newFavorites.add(id);
        }
        setFavorites(newFavorites);
    };

    const handleDownload = async (item: MediaImage | MediaVideo) => {
        try {
            const response = await fetch(item.downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.id}.${type === 'image' ? 'jpg' : 'mp4'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar:', error);
        }
    };

    const isSelected = (id: string) => selectedItems.includes(id);

    if (items.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <PhotoIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum resultado encontrado</p>
                <p className="text-sm mt-1">Tente usar outros termos de busca</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => showSelection && onSelect ? onSelect(item) : setPreviewItem(item)}
                    >
                        {/* Image/Video Thumbnail */}
                        <img
                            src={item.thumbnail}
                            alt={'alt' in item ? item.alt : 'Video thumbnail'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />

                        {/* Video Duration Badge */}
                        {type === 'video' && 'duration' in item && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                                {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                            </div>
                        )}

                        {/* Selection Checkbox */}
                        {showSelection && (
                            <div className="absolute top-2 left-2">
                                {isSelected(item.id) ? (
                                    <CheckCircleIcon className="w-6 h-6 text-blue-500 bg-white rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 border-2 border-white rounded-full bg-black/50"></div>
                                )}
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                {/* Photographer Info */}
                                <p className="text-white text-xs font-medium truncate mb-2">
                                    {'photographer' in item ? item.photographer : item.user}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(item.id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded text-white text-xs transition-colors"
                                    >
                                        {favorites.has(item.id) ? (
                                            <HeartSolidIcon className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <HeartIcon className="w-4 h-4" />
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewItem(item);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded text-white text-xs transition-colors"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(item);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs transition-colors"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Source Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded uppercase font-bold">
                            {item.source}
                        </div>
                    </div>
                ))}

                {/* Loading Skeletons */}
                {isLoading &&
                    Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className="aspect-square bg-gray-800 rounded-lg animate-pulse"
                        />
                    ))}
            </div>

            {/* Load More Button */}
            {hasMore && !isLoading && (
                <div className="mt-8 text-center">
                    <button
                        onClick={onLoadMore}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Carregar Mais
                    </button>
                </div>
            )}

            {/* Preview Modal */}
            {previewItem && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        className="max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <div>
                                <h3 className="text-white font-semibold">
                                    {'alt' in previewItem ? previewItem.alt : 'Vídeo'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Por {'photographer' in previewItem ? previewItem.photographer : previewItem.user}
                                </p>
                            </div>
                            <button
                                onClick={() => setPreviewItem(null)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4">
                            {type === 'image' && 'url' in previewItem && (
                                <img
                                    src={previewItem.url}
                                    alt={'alt' in previewItem ? previewItem.alt : ''}
                                    className="w-full h-auto max-h-[70vh] object-contain rounded"
                                />
                            )}
                            {type === 'video' && 'downloadUrl' in previewItem && (
                                <video
                                    src={previewItem.downloadUrl}
                                    controls
                                    className="w-full h-auto max-h-[70vh] rounded"
                                />
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-4 border-t border-gray-800">
                            <button
                                onClick={() => handleDownload(previewItem)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Baixar
                            </button>
                            {showSelection && onSelect && (
                                <button
                                    onClick={() => {
                                        onSelect(previewItem);
                                        setPreviewItem(null);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Selecionar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
