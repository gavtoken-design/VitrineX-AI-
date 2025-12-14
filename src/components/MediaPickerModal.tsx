
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import MediaSearch from './MediaSearch';
import MediaGallery from './MediaGallery';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaImage, MediaVideo } from '../services/mediaService';

export interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MediaImage | MediaVideo) => void;
    type?: 'image' | 'video';
    title?: string;
    allowMultiple?: boolean;
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    type = 'image',
    title,
    allowMultiple = false,
}) => {
    const {
        items,
        isLoading,
        hasMore,
        search,
        loadMore,
        getCurated,
    } = useMediaLibrary({ type, perPage: 15 });

    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (isOpen && type === 'image') {
            getCurated();
        }
    }, [isOpen, type, getCurated]);

    const handleSelect = (item: MediaImage | MediaVideo) => {
        if (allowMultiple) {
            if (selectedItems.includes(item.id)) {
                setSelectedItems(selectedItems.filter(id => id !== item.id));
            } else {
                setSelectedItems([...selectedItems, item.id]);
            }
        } else {
            onSelect(item);
            onClose();
        }
    };

    const handleConfirmMultiple = () => {
        const selected = items.filter(item => selectedItems.includes(item.id));
        selected.forEach(item => onSelect(item));
        onClose();
        setSelectedItems([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-6xl bg-gray-900 rounded-lg shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {title || `Selecionar ${type === 'image' ? 'Imagem' : 'Vídeo'}`}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Milhões de {type === 'image' ? 'imagens' : 'vídeos'} profissionais gratuitos
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-800">
                    <MediaSearch
                        onSearch={search}
                        isLoading={isLoading}
                        placeholder={`Buscar ${type === 'image' ? 'imagens' : 'vídeos'}...`}
                    />
                </div>

                {/* Gallery */}
                <div className="flex-1 overflow-y-auto p-6">
                    <MediaGallery
                        items={items}
                        type={type}
                        isLoading={isLoading}
                        onLoadMore={loadMore}
                        hasMore={hasMore}
                        onSelect={handleSelect}
                        selectedItems={selectedItems}
                        showSelection={allowMultiple}
                    />
                </div>

                {/* Footer (only for multiple selection) */}
                {allowMultiple && selectedItems.length > 0 && (
                    <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                        <p className="text-gray-400">
                            {selectedItems.length} {type === 'image' ? 'imagem(ns)' : 'vídeo(s)'} selecionado(s)
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedItems([])}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={handleConfirmMultiple}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Confirmar Seleção
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaPickerModal;
