
// Pixabay API Service (Fallback)
// Documentação: https://pixabay.com/api/docs/

const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://pixabay.com/api/';

export interface PixabayImage {
    id: number;
    pageURL: string;
    type: 'photo' | 'illustration' | 'vector';
    tags: string;
    previewURL: string;
    previewWidth: number;
    previewHeight: number;
    webformatURL: string;
    webformatWidth: number;
    webformatHeight: number;
    largeImageURL: string;
    imageWidth: number;
    imageHeight: number;
    imageSize: number;
    views: number;
    downloads: number;
    likes: number;
    comments: number;
    user_id: number;
    user: string;
    userImageURL: string;
}

export interface PixabayVideo {
    id: number;
    pageURL: string;
    type: string;
    tags: string;
    duration: number;
    picture_id: string;
    videos: {
        large: { url: string; width: number; height: number; size: number };
        medium: { url: string; width: number; height: number; size: number };
        small: { url: string; width: number; height: number; size: number };
        tiny: { url: string; width: number; height: number; size: number };
    };
    views: number;
    downloads: number;
    likes: number;
    comments: number;
    user_id: number;
    user: string;
    userImageURL: string;
}

export interface PixabaySearchResponse<T> {
    total: number;
    totalHits: number;
    hits: T[];
}

class PixabayService {
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || localStorage.getItem('vitrinex_pixabay_key') || PIXABAY_API_KEY;
    }

    private async request<T>(endpoint: string, params: URLSearchParams): Promise<T> {
        params.append('key', this.apiKey);

        const response = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Pixabay API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Busca imagens por palavra-chave
     */
    async searchImages(
        query: string,
        options: {
            page?: number;
            perPage?: number;
            lang?: string;
            imageType?: 'all' | 'photo' | 'illustration' | 'vector';
            orientation?: 'all' | 'horizontal' | 'vertical';
            category?: string;
            minWidth?: number;
            minHeight?: number;
            colors?: string;
            editorsChoice?: boolean;
            safeSearch?: boolean;
            order?: 'popular' | 'latest';
        } = {}
    ): Promise<PixabaySearchResponse<PixabayImage>> {
        const {
            page = 1,
            perPage = 20,
            lang = 'pt',
            imageType = 'all',
            orientation = 'all',
            category,
            minWidth,
            minHeight,
            colors,
            editorsChoice = false,
            safeSearch = true,
            order = 'popular',
        } = options;

        const params = new URLSearchParams({
            q: query,
            page: page.toString(),
            per_page: perPage.toString(),
            lang,
            image_type: imageType,
            orientation,
            safesearch: safeSearch.toString(),
            order,
            editors_choice: editorsChoice.toString(),
        });

        if (category) params.append('category', category);
        if (minWidth) params.append('min_width', minWidth.toString());
        if (minHeight) params.append('min_height', minHeight.toString());
        if (colors) params.append('colors', colors);

        return this.request<PixabaySearchResponse<PixabayImage>>('', params);
    }

    /**
     * Busca vídeos por palavra-chave
     */
    async searchVideos(
        query: string,
        options: {
            page?: number;
            perPage?: number;
            lang?: string;
            videoType?: 'all' | 'film' | 'animation';
            category?: string;
            minWidth?: number;
            minHeight?: number;
            editorsChoice?: boolean;
            safeSearch?: boolean;
            order?: 'popular' | 'latest';
        } = {}
    ): Promise<PixabaySearchResponse<PixabayVideo>> {
        const {
            page = 1,
            perPage = 20,
            lang = 'pt',
            videoType = 'all',
            category,
            minWidth,
            minHeight,
            editorsChoice = false,
            safeSearch = true,
            order = 'popular',
        } = options;

        const params = new URLSearchParams({
            q: query,
            page: page.toString(),
            per_page: perPage.toString(),
            lang,
            video_type: videoType,
            safesearch: safeSearch.toString(),
            order,
            editors_choice: editorsChoice.toString(),
        });

        if (category) params.append('category', category);
        if (minWidth) params.append('min_width', minWidth.toString());
        if (minHeight) params.append('min_height', minHeight.toString());

        return this.request<PixabaySearchResponse<PixabayVideo>>('videos/', params);
    }
}

export const pixabayService = new PixabayService();
