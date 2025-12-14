// Prompt Enhancement Service - Melhora prompts de geração de imagens
// Converte prompts simples em JSON estruturado para melhor qualidade

export interface EnhancedImagePrompt {
    mainSubject: string;
    style: string;
    lighting: string;
    composition: string;
    colors: string[];
    mood: string;
    details: string[];
    negativePrompt: string[];
    quality: string;
    aspectRatio?: string;
}

export interface PromptAnalysis {
    original: string;
    enhanced: EnhancedImagePrompt;
    finalPrompt: string;
    improvements: string[];
}

/**
 * Analisa e melhora um prompt usando IA
 */
export const analyzeAndEnhancePrompt = async (
    userPrompt: string,
    context?: string
): Promise<PromptAnalysis> => {
    // Aqui você integraria com a API do Gemini para análise
    // Por enquanto, vou criar uma versão que estrutura o prompt

    const analysis = await analyzePromptWithAI(userPrompt, context);

    return {
        original: userPrompt,
        enhanced: analysis,
        finalPrompt: convertToOptimizedPrompt(analysis),
        improvements: generateImprovementsList(userPrompt, analysis)
    };
};

/**
 * Analisa prompt com IA (Gemini)
 */
const analyzePromptWithAI = async (
    prompt: string,
    context?: string
): Promise<EnhancedImagePrompt> => {
    // Mock - Em produção, chamar Gemini API
    // O Gemini analisaria o prompt e retornaria JSON estruturado

    const systemInstruction = `Você é um especialista em geração de imagens com IA.
Analise o prompt fornecido e retorne um JSON estruturado com os seguintes campos:

{
  "mainSubject": "assunto principal da imagem",
  "style": "estilo artístico (fotográfico, ilustração, 3D, etc)",
  "lighting": "tipo de iluminação (natural, dramática, suave, etc)",
  "composition": "composição (close-up, plano geral, etc)",
  "colors": ["cor1", "cor2", "cor3"],
  "mood": "atmosfera/sentimento",
  "details": ["detalhe1", "detalhe2"],
  "negativePrompt": ["o que evitar"],
  "quality": "qualidade desejada",
  "aspectRatio": "proporção (16:9, 1:1, etc)"
}

Seja específico e detalhado. Use termos técnicos de fotografia e arte.`;

    // Simulação de resposta (em produção, usar Gemini real)
    const mockResponse: EnhancedImagePrompt = {
        mainSubject: extractMainSubject(prompt),
        style: "fotográfico profissional",
        lighting: "iluminação natural suave",
        composition: "plano médio centralizado",
        colors: extractColors(prompt),
        mood: extractMood(prompt),
        details: extractDetails(prompt),
        negativePrompt: [
            "baixa qualidade",
            "desfocado",
            "distorcido",
            "texto",
            "marca d'água"
        ],
        quality: "alta resolução, 8k, ultra detalhado",
        aspectRatio: context?.includes('story') ? '9:16' : '1:1'
    };

    return mockResponse;
};

/**
 * Extrai assunto principal do prompt
 */
const extractMainSubject = (prompt: string): string => {
    // Lógica simples - em produção, usar IA
    const words = prompt.toLowerCase().split(' ');

    // Palavras-chave comuns
    const subjects = {
        'pessoa': 'pessoa profissional',
        'mulher': 'mulher profissional',
        'homem': 'homem profissional',
        'produto': 'produto comercial',
        'comida': 'prato de comida gourmet',
        'paisagem': 'paisagem natural',
        'cidade': 'cenário urbano',
        'escritório': 'ambiente de escritório moderno',
        'tecnologia': 'dispositivo tecnológico',
        'marketing': 'conceito de marketing digital'
    };

    for (const [key, value] of Object.entries(subjects)) {
        if (words.includes(key)) {
            return value;
        }
    }

    return prompt.slice(0, 50);
};

/**
 * Extrai cores do prompt
 */
const extractColors = (prompt: string): string[] => {
    const colorKeywords: { [key: string]: string[] } = {
        'azul': ['azul', 'blue'],
        'vermelho': ['vermelho', 'red'],
        'verde': ['verde', 'green'],
        'amarelo': ['amarelo', 'yellow'],
        'roxo': ['roxo', 'purple'],
        'rosa': ['rosa', 'pink'],
        'preto': ['preto', 'black'],
        'branco': ['branco', 'white']
    };

    const foundColors: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const [color, keywords] of Object.entries(colorKeywords)) {
        if (keywords.some(k => lowerPrompt.includes(k))) {
            foundColors.push(color);
        }
    }

    return foundColors.length > 0 ? foundColors : ['cores vibrantes', 'paleta harmoniosa'];
};

/**
 * Extrai mood/atmosfera
 */
const extractMood = (prompt: string): string => {
    const moodKeywords: { [key: string]: string[] } = {
        'profissional': ['profissional', 'corporativo', 'negócios'],
        'alegre': ['alegre', 'feliz', 'divertido'],
        'sério': ['sério', 'formal', 'elegante'],
        'moderno': ['moderno', 'contemporâneo', 'minimalista'],
        'acolhedor': ['acolhedor', 'confortável', 'aconchegante']
    };

    const lowerPrompt = prompt.toLowerCase();

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        if (keywords.some(k => lowerPrompt.includes(k))) {
            return mood;
        }
    }

    return 'profissional e atraente';
};

/**
 * Extrai detalhes específicos
 */
