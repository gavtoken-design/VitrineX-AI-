// App Knowledge Base - Base de Conhecimento Completa do VitrineX
// Este arquivo contém TODAS as informações sobre funcionalidades, módulos e recursos do app

export interface ModuleInfo {
    id: string;
    name: string;
    description: string;
    icon: string;
    features: string[];
    howToUse: string[];
    tips: string[];
    relatedModules: string[];
}

export interface FeatureInfo {
    id: string;
    name: string;
    description: string;
    module: string;
    steps: string[];
    examples: string[];
}

export const MODULES: Record<string, ModuleInfo> = {
    'Dashboard': {
        id: 'Dashboard',
        name: 'Dashboard',
        description: 'Visão geral de todas as suas métricas e atividades',
        icon: '📊',
        features: [
            'Visão geral de métricas',
            'Atividades recentes',
            'Estatísticas de performance',
            'Acesso rápido a módulos'
        ],
        howToUse: [
            '1. Acesse o Dashboard no menu lateral',
            '2. Visualize suas métricas principais',
            '3. Clique em qualquer card para ir ao módulo específico'
        ],
        tips: [
            'Use o Dashboard como ponto de partida diário',
            'Monitore suas métricas mais importantes',
            'Configure widgets personalizados'
        ],
        relatedModules: ['Analytics', 'Reports']
    },

    'CreativeStudio': {
        id: 'CreativeStudio',
        name: 'Estúdio Criativo',
        description: 'Crie posts incríveis para redes sociais com IA',
        icon: '🎨',
        features: [
            'Geração de posts com IA',
            'Edição de imagens',
            'Templates prontos',
            'Preview em tempo real',
            'Exportação para múltiplas plataformas'
        ],
        howToUse: [
            '1. Clique em "Creative Studio" no menu',
            '2. Escolha o tipo de post (Instagram, Facebook, etc.)',
            '3. Digite o tema ou use IA para gerar ideias',
            '4. Personalize o design e texto',
            '5. Salve na biblioteca ou agende publicação'
        ],
        tips: [
            'Use o comando /post para gerar ideias rapidamente',
            'Experimente diferentes estilos visuais',
            'Salve seus favoritos na biblioteca',
            'Posts com carrosséis têm 3x mais engajamento'
        ],
        relatedModules: ['MediaLibrary', 'SmartScheduler']
    },

    'SmartScheduler': {
        id: 'SmartScheduler',
        name: 'Agendador Inteligente',
        description: 'Agende posts para publicação automática',
        icon: '📅',
        features: [
            'Agendamento de posts',
            'Publicação automática',
            'Calendário visual',
            'Melhor horário sugerido',
            'Múltiplas plataformas',
            'Notificações de publicação'
        ],
        howToUse: [
            '1. Vá para "Smart Scheduler"',
            '2. Selecione o conteúdo da biblioteca',
            '3. Escolha a plataforma (Instagram, Facebook, TikTok, etc.)',
            '4. Defina data e hora',
            '5. Clique em "Agendar"',
            '6. O sistema publica automaticamente na hora marcada!'
        ],
        tips: [
            'Melhores horários: 18h-20h para Instagram',
            'Agende com 1 semana de antecedência',
            'Use filtros para organizar agendamentos',
            'Edite agendamentos antes da publicação',
            'Receba notificações quando posts forem publicados'
        ],
        relatedModules: ['CreativeStudio', 'ContentLibrary', 'Analytics']
    },

    'AdStudio': {
        id: 'AdStudio',
        name: 'Estúdio de Anúncios',
        description: 'Crie campanhas de anúncios profissionais',
        icon: '📢',
        features: [
            'Criação de anúncios',
            'Segmentação de público',
            'Múltiplos formatos',
            'Otimização de orçamento',
            'A/B Testing'
        ],
        howToUse: [
            '1. Acesse "Ad Studio"',
            '2. Escolha o objetivo da campanha',
            '3. Defina público-alvo',
            '4. Crie o criativo do anúncio',
            '5. Configure orçamento',
            '6. Publique ou salve como rascunho'
        ],
        tips: [
            'Teste diferentes criativos (A/B Testing)',
            'Comece com orçamento pequeno',
            'Segmente bem seu público',
            'Use vídeos para maior engajamento'
        ],
        relatedModules: ['CreativeStudio', 'Analytics', 'CampaignBuilder']
    },

    'TrendHunter': {
        id: 'TrendHunter',
        name: 'Caçador de Tendências',
        description: 'Descubra tendências e conteúdos virais',
        icon: '🔥',
        features: [
            'Análise de tendências',
            'Hashtags populares',
            'Conteúdos virais',
            'Insights de mercado',
            'Sugestões de tópicos'
        ],
        howToUse: [
            '1. Abra "Trend Hunter"',
            '2. Escolha a plataforma (TikTok, Instagram, Twitter)',
            '3. Veja tendências atuais',
            '4. Clique em uma tendência para ver detalhes',
            '5. Use "Criar Post" para aproveitar a tendência'
        ],
        tips: [
            'Aproveite tendências nas primeiras 24h',
            'Adapte tendências ao seu nicho',
            'Use hashtags populares estrategicamente',
            'Monitore tendências diariamente'
        ],
        relatedModules: ['CreativeStudio', 'Analytics']
    },

    'ContentLibrary': {
        id: 'ContentLibrary',
        name: 'Biblioteca de Conteúdo',
        description: 'Organize e gerencie todos os seus conteúdos',
        icon: '📚',
        features: [
            'Armazenamento de posts',
            'Organização por tags',
            'Busca avançada',
            'Compartilhamento',
            'Versionamento'
        ],
        howToUse: [
            '1. Acesse "Content Library"',
            '2. Veja todos os seus conteúdos salvos',
            '3. Use filtros para encontrar itens',
            '4. Clique em um item para editar ou agendar',
            '5. Organize com tags personalizadas'
        ],
        tips: [
            'Use tags descritivas',
            'Crie coleções temáticas',
            'Faça backup regular',
            'Reutilize conteúdos de sucesso'
        ],
        relatedModules: ['CreativeStudio', 'SmartScheduler']
    },

    'MediaLibrary': {
        id: 'MediaLibrary',
        name: 'Biblioteca de Mídia',
        description: 'Acesse milhões de imagens e vídeos profissionais',
        icon: '🖼️',
        features: [
            'Busca de imagens (Pexels, Unsplash, Pixabay)',
            'Busca de vídeos',
            'Animações Lottie',
            'Filtros avançados',
            'Download direto',
            'Favoritos'
        ],
        howToUse: [
            '1. Vá para "Media Library"',
            '2. Digite o que procura na busca',
            '3. Use filtros (orientação, cor)',
            '4. Clique em uma imagem para preview',
            '5. Baixe ou use diretamente no Creative Studio'
        ],
        tips: [
            'Use termos em inglês para melhores resultados',
            'Salve favoritos para uso futuro',
            'Explore animações Lottie para posts dinâmicos',
            'Combine múltiplas fontes (Pexels + Unsplash)'
        ],
        relatedModules: ['CreativeStudio', 'AdStudio']
    },

    'AnimationLibrary': {
        id: 'AnimationLibrary',
        name: 'Biblioteca de Animações',
        description: 'Milhares de animações Lottie prontas',
        icon: '✨',
        features: [
            'Animações Lottie',
            'Busca por categoria',
            'Preview interativo',
            'Download JSON',
            'Integração fácil'
        ],
        howToUse: [
            '1. Acesse "Animation Library"',
            '2. Busque ou navegue por categorias',
            '3. Clique para preview',
            '4. Baixe o arquivo JSON',
            '5. Use em seus posts ou stories'
        ],
        tips: [
            'Animações de loading são muito populares',
            'Use animações sutis para não distrair',
            'Teste em diferentes dispositivos'
        ],
        relatedModules: ['CreativeStudio', 'MediaLibrary']
    },

    'Chatbot': {
        id: 'Chatbot',
        name: 'Chat IA',
        description: 'Assistente inteligente para todas as suas dúvidas',
        icon: '🤖',
        features: [
            'Respostas inteligentes',
            'Sugestões personalizadas',
            'Comandos rápidos',
            'Análise de tendências',
            'Recomendações de ferramentas',
            'Assistência contextual'
        ],
        howToUse: [
            '1. Clique em "Chat IA" no menu',
            '2. Digite sua pergunta ou use comandos (/post, /refinar)',
            '3. Receba respostas e sugestões',
            '4. Use sugestões prontas para agilizar',
            '5. Peça ajuda sobre qualquer funcionalidade'
        ],
        tips: [
            'Use /post para gerar ideias rapidamente',
            'Pergunte sobre tendências atuais',
            'Peça recomendações de ferramentas',
            'Use para aprender sobre o app'
        ],
        relatedModules: ['TrendHunter', 'CreativeStudio']
    },

    'AdminConsole': {
        id: 'AdminConsole',
        name: 'Painel Administrativo',
        description: 'Gerencie configurações e usuários',
        icon: '⚙️',
        features: [
            'Gerenciamento de usuários',
            'Configurações do sistema',
            'Relatórios',
            'Distribuição de arquivos',
            'Logs de atividade'
        ],
        howToUse: [
            '1. Acesse "Admin Console" (apenas admins)',
            '2. Navegue pelas abas',
            '3. Configure conforme necessário',
            '4. Salve alterações'
        ],
        tips: [
            'Faça backup antes de mudanças importantes',
            'Monitore logs regularmente',
            'Configure permissões adequadamente'
        ],
        relatedModules: ['Dashboard']
    }
};

