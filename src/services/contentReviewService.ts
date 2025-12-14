
// Content Review Service - Revisão e Validação de Conteúdo Gerado por IA

export interface ContentReviewResult {
    isValid: boolean;
    score: number; // 0-100
    errors: ContentError[];
    warnings: ContentWarning[];
    suggestions: string[];
    correctedContent?: string;
}

export interface ContentError {
    type: 'grammar' | 'spelling' | 'coherence' | 'inappropriate' | 'length';
    message: string;
    position?: { start: number; end: number };
    severity: 'low' | 'medium' | 'high';
}

export interface ContentWarning {
    type: 'style' | 'tone' | 'clarity' | 'repetition';
    message: string;
    suggestion: string;
}

/**
 * Valida gramática básica em português
 */
const validateGrammar = (text: string): ContentError[] => {
    const errors: ContentError[] = [];

    // Verificar pontuação duplicada
    if (/[.!?]{2,}/.test(text)) {
        errors.push({
            type: 'grammar',
            message: 'Pontuação duplicada detectada',
            severity: 'medium',
        });
    }

    // Verificar espaços duplicados
    if (/\s{2,}/.test(text)) {
        errors.push({
            type: 'grammar',
            message: 'Espaços duplicados detectados',
            severity: 'low',
        });
    }

    // Verificar falta de pontuação no final
    if (text.length > 20 && !/[.!?]$/.test(text.trim())) {
        errors.push({
            type: 'grammar',
            message: 'Falta pontuação no final da frase',
            severity: 'low',
        });
    }

    // Verificar letras maiúsculas no início
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach((sentence) => {
        const trimmed = sentence.trim();
        if (trimmed.length > 0 && /^[a-z]/.test(trimmed)) {
            errors.push({
                type: 'grammar',
                message: 'Frase deve começar com letra maiúscula',
                severity: 'medium',
            });
        }
    });

    return errors;
};

/**
 * Verifica ortografia básica
 */
const validateSpelling = (text: string): ContentError[] => {
    const errors: ContentError[] = [];

    // Palavras comuns escritas erradas
    const commonMistakes: { [key: string]: string } = {
        'vc': 'você',
        'tbm': 'também',
        'pq': 'porque',
        'hj': 'hoje',
        'mt': 'muito',
        'blz': 'beleza',
        'flw': 'falou',
        'vlw': 'valeu',
        'msg': 'mensagem',
        'td': 'tudo',
        'bom dia': 'bom dia', // OK
        'concerteza': 'com certeza',
        'derrepente': 'de repente',
        'porisso': 'por isso',
    };

    const words = text.toLowerCase().split(/\s+/);
    words.forEach((word) => {
        const cleaned = word.replace(/[.,!?;:]/, '');
        if (commonMistakes[cleaned] && commonMistakes[cleaned] !== cleaned) {
            errors.push({
                type: 'spelling',
                message: `"${cleaned}" deveria ser "${commonMistakes[cleaned]}"`,
                severity: 'medium',
            });
        }
    });

    return errors;
};

/**
 * Verifica coerência do texto
 */
const validateCoherence = (text: string): ContentError[] => {
    const errors: ContentError[] = [];

    // Texto muito curto
    if (text.trim().length < 10) {
        errors.push({
            type: 'coherence',
            message: 'Texto muito curto, adicione mais conteúdo',
            severity: 'high',
        });
    }

    // Texto muito longo para redes sociais
    if (text.length > 2200) {
        errors.push({
            type: 'length',
            message: 'Texto muito longo para redes sociais (máx. 2200 caracteres)',
            severity: 'high',
        });
    }

    // Verificar repetição excessiva de palavras
    const words = text.toLowerCase().split(/\s+/);
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
        const cleaned = word.replace(/[.,!?;:]/, '');
        if (cleaned.length > 3) {
            wordCount[cleaned] = (wordCount[cleaned] || 0) + 1;
        }
    });

    Object.entries(wordCount).forEach(([word, count]) => {
        if (count > 5) {
            errors.push({
                type: 'coherence',
                message: `Palavra "${word}" repetida ${count} vezes`,
                severity: 'low',
            });
        }
    });

    return errors;
};

/**
 * Verifica conteúdo inapropriado
 */
const validateAppropriate = (text: string): ContentError[] => {
    const errors: ContentError[] = [];

    // Lista de palavras inapropriadas (exemplo básico)
    const inappropriate = [
        'palavrão1', 'palavrão2', // Adicionar palavras reais conforme necessário
    ];

    const lowerText = text.toLowerCase();
    inappropriate.forEach(word => {
        if (lowerText.includes(word)) {
            errors.push({
                type: 'inappropriate',
                message: 'Conteúdo inapropriado detectado',
                severity: 'high',
            });
        }
    });

    return errors;
};

/**
 * Gera avisos de estilo
 */
