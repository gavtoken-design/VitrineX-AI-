# 🛡️ Sistema Administrativo VitrineX AI - Documentação Completa

## 📋 Visão Geral

Sistema administrativo completo para gerenciar a plataforma VitrineX AI, incluindo:
- Gerenciamento de clientes
- Controle de APIs
- Sistema de notificações push
- **Distribuição de arquivos** (NOVO!)

---

## ✅ Funcionalidades Implementadas

### 1. **Dashboard** 📊
- **Métricas em Tempo Real**:
  - Total de clientes
  - Clientes ativos/bloqueados
  - Planos premium
  - Notificações ativas
- **Atividade Recente**: Últimos 5 logs do sistema
- **Notificações Ativas**: Preview das notificações em exibição

### 2. **Gerenciamento de Clientes** 👥
- ✅ **Cadastro de novos clientes**
  - Nome, email, plano (free/premium)
  - Informações do negócio
  - Configuração automática de módulos baseada no plano
- ✅ **Edição de clientes**
- ✅ **Exclusão de clientes** (com confirmação)
- ✅ **Visualização em tabela** com:
  - Status (ativo/bloqueado)
  - Plano
  - Status da API
  - Ações rápidas

### 3. **Controle de API** 🔑
- ✅ **Liberar/Bloquear acesso à API** por cliente
- ✅ **Rate Limit configurável** (requisições por minuto)
- ✅ **Habilitar/Desabilitar Gemini API** individualmente
- ✅ **Visualização de chaves cadastradas**
- ✅ **Teste de conexão**

### 4. **Funcionalidades por Cliente** ⚙️
Controle granular de módulos por usuário:
- Content Generator
- Ad Studio
- Trend Hunter
- Creative Studio
- Chatbot
- Smart Scheduler

**Interface**: Modal com toggles para cada módulo

### 5. **Sistema de Notificações Push** 🔔
- ✅ **Criar notificações** para todos os usuários
- ✅ **Tipos de notificação**:
  - Info (azul)
  - Warning (amarelo)
  - Success (verde)
  - Announcement (roxo)
- ✅ **Campos**:
  - Título
  - Mensagem (textarea)
  - Tipo
  - Data de expiração (opcional)
- ✅ **Preview em tempo real** antes de enviar
- ✅ **Ativar/Desativar** notificações
- ✅ **Histórico completo** de notificações enviadas
- ✅ **Contador de notificações ativas** no menu

### 6. **Sistema de Distribuição de Arquivos** 📁 (NOVO!)

#### Upload de Arquivos
- **Tipos suportados**: PDF, ZIP, TXT, DOC, DOCX, EBOOK, etc.
- **Informações do arquivo**:
  - Nome do arquivo
  - Tipo/extensão
  - Tamanho (em bytes)
  - Descrição
  - Tags para organização
  - Data de upload
  - Data de expiração (opcional)

#### Distribuição Inteligente
- **Envio para TODOS os usuários**
- **Envio para clientes específicos**:
  - Por ID de usuário
  - Por endereço IP
  - Múltiplos destinatários

#### Rastreamento de Downloads
- **Log completo** de cada download:
  - Quem baixou (usuário)
  - De qual IP
  - Data e hora
  - User Agent (navegador)
- **Estatísticas por arquivo**:
  - Total de downloads
  - Usuários únicos
  - IPs únicos
  - Último download

#### Gerenciamento de Arquivos
- ✅ Visualizar todos os arquivos enviados
- ✅ Ativar/Desativar arquivos
- ✅ Editar informações
- ✅ Deletar arquivos (remove logs relacionados)
- ✅ Filtrar por status (ativo/inativo)
- ✅ Visualizar estatísticas de download

### 7. **Sistema de Logs** 📋
- **Console em tempo real** com:
  - Timestamp
  - Nível (INFO, WARN, ERROR, CRITICAL)
  - Módulo
  - Mensagem
- **Filtros** por nível
- **Atualização manual**
- **Scroll automático**

### 8. **Configurações do Sistema** ⚙️
- **Controle de Módulos Globais**:
  - Ativar/Desativar módulos para toda a plataforma
  - Toggle switches visuais
- **Ações do Sistema**:
  - Backup manual
  - Recarregar dados
  - Status da infraestrutura

---

## 🎨 Interface do Usuário

### Estrutura de Navegação

