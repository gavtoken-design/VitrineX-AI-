# 🎯 Guia de Integração - Media APIs no VitrineX

## 📚 Componentes Disponíveis

### 1. **useMediaLibrary** (Hook)
Hook React para gerenciar busca de mídia

### 2. **MediaPickerModal** (Componente)
Modal completo para seleção de mídia

### 3. **MediaSearch** (Componente)
Barra de busca com filtros

### 4. **MediaGallery** (Componente)
Galeria de resultados

---

## 🚀 Integração no Creative Studio

### Exemplo Completo

```typescript
// src/pages/CreativeStudio.tsx
import React, { useState } from 'react';
import MediaPickerModal from '../components/MediaPickerModal';
import { MediaImage } from '../services/mediaService';
import { PhotoIcon } from '@heroicons/react/24/outline';

const CreativeStudio: React.FC = () => {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [postImage, setPostImage] = useState<string>('');
  const [postContent, setPostContent] = useState('');

  const handleSelectImage = (image: MediaImage) => {
    setPostImage(image.url);
    console.log('Imagem selecionada:', {
      url: image.url,
      photographer: image.photographer,
      source: image.source,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Creative Studio</h1>

      {/* Post Editor */}
      <div className="bg-gray-900 rounded-lg p-6">
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Escreva sua legenda..."
          className="w-full bg-gray-800 text-white p-4 rounded-lg mb-4"
          rows={4}
        />

        {/* Image Preview */}
        {postImage ? (
          <div className="relative mb-4">
            <img
              src={postImage}
              alt="Post preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={() => setPostImage('')}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg"
            >
              Remover
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowMediaPicker(true)}
            className="w-full h-64 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
          >
            <PhotoIcon className="w-12 h-12 text-gray-600 mb-2" />
            <span className="text-gray-400">Clique para adicionar imagem</span>
          </button>
        )}

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
          Publicar
        </button>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleSelectImage}
        type="image"
        title="Selecionar Imagem para o Post"
      />
    </div>
  );
};

export default CreativeStudio;
```

---

## 🎨 Integração no Ad Studio

### Exemplo com Múltiplas Imagens

```typescript
// src/pages/AdStudio.tsx
import React, { useState } from 'react';
import MediaPickerModal from '../components/MediaPickerModal';
import { MediaImage } from '../services/mediaService';

const AdStudio: React.FC = () => {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [adImages, setAdImages] = useState<string[]>([]);

  const handleSelectImage = (image: MediaImage) => {
    // Adicionar imagem ao carrossel do anúncio
    setAdImages(prev => [...prev, image.url]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ad Studio</h1>

      {/* Ad Creator */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Criar Anúncio</h2>

        {/* Image Carousel */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Imagens do Anúncio (até 10)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {adImages.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Ad image ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  onClick={() => setAdImages(adImages.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {adImages.length < 10 && (
              <button
                onClick={() => setShowMediaPicker(true)}
                className="aspect-square border-2 border-dashed border-gray-700 rounded flex items-center justify-center hover:border-blue-500"
              >
                <span className="text-3xl text-gray-600">+</span>
              </button>
            )}
          </div>
        </div>

        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">
          Criar Anúncio
        </button>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleSelectImage}
        type="image"
        title="Adicionar Imagem ao Anúncio"
        allowMultiple={false}
      />
    </div>
  );
};

export default AdStudio;
```

---

## 🎬 Integração com Vídeos

### Exemplo para Vídeos

```typescript
// src/pages/VideoCreator.tsx
import React, { useState } from 'react';
import MediaPickerModal from '../components/MediaPickerModal';
import { MediaVideo } from '../services/mediaService';

const VideoCreator: React.FC = () => {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);

  const handleSelectVideo = (video: MediaVideo) => {
    setSelectedVideo(video);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Video Creator</h1>

      {selectedVideo ? (
        <div className="bg-gray-900 rounded-lg p-6">
          <video
            src={selectedVideo.downloadUrl}
            controls
            className="w-full rounded-lg mb-4"
          />
          <p className="text-gray-400 text-sm">
            Por {selectedVideo.user} · Duração: {selectedVideo.duration}s
          </p>
          <button
            onClick={() => setSelectedVideo(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Remover Vídeo
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowMediaPicker(true)}
          className="w-full h-96 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center hover:border-blue-500"
        >
          <span className="text-4xl mb-2">🎬</span>
          <span className="text-gray-400">Selecionar Vídeo</span>
        </button>
      )}

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleSelectVideo}
        type="video"
        title="Selecionar Vídeo"
      />
    </div>
  );
};

export default VideoCreator;
```

---

## 🔧 Uso Avançado do Hook

### Busca Personalizada

