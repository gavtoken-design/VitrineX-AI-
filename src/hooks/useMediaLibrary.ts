
import { useState, useCallback } from 'react';
import { mediaService, MediaImage, MediaVideo, MediaSearchResult } from '../services/media/mediaService';
import { MediaSearchFilters } from '../components/MediaSearch';

export interface UseMediaLibraryOptions {
    type?: 'image' | 'video';
    perPage?: number;
}

export interface UseMediaLibraryReturn {
    items: (MediaImage | MediaVideo)[];
    isLoading: boolean;
    error: string | null;
    totalResults: number;
    currentPage: number;
    hasMore: boolean;
    source: string;
    search: (query: string, filters?: MediaSearchFilters) => Promise<void>;
    loadMore: () => Promise<void>;
    getCurated: () => Promise<void>;
    getRandom: (query?: string, count?: number) => Promise<(MediaImage | MediaVideo)[]>;
    reset: () => void;
}

export const useMediaLibrary = (options: UseMediaLibraryOptions = {}): UseMediaLibraryReturn => {
    const { type = 'image', perPage = 20 } = options;

    const [items, setItems] = useState<(MediaImage | MediaVideo)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [source, setSource] = useState('');
    const [currentQuery, setCurrentQuery] = useState('');
    const [currentFilters, setCurrentFilters] = useState<MediaSearchFilters>({});

    const search = useCallback(async (query: string, filters: MediaSearchFilters = {}) => {
        try {
            setIsLoading(true);
            setError(null);
            setCurrentQuery(query);
            setCurrentFilters(filters);
            setCurrentPage(1);

            let result: MediaSearchResult<MediaImage | MediaVideo>;

            if (type === 'image') {
                result = await mediaService.searchImages(query, {
                    page: 1,
                    perPage,
                    ...filters,
                });
            } else {
                result = await mediaService.searchVideos(query, {
                    page: 1,
                    perPage,
                    ...filters,
                });
            }

            setItems(result.items);
            setTotalResults(result.total);
            setHasMore(result.hasMore);
            setSource(result.source);
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar mídia');
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [type, perPage]);

    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading || !currentQuery) return;

        try {
            setIsLoading(true);
            setError(null);
            const nextPage = currentPage + 1;

            let result: MediaSearchResult<MediaImage | MediaVideo>;

            if (type === 'image') {
                result = await mediaService.searchImages(currentQuery, {
                    page: nextPage,
                    perPage,
                    ...currentFilters,
                });
            } else {
                result = await mediaService.searchVideos(currentQuery, {
                    page: nextPage,
                    perPage,
                    ...currentFilters,
                });
            }

            setItems(prev => [...prev, ...result.items]);
            setHasMore(result.hasMore);
            setCurrentPage(nextPage);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar mais');
        } finally {
            setIsLoading(false);
        }
    }, [hasMore, isLoading, currentQuery, currentPage, currentFilters, type, perPage]);

    const getCurated = useCallback(async () => {
        if (type !== 'image') return;

        try {
            setIsLoading(true);
            setError(null);
            setCurrentQuery('');
            setCurrentPage(1);

            const result = await mediaService.getCuratedImages(1, perPage);

            setItems(result.items);
            setTotalResults(result.total);
            setHasMore(result.hasMore);
            setSource(result.source);
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar imagens curadas');
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [type, perPage]);

    const getRandom = useCallback(async (query?: string, count: number = 10) => {
        if (type !== 'image') return [];

        try {
            const images = await mediaService.getRandomImages(query, count);
            return images;
        } catch (err: any) {
            console.error('Erro ao buscar imagens aleatórias:', err);
            return [];
        }
    }, [type]);

    const reset = useCallback(() => {
        setItems([]);
        setIsLoading(false);
        setError(null);
        setTotalResults(0);
        setCurrentPage(1);
        setHasMore(false);
        setSource('');
        setCurrentQuery('');
        setCurrentFilters({});
    }, []);

    return {
        items,
        isLoading,
        error,
        totalResults,
        currentPage,
        hasMore,
        source,
        search,
        loadMore,
        getCurated,
        getRandom,
        reset,
    };
};
