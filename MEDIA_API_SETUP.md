# 🚀 Guia de Configuração - APIs de Mídia

## 📋 APIs Necessárias

Para usar o sistema de busca de mídia do VitrineX AI, você precisa obter chaves de API gratuitas dos seguintes serviços:

---

## 1. **Pexels API** (Recomendado)

### Como Obter:
1. Acesse: https://www.pexels.com/api/
2. Clique em "Get Started"
3. Crie uma conta gratuita
4. Vá para "Your API Key"
5. Copie sua chave de API

### Adicionar ao `.env`:
```
VITE_PEXELS_API_KEY=sua_chave_aqui
```

### Limites Gratuitos:
- 200 requisições por hora
- Sem limite de downloads
- Uso comercial permitido

---

## 2. **Unsplash API** (Recomendado)

### Como Obter:
1. Acesse: https://unsplash.com/developers
2. Clique em "Register as a developer"
3. Crie uma conta
4. Vá para "Your apps"
5. Clique em "New Application"
6. Aceite os termos
7. Copie o "Access Key"

### Adicionar ao `.env`:
```
VITE_UNSPLASH_ACCESS_KEY=sua_chave_aqui
```

### Limites Gratuitos:
- 50 requisições por hora
- Uso comercial permitido
- Atribuição recomendada (mas não obrigatória)

---

## 3. **Pixabay API** (Opcional - Fallback)

### Como Obter:
1. Acesse: https://pixabay.com/api/docs/
2. Crie uma conta em https://pixabay.com/
3. Vá para https://pixabay.com/api/docs/
4. Copie sua chave de API (aparece automaticamente quando logado)

### Adicionar ao `.env`:
```
VITE_PIXABAY_API_KEY=sua_chave_aqui
```

### Limites Gratuitos:
- Sem limite oficial (uso razoável)
- Uso comercial permitido
- Sem atribuição necessária

---

## 📝 Configuração Completa

### 1. Criar arquivo `.env`

Na raiz do projeto, crie um arquivo chamado `.env` com o seguinte conteúdo:

```env
# Google Gemini API (já configurada)
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui

# Media APIs (NOVAS)
VITE_PEXELS_API_KEY=sua_chave_pexels_aqui
VITE_UNSPLASH_ACCESS_KEY=sua_chave_unsplash_aqui
VITE_PIXABAY_API_KEY=sua_chave_pixabay_aqui
```

### 2. Reiniciar o servidor de desenvolvimento

Após adicionar as chaves, reinicie o servidor:

```bash
npm run dev
```

---

## ✅ Verificação

Para verificar se as APIs estão funcionando:

1. Acesse o VitrineX AI
2. Vá para **Creative Studio** ou **Media Library**
3. Faça uma busca por "marketing"
4. Você deve ver imagens de alta qualidade aparecendo

---

## 🔒 Segurança

**IMPORTANTE:**
- ✅ O arquivo `.env` está no `.gitignore` (não será enviado ao GitHub)
- ✅ As chaves são usadas apenas no frontend (sem risco de exposição)
- ✅ Todas as APIs têm limites de uso gratuitos

**NÃO COMPARTILHE** suas chaves de API publicamente!

---

## 🆘 Troubleshooting

### Problema: "API Error 401"
**Solução**: Verifique se a chave de API está correta no `.env`

### Problema: "Too Many Requests"
**Solução**: Você atingiu o limite de requisições. Aguarde 1 hora ou use outra API (o sistema faz fallback automático)

### Problema: "Nenhuma imagem encontrada"
**Solução**: Tente outro termo de busca ou verifique se as chaves de API estão configuradas

---

## 📊 Prioridade de Uso

O sistema usa as APIs na seguinte ordem:

1. **Pexels** (primeira tentativa - melhor qualidade)
2. **Unsplash** (fallback - qualidade premium)
3. **Pixabay** (último fallback - maior variedade)

Se uma API falhar ou não retornar resultados, o sistema automaticamente tenta a próxima!

---

## 💡 Dicas

- **Pexels**: Melhor para imagens e vídeos gerais
- **Unsplash**: Melhor para fotos profissionais e artísticas
- **Pixabay**: Melhor para ilustrações e vetores

---

**Desenvolvido por Jean Carlos - VitrineX AI**  
**Data**: 2025-12-12