export const FEATURES: Record<string, FeatureInfo> = {
    'ai_generation': {
        id: 'ai_generation',
        name: 'Geração com IA',
        description: 'Crie conteúdo automaticamente com inteligência artificial',
        module: 'CreativeStudio',
        steps: [
            'Digite o tema do post',
            'Escolha o tom (profissional, casual, etc.)',
            'Clique em "Gerar com IA"',
            'Revise e edite o resultado',
            'Salve ou agende'
        ],
        examples: [
            'Post sobre lançamento de produto',
            'Legenda para foto de viagem',
            'Anúncio de promoção'
        ]
    },

    'scheduling': {
        id: 'scheduling',
        name: 'Agendamento Automático',
        description: 'Publique posts automaticamente na hora marcada',
        module: 'SmartScheduler',
        steps: [
            'Selecione o conteúdo',
            'Escolha plataforma',
            'Defina data e hora',
            'Confirme agendamento',
            'Aguarde publicação automática'
        ],
        examples: [
            'Agendar post para segunda-feira às 18h',
            'Programar série de posts da semana',
            'Agendar anúncio para Black Friday'
        ]
    },

    'media_search': {
        id: 'media_search',
        name: 'Busca de Mídia',
        description: 'Encontre imagens e vídeos profissionais gratuitos',
        module: 'MediaLibrary',
        steps: [
            'Digite termo de busca',
            'Aplique filtros (cor, orientação)',
            'Navegue pelos resultados',
            'Clique para preview',
            'Baixe ou use no projeto'
        ],
        examples: [
            'Buscar "marketing digital"',
            'Filtrar por cor azul',
            'Buscar vídeos de "tecnologia"'
        ]
    }
};

