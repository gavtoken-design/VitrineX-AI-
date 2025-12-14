
// LottieFiles API Service
// Documentação: https://lottiefiles.com/

const LOTTIE_API_URL = 'https://api.lottiefiles.com/v1';

export interface LottieAnimation {
    id: number;
    name: string;
    description: string;
    bgColor: string;
    url: string;
    jsonUrl: string;
    gifUrl: string;
    videoUrl: string;
    imageUrl: string;
    createdBy: {
        name: string;
        avatarUrl: string;
        username: string;
    };
    downloads: number;
    likes: number;
    views: number;
    tags: string[];
    createdAt: string;
}

export interface LottieSearchResponse {
    data: LottieAnimation[];
    current_page: number;
    total_pages: number;
    total: number;
}

export interface LottieFeaturedResponse {
    data: LottieAnimation[];
}

class LottieService {
    /**
     * Busca animações por palavra-chave
     * Nota: API pública do LottieFiles (sem necessidade de chave)
     */
    async searchAnimations(
        query: string,
        page: number = 1,
        perPage: number = 20
    ): Promise<LottieSearchResponse> {
        try {
            const response = await fetch(
                `${LOTTIE_API_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
            );

            if (!response.ok) {
                throw new Error(`LottieFiles API Error: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao buscar animações:', error);
            throw error;
        }
    }

    /**
     * Obtém animações em destaque/populares
     */
    async getFeaturedAnimations(): Promise<LottieFeaturedResponse> {
        try {
            const response = await fetch(`${LOTTIE_API_URL}/featured`);

            if (!response.ok) {
                throw new Error(`LottieFiles API Error: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao buscar animações em destaque:', error);
            throw error;
        }
    }

    /**
     * Obtém uma animação específica por ID
     */
    async getAnimation(id: number): Promise<LottieAnimation> {
        try {
            const response = await fetch(`${LOTTIE_API_URL}/animations/${id}`);

            if (!response.ok) {
                throw new Error(`LottieFiles API Error: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao buscar animação:', error);
            throw error;
        }
    }

    /**
     * Busca animações por categoria
     */
    async getAnimationsByCategory(
        category: string,
        page: number = 1,
        perPage: number = 20
    ): Promise<LottieSearchResponse> {
        const categories = {
            'loading': 'loading spinner',
            'success': 'success checkmark',
            'error': 'error warning',
            'social': 'social media',
            'business': 'business office',
            'nature': 'nature environment',
            'technology': 'technology digital',
            'food': 'food restaurant',
            'sports': 'sports fitness',
            'education': 'education learning',
        };

        const searchQuery = categories[category as keyof typeof categories] || category;
        return this.searchAnimations(searchQuery, page, perPage);
    }

    /**
     * Baixa o JSON da animação
     */
    async downloadAnimationJSON(jsonUrl: string): Promise<any> {
        try {
            const response = await fetch(jsonUrl);

            if (!response.ok) {
                throw new Error('Erro ao baixar animação');
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao baixar JSON da animação:', error);
            throw error;
        }
    }

    /**
     * Converte URL do LottieFiles para formato utilizável
     */
    getAnimationUrl(animation: LottieAnimation): string {
        return animation.jsonUrl || animation.url;
    }
}

export const lottieService = new LottieService();
