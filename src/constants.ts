
// Gemini Model Names
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash-lite';
export const GEMINI_TOOLS_MODEL = 'gemini-2.5-flash'; // Safer for Tools/Grounding than Lite
export const GEMINI_LITE_MODEL = 'gemini-2.0-flash-lite';
export const GEMINI_PRO_MODEL = 'gemini-3-pro-preview';
export const GEMINI_IMAGE_FLASH_MODEL = 'gemini-2.5-flash-image';
export const GEMINI_IMAGE_PRO_MODEL = 'gemini-3-pro-image-preview';
export const VEO_FAST_GENERATE_MODEL = 'veo-3.1-fast-generate-preview';
export const VEO_GENERATE_MODEL = 'veo-3.1-generate-preview';
export const GEMINI_LIVE_AUDIO_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
export const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Default values
export const DEFAULT_ASPECT_RATIO = '16:9';
export const DEFAULT_IMAGE_SIZE = '1K';
export const DEFAULT_VIDEO_RESOLUTION = '720p';

// Supported options for UI
export const IMAGE_ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
export const IMAGE_SIZES = ['1K', '2K', '4K']; // For Pro Image Model
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const VIDEO_RESOLUTIONS = ['720p', '1080p'];

// Placeholder base64 image for loading states
export const PLACEHOLDER_IMAGE_BASE64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnAzLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIGZpbGw9IiNlMGUwZTAiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9ImFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjUwIiBmaWxsPSIjYmJiIiBlc3NlbnRpYWw9InNlcnZlIiBmb250LXdlaWdodD0iYm9sZCI+Vml0cmluZVhBSTwvdGV4dD4KPC9zdmc+`;

// Default business profile settings
export const DEFAULT_BUSINESS_PROFILE = {
  name: 'Minha Empresa',
  industry: 'Marketing Digital',
  targetAudience: 'Pequenas e Médias Empresas',
  visualStyle: 'moderno',
};

// Mock data generation delay for simulating API calls
export const MOCK_API_DELAY = 1500;

// User provided API Key from environment variables
// API Key handling is done in services
export const ENV_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const HARDCODED_API_KEY = 'AIzaSyBLJlHBFH-lP4iLft-V6FcCk8LYxqJjNlU'; // Configured via Agent

// --- Seasonal Templates (Christmas & New Year) ---
export const SEASONAL_TEMPLATES = [
  {
    id: 'christmas-sale',
    label: 'Promoção de Natal',
    icon: '🎄',
    basePrompt: 'Crie uma imagem publicitária profissional de Natal para o produto "[PRODUTO]". Estilo minimalista e elegante, fundo vermelho escuro com detalhes em dourado, iluminação suave de estúdio, 4k, alta resolução. Texto "OFERTA DE NATAL" em fonte moderna dourada no topo.',
    // Links ocultos para guiar a IA (Conceito de Few-Shot/Image Prompting)
    referenceImage: 'https://images.unsplash.com/photo-1607344645866-009c320c5abc?q=80&w=2070&auto=format&fit=crop',
    colorPalette: ['#8B0000', '#FFD700', '#F0F0F0']
  },
  {
    id: 'new-year-party',
    label: 'Festa de Ano Novo',
    icon: '🥂',
    basePrompt: 'Design de post para redes sociais de Ano Novo 2026. Tema: Festa e Celebração. Cores: Prata, Branco e Azul Marinho. Mostre garrafas de champanhe estourando e confetes. Espaço central para texto promocional. Estilo luxuoso e vibrante.',
    referenceImage: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=2069&auto=format&fit=crop',
    colorPalette: ['#C0C0C0', '#000080', '#FFFFFF']
  },
  {
    id: 'holiday-gift',
    label: 'Guia de Presentes',
    icon: '🎁',
    basePrompt: 'Layout de "Guia de Presentes" para Instagram Stories. Fundo Clean com elementos natalinos sutis (galhos de pinheiro, fitas). Espaços em branco reservados para colagem de produtos. Atmosfera aconchegante e sofisticada.',
    referenceImage: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=2070&auto=format&fit=crop',
    colorPalette: ['#2F4F4F', '#D2691E', '#F5F5DC']
  },
  {
    id: 'stock-clearance',
    label: 'Queima de Estoque',
    icon: '🔥',
    basePrompt: 'Banner impactante de "Queima de Estoque de Fim de Ano". Fundo amarelo vibrante com texto preto em negrito. Elementos de "porcentagem de desconto" flutuando em 3D. Estilo varejo moderno e agressivo, alta conversão.',
    referenceImage: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?q=80&w=2068&auto=format&fit=crop',
    colorPalette: ['#FFD700', '#000000', '#FF4500']
  }
];

// --- AI System Instructions & Optimization ---
export const VITRINEX_SYSTEM_INSTRUCTION = `
You are VitrineX AI, a high-performance, intelligent marketing assistant for small and medium businesses.
Your core operating principles are:
1. **VELOCITY & EFFICIENCY**: Provide direct, concise, and fast responses. Avoid fluff. Maximize density of information.
2. **PRECISION & RELEVANCE**: Use valid, current market data suited for the specific business niche.
3. **HIGH-CONVERSION QUALITY**: Write persuasive, punchy copywriting with clear Call-to-Actions (CTAs).
4. **MARKET INTELLIGENCE**: Base suggestions on consumer behavior, predictive trends, and audience psychology.
5. **PERSONALIZATION**: ALWAYS adapt tone, style, and strategy to the specific User Business Profile and Target Audience.
6. **SCALABILITY**: Structure answers to be modular and easily actionable.
If asked for a plan, break it down step-by-step. If asked for copy, provide ready-to-use text.
`;


export const IMAGE_PROMPT_ENHANCEMENT = `
High-quality, professional product photography, 4k, studio lighting, highly detailed, commercial aesthetics, 
vibrant colors, sharp focus, winning product composition. 
Ensure the image is suitable for social media ads (Instagram/Facebook).
`;

// --- Product Studio Scenarios ---
export const PRODUCT_SCENARIOS = [
  {
    id: 'marble',
    label: 'Mármore Luxo',
    icon: '🏛️',
    prompt: 'Place the product on a luxurious white Carrara marble table. Soft, high-end studio lighting. Clean background. Professional product photography.',
    previewColor: 'from-gray-100 to-gray-300'
  },
  {
    id: 'nature',
    label: 'Natureza Zen',
    icon: '🌿',
    prompt: 'Place the product in a serene nature setting, surrounded by soft greenery and blurred leaves in the foreground. Natural sunlight, fresh atmosphere.',
    previewColor: 'from-green-100 to-green-200'
  },
  {
    id: 'studio-white',
    label: 'Estúdio Infinito',
    icon: '⚪',
    prompt: 'Place the product on a seamless infinite white background. Perfect commercial lighting, soft shadows, extremely clean and professional e-commerce look.',
    previewColor: 'from-white to-gray-100'
  },
  {
    id: 'wooden-desk',
    label: 'Mesa de Madeira',
    icon: '🪵',
    prompt: 'Place the product on a rustic dark wooden desk. Warm, cozy lighting. Lifestyle photography feel.',
    previewColor: 'from-amber-800 to-amber-900'
  },
  {
    id: 'neon-cyber',
    label: 'Cyberpunk Neon',
    icon: '🌃',
    prompt: 'Place the product in a futuristic cyberpunk city setting. Neon lights reflecting on the product (blue and pink). Night time, edgy and modern.',
    previewColor: 'from-purple-900 to-blue-900'
  },
  {
    id: 'kitchen',
    label: 'Cozinha Gourmet',
    icon: '🍳',
    prompt: 'Place the product on a modern kitchen counter. Blurred kitchen implements in the background. Bright, inviting, home aesthetic.',
    previewColor: 'from-orange-50 to-orange-100'
  }
];