const generateWarnings = (text: string): ContentWarning[] => {
    const warnings: ContentWarning[] = [];

    // Verificar uso excessivo de emojis
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 10) {
        warnings.push({
            type: 'style',
            message: 'Uso excessivo de emojis',
            suggestion: 'Reduza a quantidade de emojis para manter profissionalismo',
        });
    }

    // Verificar uso excessivo de CAPS
    const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
    if (capsWords.length > 3) {
        warnings.push({
            type: 'style',
            message: 'Uso excessivo de letras maiúsculas',
            suggestion: 'Evite escrever palavras inteiras em maiúsculas',
        });
    }

    // Verificar clareza
    const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;
    if (avgWordLength > 8) {
        warnings.push({
            type: 'clarity',
            message: 'Palavras muito longas podem dificultar leitura',
            suggestion: 'Use palavras mais simples e diretas',
        });
    }

    return warnings;
};

/**
 * Corrige erros automáticos
 */
const autoCorrect = (text: string): string => {
    let corrected = text;

    // Corrigir espaços duplicados
    corrected = corrected.replace(/\s{2,}/g, ' ');

    // Corrigir pontuação duplicada
    corrected = corrected.replace(/([.!?]){2,}/g, '$1');

    // Corrigir abreviações comuns
    const corrections: { [key: string]: string } = {
        ' vc ': ' você ',
        ' tbm ': ' também ',
        ' pq ': ' porque ',
        ' hj ': ' hoje ',
        ' mt ': ' muito ',
        'concerteza': 'com certeza',
        'derrepente': 'de repente',
        'porisso': 'por isso',
    };

    Object.entries(corrections).forEach(([wrong, right]) => {
        const regex = new RegExp(wrong, 'gi');
        corrected = corrected.replace(regex, right);
    });

    // Garantir espaço após pontuação
    corrected = corrected.replace(/([.!?,;:])([A-Za-z])/g, '$1 $2');

    // Capitalizar primeira letra de frases
    corrected = corrected.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());

    return corrected.trim();
};

/**
 * Revisa conteúdo gerado pela IA
 */
export const reviewContent = (content: string): ContentReviewResult => {
    const errors: ContentError[] = [];
    const warnings: ContentWarning[] = [];

    // Executar todas as validações
    errors.push(...validateGrammar(content));
    errors.push(...validateSpelling(content));
    errors.push(...validateCoherence(content));
    errors.push(...validateAppropriate(content));
    warnings.push(...generateWarnings(content));

    // Calcular score (0-100)
    const errorPenalty = errors.reduce((sum, error) => {
        switch (error.severity) {
            case 'high': return sum + 20;
            case 'medium': return sum + 10;
            case 'low': return sum + 5;
            default: return sum;
        }
    }, 0);

    const warningPenalty = warnings.length * 2;
    const score = Math.max(0, 100 - errorPenalty - warningPenalty);

    // Gerar sugestões
    const suggestions: string[] = [];
    if (errors.some(e => e.type === 'grammar')) {
        suggestions.push('Revise a gramática do texto');
    }
    if (errors.some(e => e.type === 'spelling')) {
        suggestions.push('Corrija erros de ortografia');
    }
    if (warnings.some(w => w.type === 'style')) {
        suggestions.push('Ajuste o estilo do texto');
    }

    // Auto-corrigir se possível
    const correctedContent = autoCorrect(content);

    return {
        isValid: errors.filter(e => e.severity === 'high').length === 0,
        score,
        errors,
        warnings,
        suggestions,
        correctedContent: correctedContent !== content ? correctedContent : undefined,
    };
};

/**
 * Revisa e corrige automaticamente se possível
 */
export const reviewAndCorrect = async (content: string): Promise<{ content: string; review: ContentReviewResult }> => {
    const review = reviewContent(content);

    // Se tem correção automática disponível e score é baixo, usar correção
    if (review.correctedContent && review.score < 70) {
        return {
            content: review.correctedContent,
            review: reviewContent(review.correctedContent), // Re-revisar conteúdo corrigido
        };
    }

    return {
        content,
        review,
    };
};

/**
 * Formata resultado da revisão para exibição
 */
export const formatReviewResult = (review: ContentReviewResult): string => {
    const lines: string[] = [];

    lines.push(`📊 Score de Qualidade: ${review.score}/100`);
    lines.push('');

    if (review.errors.length > 0) {
        lines.push('❌ Erros Encontrados:');
        review.errors.forEach((error, i) => {
            lines.push(`${i + 1}. [${error.severity.toUpperCase()}] ${error.message}`);
        });
        lines.push('');
    }

    if (review.warnings.length > 0) {
        lines.push('⚠️ Avisos:');
        review.warnings.forEach((warning, i) => {
            lines.push(`${i + 1}. ${warning.message}`);
            lines.push(`   💡 ${warning.suggestion}`);
        });
        lines.push('');
    }

    if (review.suggestions.length > 0) {
        lines.push('💡 Sugestões:');
        review.suggestions.forEach((suggestion, i) => {
            lines.push(`${i + 1}. ${suggestion}`);
        });
    }

    return lines.join('\n');
};
