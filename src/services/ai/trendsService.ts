// Trends Service - Análise de Tendências em Tempo Real
// Integra com APIs de redes sociais para buscar tendências atuais

export interface TrendingTopic {
    id: string;
    topic: string;
    platform: 'tiktok' | 'instagram' | 'twitter' | 'youtube';
    volume: number; // Número de menções/posts
    growth: number; // Percentual de crescimento
    hashtags: string[];
    description: string;
    exampleContent?: string;
}

export interface HashtagSuggestion {
    tag: string;
    posts: number;
    engagement: 'low' | 'medium' | 'high' | 'viral';
    relevance: number; // 0-100
}

// Cache de tendências (1 hora)
const trendsCache: {
    [key: string]: { data: any; timestamp: number };
} = {};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

/**
 * Verifica se cache é válido
 */
const isCacheValid = (key: string): boolean => {
    const cached = trendsCache[key];
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
};

/**
 * Busca tendências do TikTok
 * Nota: Em produção, integrar com TikTok Creative Center API
 */
export const getTikTokTrends = async (): Promise<TrendingTopic[]> => {
    const cacheKey = 'tiktok_trends';

    if (isCacheValid(cacheKey)) {
        return trendsCache[cacheKey].data;
    }

    // Mock data - Em produção, fazer chamada real à API
    const mockTrends: TrendingTopic[] = [
        {
            id: 'tt1',
            topic: 'Marketing Digital 2025',
            platform: 'tiktok',
            volume: 125000,
            growth: 45,
            hashtags: ['#marketingdigital', '#marketing2025', '#empreendedorismo'],
            description: 'Tendências e estratégias de marketing para 2025',
            exampleContent: 'Vídeos sobre IA no marketing, automação e personalização'
        },
        {
            id: 'tt2',
            topic: 'Criação de Conteúdo com IA',
            platform: 'tiktok',
            volume: 89000,
            growth: 78,
            hashtags: ['#iamarketing', '#conteudoia', '#chatgpt'],
            description: 'Como usar IA para criar conteúdo viral',
            exampleContent: 'Tutoriais de ferramentas de IA, dicas de prompts'
        },
        {
            id: 'tt3',
            topic: 'Reels que Vendem',
            platform: 'tiktok',
            volume: 156000,
            growth: 32,
            hashtags: ['#reelsquevendem', '#vendasonline', '#ecommerce'],
            description: 'Estratégias para criar Reels que convertem',
            exampleContent: 'Hooks poderosos, CTA efetivos, storytelling'
        }
    ];

    trendsCache[cacheKey] = {
        data: mockTrends,
        timestamp: Date.now()
    };

    return mockTrends;
};

/**
 * Busca tendências do Instagram
 */
export const getInstagramTrends = async (): Promise<TrendingTopic[]> => {
    const cacheKey = 'instagram_trends';

    if (isCacheValid(cacheKey)) {
        return trendsCache[cacheKey].data;
    }

    const mockTrends: TrendingTopic[] = [
        {
            id: 'ig1',
            topic: 'Carrosséis Educativos',
            platform: 'instagram',
            volume: 234000,
            growth: 56,
            hashtags: ['#carrossel', '#educacao', '#dicas'],
            description: 'Posts em carrossel com conteúdo educativo performam 3x melhor',
            exampleContent: '10 slides com dicas, infográficos, listas'
        },
        {
            id: 'ig2',
            topic: 'Stories Interativos',
            platform: 'instagram',
            volume: 178000,
            growth: 41,
            hashtags: ['#storiesinterativos', '#enquetes', '#quiz'],
            description: 'Stories com enquetes e quiz aumentam engajamento',
            exampleContent: 'Perguntas, caixinhas de perguntas, quizzes'
        },
        {
            id: 'ig3',
            topic: 'Bastidores do Negócio',
            platform: 'instagram',
            volume: 145000,
            growth: 67,
            hashtags: ['#bastidores', '#empreendedorismo', '#realidade'],
            description: 'Mostrar os bastidores humaniza a marca',
            exampleContent: 'Dia a dia, processos, equipe, desafios'
        }
    ];

    trendsCache[cacheKey] = {
        data: mockTrends,
        timestamp: Date.now()
    };

    return mockTrends;
};

/**
 * Busca tendências do Twitter
 */
