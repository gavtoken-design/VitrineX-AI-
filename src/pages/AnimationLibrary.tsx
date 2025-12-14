
import React, { useState, useEffect } from 'react';
import { lottieService, LottieAnimation as LottieAnimationType } from '../services/lottieService';
import LottieAnimation from '../components/LottieAnimation';
import {
    MagnifyingGlassIcon,
    SparklesIcon,
    ArrowDownTrayIcon,
    PlayIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

const categories = [
    { id: 'loading', label: '⏳ Loading', emoji: '⏳' },
    { id: 'success', label: '✅ Success', emoji: '✅' },
    { id: 'error', label: '❌ Error', emoji: '❌' },
    { id: 'social', label: '📱 Social', emoji: '📱' },
    { id: 'business', label: '💼 Business', emoji: '💼' },
    { id: 'nature', label: '🌿 Nature', emoji: '🌿' },
    { id: 'technology', label: '💻 Tech', emoji: '💻' },
    { id: 'food', label: '🍔 Food', emoji: '🍔' },
    { id: 'sports', label: '⚽ Sports', emoji: '⚽' },
    { id: 'education', label: '📚 Education', emoji: '📚' },
];

const AnimationLibrary: React.FC = () => {
    const [animations, setAnimations] = useState<LottieAnimationType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [previewAnimation, setPreviewAnimation] = useState<LottieAnimationType | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { addToast } = useToast();

    // Load featured animations on mount
    useEffect(() => {
        loadFeaturedAnimations();
    }, []);

    const loadFeaturedAnimations = async () => {
        try {
            setIsLoading(true);
            const result = await lottieService.getFeaturedAnimations();
            setAnimations(result.data);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Erro ao carregar animações em destaque:', error);
            addToast({
                type: 'error',
                message: 'Erro ao carregar animações. Tente novamente.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setIsLoading(true);
            setCurrentPage(1);
            const result = await lottieService.searchAnimations(searchQuery, 1, 20);
            setAnimations(result.data);
            setTotalPages(result.total_pages);
            setSelectedCategory(null);

            addToast({
                type: 'success',
                message: `${result.data.length} animações encontradas!`,
            });
        } catch (error) {
            console.error('Erro na busca:', error);
            addToast({
                type: 'error',
                message: 'Erro ao buscar animações.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = async (categoryId: string) => {
        try {
            setIsLoading(true);
            setCurrentPage(1);
            setSelectedCategory(categoryId);
            const result = await lottieService.getAnimationsByCategory(categoryId, 1, 20);
            setAnimations(result.data);
            setTotalPages(result.total_pages);
        } catch (error) {
            console.error('Erro ao carregar categoria:', error);
            addToast({
                type: 'error',
                message: 'Erro ao carregar categoria.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadJSON = async (animation: LottieAnimationType) => {
        try {
            const jsonData = await lottieService.downloadAnimationJSON(animation.jsonUrl);
            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${animation.name.replace(/\s+/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            addToast({
                type: 'success',
                message: 'Animação baixada com sucesso!',
            });
        } catch (error) {
            console.error('Erro ao baixar animação:', error);
            addToast({
                type: 'error',
                message: 'Erro ao baixar animação.',
            });
        }
    };

    const handleLoadMore = async () => {
        if (currentPage >= totalPages || isLoading) return;

        try {
            setIsLoading(true);
            const nextPage = currentPage + 1;

            let result;
            if (selectedCategory) {
                result = await lottieService.getAnimationsByCategory(selectedCategory, nextPage, 20);
            } else if (searchQuery) {
                result = await lottieService.searchAnimations(searchQuery, nextPage, 20);
            } else {
                return;
            }

            setAnimations([...animations, ...result.data]);
            setCurrentPage(nextPage);
        } catch (error) {
            console.error('Erro ao carregar mais:', error);
            addToast({
                type: 'error',
                message: 'Erro ao carregar mais animações.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <SparklesIcon className="w-8 h-8 text-purple-500" />
                        <h1 className="text-3xl font-bold">Biblioteca de Animações</h1>
                    </div>
                    <p className="text-gray-400">
                        Milhares de animações Lottie gratuitas para seus projetos
                    </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar animações..."
                            className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium"
                        >
                            Buscar
                        </button>
                    </div>
                </form>

                {/* Categories */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={loadFeaturedAnimations}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${!selectedCategory && !searchQuery
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            ✨ Em Destaque
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category.id
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {category.emoji} {category.label.split(' ')[1]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Info */}
                {animations.length > 0 && (
                    <p className="text-gray-400 text-sm mb-4">
                        Mostrando {animations.length} animações
                        {searchQuery && <> para <span className="text-white font-semibold">"{searchQuery}"</span></>}
                    </p>
                )}

                {/* Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                    {animations.map((animation) => (
                        <div
                            key={animation.id}
                            className="group relative bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
                            onClick={() => setPreviewAnimation(animation)}
                        >
                            {/* Animation Preview */}
                            <div className="aspect-square p-4" style={{ backgroundColor: animation.bgColor || '#1a1a1a' }}>
                                <LottieAnimation
                                    animationUrl={animation.jsonUrl}
                                    loop={true}
                                    autoplay={true}
                                    width="100%"
                                    height="100%"
                                />
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <p className="text-white text-sm font-medium truncate mb-2">
                                        {animation.name}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewAnimation(animation);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded text-white text-xs"
                                        >
                                            <PlayIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadJSON(animation);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs"
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="absolute top-2 right-2 flex gap-1 text-xs text-white/80">
                                <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded">
                                    ❤️ {animation.likes}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Loading Skeletons */}
                    {isLoading &&
                        Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className="aspect-square bg-gray-900 rounded-lg animate-pulse"
                            />
                        ))}
                </div>

                {/* Load More */}
                {currentPage < totalPages && !isLoading && (
                    <div className="text-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                        >
                            Carregar Mais
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {animations.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">
                            Nenhuma animação encontrada
                        </h3>
                        <p className="text-gray-500">
                            Tente usar outros termos de busca ou explore as categorias
                        </p>
                    </div>
                )}

                {/* Preview Modal */}
                {previewAnimation && (
                    <div
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setPreviewAnimation(null)}
                    >
                        <div
                            className="max-w-2xl w-full bg-gray-900 rounded-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                                <div>
                                    <h3 className="text-white font-semibold">{previewAnimation.name}</h3>
                                    <p className="text-gray-400 text-sm">Por {previewAnimation.createdBy.name}</p>
                                </div>
                                <button
                                    onClick={() => setPreviewAnimation(null)}
                                    className="p-2 hover:bg-gray-800 rounded-lg"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Animation */}
                            <div className="p-8" style={{ backgroundColor: previewAnimation.bgColor || '#1a1a1a' }}>
                                <LottieAnimation
                                    animationUrl={previewAnimation.jsonUrl}
                                    loop={true}
                                    autoplay={true}
                                    controls={true}
                                    width="100%"
                                    height="400px"
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-800">
                                <button
                                    onClick={() => handleDownloadJSON(previewAnimation)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                    Baixar JSON
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimationLibrary;
