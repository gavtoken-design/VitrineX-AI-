
// Unsplash API Service
// Documentação: https://unsplash.com/documentation

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE';
const BASE_URL = 'https://api.unsplash.com';

export interface UnsplashPhoto {
    id: string;
    created_at: string;
    updated_at: string;
    width: number;
    height: number;
    color: string;
    blur_hash: string;
    downloads: number;
    likes: number;
    liked_by_user: boolean;
    description: string | null;
    alt_description: string | null;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    };
    links: {
        self: string;
        html: string;
        download: string;
        download_location: string;
    };
    user: {
        id: string;
        username: string;
        name: string;
        portfolio_url: string | null;
        bio: string | null;
        location: string | null;
        total_likes: number;
        total_photos: number;
        total_collections: number;
        profile_image: {
            small: string;
            medium: string;
            large: string;
        };
        links: {
            self: string;
            html: string;
            photos: string;
            likes: string;
        };
    };
}

export interface UnsplashSearchResponse {
    total: number;
    total_pages: number;
    results: UnsplashPhoto[];
}

export interface UnsplashCollection {
    id: string;
    title: string;
    description: string | null;
    published_at: string;
    updated_at: string;
    curated: boolean;
    featured: boolean;
    total_photos: number;
    private: boolean;
    share_key: string;
    cover_photo: UnsplashPhoto;
    user: UnsplashPhoto['user'];
}

class UnsplashService {
    private accessKey: string;

    constructor(accessKey?: string) {
        this.accessKey = accessKey || localStorage.getItem('vitrinex_unsplash_key') || UNSPLASH_ACCESS_KEY;
    }

    private async request<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Client-ID ${this.accessKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Unsplash API Error: ${response.status} ${response.statusText}`);
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
            orderBy?: 'relevant' | 'latest';
            collections?: string;
            contentFilter?: 'low' | 'high';
            color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
            orientation?: 'landscape' | 'portrait' | 'squarish';
        } = {}
    ): Promise<UnsplashSearchResponse> {
        const {
            page = 1,
            perPage = 15,
            orderBy = 'relevant',
            collections,
            contentFilter = 'low',
            color,
            orientation,
        } = options;

        const params = new URLSearchParams({
            query,
            page: page.toString(),
            per_page: perPage.toString(),
            order_by: orderBy,
            content_filter: contentFilter,
        });

        if (collections) params.append('collections', collections);
        if (color) params.append('color', color);
        if (orientation) params.append('orientation', orientation);

        return this.request<UnsplashSearchResponse>(`/search/photos?${params.toString()}`);
    }

    /**
     * Busca coleções por palavra-chave
     */
    async searchCollections(
        query: string,
        page: number = 1,
        perPage: number = 10
    ): Promise<{ total: number; total_pages: number; results: UnsplashCollection[] }> {
        const params = new URLSearchParams({
            query,
            page: page.toString(),
            per_page: perPage.toString(),
        });

        return this.request(`/search/collections?${params.toString()}`);
    }

    /**
     * Obtém fotos de uma coleção específica
     */
    async getCollectionPhotos(
        collectionId: string,
        page: number = 1,
        perPage: number = 15
    ): Promise<UnsplashPhoto[]> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        return this.request<UnsplashPhoto[]>(`/collections/${collectionId}/photos?${params.toString()}`);
    }

    /**
     * Obtém fotos aleatórias
     */
    async getRandomPhotos(
        options: {
            count?: number;
            collections?: string;
            topics?: string;
            query?: string;
            orientation?: 'landscape' | 'portrait' | 'squarish';
            contentFilter?: 'low' | 'high';
        } = {}
    ): Promise<UnsplashPhoto[]> {
        const {
            count = 1,
            collections,
            topics,
            query,
            orientation,
            contentFilter = 'low',
        } = options;

        const params = new URLSearchParams({
            count: count.toString(),
            content_filter: contentFilter,
        });

        if (collections) params.append('collections', collections);
        if (topics) params.append('topics', topics);
        if (query) params.append('query', query);
        if (orientation) params.append('orientation', orientation);

        return this.request<UnsplashPhoto[]>(`/photos/random?${params.toString()}`);
    }

    /**
     * Obtém uma foto específica por ID
     */
    async getPhoto(id: string): Promise<UnsplashPhoto> {
        return this.request<UnsplashPhoto>(`/photos/${id}`);
    }

    /**
     * Registra um download (obrigatório pela API do Unsplash)
     */
    async trackDownload(downloadLocation: string): Promise<void> {
        await fetch(downloadLocation);
    }

    /**
     * Lista fotos curadas/editoriais
     */
    async listCuratedPhotos(
        page: number = 1,
        perPage: number = 15,
        orderBy: 'latest' | 'oldest' | 'popular' = 'latest'
    ): Promise<UnsplashPhoto[]> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
            order_by: orderBy,
        });

        return this.request<UnsplashPhoto[]>(`/photos?${params.toString()}`);
    }
}

export const unsplashService = new UnsplashService();