export const getTwitterTrends = async (): Promise<TrendingTopic[]> => {
    const cacheKey = 'twitter_trends';

    if (isCacheValid(cacheKey)) {
        return trendsCache[cacheKey].data;
    }

    const mockTrends: TrendingTopic[] = [
        {
            id: 'tw1',
            topic: 'Threads de Valor',
            platform: 'twitter',
            volume: 98000,
            growth: 52,
            hashtags: ['#thread', '#marketing', '#dicas'],
            description: 'Threads educativas geram muito engajamento',
            exampleContent: 'Sequência de tweets com dicas práticas'
        },
        {
            id: 'tw2',
            topic: 'IA Generativa',
            platform: 'twitter',
            volume: 267000,
            growth: 89,
            hashtags: ['#ia', '#chatgpt', '#midjourney'],
            description: 'Discussões sobre IA e suas aplicações',
            exampleContent: 'Casos de uso, ferramentas, tutoriais'
        }
    ];

    trendsCache[cacheKey] = {
        data: mockTrends,
        timestamp: Date.now()
    };

    return mockTrends;
};

/**
 * Busca TODAS as tendências
 */
export const getAllTrends = async (): Promise<TrendingTopic[]> => {
    const [tiktok, instagram, twitter] = await Promise.all([
        getTikTokTrends(),
        getInstagramTrends(),
        getTwitterTrends()
    ]);

    return [...tiktok, ...instagram, ...twitter]
        .sort((a, b) => b.growth - a.growth); // Ordenar por crescimento
};

/**
 * Sugere hashtags para um tópico
 */
export const suggestHashtags = async (topic: string): Promise<HashtagSuggestion[]> => {
    const lowerTopic = topic.toLowerCase();

    // Mock data - Em produção, buscar de API real
    const allHashtags: HashtagSuggestion[] = [
        { tag: '#marketingdigital', posts: 5600000, engagement: 'high', relevance: 95 },
        { tag: '#empreendedorismo', posts: 4200000, engagement: 'high', relevance: 90 },
        { tag: '#marketing', posts: 8900000, engagement: 'medium', relevance: 85 },
        { tag: '#vendas', posts: 3100000, engagement: 'high', relevance: 88 },
        { tag: '#negociosonline', posts: 2800000, engagement: 'medium', relevance: 82 },
        { tag: '#conteudo', posts: 1900000, engagement: 'medium', relevance: 75 },
        { tag: '#redessociais', posts: 3400000, engagement: 'high', relevance: 92 },
        { tag: '#instagram', posts: 12000000, engagement: 'medium', relevance: 70 },
        { tag: '#tiktok', posts: 9500000, engagement: 'high', relevance: 78 },
        { tag: '#criativos', posts: 1200000, engagement: 'medium', relevance: 80 }
    ];

    // Filtrar por relevância ao tópico
    return allHashtags
        .filter(h => h.relevance > 70)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10);
};

/**
 * Busca conteúdos virais de um nicho
 */
export const getViralContent = async (niche: string): Promise<any[]> => {
    // Mock data
    return [
        {
            title: 'Como criar posts que vendem',
            platform: 'instagram',
            engagement: 45000,
            type: 'carrossel',
            description: 'Carrossel com 10 dicas de copywriting'
        },
        {
            title: '5 erros que matam seu engajamento',
            platform: 'tiktok',
            engagement: 128000,
            type: 'video',
            description: 'Vídeo curto e direto com erros comuns'
        }
    ];
};

/**
 * Analisa melhor horário para postar
 */
export const getBestPostingTimes = (platform: string): string[] => {
    const times: { [key: string]: string[] } = {
        'instagram': [
            '18:00 - 20:00 (Melhor engajamento)',
            '12:00 - 13:00 (Horário de almoço)',
            '20:00 - 22:00 (Noite)'
        ],
        'facebook': [
            '13:00 - 16:00 (Tarde)',
            '19:00 - 21:00 (Noite)'
        ],
        'tiktok': [
            '19:00 - 21:00 (Pico de uso)',
            '12:00 - 14:00 (Almoço)',
            '22:00 - 23:00 (Antes de dormir)'
        ],
        'twitter': [
            '12:00 - 13:00 (Almoço)',
            '17:00 - 18:00 (Fim do expediente)'
        ]
    };

    return times[platform.toLowerCase()] || ['18:00 - 20:00'];
};

/**
 * Gera sugestão de conteúdo baseada em tendências
 */
export const generateContentSuggestion = async (userNiche?: string): Promise<string> => {
    const trends = await getAllTrends();
    const topTrend = trends[0];

    return `💡 Sugestão de Conteúdo:

📈 Tendência em Alta: ${topTrend.topic}
🔥 Crescimento: +${topTrend.growth}%
📱 Plataforma: ${topTrend.platform}

Ideia de Post:
"${topTrend.description}"

Hashtags Sugeridas:
${topTrend.hashtags.join(' ')}

Melhor Horário:
${getBestPostingTimes(topTrend.platform)[0]}

Dica: ${topTrend.exampleContent}`;
};
