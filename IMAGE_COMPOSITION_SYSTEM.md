# 🎨 Sistema de Composição de Imagens - Documentação Completa

## 📋 Visão Geral

Sistema que permite importar uma imagem, mantê-la com foco e adicionar elementos (logos, overlays) em posições específicas da composição.

---

## ✅ Funcionalidades

### 1. **Posicionamento Flexível**
9 opções de posicionamento:
- ⊙ Centro
- ↑ Topo
- ↓ Baixo
- ← Esquerda
- → Direita
- ↖ Superior Esquerdo
- ↗ Superior Direito
- ↙ Inferior Esquerdo
- ↘ Inferior Direito

### 2. **Manter Imagem com Foco**
- Imagem principal sempre em destaque
- Elementos adicionais não interferem no foco
- Composição equilibrada automaticamente

### 3. **Adicionar Logos**
- Upload de logo/marca
- Controle de tamanho (5% - 50%)
- Controle de opacidade (0% - 100%)
- Posicionamento livre

### 4. **Múltiplos Elementos**
- Adicione quantos elementos quiser
- Cada um com posição independente
- Sistema de camadas (z-index)

### 5. **Preview em Tempo Real**
- Veja resultado antes de finalizar
- Atualização automática ao mudar configurações

---

## 🚀 Como Usar

### Uso Básico no Creative Studio

```typescript
import ImageComposer from '../components/ImageComposer';

const CreativeStudio = () => {
  const [mainImage, setMainImage] = useState('');
  const [finalComposition, setFinalComposition] = useState('');

  return (
    <div>
      {/* Upload da imagem principal */}
      <input 
        type="file" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setMainImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* Compositor */}
      {mainImage && (
        <ImageComposer
          mainImage={mainImage}
          onCompositionComplete={(composedUrl) => {
            setFinalComposition(composedUrl);
            // Usar imagem composta
          }}
        />
      )}

      {/* Resultado */}
      {finalComposition && (
        <img src={finalComposition} alt="Composição final" />
      )}
    </div>
  );
};
```

---

## 📊 Exemplos Práticos

### Exemplo 1: Post com Logo no Canto

```typescript
import { composeWithLogo } from '../services/imageCompositionService';

const result = await composeWithLogo(
  'url-da-imagem-principal.jpg',
  'url-do-logo.png',
  'bottom-right', // Posição
  { width: 1080, height: 1080 } // Tamanho do canvas
);

// result = data URL da imagem composta
```

### Exemplo 2: Produto com Fundo e Logo

```typescript
import { composeImages } from '../services/imageCompositionService';

const config = {
  canvas: { width: 1080, height: 1080 },
  elements: [
    {
      id: 'background',
      type: 'overlay',
      url: 'fundo.jpg',
      position: 'center',
      size: 100,
      opacity: 0.3, // Fundo desfocado
      zIndex: 1,
    },
    {
      id: 'product',
      type: 'main',
      url: 'produto.png',
      position: 'center',
      size: 70, // 70% do canvas
      opacity: 1,
      zIndex: 2,
    },
    {
      id: 'logo',
      type: 'logo',
      url: 'logo.png',
      position: 'bottom-right',
      size: 15,
      opacity: 0.9,
      zIndex: 3,
    },
  ],
  outputFormat: 'png',
  quality: 95,
};

const result = await composeImages(config);
```

### Exemplo 3: Story com Múltiplos Elementos

```typescript
import { addElementsToImage } from '../services/imageCompositionService';

const result = await addElementsToImage(
  'imagem-base.jpg',
  [
    { url: 'logo.png', position: 'top-right', size: 12, opacity: 1 },
    { url: 'selo.png', position: 'top-left', size: 15, opacity: 0.9 },
    { url: 'cta.png', position: 'bottom', size: 30, opacity: 1 },
  ]
);
```

---

## 🎨 Interface Visual

### Seletor de Posição

```
┌─────────────────────────┐
│  ↖     ↑      ↗        │
│                         │
│  ←     ⊙      →        │
│                         │
│  ↙     ↓      ↘        │
└─────────────────────────┘
```

### Controles

```
Tamanho:  [=========>    ] 50%
Opacidade: [============>  ] 90%
```

---

## 📐 Presets para Redes Sociais

### Instagram Post (1:1)

