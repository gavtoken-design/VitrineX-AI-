# 🔍 Sistema de Revisão de Conteúdo IA - Documentação Completa

## 📋 Visão Geral

Sistema automático de revisão e validação de conteúdo gerado por IA para evitar erros gramaticais, ortográficos e garantir qualidade do texto.

---

## ✅ Funcionalidades

### 1. **Validação de Gramática**
- ✅ Detecta pontuação duplicada (!!!, ???)
- ✅ Detecta espaços duplicados
- ✅ Verifica falta de pontuação no final
- ✅ Verifica letras maiúsculas no início de frases

### 2. **Validação de Ortografia**
- ✅ Corrige abreviações comuns (vc → você, tbm → também)
- ✅ Detecta erros comuns (concerteza → com certeza)
- ✅ Sugere correções automáticas

### 3. **Validação de Coerência**
- ✅ Verifica texto muito curto (< 10 caracteres)
- ✅ Verifica texto muito longo (> 2200 caracteres)
- ✅ Detecta repetição excessiva de palavras

### 4. **Validação de Conteúdo Inapropriado**
- ✅ Filtra palavras inapropriadas
- ✅ Bloqueia conteúdo ofensivo

### 5. **Avisos de Estilo**
- ⚠️ Uso excessivo de emojis
- ⚠️ Uso excessivo de CAPS
- ⚠️ Palavras muito longas

### 6. **Correção Automática**
- 🔧 Corrige espaços duplicados
- 🔧 Corrige pontuação duplicada
- 🔧 Substitui abreviações
- 🔧 Capitaliza primeira letra
- 🔧 Adiciona espaço após pontuação

---

## 🚀 Como Usar

### Uso Básico

```typescript
import { reviewContent, reviewAndCorrect } from '../services/contentReviewService';

// Revisar conteúdo
const review = reviewContent('meu texto aqui');

console.log(`Score: ${review.score}/100`);
console.log(`Válido: ${review.isValid}`);
console.log(`Erros: ${review.errors.length}`);
console.log(`Avisos: ${review.warnings.length}`);

// Se tem correção automática
if (review.correctedContent) {
  console.log('Texto corrigido:', review.correctedContent);
}
```

### Revisar e Corrigir Automaticamente

```typescript
const { content, review } = await reviewAndCorrect('texto com erros');

// content = texto corrigido (se possível)
// review = resultado da revisão
```

---

## 📊 Sistema de Pontuação

### Score (0-100)

**Penalidades:**
- Erro HIGH: -20 pontos
- Erro MEDIUM: -10 pontos
- Erro LOW: -5 pontos
- Aviso: -2 pontos cada

**Classificação:**
- 90-100: Excelente ✅
- 70-89: Bom ⚠️
- 50-69: Regular ⚠️
- 0-49: Ruim ❌

---

## 🔧 Integração no Creative Studio

### Exemplo de Integração

```typescript
// src/pages/CreativeStudio.tsx

import { reviewAndCorrect, formatReviewResult } from '../services/contentReviewService';

const CreativeStudio = () => {
  const [generatedText, setGeneratedText] = useState('');
  const [reviewResult, setReviewResult] = useState(null);

  const handleGeneratePost = async () => {
    // 1. Gerar conteúdo com IA
    const aiGenerated = await generateWithAI(prompt);
    
    // 2. Revisar e corrigir automaticamente
    const { content, review } = await reviewAndCorrect(aiGenerated);
    
    // 3. Atualizar estado
    setGeneratedText(content);
    setReviewResult(review);
    
    // 4. Mostrar feedback se score baixo
    if (review.score < 70) {
      addToast({
        type: 'warning',
        message: `Qualidade do texto: ${review.score}/100. Revise antes de publicar.`
      });
    }
    
    // 5. Mostrar detalhes da revisão
    console.log(formatReviewResult(review));
  };

  return (
    <div>
      {/* ... */}
      
      {reviewResult && (
        <div className="bg-gray-900 p-4 rounded-lg mt-4">
          <h4 className="font-semibold mb-2">Análise de Qualidade</h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold">{reviewResult.score}</span>
            <span className="text-gray-400">/100</span>
            {reviewResult.score >= 90 && <span className="text-green-500">✅ Excelente</span>}
            {reviewResult.score >= 70 && reviewResult.score < 90 && <span className="text-yellow-500">⚠️ Bom</span>}
            {reviewResult.score < 70 && <span className="text-red-500">❌ Precisa melhorar</span>}
          </div>
          
          {reviewResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-red-400 text-sm">
                {reviewResult.errors.length} erro(s) encontrado(s)
              </p>
            </div>
          )}
          
          {reviewResult.correctedContent && (
            <button
              onClick={() => setGeneratedText(reviewResult.correctedContent)}
              className="mt-2 px-3 py-1 bg-blue-600 rounded text-sm"
            >
              Aplicar Correções Automáticas
            </button>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 📝 Exemplos de Validação

### Exemplo 1: Texto com Erros

**Input:**
```
vc precisa tbm ver isso  hj pq é mt importante
```

**Erros Detectados:**
- Abreviações: vc, tbm, hj, pq, mt
- Espaços duplicados
- Falta pontuação no final
- Não começa com maiúscula

**Output Corrigido:**
```
Você precisa também ver isso hoje porque é muito importante.
```

**Score:** 45/100 → 85/100 (após correção)

---

### Exemplo 2: Pontuação Incorreta

**Input:**
```
Olá!!!  Como  você está???
```

**Erros Detectados:**
- Pontuação duplicada (!!!, ???)
- Espaços duplicados

**Output Corrigido:**
```
Olá! Como você está?
```

**Score:** 60/100 → 95/100

---

### Exemplo 3: Texto Muito Curto

**Input:**
```
Ok
```

**Erros Detectados:**
- Texto muito curto (< 10 caracteres)

**Score:** 20/100

---

### Exemplo 4: Repetição Excessiva

**Input:**
```
Este produto é muito bom, muito bom mesmo, muito bom para você, muito bom para todos, muito bom sempre.
```

**Erros Detectados:**
- Palavra "muito" repetida 5 vezes
- Palavra "bom" repetida 5 vezes

**Score:** 70/100

---

## 🎯 Fluxo de Revisão

```
1. Usuário solicita geração de conteúdo
   ↓
