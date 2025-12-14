
// Media Service - Orquestrador de APIs de Mídia
// Gerencia Pexels, Unsplash e Pixabay com fallback automático

import { pexelsService, PexelsPhoto, PexelsVideo } from './pexelsService';
import { unsplashService, UnsplashPhoto } from './unsplashService';
import { pixabayService, PixabayImage, PixabayVideo } from './pixabayService';

export interface MediaImage {
    id: string;
    source: 'pexels' | 'unsplash' | 'pixabay';
    url: string;
    thumbnail: string;
    width: number;
    height: number;
    photographer: string;
    photographerUrl: string;
    alt: string;
    downloadUrl: string;
    color?: string;
}

export interface MediaVideo {
    id: string;
    source: 'pexels' | 'pixabay';
    url: string;
    thumbnail: string;
    width: number;
    height: number;
    duration: number;
    user: string;
    userUrl: string;
    downloadUrl: string;
}

export interface MediaSearchOptions {
    page?: number;
    perPage?: number;
    orientation?: 'landscape' | 'portrait' | 'square';
    color?: string;
    orderBy?: 'relevant' | 'latest' | 'popular';
}

export interface MediaSearchResult<T> {
    items: T[];
    total: number;
    page: number;
    perPage: number;
    hasMore: boolean;
    source: 'pexels' | 'unsplash' | 'pixabay' | 'mixed';
}

class MediaService {
    /**
     * Converte foto do Pexels para formato unificado
     */
    private convertPexelsPhoto(photo: PexelsPhoto): MediaImage {
        return {
            id: `pexels-${photo.id}`,
            source: 'pexels',
            url: photo.src.large,
            thumbnail: photo.src.medium,
            width: photo.width,
            height: photo.height,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            alt: photo.alt || 'Image from Pexels',
            downloadUrl: photo.src.original,
            color: photo.avg_color,
        };
    }

    /**
     * Converte foto do Unsplash para formato unificado
     */
    private convertUnsplashPhoto(photo: UnsplashPhoto): MediaImage {
        return {
            id: `unsplash-${photo.id}`,
            source: 'unsplash',
            url: photo.urls.regular,
            thumbnail: photo.urls.small,
            width: photo.width,
            height: photo.height,
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
            alt: photo.alt_description || photo.description || 'Image from Unsplash',
            downloadUrl: photo.urls.full,
            color: photo.color,
        };
    }

    /**
     * Converte imagem do Pixabay para formato unificado
     */
    private convertPixabayImage(image: PixabayImage): MediaImage {
        return {
            id: `pixabay-${image.id}`,
            source: 'pixabay',
            url: image.webformatURL,
            thumbnail: image.previewURL,
            width: image.imageWidth,
            height: image.imageHeight,
            photographer: image.user,
            photographerUrl: image.pageURL,
            alt: image.tags,
            downloadUrl: image.largeImageURL,
        };
    }

    /**
     * Converte vídeo do Pexels para formato unificado
     */
    private convertPexelsVideo(video: PexelsVideo): MediaVideo {
        const bestQuality = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];

