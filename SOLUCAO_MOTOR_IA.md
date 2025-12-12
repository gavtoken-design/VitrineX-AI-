# 🔧 SOLUÇÃO: Motor de IA Não Funciona

## 🐛 **Problema Identificado**

O código está tentando se conectar a um **backend proxy** (`http://localhost:3000`) que:
1. ❌ Não existe no deployment do Hostinger
2. ❌ Só funcionaria se você tivesse um servidor Node.js rodando
3. ❌ Causa falha nas chamadas de IA

## ✅ **Solução Rápida**

O código já tem **fallback automático** para o SDK client-side quando o backend falha. O problema é que a **chave API não está configurada**.

### **Como Resolver:**

#### **Opção 1: Configurar via Interface (Recomendado)**

1. **Acesse o site** após o deploy
2. Vá em **Configurações** (Settings)
3. Na seção **"Motor de Inteligência (Gemini)"**:
   - Cole sua **Chave API do Google Gemini**
   - Clique em **"Testar Conexão"**
   - Se funcionar, clique em **"Salvar Chave"**
4. ✅ Pronto! O motor de IA estará ativo

#### **Opção 2: Hardcode (Temporário para Testes)**

Se você quiser testar localmente antes do deploy:

1. Abra o arquivo: `src/constants.ts`
2. Encontre a linha:
   ```typescript
   export const HARDCODED_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
   ```
3. Substitua por:
   ```typescript
   export const HARDCODED_API_KEY = 'SUA_CHAVE_API_AQUI';
   ```
4. **⚠️ IMPORTANTE**: Remova a chave antes de fazer commit no GitHub!

---

## 🔑 **Como Obter a Chave API do Google Gemini**

1. Acesse: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave (começa com `AIzaSy...`)
5. Cole no app (Configurações)

---

## 🧪 **Testar Localmente**

Antes de fazer deploy, teste localmente:

```bash
# 1. Certifique-se de que está na pasta do projeto
cd "c:\Users\Jeanc\OneDrive\Área de Trabalho\VITRINIX-AI-main"

# 2. Execute o servidor de desenvolvimento
npm run dev

# 3. Acesse http://localhost:3000
# 4. Vá em Configurações e configure a API
# 5. Teste o motor de IA
```

---

## 📝 **Fluxo de Funcionamento**

### **Como o Código Funciona:**

1. **Tenta usar o backend proxy** (`http://localhost:3000`)
   - ❌ Falha (backend não existe)
   
2. **Fallback automático para SDK client-side**
   - ✅ Usa a chave API do `localStorage`
   - ✅ Ou usa a chave do `.env`
   - ✅ Ou usa a `HARDCODED_API_KEY`

3. **Se nenhuma chave for encontrada**
   - ❌ Erro: "Chave de API não encontrada"

### **Ordem de Prioridade das Chaves:**

```
1º → localStorage.getItem('vitrinex_gemini_api_key')
2º → process.env.API_KEY
3º → HARDCODED_API_KEY
```

---

## 🚀 **Para o Deploy no Hostinger**

### **O que acontece:**

1. Usuário acessa o site
2. Vai em **Configurações**
3. Insere a **Chave API**
4. Chave é salva no `localStorage` do navegador
5. ✅ Motor de IA funciona!

### **Vantagens:**

- ✅ Cada usuário usa sua própria chave
- ✅ Mais seguro (chave não fica no código)
- ✅ Funciona sem backend
- ✅ Ideal para hospedagem estática (Hostinger)

---

## 🔍 **Verificar se Está Funcionando**

### **No Dashboard:**

1. Clique no botão **"Testar API"**
2. Se aparecer uma mensagem de sucesso → ✅ Funcionando
3. Se aparecer erro → ❌ Chave não configurada

### **No Console do Navegador:**

1. Pressione `F12` (DevTools)
2. Vá na aba **Console**
3. Procure por erros relacionados a "API" ou "Gemini"
4. Se aparecer "Chave de API não encontrada" → Configure a chave

---

## 🛠️ **Solução Alternativa (Remover Backend Proxy)**

Se quiser **remover completamente** as tentativas de usar o backend proxy e usar **apenas o SDK client-side**, posso modificar o código para você.

**Vantagens:**
- ✅ Mais rápido (não tenta conectar ao backend)
- ✅ Menos erros no console
- ✅ Código mais simples

**Desvantagens:**
- ❌ Se no futuro você quiser adicionar um backend, terá que modificar novamente

---

## ❓ **Perguntas Frequentes**

### **1. A chave API é gratuita?**
Sim! O Google Gemini tem um tier gratuito generoso.

### **2. A chave fica exposta no código?**
Não! Ela fica salva no `localStorage` do navegador do usuário.

### **3. Preciso de um servidor backend?**
Não! O app funciona 100% no frontend (client-side).

### **4. Funciona offline?**
Parcialmente. O PWA funciona offline, mas as chamadas de IA precisam de internet.

---

## 📞 **Próximos Passos**

1. ✅ Obtenha sua chave API do Google Gemini
2. ✅ Faça o deploy no Hostinger (já está pronto!)
3. ✅ Acesse o site e configure a chave em **Configurações**
4. ✅ Teste o motor de IA

---

**Quer que eu modifique o código para remover o backend proxy e usar apenas o SDK client-side?**

Digite **"sim"** se quiser que eu faça essa otimização agora.

---

**Desenvolvido com 💜 por Jean (VitrineX)**
