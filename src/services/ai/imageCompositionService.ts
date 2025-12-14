// Image Composition Service - Composição e Posicionamento de Imagens
// Permite manter imagem importada com foco e adicionar elementos em posições específicas

export type ImagePosition =
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

export interface ImageElement {
    id: string;
    type: 'main' | 'logo' | 'overlay' | 'text';
    url: string;
    position: ImagePosition;
    size: number; // 0-100 (percentual)
    opacity: number; // 0-1
    zIndex: number;
    offsetX?: number; // Ajuste fino horizontal
    offsetY?: number; // Ajuste fino vertical
}

export interface CompositionConfig {
    canvas: {
        width: number;
        height: number;
        backgroundColor?: string;
    };
    elements: ImageElement[];
    outputFormat: 'png' | 'jpg' | 'webp';
    quality: number; // 0-100
}

export interface PositionCoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Calcula coordenadas baseadas na posição escolhida
 */
export const calculatePosition = (
    position: ImagePosition,
    canvasWidth: number,
    canvasHeight: number,
    elementWidth: number,
    elementHeight: number,
    offsetX: number = 0,
    offsetY: number = 0
): PositionCoordinates => {
    let x = 0;
    let y = 0;

    switch (position) {
        case 'center':
            x = (canvasWidth - elementWidth) / 2;
            y = (canvasHeight - elementHeight) / 2;
            break;

        case 'top':
            x = (canvasWidth - elementWidth) / 2;
            y = 20; // Margem do topo
            break;

        case 'bottom':
            x = (canvasWidth - elementWidth) / 2;
            y = canvasHeight - elementHeight - 20; // Margem do fundo
            break;

        case 'left':
            x = 20; // Margem da esquerda
            y = (canvasHeight - elementHeight) / 2;
            break;

        case 'right':
            x = canvasWidth - elementWidth - 20; // Margem da direita
            y = (canvasHeight - elementHeight) / 2;
            break;

        case 'top-left':
            x = 20;
            y = 20;
            break;

        case 'top-right':
            x = canvasWidth - elementWidth - 20;
            y = 20;
            break;

        case 'bottom-left':
            x = 20;
            y = canvasHeight - elementHeight - 20;
            break;

        case 'bottom-right':
            x = canvasWidth - elementWidth - 20;
            y = canvasHeight - elementHeight - 20;
            break;
    }

    return {
        x: x + offsetX,
        y: y + offsetY,
        width: elementWidth,
        height: elementHeight
    };
};

/**
 * Cria composição de imagens no canvas
 */
export const composeImages = async (
    config: CompositionConfig
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = config.canvas.width;
        canvas.height = config.canvas.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
        }

        // Fundo
        if (config.canvas.backgroundColor) {
            ctx.fillStyle = config.canvas.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Ordenar elementos por zIndex
        const sortedElements = [...config.elements].sort((a, b) => a.zIndex - b.zIndex);

        // Carregar e desenhar cada elemento
        const loadPromises = sortedElements.map((element) => {
            return new Promise<void>((resolveElement, rejectElement) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    // Calcular tamanho do elemento
                    const elementSize = (Math.min(canvas.width, canvas.height) * element.size) / 100;
                    const aspectRatio = img.width / img.height;

                    let elementWidth = elementSize;
                    let elementHeight = elementSize;

                    if (aspectRatio > 1) {
                        elementHeight = elementSize / aspectRatio;
                    } else {
                        elementWidth = elementSize * aspectRatio;
                    }

                    // Calcular posição
                    const coords = calculatePosition(
                        element.position,
                        canvas.width,
                        canvas.height,
                        elementWidth,
                        elementHeight,
                        element.offsetX,
                        element.offsetY
                    );

                    // Aplicar opacidade
                    ctx.globalAlpha = element.opacity;

                    // Desenhar imagem
                    ctx.drawImage(
                        img,
                        coords.x,
                        coords.y,
                        coords.width,
                        coords.height
                    );

                    // Resetar opacidade
                    ctx.globalAlpha = 1;

                    resolveElement();
                };

                img.onerror = () => rejectElement(new Error(`Erro ao carregar imagem: ${element.url}`));
                img.src = element.url;
            });
        });

        // Aguardar todas as imagens carregarem
        Promise.all(loadPromises)
            .then(() => {
                // Converter canvas para data URL
                const dataUrl = canvas.toDataURL(
                    `image/${config.outputFormat}`,
                    config.quality / 100
                );
                resolve(dataUrl);
            })
            .catch(reject);
    });
};

/**
 * Cria composição simples: imagem principal + logo
 */
export const composeWithLogo = async (
    mainImageUrl: string,
    logoUrl: string,
    logoPosition: ImagePosition = 'bottom-right',
    canvasSize: { width: number; height: number } = { width: 1080, height: 1080 }
): Promise<string> => {
    const config: CompositionConfig = {
        canvas: {
            width: canvasSize.width,
            height: canvasSize.height,
        },
        elements: [
            {
                id: 'main',
                type: 'main',
                url: mainImageUrl,
                position: 'center',
                size: 100, // Preencher todo canvas
                opacity: 1,
                zIndex: 1,
            },
            {
                id: 'logo',
                type: 'logo',
                url: logoUrl,
                position: logoPosition,
                size: 15, // 15% do tamanho do canvas
                opacity: 0.9,
                zIndex: 2,
            },
        ],
        outputFormat: 'png',
        quality: 95,
    };

    return await composeImages(config);
};