```typescript
import { applyCompositionPreset } from '../services/imageCompositionService';

const result = await applyCompositionPreset(
  'instagram-post-with-logo',
  'imagem.jpg',
  'logo.png'
);

// Canvas: 1080x1080
// Logo: 15% no canto inferior direito
```

### Instagram Story (9:16)

```typescript
const result = await applyCompositionPreset(
  'instagram-story-with-logo',
  'imagem.jpg',
  'logo.png'
);

// Canvas: 1080x1920
// Logo: 12% no canto superior direito
```

### Facebook Cover

```typescript
const result = await applyCompositionPreset(
  'facebook-cover-with-logo',
  'imagem.jpg',
  'logo.png'
);

// Canvas: 820x312
// Logo: 10% no canto inferior esquerdo
```

---

## 🔧 Casos de Uso

### 1. Adicionar Logo em Post Pronto

```
ANTES: Post sem marca
DEPOIS: Post com logo no canto
```

### 2. Criar Composição de Produto

```
ANTES: Foto do produto simples
DEPOIS: Produto + fundo estilizado + logo
```

### 3. Story com CTA

```
ANTES: Imagem básica
DEPOIS: Imagem + logo topo + CTA embaixo
```

### 4. Banner com Múltiplos Elementos

```
ANTES: Imagem de fundo
DEPOIS: Fundo + produto + logo + selo + texto
```

---

## 💡 Dicas de Uso

### 1. Tamanho do Logo

- **Pequeno (5-10%)**: Discreto, não chama atenção
- **Médio (10-20%)**: Visível mas não dominante
- **Grande (20-30%)**: Destaque, marca forte

### 2. Opacidade

- **100%**: Logo totalmente opaco
- **80-90%**: Sutilmente transparente (recomendado)
- **50-70%**: Marca d'água
- **<50%**: Muito transparente

### 3. Posicionamento

- **Cantos**: Não interfere no conteúdo principal
- **Centro**: Quando logo é o foco
- **Topo/Baixo**: Para banners e headers

### 4. Qualidade

- Use PNG para logos (transparência)
- Use JPG para fotos
- Qualidade 90-95% para resultado final

---

## 🎯 Fluxo Completo

```
1. Usuário importa imagem principal
   ↓
2. Sistema mantém imagem com foco
   ↓
3. Usuário adiciona logo/elementos
   ↓
4. Escolhe posição (9 opções)
   ↓
5. Ajusta tamanho e opacidade
   ↓
6. Preview em tempo real
   ↓
7. Confirma composição
   ↓
8. Sistema gera imagem final (1080x1080)
   ↓
9. Pronto para usar/agendar!
```

---

## 📊 Especificações Técnicas

### Tamanhos de Canvas Suportados

| Plataforma | Formato | Dimensões |
|------------|---------|-----------|
| Instagram Post | 1:1 | 1080x1080 |
| Instagram Story | 9:16 | 1080x1920 |
| Facebook Post | 1:1 | 1200x1200 |
| Facebook Cover | 205:78 | 820x312 |
| Twitter Post | 16:9 | 1200x675 |
| LinkedIn Post | 1.91:1 | 1200x627 |

### Formatos de Saída

- **PNG**: Melhor para logos e transparência
- **JPG**: Menor tamanho de arquivo
- **WebP**: Melhor compressão (moderno)

### Qualidade

- **Preview**: 80% (mais rápido)
- **Final**: 95% (alta qualidade)

---

## ✅ Benefícios

- ✅ **Mantém foco** na imagem principal
- ✅ **Flexibilidade total** de posicionamento
- ✅ **Preview em tempo real**
- ✅ **Fácil de usar** (interface visual)
- ✅ **Profissional** (resultado de alta qualidade)
- ✅ **Rápido** (composição em segundos)
- ✅ **Versátil** (múltiplos casos de uso)

---

## 🎉 Resultado Final

**Antes:**
- Imagem simples sem marca
- Sem elementos adicionais
- Genérico

**Depois:**
- Imagem com logo profissional
- Elementos posicionados perfeitamente
- Marca forte e reconhecível
- Pronto para publicar!

---

**Status**: ✅ PRONTO PARA USO  
**Complexidade**: Média  
**Tempo de Integração**: 10 minutos