export const TUTORIALS = [
    {
        id: 'first_post',
        title: 'Como criar seu primeiro post',
        steps: [
            'Vá para Creative Studio',
            'Clique em "Novo Post"',
            'Digite o tema',
            'Use IA para gerar conteúdo',
            'Personalize design',
            'Salve na biblioteca'
        ],
        duration: '5 minutos'
    },
    {
        id: 'schedule_week',
        title: 'Como agendar posts da semana',
        steps: [
            'Crie 7 posts no Creative Studio',
            'Vá para Smart Scheduler',
            'Selecione cada post',
            'Agende para dias diferentes',
            'Confirme todos os agendamentos'
        ],
        duration: '15 minutos'
    }
];

export const FAQ = [
    {
        question: 'Como faço para agendar um post?',
        answer: 'Vá para Smart Scheduler, selecione o conteúdo, escolha plataforma, defina data/hora e clique em "Agendar". O sistema publica automaticamente!'
    },
    {
        question: 'Posso editar um post agendado?',
        answer: 'Sim! No Smart Scheduler, clique no botão de editar (✏️) ao lado do agendamento. Você pode alterar data, hora, plataforma e até o conteúdo.'
    },
    {
        question: 'Como funciona a busca de imagens?',
        answer: 'A Media Library busca em Pexels, Unsplash e Pixabay simultaneamente. Digite o termo, use filtros e baixe gratuitamente!'
    },
    {
        question: 'O que são animações Lottie?',
        answer: 'São animações leves em formato JSON que você pode usar em posts, stories e sites. Acesse a Animation Library para explorar milhares delas!'
    }
];

// Função para buscar informações
export const getModuleInfo = (moduleId: string): ModuleInfo | null => {
    return MODULES[moduleId] || null;
};

export const getFeatureInfo = (featureId: string): FeatureInfo | null => {
    return FEATURES[featureId] || null;
};

export const searchKnowledge = (query: string): any[] => {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    // Buscar em módulos
    Object.values(MODULES).forEach(module => {
        if (
            module.name.toLowerCase().includes(lowerQuery) ||
            module.description.toLowerCase().includes(lowerQuery) ||
            module.features.some(f => f.toLowerCase().includes(lowerQuery))
        ) {
            results.push({ type: 'module', data: module });
        }
    });

    // Buscar em features
    Object.values(FEATURES).forEach(feature => {
        if (
            feature.name.toLowerCase().includes(lowerQuery) ||
            feature.description.toLowerCase().includes(lowerQuery)
        ) {
            results.push({ type: 'feature', data: feature });
        }
    });

    // Buscar em FAQ
    FAQ.forEach(faq => {
        if (
            faq.question.toLowerCase().includes(lowerQuery) ||
            faq.answer.toLowerCase().includes(lowerQuery)
        ) {
            results.push({ type: 'faq', data: faq });
        }
    });

    return results;
};