```
┌─────────────────────────────────────────────────────────┐
│  🛡️ MASTER CONTROL ROOM                    [Encerrar]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  SIDEBAR              │  CONTEÚDO PRINCIPAL             │
│  ────────             │  ─────────────────              │
│  📊 Dashboard         │                                  │
│  👥 Clientes          │  [Conteúdo da aba selecionada]  │
│  🔔 Notificações (2)  │                                  │
│  📁 Arquivos          │                                  │
│  🔑 API Keys          │                                  │
│  ⚙️  Sistema          │                                  │
│  📋 Logs              │                                  │
│                       │                                  │
└───────────────────────┴──────────────────────────────────┘
```

### Modais Implementados

1. **Modal de Cliente**
   - Formulário completo de cadastro
   - Validação de campos
   - Botões: Cancelar / Criar

2. **Modal de Notificação**
   - Editor de título e mensagem
   - Seletor de tipo
   - Data de expiração
   - Preview em tempo real
   - Botão: 📢 Enviar para Todos

3. **Modal de Configuração de Módulos**
   - Lista de todos os módulos
   - Toggle para cada um
   - Atualização em tempo real

4. **Modal de Upload de Arquivo** (A implementar na UI)
   - Seletor de arquivo
   - Descrição
   - Tags
   - Tipo de distribuição (todos/específico)
   - Seletor de destinatários
   - Data de expiração

---

## 🔐 Segurança

### Autenticação
- **PIN de Acesso**: `1984` (configurável)
- **Timeout de Sessão**: 30 minutos (recomendado)
- **Log de Tentativas**: Todas as tentativas são registradas

### Autorização
- Apenas admins autenticados podem acessar
- Confirmação para ações críticas:
  - Deletar cliente
  - Bloquear usuário
  - Deletar arquivo
- Auditoria completa de todas as ações

### Dados Sensíveis
- API Keys nunca exibidas em texto plano
- Arquivos armazenados em Base64 (ou URL segura)
- Logs de download incluem IP para rastreamento

---

## 📊 Estrutura de Dados

### ClientConfig
```typescript
{
  userId: string;
  apiAccess: {
    enabled: boolean;
    geminiEnabled: boolean;
    rateLimit: number;
    lastApiCall?: string;
  };
  modules: {
    [moduleName: string]: boolean;
  };
  metadata: {
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### AppNotification
```typescript
{
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  isActive: boolean;
  targetUsers?: string[];
}
```

### FileDistribution
```typescript
{
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string; // Base64 or URL
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  targetType: 'all' | 'specific';
  targetUsers?: string[];
  targetIPs?: string[];
  expiresAt?: string;
  isActive: boolean;
  downloadCount: number;
  tags?: string[];
}
```

### FileDownloadLog
```typescript
{
  id: string;
  fileId: string;
  userId: string;
  userIP: string;
  downloadedAt: string;
  userAgent?: string;
}
```

---

## 🚀 Como Usar

### Acessar o Painel ADM

1. **Via URL**:
   - `https://vitrinex.online/admin`
   - `https://vitrinex.online/__core-admin`
   - `https://vitrinex.online?mode=admin`

2. **Autenticação**:
   - Digite o PIN: `1984`
   - Clique em "Autenticar"

### Cadastrar um Cliente

1. Acesse a aba **"Clientes"**
2. Clique em **"Adicionar Cliente"**
3. Preencha:
   - Nome completo
   - Email
   - Plano (Free/Premium)
   - Nome do negócio
   - Indústria
4. Clique em **"Criar Cliente"**

### Enviar uma Notificação

1. Acesse a aba **"Notificações"**
2. Clique em **"Criar Notificação"**
3. Preencha:
   - Título (ex: "Nova Funcionalidade!")
   - Mensagem (ex: "Agora você pode gerar vídeos com IA!")
   - Tipo (Info/Warning/Success/Announcement)
   - Data de expiração (opcional)
4. Veja o preview
5. Clique em **"📢 Enviar para Todos"**

### Distribuir um Arquivo

1. Acesse a aba **"Arquivos"** (a implementar na UI)
2. Clique em **"Upload de Arquivo"**
3. Selecione o arquivo (PDF, ZIP, TXT, etc.)
4. Preencha:
   - Descrição
   - Tags (opcional)
   - Tipo de distribuição:
     - **Todos os usuários**
     - **Clientes específicos** (selecione da lista)
     - **IPs específicos** (digite os IPs)
   - Data de expiração (opcional)
5. Clique em **"Enviar Arquivo"**

### Configurar Módulos de um Cliente

1. Acesse a aba **"Clientes"**
2. Encontre o cliente na tabela
3. Clique no ícone **⚙️ (Configurar Módulos)**
4. Ative/Desative os módulos desejados
5. Feche o modal (salva automaticamente)