/**
 * Cria composição com imagem de fundo e elemento principal
 */
export const composeWithBackground = async (
    backgroundUrl: string,
    mainElementUrl: string,
    elementPosition: ImagePosition = 'center',
    elementSize: number = 60
): Promise<string> => {
    const config: CompositionConfig = {
        canvas: {
            width: 1080,
            height: 1080,
        },
        elements: [
            {
                id: 'background',
                type: 'overlay',
                url: backgroundUrl,
                position: 'center',
                size: 100,
                opacity: 0.3, // Fundo desfocado/transparente
                zIndex: 1,
            },
            {
                id: 'main',
                type: 'main',
                url: mainElementUrl,
                position: elementPosition,
                size: elementSize,
                opacity: 1,
                zIndex: 2,
            },
        ],
        outputFormat: 'png',
        quality: 95,
    };

    return await composeImages(config);
};

/**
 * Adiciona múltiplos elementos a uma imagem base
 */
export const addElementsToImage = async (
    baseImageUrl: string,
    elements: Array<{
        url: string;
        position: ImagePosition;
        size?: number;
        opacity?: number;
    }>
): Promise<string> => {
    const config: CompositionConfig = {
        canvas: {
            width: 1080,
            height: 1080,
        },
        elements: [
            {
                id: 'base',
                type: 'main',
                url: baseImageUrl,
                position: 'center',
                size: 100,
                opacity: 1,
                zIndex: 1,
            },
            ...elements.map((el, index) => ({
                id: `element-${index}`,
                type: 'overlay' as const,
                url: el.url,
                position: el.position,
                size: el.size || 20,
                opacity: el.opacity || 1,
                zIndex: index + 2,
            })),
        ],
        outputFormat: 'png',
        quality: 95,
    };

    return await composeImages(config);
};

/**
 * Gera prompt melhorado mantendo imagem importada
 */
export const generateCompositionPrompt = (
    importedImageDescription: string,
    position: ImagePosition,
    additionalElements: string[]
): string => {
    const positionDescriptions: Record<ImagePosition, string> = {
        'center': 'centralizado na composição',
        'top': 'posicionado no topo',
        'bottom': 'posicionado na parte inferior',
        'left': 'posicionado à esquerda',
        'right': 'posicionado à direita',
        'top-left': 'no canto superior esquerdo',
        'top-right': 'no canto superior direito',
        'bottom-left': 'no canto inferior esquerdo',
        'bottom-right': 'no canto inferior direito',
    };

    let prompt = `Composição profissional com ${importedImageDescription} ${positionDescriptions[position]}`;

    if (additionalElements.length > 0) {
        prompt += `, incluindo ${additionalElements.join(', ')}`;
    }

    prompt += '. Manter foco na imagem principal, composição equilibrada, alta qualidade, 8k';

    return prompt;
};

/**
 * Configurações pré-definidas para casos comuns
 */
export const COMPOSITION_PRESETS = {
    'instagram-post-with-logo': {
        canvas: { width: 1080, height: 1080 },
        mainSize: 100,
        logoPosition: 'bottom-right' as ImagePosition,
        logoSize: 15,
    },
    'instagram-story-with-logo': {
        canvas: { width: 1080, height: 1920 },
        mainSize: 100,
        logoPosition: 'top-right' as ImagePosition,
        logoSize: 12,
    },
    'facebook-cover-with-logo': {
        canvas: { width: 820, height: 312 },
        mainSize: 100,
        logoPosition: 'bottom-left' as ImagePosition,
        logoSize: 10,
    },
    'product-showcase': {
        canvas: { width: 1080, height: 1080 },
        mainSize: 70,
        logoPosition: 'bottom-right' as ImagePosition,
        logoSize: 15,
    },
};

/**
 * Aplica preset de composição
 */
export const applyCompositionPreset = async (
    presetName: keyof typeof COMPOSITION_PRESETS,
    mainImageUrl: string,
    logoUrl?: string
): Promise<string> => {
    const preset = COMPOSITION_PRESETS[presetName];

    const elements: ImageElement[] = [
        {
            id: 'main',
            type: 'main',
            url: mainImageUrl,
            position: 'center',
            size: preset.mainSize,
            opacity: 1,
            zIndex: 1,
        },
    ];

    if (logoUrl) {
        elements.push({
            id: 'logo',
            type: 'logo',
            url: logoUrl,
            position: preset.logoPosition,
            size: preset.logoSize,
            opacity: 0.95,
            zIndex: 2,
        });
    }

    const config: CompositionConfig = {
        canvas: preset.canvas,
        elements,
        outputFormat: 'png',
        quality: 95,
    };

    return await composeImages(config);
};

/**
 * Exporta configuração de composição como JSON
 */
export const exportCompositionConfig = (config: CompositionConfig): string => {
    return JSON.stringify(config, null, 2);
};

/**
 * Importa configuração de composição de JSON
 */
export const importCompositionConfig = (json: string): CompositionConfig => {
    return JSON.parse(json);
};