```typescript
import { useMediaLibrary } from '../hooks/useMediaLibrary';

const MyComponent = () => {
  const {
    items,
    isLoading,
    search,
    loadMore,
    getCurated,
    getRandom,
  } = useMediaLibrary({ type: 'image', perPage: 30 });

  // Busca simples
  const handleSearch = () => {
    search('marketing digital');
  };

  // Busca com filtros
  const handleAdvancedSearch = () => {
    search('oceano', {
      orientation: 'landscape',
      color: 'blue',
      orderBy: 'popular',
    });
  };

  // Imagens curadas
  const handleGetCurated = () => {
    getCurated();
  };

  // Imagens aleatórias
  const handleGetRandom = async () => {
    const randomImages = await getRandom('nature', 5);
    console.log('5 imagens aleatórias:', randomImages);
  };

  return (
    <div>
      <button onClick={handleSearch}>Buscar</button>
      <button onClick={handleAdvancedSearch}>Busca Avançada</button>
      <button onClick={handleGetCurated}>Curadas</button>
      <button onClick={handleGetRandom}>Aleatórias</button>
      
      {items.map(item => (
        <img key={item.id} src={item.thumbnail} alt={item.alt} />
      ))}
      
      {hasMore && <button onClick={loadMore}>Carregar Mais</button>}
    </div>
  );
};
```

---

## 💡 Casos de Uso

### 1. **Background Automático**
Gerar background aleatório para posts

```typescript
const generateRandomBackground = async () => {
  const { getRandom } = useMediaLibrary({ type: 'image' });
  const images = await getRandom('abstract', 1);
  if (images.length > 0) {
    setBackground(images[0].url);
  }
};
```

### 2. **Sugestões Baseadas em Conteúdo**
Sugerir imagens baseadas no texto do post

```typescript
const suggestImages = async (postText: string) => {
  // Extrair palavras-chave do texto
  const keywords = extractKeywords(postText);
  
  // Buscar imagens relacionadas
  const { search } = useMediaLibrary({ type: 'image' });
  await search(keywords.join(' '));
};
```

### 3. **Galeria de Inspiração**
Mostrar imagens curadas para inspiração

```typescript
useEffect(() => {
  const { getCurated } = useMediaLibrary({ type: 'image' });
  getCurated();
}, []);
```

---

## 🎨 Customização do Modal

### Alterar Título e Aparência

```typescript
<MediaPickerModal
  isOpen={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={handleSelect}
  type="image"
  title="🎨 Escolha uma Imagem Incrível"
  allowMultiple={true}  // Permitir seleção múltipla
/>
```

### Filtrar por Tipo Específico

```typescript
// Apenas paisagens
<MediaPickerModal
  isOpen={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={handleSelect}
  type="image"
  // Você pode pré-filtrar passando uma busca inicial
/>
```

---

## 📊 Tracking e Analytics

### Rastrear Uso de Imagens

```typescript
const handleSelectImage = (image: MediaImage) => {
  // Salvar metadados
  const imageData = {
    id: image.id,
    source: image.source,
    photographer: image.photographer,
    url: image.url,
    selectedAt: new Date().toISOString(),
  };
  
  // Enviar para analytics
  trackEvent('image_selected', imageData);
  
  // Salvar no localStorage
  const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
  history.push(imageData);
  localStorage.setItem('imageHistory', JSON.stringify(history));
  
  // Usar imagem
  setPostImage(image.url);
};
```

---

## ✅ Checklist de Integração

### Creative Studio
- [ ] Importar `MediaPickerModal`
- [ ] Adicionar estado para controlar modal
- [ ] Adicionar botão "Adicionar Imagem"
- [ ] Implementar `handleSelectImage`
- [ ] Testar seleção de imagem
- [ ] Testar preview da imagem
- [ ] Testar remoção da imagem

### Ad Studio
- [ ] Importar `MediaPickerModal`
- [ ] Adicionar estado para múltiplas imagens
- [ ] Adicionar botão "+" para adicionar imagens
- [ ] Implementar `handleSelectImage`
- [ ] Testar seleção múltipla
- [ ] Testar remoção individual
- [ ] Testar limite de 10 imagens

### Campaign Builder
- [ ] Importar `useMediaLibrary`
- [ ] Buscar imagens relacionadas ao produto
- [ ] Mostrar sugestões automáticas
- [ ] Permitir seleção de imagens
- [ ] Salvar imagens na campanha

---

## 🚀 Próximos Passos

1. ✅ Integrar no Creative Studio
2. ✅ Integrar no Ad Studio
3. ✅ Criar hook `useMediaLibrary`
4. ✅ Criar `MediaPickerModal`
5. [ ] Testar em produção
6. [ ] Adicionar analytics
7. [ ] Otimizar performance

---

**Desenvolvido por Jean Carlos - VitrineX AI**  
**Data**: 2025-12-12  
**Versão**: 2.5.0-media-integration
