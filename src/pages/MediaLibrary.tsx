
import React, { useState, useEffect } from 'react';
import { mediaService, MediaImage, MediaVideo } from '../services/media/mediaService';
import MediaSearch, { MediaSearchFilters } from '../components/MediaSearch';
import MediaGallery from '../components/MediaGallery';
import { PhotoIcon, VideoCameraIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

type MediaType = 'image' | 'video';

const MediaLibrary: React.FC = () => {
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [items, setItems] = useState<(MediaImage | MediaVideo)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [currentQuery, setCurrentQuery] = useState('');
    const [currentFilters, setCurrentFilters] = useState<MediaSearchFilters>({});
    const [source, setSource] = useState<string>('');
    const [showCurated, setShowCurated] = useState(true);

    const { addToast } = useToast();

    // Load curated images on mount
    useEffect(() => {
        loadCuratedImages();
    }, []);

    const loadCuratedImages = async () => {
        try {
            setIsLoading(true);
            setShowCurated(true);
            const result = await mediaService.getCuratedImages(1, 20);
            setItems(result.items);
            setTotalResults(result.total);
            setHasMore(result.hasMore);
            setSource(result.source);
            setCurrentPage(1);
            setCurrentQuery('');
        } catch (error) {
            console.error('Erro ao carregar imagens curadas:', error);
            addToast({
                type: 'error',
                message: 'Erro ao carregar imagens. Tente novamente.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string, filters: MediaSearchFilters) => {
        try {
            setIsLoading(true);
            setShowCurated(false);
            setCurrentQuery(query);
            setCurrentFilters(filters);
            setCurrentPage(1);

            let result;
            if (mediaType === 'image') {
                result = await mediaService.searchImages(query, {
                    page: 1,
                    perPage: 20,
                    ...filters,
                });
            } else {
                result = await mediaService.searchVideos(query, {
                    page: 1,
                    perPage: 20,
                    ...filters,
                });
            }

            setItems(result.items);
            setTotalResults(result.total);
            setHasMore(result.hasMore);
            setSource(result.source);

            addToast({
                type: 'success',
                message: `${result.items.length} ${mediaType === 'image' ? 'imagens' : 'vídeos'} encontrados!`,
            });
        } catch (error: any) {
            console.error('Erro na busca:', error);
            addToast({
                type: 'error',
                message: error.message || 'Erro ao buscar. Tente novamente.',
            });
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (!hasMore || isLoading) return;

        try {
            setIsLoading(true);
            const nextPage = currentPage + 1;

            let result;
            if (showCurated) {
                result = await mediaService.getCuratedImages(nextPage, 20);
            } else if (mediaType === 'image') {
                result = await mediaService.searchImages(currentQuery, {
                    page: nextPage,
                    perPage: 20,
                    ...currentFilters,
                });
            } else {
                result = await mediaService.searchVideos(currentQuery, {
                    page: nextPage,
                    perPage: 20,
                    ...currentFilters,
                });
            }

            setItems([...items, ...result.items]);
            setHasMore(result.hasMore);
            setCurrentPage(nextPage);
        } catch (error) {
            console.error('Erro ao carregar mais:', error);
            addToast({
                type: 'error',
                message: 'Erro ao carregar mais resultados.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMediaTypeChange = (type: MediaType) => {
        setMediaType(type);
        setItems([]);
        setCurrentPage(1);
        setHasMore(false);
        setTotalResults(0);
        setCurrentQuery('');
        setShowCurated(type === 'image');

        if (type === 'image') {
            loadCuratedImages();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <PhotoIcon className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold">Biblioteca de Mídia</h1>
                    </div>
                    <p className="text-gray-400">
                        Milhões de imagens e vídeos profissionais gratuitos para seus projetos
                    </p>
                </div>

                {/* Media Type Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => handleMediaTypeChange('image')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${mediaType === 'image'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <PhotoIcon className="w-5 h-5" />
                        Imagens
                    </button>
                    <button
                        onClick={() => handleMediaTypeChange('video')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${mediaType === 'video'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <VideoCameraIcon className="w-5 h-5" />
                        Vídeos
                    </button>
                    {mediaType === 'image' && (
                        <button
                            onClick={loadCuratedImages}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ml-auto ${showCurated
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Curadas
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="mb-8">
                    <MediaSearch
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        placeholder={`Buscar ${mediaType === 'image' ? 'imagens' : 'vídeos'}...`}
                    />
                </div>

                {/* Results Info */}
                {items.length > 0 && (
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">
                            {showCurated ? (
                                <>
                                    <span className="text-purple-400 font-semibold">Curadas</span> · {totalResults.toLocaleString()} imagens disponíveis
                                </>
                            ) : (
                                <>
                                    Mostrando {items.length} de {totalResults.toLocaleString()} resultados
                                    {currentQuery && (
                                        <> para <span className="text-white font-semibold">"{currentQuery}"</span></>
                                    )}
                                </>
                            )}
                        </p>
                        {source && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Fonte:</span>
                                <span className="px-2 py-1 bg-gray-800 rounded uppercase font-bold">
                                    {source}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Gallery */}
                <MediaGallery
                    items={items}
                    type={mediaType}
                    isLoading={isLoading}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                />

                {/* Empty State */}
                {items.length === 0 && !isLoading && !showCurated && (
                    <div className="text-center py-16">
                        <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">
                            Faça uma busca para começar
                        </h3>
                        <p className="text-gray-500">
                            Digite um termo acima para encontrar {mediaType === 'image' ? 'imagens' : 'vídeos'} incríveis
                        </p>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <h4 className="text-2xl font-bold text-blue-500 mb-2">Milhões</h4>
                            <p className="text-gray-400 text-sm">de imagens e vídeos profissionais</p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-green-500 mb-2">100% Grátis</h4>
                            <p className="text-gray-400 text-sm">uso comercial permitido</p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-purple-500 mb-2">Alta Qualidade</h4>
                            <p className="text-gray-400 text-sm">fotos e vídeos profissionais</p>
                        </div>
                    </div>
                    <p className="text-center text-gray-600 text-xs mt-6">
                        Powered by Pexels, Unsplash e Pixabay
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MediaLibrary;