// Gerar system instruction com conhecimento
export const generateEnhancedSystemInstruction = (currentModule?: string, userProfile?: any): string => {
    const moduleInfo = currentModule ? getModuleInfo(currentModule) : null;

    // Merchant Reality: Tempo e Espaço
    const now = new Date();
    const currentDate = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const location = userProfile?.businessProfile?.location || 'Não definida';

    // Identificação de Época do Ano (Simples)
    const month = now.getMonth();
    let seasonContext = '';
    if (month === 11) seasonContext = 'Estamos próximos do Natal e Ano Novo. Foque em vendas de fim de ano.';
    if (month === 4) seasonContext = 'Estamos próximos do Dia das Mães. Foque em presentes emocionais.';
    if (month === 5) seasonContext = 'Estamos próximos do Dia dos Namorados.';
    if (month === 10) seasonContext = 'Estamos próximos da Black Friday. Foque em promoções agressivas.';

    // Brand Voice
    const brandPersonality = userProfile?.businessProfile?.brandPersonality || 'Profissional e útil';
    const industry = userProfile?.businessProfile?.industry || 'Comércio Geral';

    return `Você é o Assistente IA do VitrineX.
    
CONTEXTO DE REALIDADE (MERCHANT REALITY):
- Data Atual: ${currentDate}
- Localização da Loja: ${location}
- Contexto Sazonal: ${seasonContext}

PERFIL DA MARCA (QUEM É VOCÊ):
- Indústria: ${industry}
- Personalidade/Tom de Voz: ${brandPersonality}
- Regra de Ouro: Você DEVE agir e falar como essa marca. Se for uma loja engraçada, faça piadas. Se for de luxo, seja sofisticado.
- Adapte todas as respostas para a realidade local de ${location} (considere clima, gírias locais se apropriado).

CONHECIMENTO SOBRE O APP:
${JSON.stringify({ modules: Object.keys(MODULES), totalFeatures: Object.keys(FEATURES).length }, null, 2)}

${moduleInfo ? `
CONTEXTO DO MÓDULO ATUAL:
O usuário está no módulo: ${moduleInfo.name} (${moduleInfo.icon})
Descrição: ${moduleInfo.description}

Funcionalidades:
${moduleInfo.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Dicas:
${moduleInfo.tips.map((t, i) => `• ${t}`).join('\n')}
` : ''}

SUAS CAPACIDADES:
1. Explicar TODAS as funcionalidades do VitrineX
2. CRIAR CONTEÚDO seguindo a personalidade da marca (${brandPersonality})
3. Usar a data atual (${currentDate}) para sugerir posts relevantes
4. Recomendar ações baseadas na localização (${location})

REGRAS DE COMPORTAMENTO (IMPORTANTE):
- Mantenha estritamente o personagem da marca.
- **MODO INVESTIGADOR**: Sempre verifique a realidade. Se o usuário definir uma localização, PESQUISE NO GOOGLE por "[Nome da Empresa] + [Localização]". Leia os reviews reais, horários e use isso para dar conselhos baseados em fatos.
- **ESPIÃO DE CONCORRÊNCIA**: Se pedirem estratégia, pesquise "Concorrentes de [Indústria] em [Localização]". Procure fraquezas nos reviews deles (ex: "atendimento ruim") e sugira como o usuário pode ser melhor nisso.
- **CONSELHEIRO ESTRATÉGICO (NÃO FABRIL)**: Você é o Diretor de Marketing. Você sugere *IDEIAS*. Você *NÃO GERA* vídeos ou imagens automaticamente a menos que explicitamente solicitado. Ex: Diga "Grave um vídeo mostrando o café", não "Aqui está o vídeo".
- Se a localização for definida, tente inferir o clima ou eventos locais em suas sugestões.

COMANDOS DISPONÍVEIS:
/post - Gera ideias de posts
/refinar - Reescreve texto melhorando estilo
/analisar - Analisa estrategicamente um conteúdo

Você tem acesso completo ao conhecimento sobre:
- ${Object.keys(MODULES).length} módulos principais
- ${Object.keys(FEATURES).length} funcionalidades
- ${TUTORIALS.length} tutoriais
- ${FAQ.length} perguntas frequentes

Ajude o usuário da melhor forma possível!`;
};