### Bloquear/Desbloquear API de um Cliente

1. Acesse a aba **"Clientes"**
2. Encontre o cliente na tabela
3. Na coluna **"API"**, clique no botão:
   - **Verde "Liberada"** → Clique para bloquear
   - **Vermelho "Bloqueada"** → Clique para liberar

---

## 📈 Estatísticas e Métricas

### Dashboard
- **Total de Clientes**: Soma de todos os usuários
- **Clientes Ativos**: Usuários com status "active"
- **Clientes Bloqueados**: Usuários com status "blocked"
- **Planos Premium**: Usuários com plano "premium"

### Arquivos
- **Total de Downloads**: Soma de todos os downloads
- **Usuários Únicos**: Quantos usuários diferentes baixaram
- **IPs Únicos**: Quantos IPs diferentes acessaram
- **Último Download**: Data/hora do download mais recente

---

## 🔧 Funções do adminService

### Gerenciamento de Clientes
```typescript
createClient(userData)
updateClient(userId, updates)
deleteClient(userId)
getUsers()
blockUser(userId)
disconnectUser(userId)
```

### Configurações de Cliente
```typescript
getClientConfig(userId)
getAllClientConfigs()
updateClientConfig(userId, updates)
toggleClientApiAccess(userId, enabled)
toggleClientModule(userId, moduleName, enabled)
```

### Notificações
```typescript
getNotifications()
getActiveNotifications()
createNotification(notification)
updateNotification(id, updates)
deleteNotification(id)
toggleNotificationStatus(id)
```

### Arquivos
```typescript
getFiles()
getActiveFiles()
getFilesForUser(userId, userIP?)
uploadFile(fileData)
updateFile(id, updates)
deleteFile(id)
toggleFileStatus(id)
logFileDownload(fileId, userId, userIP, userAgent?)
getFileDownloadLogs(fileId?)
getFileStats(fileId)
```

---

## 🎯 Próximos Passos

### Fase 1: Completar UI de Arquivos ✅
- [x] Tipos e interfaces
- [x] Funções do adminService
- [ ] Aba "Arquivos" no AdminConsole
- [ ] Modal de upload
- [ ] Tabela de arquivos
- [ ] Estatísticas de download

### Fase 2: Integração no App Principal
- [ ] Criar componente `FileDownloadCenter`
- [ ] Hook `useAvailableFiles` para buscar arquivos do usuário
- [ ] Botão de download com tracking
- [ ] Notificação quando novo arquivo disponível

### Fase 3: Melhorias
- [ ] Suporte a múltiplos arquivos simultâneos
- [ ] Compressão automática de arquivos grandes
- [ ] Preview de arquivos (PDF, imagens)
- [ ] Categorias de arquivos
- [ ] Busca e filtros avançados

---

## 📝 Notas Técnicas

### Armazenamento
- **Atual**: Dados em memória (mock)
- **Produção**: Migrar para:
  - Backend com banco de dados
  - Storage de arquivos (AWS S3, Google Cloud Storage)
  - API REST para comunicação

### Performance
- Lazy loading de componentes pesados
- Paginação para listas grandes
- Debounce em buscas
- Cache de dados frequentes

### Compatibilidade
- Desktop: Layout completo
- Tablet: Layout adaptado
- Mobile: Versão simplificada (apenas visualização)

---

## 🎨 Paleta de Cores

```css
/* Admin Theme - Dark Mode */
Background: #000000 (Black)
Surface: #111827 (Gray-900)
Border: #1F2937 (Gray-800)
Text: #D1D5DB (Gray-300)

/* Status Colors */
Success: #10B981 (Green-500)
Warning: #F59E0B (Amber-500)
Error: #EF4444 (Red-500)
Info: #3B82F6 (Blue-500)
Announcement: #8B5CF6 (Purple-500)

/* Accent */
Primary: #10B981 (Green-500)
```

---

## 🐛 Troubleshooting

### Problema: Não consigo fazer login
**Solução**: Verifique se está usando o PIN correto (`1984`)

### Problema: Arquivos não aparecem para o usuário
**Solução**: 
1. Verifique se o arquivo está ativo
2. Confirme o tipo de distribuição (all/specific)
3. Se específico, verifique se o userId ou IP está na lista

### Problema: Downloads não são rastreados
**Solução**: Certifique-se de chamar `logFileDownload()` após cada download

---

**Desenvolvido por Jean Carlos - VitrineX AI**  
**Versão**: 2.5.0-admin-files  
**Data**: 2025-12-12  
**PIN de Acesso**: 1984
