// Affiliate Links Service - Sistema de Links de Afiliados
// Gerencia recomendações de produtos/serviços com links de afiliados

export interface AffiliateLink {
    id: string;
    name: string;
    description: string;
    category: 'tools' | 'courses' | 'templates' | 'services' | 'hosting' | 'design';
    url: string; // Link com ID de afiliado
    commission: string; // Ex: "30%", "R$ 50 por venda"
    price: string; // Ex: "Grátis", "R$ 97/mês", "R$ 497"
    relevantFor: string[]; // Contextos/módulos relevantes
    pros: string[];
    rating: number; // 0-5
    image?: string;
}

// 🔗 BANCO DE LINKS DE AFILIADOS
// IMPORTANTE: Substitua os links abaixo pelos seus links reais de afiliado!

export const AFFILIATE_LINKS: AffiliateLink[] = [
    // === FERRAMENTAS DE DESIGN ===
    {
        id: 'canva-pro',
        name: 'Canva Pro',
        description: 'Editor de design profissional com milhares de templates',
        category: 'design',
        url: 'https://www.canva.com/pt_br/', // SUBSTITUIR pelo seu link de afiliado
        commission: '30%',
        price: 'R$ 54,90/mês',
        relevantFor: ['CreativeStudio', 'AdStudio', 'design', 'posts'],
        pros: [
            'Milhares de templates prontos',
            'Fácil de usar',
            'Biblioteca de imagens e vídeos',
            'Colaboração em equipe'
        ],
        rating: 4.8
    },
    {
        id: 'adobe-express',
        name: 'Adobe Express',
        description: 'Criação rápida de conteúdo visual profissional',
        category: 'design',
        url: 'https://www.adobe.com/express/', // SUBSTITUIR
        commission: '25%',
        price: 'R$ 69,90/mês',
        relevantFor: ['CreativeStudio', 'design', 'branding'],
        pros: [
            'Qualidade Adobe',
            'Templates premium',
            'Integração com Creative Cloud'
        ],
        rating: 4.6
    },

    // === FERRAMENTAS DE AGENDAMENTO ===
    {
        id: 'buffer',
        name: 'Buffer',
        description: 'Agendamento e análise de posts para redes sociais',
        category: 'tools',
        url: 'https://buffer.com/', // SUBSTITUIR
        commission: '30%',
        price: 'A partir de $6/mês',
        relevantFor: ['SmartScheduler', 'scheduling', 'analytics'],
        pros: [
            'Agendamento em múltiplas plataformas',
            'Analytics detalhados',
            'Sugestão de melhores horários',
            'Fácil de usar'
        ],
        rating: 4.7
    },
    {
        id: 'hootsuite',
        name: 'Hootsuite',
        description: 'Plataforma completa de gerenciamento de redes sociais',
        category: 'tools',
        url: 'https://www.hootsuite.com/', // SUBSTITUIR
        commission: '25%',
        price: 'A partir de $99/mês',
        relevantFor: ['SmartScheduler', 'analytics', 'social media'],
        pros: [
            'Gerenciamento completo',
            'Múltiplas contas',
            'Relatórios avançados',
            'Monitoramento de menções'
        ],
        rating: 4.5
    },

    // === CURSOS E TREINAMENTOS ===
    {
        id: 'curso-marketing-digital',
        name: 'Marketing Digital Completo',
        description: 'Curso completo de marketing digital do zero ao avançado',
        category: 'courses',
        url: 'https://hotmart.com/pt-br/', // SUBSTITUIR pelo link do curso
        commission: '40%',
        price: 'R$ 497',
        relevantFor: ['learning', 'marketing', 'strategy'],
        pros: [
            'Certificado reconhecido',
            'Aulas práticas',
            'Suporte vitalício',
            'Atualizações gratuitas'
        ],
        rating: 4.9
    },
    {
        id: 'curso-copywriting',
        name: 'Copywriting Persuasivo',
        description: 'Aprenda a escrever textos que vendem',
        category: 'courses',
        url: 'https://hotmart.com/pt-br/', // SUBSTITUIR
        commission: '50%',
        price: 'R$ 297',
        relevantFor: ['CreativeStudio', 'copywriting', 'sales'],
        pros: [
            'Técnicas comprovadas',
            'Exemplos reais',
            'Templates prontos',
            'Garantia de 7 dias'
        ],
        rating: 4.8
    },

    // === TEMPLATES E RECURSOS ===
    {
        id: 'templates-instagram',
        name: 'Pack de Templates Instagram',
        description: '500+ templates editáveis para Instagram',
        category: 'templates',
        url: 'https://www.creative-tim.com/', // SUBSTITUIR
        commission: '35%',
        price: 'R$ 97',
        relevantFor: ['CreativeStudio', 'instagram', 'design'],
        pros: [
            '500+ templates',
            'Totalmente editáveis',
            'Atualizações mensais',
            'Suporte incluído'
        ],
        rating: 4.7
    },

    // === HOSPEDAGEM E DOMÍNIOS ===
    {
        id: 'hostinger',
        name: 'Hostinger',
        description: 'Hospedagem de sites rápida e confiável',
        category: 'hosting',
        url: 'https://www.hostinger.com.br/', // SUBSTITUIR
        commission: '60%',
        price: 'A partir de R$ 6,99/mês',
        relevantFor: ['website', 'landing page', 'blog'],
        pros: [
            'Muito rápido',
            'Suporte 24/7',
            'SSL grátis',
            'Domínio grátis no primeiro ano'
        ],
        rating: 4.8
    },

    // === SERVIÇOS ===
    {
        id: 'grammarly',
        name: 'Grammarly',
        description: 'Corretor gramatical e de estilo avançado',
        category: 'tools',
        url: 'https://www.grammarly.com/', // SUBSTITUIR
        commission: '20%',
        price: 'A partir de $12/mês',
        relevantFor: ['CreativeStudio', 'writing', 'content'],
        pros: [
            'Correção em tempo real',
            'Sugestões de estilo',
            'Detector de plágio',
            'Funciona em qualquer site'
        ],
        rating: 4.6
    }
];

