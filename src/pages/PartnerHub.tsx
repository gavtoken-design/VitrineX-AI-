import React, { useState, useEffect } from 'react';
import {
    AFFILIATE_LINKS,
    getAllCategories,
    getLinksByCategory,
    AffiliateLink
} from '../services/affiliateLinksService';
import {
    SparklesIcon,
    ArrowTopRightOnSquareIcon,
    CheckCircleIcon,
    StarIcon,
    CurrencyDollarIcon,
    TagIcon
} from '@heroicons/react/24/outline';

const PartnerHub: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [links, setLinks] = useState<AffiliateLink[]>(AFFILIATE_LINKS);
    const categories = ['all', ...getAllCategories()];

    useEffect(() => {
        if (selectedCategory === 'all') {
            setLinks(AFFILIATE_LINKS);
        } else {
            setLinks(getLinksByCategory(selectedCategory as any));
        }
    }, [selectedCategory]);

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            'all': 'Todos',
            'tools': 'Ferramentas',
            'courses': 'Cursos',
            'templates': 'Templates',
            'services': 'Serviços',
            'hosting': 'Hospedagem',
            'design': 'Design'
        };
        return labels[cat] || cat;
    };

    return (
        <div className="container mx-auto py-8 px-4 animate-fade-in">
            {/* Header */}
            <div className="mb-10 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-title mb-4 flex items-center justify-center gap-3">
                    <SparklesIcon className="w-10 h-10 text-primary" />
                    Central de Parceiros
                </h1>
                <p className="text-body text-lg leading-relaxed">
                    Ferramentas essenciais, cursos e recursos recomendados para acelerar o crescimento do seu negócio.
                    Nós selecionamos apenas o melhor para você.
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                            ${selectedCategory === cat
                                ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                : 'bg-surface text-muted border-border hover:border-primary hover:text-title'
                            }`}
                    >
                        {getCategoryLabel(cat)}
                    </button>
                ))}
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map((link) => (
                    <div
                        key={link.id}
                        className="bg-surface rounded-xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group flex flex-col"
                    >
                        {/* Card Header */}
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-br from-gray-800 to-black border border-gray-700`}>
                                    {/* Placeholder Icon based on name initials */}
                                    <span className="font-bold text-primary">{link.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold">
                                    <StarIcon className="w-3 h-3" />
                                    {link.rating}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-title mb-2 group-hover:text-primary transition-colors">
                                {link.name}
                            </h3>
                            <p className="text-muted text-sm mb-4 line-clamp-3">
                                {link.description}
                            </p>

                            {/* Pros List */}
                            <ul className="space-y-2 mb-6">
                                {link.pros.slice(0, 3).map((pro, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-body">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>{pro}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 bg-background border-t border-border mt-auto">
                            <div className="flex items-center justify-between mb-4 text-xs font-medium">
                                <div className="flex items-center gap-1 text-muted">
                                    <TagIcon className="w-3 h-3" />
                                    {getCategoryLabel(link.category)}
                                </div>
                                <div className="flex items-center gap-1 text-primary">
                                    <CurrencyDollarIcon className="w-3 h-3" />
                                    {link.price}
                                </div>
                            </div>

                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-primary hover:bg-primary-hover text-white text-center font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                Acessar Agora
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {links.length === 0 && (
                <div className="text-center py-20 text-muted">
                    <p className="text-lg">Nenhum parceiro encontrado nesta categoria.</p>
                </div>
            )}
        </div>
    );
};

export default PartnerHub;
