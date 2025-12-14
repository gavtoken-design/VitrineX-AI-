import React, { useState, useEffect } from 'react';
import {
    ImagePosition,
    composeImages,
    composeWithLogo,
    COMPOSITION_PRESETS,
    CompositionConfig,
    ImageElement
} from '../services/imageCompositionService';
import Button from './Button';
import { useToast } from '../contexts/ToastContext';

interface ImageComposerProps {
    mainImage: string;
    onCompositionComplete: (composedImageUrl: string) => void;
}

const ImageComposer: React.FC<ImageComposerProps> = ({ mainImage, onCompositionComplete }) => {
    const [position, setPosition] = useState<ImagePosition>('center');
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [logoSize, setLogoSize] = useState<number>(15);
    const [logoOpacity, setLogoOpacity] = useState<number>(0.9);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isComposing, setIsComposing] = useState(false);
    const { addToast } = useToast();

    // Opções de posicionamento
    const positions: Array<{ value: ImagePosition; label: string; icon: string }> = [
        { value: 'center', label: 'Centro', icon: '⊙' },
        { value: 'top', label: 'Topo', icon: '↑' },
        { value: 'bottom', label: 'Baixo', icon: '↓' },
        { value: 'left', label: 'Esquerda', icon: '←' },
        { value: 'right', label: 'Direita', icon: '→' },
        { value: 'top-left', label: 'Superior Esquerdo', icon: '↖' },
        { value: 'top-right', label: 'Superior Direito', icon: '↗' },
        { value: 'bottom-left', label: 'Inferior Esquerdo', icon: '↙' },
        { value: 'bottom-right', label: 'Inferior Direito', icon: '↘' },
    ];

    // Gerar preview automaticamente
    useEffect(() => {
        if (mainImage && logoUrl) {
            generatePreview();
        }
    }, [position, logoSize, logoOpacity]);

    const generatePreview = async () => {
        try {
            const config: CompositionConfig = {
                canvas: { width: 400, height: 400 }, // Preview menor
                elements: [
                    {
                        id: 'main',
                        type: 'main',
                        url: mainImage,
                        position: 'center',
                        size: 100,
                        opacity: 1,
                        zIndex: 1,
                    },
                    ...(logoUrl ? [{
                        id: 'logo',
                        type: 'logo' as const,
                        url: logoUrl,
                        position: position,
                        size: logoSize,
                        opacity: logoOpacity,
                        zIndex: 2,
                    }] : []),
                ],
                outputFormat: 'png' as const,
                quality: 80,
            };

            const preview = await composeImages(config);
            setPreviewUrl(preview);
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
        }
    };

    const handleCompose = async () => {
        setIsComposing(true);
        try {
            let result: string;

            if (logoUrl) {
                result = await composeWithLogo(mainImage, logoUrl, position, { width: 1080, height: 1080 });
            } else {
                // Apenas a imagem principal
                const config: CompositionConfig = {
                    canvas: { width: 1080, height: 1080 },
                    elements: [{
                        id: 'main',
                        type: 'main',
                        url: mainImage,
                        position: 'center',
                        size: 100,
                        opacity: 1,
                        zIndex: 1,
                    }],
                    outputFormat: 'png',
                    quality: 95,
                };
                result = await composeImages(config);
            }

            onCompositionComplete(result);
            addToast({ type: 'success', message: '✅ Composição criada com sucesso!' });
        } catch (error) {
            addToast({ type: 'error', message: '❌ Erro ao criar composição' });
            console.error(error);
        } finally {
            setIsComposing(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-surface p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-textlight mb-4">
                🎨 Composição de Imagem
            </h3>

            {/* Preview */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-textlight mb-2">Preview</label>
                <div className="relative bg-darkbg rounded-lg p-4 flex items-center justify-center" style={{ minHeight: '400px' }}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-96 rounded-lg shadow-lg" />
                    ) : (
                        <img src={mainImage} alt="Imagem principal" className="max-w-full max-h-96 rounded-lg shadow-lg" />
                    )}
                </div>
            </div>

            {/* Upload de Logo */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-textlight mb-2">
                    Logo / Elemento Adicional
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-textlight
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-white
            hover:file:bg-primary/80
            cursor-pointer"
                />
                {logoUrl && (
                    <button
                        onClick={() => setLogoUrl('')}
                        className="mt-2 text-sm text-red-400 hover:text-red-300"
                    >
                        ✕ Remover logo
                    </button>
                )}
            </div>

            {/* Seletor de Posição */}
            {logoUrl && (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textlight mb-3">
                            Posição do Logo
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {positions.map((pos) => (
                                <button
                                    key={pos.value}
                                    onClick={() => setPosition(pos.value)}
                                    className={`p-3 rounded-lg border-2 transition-all ${position === pos.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border bg-darkbg text-textmuted hover:border-primary/50'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{pos.icon}</div>
                                    <div className="text-xs">{pos.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Controles de Tamanho e Opacidade */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-textlight mb-2">
                                Tamanho: {logoSize}%
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={logoSize}
                                onChange={(e) => setLogoSize(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textlight mb-2">
                                Opacidade: {Math.round(logoOpacity * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={logoOpacity * 100}
                                onChange={(e) => setLogoOpacity(Number(e.target.value) / 100)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3">
                <Button
                    onClick={handleCompose}
                    variant="primary"
                    disabled={isComposing}
                    className="flex-1"
                >
                    {isComposing ? '⏳ Criando...' : '✨ Criar Composição Final'}
                </Button>

                {logoUrl && (
                    <Button
                        onClick={generatePreview}
                        variant="secondary"
                    >
                        🔄 Atualizar Preview
                    </Button>
                )}
            </div>

            {/* Dicas */}
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs text-primary">
                    💡 <strong>Dica:</strong> Adicione seu logo ou outros elementos visuais.
                    A imagem principal sempre ficará com foco e você pode posicionar elementos adicionais onde quiser!
                </p>
            </div>
        </div>
    );
};

export default ImageComposer;