        return {
            id: `pexels-video-${video.id}`,
            source: 'pexels',
            url: video.url,
            thumbnail: video.image,
            width: video.width,
            height: video.height,
            duration: video.duration,
            user: video.user.name,
            userUrl: video.user.url,
            downloadUrl: bestQuality.link,
        };
    }

    /**
     * Converte vídeo do Pixabay para formato unificado
     */
    private convertPixabayVideo(video: PixabayVideo): MediaVideo {
        return {
            id: `pixabay-video-${video.id}`,
            source: 'pixabay',
            url: video.pageURL,
            thumbnail: `https://i.vimeocdn.com/video/${video.picture_id}_640.jpg`,
            width: video.videos.large.width,
            height: video.videos.large.height,
            duration: video.duration,
            user: video.user,
            userUrl: video.pageURL,
            downloadUrl: video.videos.large.url,
        };
    }

    /**
     * Busca imagens com fallback automático entre APIs
     */
    async searchImages(
        query: string,
        options: MediaSearchOptions = {}
    ): Promise<MediaSearchResult<MediaImage>> {
        const { page = 1, perPage = 15, orientation, color, orderBy = 'relevant' } = options;

        try {
            // 1. Tentar Pexels primeiro (melhor qualidade)
            console.log('🔍 Buscando em Pexels...');
            const pexelsResult = await pexelsService.searchPhotos(query, {
                page,
                perPage,
                orientation: orientation as any,
                color,
            });

            if (pexelsResult.photos.length > 0) {
                console.log(`✅ Pexels: ${pexelsResult.photos.length} imagens encontradas`);
                return {
                    items: pexelsResult.photos.map(p => this.convertPexelsPhoto(p)),
                    total: pexelsResult.total_results,
                    page: pexelsResult.page,
                    perPage: pexelsResult.per_page,
                    hasMore: !!pexelsResult.next_page,
                    source: 'pexels',
                };
            }
        } catch (error) {
            console.warn('⚠️ Pexels falhou:', error);
        }

        try {
            // 2. Fallback para Unsplash
            console.log('🔍 Buscando em Unsplash...');
            const unsplashResult = await unsplashService.searchPhotos(query, {
                page,
                perPage,
                orientation: orientation as any,
                color: color as any,
                orderBy: orderBy === 'latest' ? 'latest' : 'relevant',
            });

            if (unsplashResult.results.length > 0) {
                console.log(`✅ Unsplash: ${unsplashResult.results.length} imagens encontradas`);
                return {
                    items: unsplashResult.results.map(p => this.convertUnsplashPhoto(p)),
                    total: unsplashResult.total,
                    page,
                    perPage,
                    hasMore: page < unsplashResult.total_pages,
                    source: 'unsplash',
                };
            }
        } catch (error) {
            console.warn('⚠️ Unsplash falhou:', error);
        }

        try {
            // 3. Último fallback: Pixabay
            console.log('🔍 Buscando em Pixabay...');
            const pixabayResult = await pixabayService.searchImages(query, {
                page,
                perPage,
                orientation: orientation === 'square' ? 'all' : orientation as any,
                colors: color,
                order: orderBy === 'latest' ? 'latest' : 'popular',
            });

            console.log(`✅ Pixabay: ${pixabayResult.hits.length} imagens encontradas`);
            return {
                items: pixabayResult.hits.map(i => this.convertPixabayImage(i)),
                total: pixabayResult.total,
                page,
                perPage,
                hasMore: pixabayResult.totalHits > page * perPage,
                source: 'pixabay',
            };
        } catch (error) {
            console.error('❌ Todas as APIs falharam:', error);
            throw new Error('Não foi possível buscar imagens. Tente novamente mais tarde.');
        }
    }

    /**
     * Busca vídeos com fallback automático
     */
    async searchVideos(
        query: string,
        options: MediaSearchOptions = {}
    ): Promise<MediaSearchResult<MediaVideo>> {
        const { page = 1, perPage = 15, orientation } = options;

        try {
            // 1. Tentar Pexels primeiro
            console.log('🔍 Buscando vídeos em Pexels...');
            const pexelsResult = await pexelsService.searchVideos(query, {
                page,
                perPage,
                orientation: orientation as any,
            });

            if (pexelsResult.videos.length > 0) {
                console.log(`✅ Pexels: ${pexelsResult.videos.length} vídeos encontrados`);
                return {
                    items: pexelsResult.videos.map(v => this.convertPexelsVideo(v)),
                    total: pexelsResult.total_results,
                    page: pexelsResult.page,
                    perPage: pexelsResult.per_page,
                    hasMore: !!pexelsResult.next_page,
                    source: 'pexels',
                };
            }
        } catch (error) {
            console.warn('⚠️ Pexels vídeos falhou:', error);
        }

        try {
            // 2. Fallback para Pixabay
            console.log('🔍 Buscando vídeos em Pixabay...');
            const pixabayResult = await pixabayService.searchVideos(query, {
                page,
                perPage,
            });

            console.log(`✅ Pixabay: ${pixabayResult.hits.length} vídeos encontrados`);
            return {
                items: pixabayResult.hits.map(v => this.convertPixabayVideo(v)),
                total: pixabayResult.total,
                page,
                perPage,
                hasMore: pixabayResult.totalHits > page * perPage,
                source: 'pixabay',
            };
        } catch (error) {
            console.error('❌ Todas as APIs de vídeo falharam:', error);
            throw new Error('Não foi possível buscar vídeos. Tente novamente mais tarde.');
        }
    }

    /**
     * Busca imagens curadas/populares
     */
    async getCuratedImages(
        page: number = 1,
        perPage: number = 15
    ): Promise<MediaSearchResult<MediaImage>> {
        try {
            const pexelsResult = await pexelsService.getCuratedPhotos(page, perPage);

            return {
                items: pexelsResult.photos.map(p => this.convertPexelsPhoto(p)),
                total: pexelsResult.total_results,
                page: pexelsResult.page,
                perPage: pexelsResult.per_page,
                hasMore: !!pexelsResult.next_page,
                source: 'pexels',
            };
        } catch (error) {
            console.error('❌ Erro ao buscar imagens curadas:', error);
            throw error;
        }
    }

    /**
     * Busca imagens aleatórias do Unsplash
     */
    async getRandomImages(
        query?: string,
        count: number = 10
    ): Promise<MediaImage[]> {
        try {
            const photos = await unsplashService.getRandomPhotos({
                count,
                query,
            });

            return photos.map(p => this.convertUnsplashPhoto(p));
        } catch (error) {
            console.error('❌ Erro ao buscar imagens aleatórias:', error);
            return [];
        }
    }
}

export const mediaService = new MediaService();
