
// Pexels API Service
// Documentação: https://www.pexels.com/api/documentation/

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    liked: boolean;
    alt: string;
}

export interface PexelsVideo {
    id: number;
    width: number;
    height: number;
    duration: number;
    url: string;
    image: string;
    user: {
        id: number;
        name: string;
        url: string;
    };
    video_files: Array<{
        id: number;
        quality: string;
        file_type: string;
        width: number;
        height: number;
        link: string;
    }>;
    video_pictures: Array<{
        id: number;
        picture: string;
        nr: number;
    }>;
}

export interface PexelsSearchResponse {
    total_results: number;
    page: number;
    per_page: number;
    photos: PexelsPhoto[];
    next_page?: string;
}

export interface PexelsVideoSearchResponse {
    total_results: number;
    page: number;
    per_page: number;
    videos: PexelsVideo[];
    next_page?: string;
}

class PexelsService {
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || localStorage.getItem('vitrinex_pexels_key') || PEXELS_API_KEY;
    }

    private async request<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Pexels API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Busca fotos por palavra-chave
     */
    async searchPhotos(
        query: string,
        options: {
            page?: number;
            perPage?: number;
            orientation?: 'landscape' | 'portrait' | 'square';
            size?: 'large' | 'medium' | 'small';
            color?: string;
            locale?: string;
        } = {}
    ): Promise<PexelsSearchResponse> {
        const {
            page = 1,
            perPage = 15,
            orientation,
            size,
            color,
            locale = 'pt-BR',
        } = options;

        const params = new URLSearchParams({
            query,
            page: page.toString(),
            per_page: perPage.toString(),
            locale,
        });

        if (orientation) params.append('orientation', orientation);
        if (size) params.append('size', size);
        if (color) params.append('color', color);

        return this.request<PexelsSearchResponse>(`/search?${params.toString()}`);
    }

    /**
     * Busca vídeos por palavra-chave
     */
    async searchVideos(
        query: string,
        options: {
            page?: number;
            perPage?: number;
            orientation?: 'landscape' | 'portrait' | 'square';
            size?: 'large' | 'medium' | 'small';
            locale?: string;
        } = {}
    ): Promise<PexelsVideoSearchResponse> {
        const {
            page = 1,
            perPage = 15,
            orientation,
            size,
            locale = 'pt-BR',
        } = options;

        const params = new URLSearchParams({
            query,
            page: page.toString(),
            per_page: perPage.toString(),
            locale,
        });

        if (orientation) params.append('orientation', orientation);
        if (size) params.append('size', size);

        return this.request<PexelsVideoSearchResponse>(`/videos/search?${params.toString()}`);
    }

    /**
     * Busca fotos curadas (populares)
     */
    async getCuratedPhotos(
        page: number = 1,
        perPage: number = 15
    ): Promise<PexelsSearchResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        return this.request<PexelsSearchResponse>(`/curated?${params.toString()}`);
    }

    /**
     * Busca vídeos populares
     */
    async getPopularVideos(
        page: number = 1,
        perPage: number = 15
    ): Promise<PexelsVideoSearchResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        return this.request<PexelsVideoSearchResponse>(`/videos/popular?${params.toString()}`);
    }

    /**
     * Obtém uma foto específica por ID
     */
    async getPhoto(id: number): Promise<PexelsPhoto> {
        return this.request<PexelsPhoto>(`/photos/${id}`);
    }

    /**
     * Obtém um vídeo específico por ID
     */
    async getVideo(id: number): Promise<PexelsVideo> {
        return this.request<PexelsVideo>(`/videos/videos/${id}`);
    }
}

export const pexelsService = new PexelsService();