const extractDetails = (prompt: string): string[] => {
    const details: string[] = [];

    if (prompt.includes('fundo')) {
        details.push('fundo desfocado (bokeh)');
    }
    if (prompt.includes('logo') || prompt.includes('marca')) {
        details.push('espaço para logo/marca');
    }
    if (prompt.includes('texto')) {
        details.push('área para texto');
    }

    // Detalhes padrão para qualidade
    details.push('alta nitidez');
    details.push('cores vibrantes');
    details.push('composição equilibrada');

    return details;
};

/**
 * Converte JSON estruturado em prompt otimizado
 */
const convertToOptimizedPrompt = (enhanced: EnhancedImagePrompt): string => {
    const parts: string[] = [];

    // Assunto principal
    parts.push(enhanced.mainSubject);

    // Estilo
    parts.push(`estilo ${enhanced.style}`);

    // Iluminação
    parts.push(enhanced.lighting);

    // Composição
    parts.push(enhanced.composition);

    // Cores
    if (enhanced.colors.length > 0) {
        parts.push(`cores: ${enhanced.colors.join(', ')}`);
    }

    // Mood
    parts.push(`atmosfera ${enhanced.mood}`);

    // Detalhes
    if (enhanced.details.length > 0) {
        parts.push(enhanced.details.join(', '));
    }

    // Qualidade
    parts.push(enhanced.quality);

    // Aspect ratio
    if (enhanced.aspectRatio) {
        parts.push(`proporção ${enhanced.aspectRatio}`);
    }

    // Montar prompt final
    const positivePrompt = parts.join(', ');
    const negativePrompt = enhanced.negativePrompt.join(', ');

    return `${positivePrompt} | Negative: ${negativePrompt}`;
};

/**
 * Gera lista de melhorias aplicadas
 */
const generateImprovementsList = (
    original: string,
    enhanced: EnhancedImagePrompt
): string[] => {
    const improvements: string[] = [];

    improvements.push('✅ Adicionada especificação de estilo artístico');
    improvements.push('✅ Definida iluminação profissional');
    improvements.push('✅ Especificada composição da imagem');

    if (enhanced.colors.length > 0) {
        improvements.push('✅ Paleta de cores otimizada');
    }

    improvements.push('✅ Atmosfera e mood definidos');
    improvements.push('✅ Detalhes técnicos adicionados');
    improvements.push('✅ Prompt negativo para evitar problemas');
    improvements.push('✅ Qualidade e resolução especificadas');

    return improvements;
};

/**
 * Função principal para uso no Creative Studio
 */
export const enhanceImagePrompt = async (
    userInput: string,
    options?: {
        platform?: 'instagram' | 'facebook' | 'tiktok' | 'pinterest';
        format?: 'post' | 'story' | 'ad';
        style?: 'photo' | 'illustration' | '3d' | 'art';
    }
): Promise<PromptAnalysis> => {
    // Adicionar contexto baseado nas opções
    let context = '';

    if (options?.platform) {
        context += `Plataforma: ${options.platform}. `;
    }

    if (options?.format) {
        context += `Formato: ${options.format}. `;
    }

    if (options?.style) {
        context += `Estilo preferido: ${options.style}. `;
    }

    return await analyzeAndEnhancePrompt(userInput, context);
};

/**
 * Versão simplificada para uso rápido
 */
export const quickEnhance = async (prompt: string): Promise<string> => {
    const analysis = await enhanceImagePrompt(prompt);
    return analysis.finalPrompt;
};

/**
 * Exporta JSON para uso em outras ferramentas
 */
export const exportPromptJSON = (analysis: PromptAnalysis): string => {
    return JSON.stringify(analysis.enhanced, null, 2);
};

/**
 * Importa JSON de prompt
 */
export const importPromptJSON = (json: string): EnhancedImagePrompt => {
    return JSON.parse(json);
};

/**
 * Exemplos de prompts otimizados
 */
export const PROMPT_EXAMPLES = {
    product: {
        simple: "produto de tecnologia",
        enhanced: {
            mainSubject: "smartphone moderno premium",
            style: "fotografia de produto profissional",
            lighting: "iluminação de estúdio com softbox",
            composition: "plano médio centralizado com ângulo de 45°",
            colors: ["preto", "prata", "azul tecnológico"],
            mood: "sofisticado e premium",
            details: [
                "reflexos sutis",
                "fundo gradiente limpo",
                "sombras suaves",
                "alta nitidez nos detalhes"
            ],
            negativePrompt: ["baixa qualidade", "desfocado", "texto", "marca d'água"],
            quality: "8k, ultra detalhado, fotorrealista",
            aspectRatio: "1:1"
        }
    },

    person: {
        simple: "pessoa profissional",
        enhanced: {
            mainSubject: "profissional de negócios confiante",
            style: "fotografia corporativa profissional",
            lighting: "iluminação natural suave de janela",
            composition: "retrato plano médio, regra dos terços",
            colors: ["azul marinho", "branco", "tons neutros"],
            mood: "profissional, confiável, acessível",
            details: [
                "fundo desfocado (bokeh)",
                "expressão amigável",
                "roupa formal",
                "postura confiante"
            ],
            negativePrompt: ["baixa qualidade", "distorcido", "múltiplas pessoas"],
            quality: "alta resolução, fotorrealista, profissional",
            aspectRatio: "4:5"
        }
    }
};