2. IA gera texto inicial
   ↓
3. reviewAndCorrect(texto)
   ↓
4. Validações executadas:
   - Gramática ✓
   - Ortografia ✓
   - Coerência ✓
   - Conteúdo inapropriado ✓
   - Estilo ✓
   ↓
5. Score calculado (0-100)
   ↓
6. Correções automáticas aplicadas (se possível)
   ↓
7. Resultado retornado:
   - Texto corrigido
   - Lista de erros
   - Lista de avisos
   - Sugestões
   ↓
8. UI mostra feedback ao usuário
   ↓
9. Usuário pode:
   - Aceitar correções
   - Editar manualmente
   - Regenerar
```

---

## 🔍 Detalhes das Validações

### Gramática

```typescript
// Verifica:
- Pontuação duplicada: /[.!?]{2,}/
- Espaços duplicados: /\s{2,}/
- Falta pontuação final: !/[.!?]$/
- Maiúscula no início: /^[a-z]/
```

### Ortografia

```typescript
// Correções automáticas:
'vc' → 'você'
'tbm' → 'também'
'pq' → 'porque'
'hj' → 'hoje'
'mt' → 'muito'
'concerteza' → 'com certeza'
'derrepente' → 'de repente'
'porisso' → 'por isso'
```

### Coerência

```typescript
// Limites:
- Mínimo: 10 caracteres
- Máximo: 2200 caracteres (redes sociais)
- Repetição: máx. 5 vezes por palavra
```

---

## 💡 Dicas de Uso

### 1. Sempre Revisar Antes de Publicar

```typescript
const handlePublish = async () => {
  const review = reviewContent(postText);
  
  if (review.score < 70) {
    const confirm = window.confirm(
      `Qualidade do texto: ${review.score}/100. Deseja publicar mesmo assim?`
    );
    if (!confirm) return;
  }
  
  // Publicar...
};
```

### 2. Mostrar Feedback Visual

```typescript
const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
};

<span className={getScoreColor(review.score)}>
  {review.score}/100
</span>
```

### 3. Aplicar Correções Gradualmente

```typescript
// Aplicar apenas correções de alta prioridade
const highPriorityErrors = review.errors.filter(e => e.severity === 'high');

if (highPriorityErrors.length > 0) {
  // Mostrar modal com correções obrigatórias
}
```

---

## 🚧 Limitações Atuais

1. **Validação Básica**: Não usa IA avançada para gramática
2. **Português Apenas**: Focado em português brasileiro
3. **Sem Contexto**: Não entende contexto semântico
4. **Lista Limitada**: Dicionário de erros é básico

---

## 🔮 Melhorias Futuras

- [ ] Integração com API de gramática (LanguageTool)
- [ ] Validação de tom (formal, informal, profissional)
- [ ] Sugestões de sinônimos
- [ ] Verificação de plágio
- [ ] Análise de sentimento
- [ ] Suporte multi-idioma
- [ ] IA para correção contextual
- [ ] Histórico de revisões

---

## 📊 Exemplo Completo de Uso

```typescript
import { reviewAndCorrect, formatReviewResult } from '../services/contentReviewService';

// Texto gerado pela IA
const aiText = "vc precisa tbm ver isso  hj pq é mt importante!!!";

// Revisar e corrigir
const { content, review } = await reviewAndCorrect(aiText);

console.log('=== REVISÃO DE CONTEÚDO ===');
console.log('Texto Original:', aiText);
console.log('Texto Corrigido:', content);
console.log('');
console.log(formatReviewResult(review));

// Output:
// === REVISÃO DE CONTEÚDO ===
// Texto Original: vc precisa tbm ver isso  hj pq é mt importante!!!
// Texto Corrigido: Você precisa também ver isso hoje porque é muito importante!
//
// 📊 Score de Qualidade: 85/100
//
// ❌ Erros Encontrados:
// 1. [MEDIUM] "vc" deveria ser "você"
// 2. [MEDIUM] "tbm" deveria ser "também"
// 3. [MEDIUM] "pq" deveria ser "porque"
// 4. [MEDIUM] "hj" deveria ser "hoje"
// 5. [MEDIUM] "mt" deveria ser "muito"
// 6. [MEDIUM] Pontuação duplicada detectada
// 7. [LOW] Espaços duplicados detectados
//
// 💡 Sugestões:
// 1. Revise a gramática do texto
// 2. Corrija erros de ortografia
```

---

**Desenvolvido por**: Jean Carlos - VitrineX AI  
**Data**: 2025-12-12  
**Versão**: 2.5.0-content-review  
**Status**: ✅ COMPLETO