/**
 * Busca links relevantes para um contexto
 */
export const getRelevantLinks = (context: string, limit: number = 3): AffiliateLink[] => {
    const lowerContext = context.toLowerCase();

    return AFFILIATE_LINKS
        .filter(link =>
            link.relevantFor.some(rel =>
                rel.toLowerCase().includes(lowerContext) ||
                lowerContext.includes(rel.toLowerCase())
            )
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
};

/**
 * Busca links por categoria
 */
export const getLinksByCategory = (category: AffiliateLink['category']): AffiliateLink[] => {
    return AFFILIATE_LINKS
        .filter(link => link.category === category)
        .sort((a, b) => b.rating - a.rating);
};

/**
 * Busca link específico por ID
 */
export const getLinkById = (id: string): AffiliateLink | null => {
    return AFFILIATE_LINKS.find(link => link.id === id) || null;
};

/**
 * Busca links por termo de pesquisa
 */
export const searchLinks = (query: string): AffiliateLink[] => {
    const lowerQuery = query.toLowerCase();

    return AFFILIATE_LINKS.filter(link =>
        link.name.toLowerCase().includes(lowerQuery) ||
        link.description.toLowerCase().includes(lowerQuery) ||
        link.category.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Gera recomendação personalizada
 */
export const generateRecommendation = (context: string): string => {
    const links = getRelevantLinks(context, 2);

    if (links.length === 0) {
        return '';
    }

    const recommendations = links.map(link => `
🔗 **${link.name}**
${link.description}
💰 ${link.price}
⭐ ${link.rating}/5
✅ ${link.pros[0]}
[Ver Ferramenta →](${link.url})
  `).join('\n');

    return `
🎁 **Ferramentas Recomendadas:**

${recommendations}

💡 Essas ferramentas podem te ajudar a alcançar melhores resultados!
  `;
};

/**
 * Gera lista de todas as categorias
 */
export const getAllCategories = (): string[] => {
    return Array.from(new Set(AFFILIATE_LINKS.map(link => link.category)));
};

/**
 * Estatísticas do banco de afiliados
 */
export const getAffiliateStats = () => {
    return {
        total: AFFILIATE_LINKS.length,
        byCategory: {
            tools: getLinksByCategory('tools').length,
            courses: getLinksByCategory('courses').length,
            templates: getLinksByCategory('templates').length,
            services: getLinksByCategory('services').length,
            hosting: getLinksByCategory('hosting').length,
            design: getLinksByCategory('design').length,
        },
        averageRating: (
            AFFILIATE_LINKS.reduce((sum, link) => sum + link.rating, 0) /
            AFFILIATE_LINKS.length
        ).toFixed(1)
    };
};
