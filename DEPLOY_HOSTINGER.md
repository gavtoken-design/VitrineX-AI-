# 🚀 Guia de Deploy - VitrineX AI para Hostinger

## 📋 Pré-requisitos

- Conta na Hostinger
- Projeto VitrineX AI local
- Node.js instalado
- Git instalado

---

## 🎯 Passo a Passo Completo

### **ETAPA 1: Preparar o Projeto para Produção**

#### 1.1 Build do Projeto

```bash
# No diretório do projeto
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

#### 1.2 Verificar Variáveis de Ambiente

Crie arquivo `.env.production`:

```env
# APIs de Mídia
VITE_PEXELS_API_KEY=sua_chave_aqui
VITE_UNSPLASH_ACCESS_KEY=sua_chave_aqui
VITE_PIXABAY_API_KEY=sua_chave_aqui

# LottieFiles
VITE_LOTTIEFILES_API_KEY=sua_chave_aqui

# Google Drive
VITE_GOOGLE_DRIVE_CLIENT_ID=seu_client_id
VITE_GOOGLE_DRIVE_API_KEY=sua_api_key

# Gemini AI
VITE_GEMINI_API_KEY=sua_chave_aqui
```

---

### **ETAPA 2: Configurar Hostinger**

#### 2.1 Acessar Painel Hostinger

1. Login em https://www.hostinger.com.br/
2. Vá para **Hospedagem** → **Gerenciar**

#### 2.2 Escolher Método de Deploy

**Opção A: Upload via Gerenciador de Arquivos (Mais Fácil)**
**Opção B: Deploy via Git (Recomendado)**

---

### **OPÇÃO A: Upload Manual**

#### Passo 1: Acessar Gerenciador de Arquivos

1. No painel Hostinger, clique em **Arquivos** → **Gerenciador de Arquivos**
2. Navegue até `public_html/`

#### Passo 2: Limpar Pasta

1. Selecione todos os arquivos existentes
2. Clique em **Deletar**

#### Passo 3: Upload dos Arquivos

1. Clique em **Upload**
2. Selecione TODOS os arquivos da pasta `dist/`
3. Aguarde upload completar (pode demorar)

#### Passo 4: Configurar .htaccess

Crie arquivo `.htaccess` em `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache de arquivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/x-javascript "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresDefault "access plus 2 days"
</IfModule>
```

---

### **OPÇÃO B: Deploy via Git (Recomendado)**

#### Passo 1: Configurar Repositório Git

```bash
# No diretório do projeto
git init
git add .
git commit -m "Deploy inicial VitrineX AI"
```

#### Passo 2: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `vitrinex-ai`
3. Clique em **Create repository**

```bash
# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/vitrinex-ai.git
git branch -M main
git push -u origin main
```

#### Passo 3: Conectar Hostinger ao GitHub

1. No painel Hostinger, vá para **Git** → **Criar Repositório**
2. Escolha **GitHub**
3. Autorize acesso
4. Selecione repositório `vitrinex-ai`
5. Branch: `main`
6. Pasta de destino: `public_html/`

#### Passo 4: Configurar Build Automático

No Hostinger, adicione script de build:

```bash
npm install
npm run build
cp -r dist/* public_html/
```

---

### **ETAPA 3: Configurar Domínio**

#### 3.1 Domínio Próprio (Se Tiver)

1. Vá para **Domínios** → **Gerenciar**
2. Aponte para seu site
3. Configure DNS:
   - Tipo: A
   - Nome: @
   - Valor: IP do servidor Hostinger

#### 3.2 Subdomínio Hostinger (Grátis)

Use: `seu-usuario.hostingersite.com`

---

### **ETAPA 4: Configurar SSL (HTTPS)**

1. No painel Hostinger, vá para **SSL**
2. Clique em **Instalar SSL**
3. Escolha **Let's Encrypt** (grátis)
4. Aguarde instalação (1-5 minutos)

---

### **ETAPA 5: Configurar Variáveis de Ambiente**

#### Opção 1: Arquivo .env

Crie `.env` em `public_html/`:

```env
VITE_PEXELS_API_KEY=sua_chave
VITE_UNSPLASH_ACCESS_KEY=sua_chave
VITE_PIXABAY_API_KEY=sua_chave
VITE_LOTTIEFILES_API_KEY=sua_chave
VITE_GOOGLE_DRIVE_CLIENT_ID=seu_id
VITE_GOOGLE_DRIVE_API_KEY=sua_chave
VITE_GEMINI_API_KEY=sua_chave
```

#### Opção 2: Variáveis no Painel

1. Vá para **Avançado** → **Variáveis de Ambiente**
2. Adicione cada variável manualmente

---

### **ETAPA 6: Testar Deploy**

1. Acesse seu domínio: `https://seu-dominio.com`
2. Verifique se carrega corretamente
3. Teste funcionalidades:
   - Login
   - Creative Studio
   - Media Library
   - Smart Scheduler
   - Chat IA

---

## 🔧 Configurações Adicionais

### Aumentar Limite de Upload

No painel Hostinger:
1. **PHP** → **Configurações**
2. `upload_max_filesize`: 64M
3. `post_max_size`: 64M
4. `max_execution_time`: 300

### Configurar Cache

Adicione ao `.htaccess`:

```apache
# Cache do navegador
<IfModule mod_headers.c>
  <FilesMatch "\.(jpg|jpeg|png|gif|svg|webp)$">
    Header set Cache-Control "max-age=31536000, public"
  </FilesMatch>
  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "max-age=2592000, public"
  </FilesMatch>
</IfModule>
```

---

## 🚨 Troubleshooting

### Problema 1: Página em Branco

**Solução:**
1. Verifique console do navegador (F12)
2. Verifique se `.htaccess` está correto
3. Verifique permissões dos arquivos (755)

### Problema 2: Erro 404 em Rotas

**Solução:**
Adicione ao `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Problema 3: APIs Não Funcionam

**Solução:**
1. Verifique variáveis de ambiente
2. Verifique CORS
3. Verifique se chaves de API estão corretas

### Problema 4: Site Lento

**Solução:**
1. Ative compressão GZIP
2. Configure cache
3. Otimize imagens
4. Use CDN da Hostinger

---

## 📊 Checklist de Deploy

- [ ] Build do projeto (`npm run build`)
- [ ] Upload de arquivos para `public_html/`
- [ ] Configurar `.htaccess`
- [ ] Configurar variáveis de ambiente
- [ ] Instalar SSL (HTTPS)
- [ ] Configurar domínio
- [ ] Testar todas as funcionalidades
- [ ] Configurar cache
- [ ] Configurar limites de upload
- [ ] Backup do projeto

---

## 🎉 Deploy Completo!

Seu VitrineX AI está no ar! 🚀

**URL de Acesso:** https://seu-dominio.com

---

## 📈 Próximos Passos

1. **Monitoramento**: Configure Google Analytics
2. **SEO**: Adicione meta tags e sitemap
3. **Performance**: Use Cloudflare CDN
4. **Backup**: Configure backup automático
5. **Atualizações**: Configure CI/CD com GitHub Actions

---

## 💡 Dicas Importantes

### 1. Sempre Faça Backup

Antes de qualquer atualização:
```bash
# Baixar backup
zip -r backup-$(date +%Y%m%d).zip public_html/
```

### 2. Use Git para Versionamento

```bash
# Atualizar site
git pull origin main
npm run build
# Upload automático via Git Hostinger
```

### 3. Monitore Performance

Use ferramentas:
- Google PageSpeed Insights
- GTmetrix
- Pingdom

### 4. Configure Email Profissional

Na Hostinger:
- **Email** → **Criar Conta**
- `contato@seu-dominio.com`

---

## 🔐 Segurança

### 1. Proteger Arquivos Sensíveis

Adicione ao `.htaccess`:

```apache
<FilesMatch "^\.env">
  Order allow,deny
  Deny from all
</FilesMatch>
```

### 2. Bloquear Acesso a Diretórios

```apache
Options -Indexes
```

### 3. Proteção contra XSS

```apache
<IfModule mod_headers.c>
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
```

---

## 📞 Suporte

**Hostinger:**
- Chat 24/7
- Email: suporte@hostinger.com.br
- Base de conhecimento: https://support.hostinger.com/

**VitrineX AI:**
- Documentação completa no projeto
- README.md para instruções

---

**Criado por**: Jean Carlos - VitrineX AI  
**Data**: 2025-12-12  
**Versão**: 1.0.0  
**Status**: ✅ PRONTO PARA DEPLOY
