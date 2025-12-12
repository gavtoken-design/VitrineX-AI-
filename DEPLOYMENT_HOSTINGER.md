# 🚀 Guia de Deploy no Hostinger - VitrineX AI

## ✅ Pré-requisitos
- Conta ativa no Hostinger
- Acesso ao painel de controle (hPanel)
- Build de produção gerado (`dist` folder)

---

## 📦 Passo 1: Gerar Build de Produção

No terminal do VS Code, execute:

```bash
npm run build
```

Isso criará uma pasta `dist/` com todos os arquivos otimizados para produção.

---

## 📤 Passo 2: Upload dos Arquivos

### Opção A: Via File Manager (Recomendado)

1. **Acesse o hPanel** do Hostinger
2. Vá em **Arquivos** → **Gerenciador de Arquivos**
3. Navegue até a pasta `public_html` (ou a pasta do seu domínio)
4. **Delete todos os arquivos existentes** na pasta (se houver)
5. **Upload da pasta `dist/`**:
   - Selecione todos os arquivos **dentro** da pasta `dist/`
   - Faça upload (arraste ou use o botão Upload)
   - **IMPORTANTE**: Copie o **conteúdo** da pasta `dist/`, não a pasta em si

### Opção B: Via FTP

1. Use um cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte usando as credenciais FTP do Hostinger
3. Navegue até `public_html`
4. Faça upload de todos os arquivos da pasta `dist/`

---

## ⚙️ Passo 3: Configurar .htaccess

O arquivo `.htaccess` já está incluído na pasta `public/` e será copiado automaticamente durante o build.

**Verifique se o arquivo está presente** em `public_html/.htaccess` com o seguinte conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirecionar HTTP para HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Servir arquivos estáticos diretamente
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Redirecionar todas as outras requisições para index.html (SPA routing)
  RewriteRule ^ index.html [L]
</IfModule>

# Habilitar compressão GZIP
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

# Segurança
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 🔑 Passo 4: Configurar Variáveis de Ambiente (API Key)

Como o Hostinger não suporta variáveis de ambiente `.env` para sites estáticos, você tem **2 opções**:

### Opção 1: Inserir via Interface (Recomendado)
- Os usuários inserem a chave API do Google Gemini diretamente nas **Configurações** do app
- A chave é salva no `localStorage` do navegador
- ✅ Mais seguro e flexível

### Opção 2: Hardcode (Não Recomendado para Produção)
- Edite o arquivo de configuração antes do build
- **NUNCA** faça commit da chave no GitHub

---

## 🧪 Passo 5: Testar a Aplicação

1. Acesse seu domínio: `https://seudominio.com`
2. Verifique se:
   - ✅ A página inicial carrega corretamente
   - ✅ O roteamento funciona (navegação entre páginas)
   - ✅ HTTPS está ativo (cadeado verde)
   - ✅ PWA pode ser instalado (ícone de instalação aparece)
   - ✅ Todas as funcionalidades estão operacionais

---

## 🔧 Troubleshooting

### Problema: Página em branco
**Solução**: Verifique se todos os arquivos da pasta `dist/` foram enviados corretamente.

### Problema: Erro 404 ao navegar
**Solução**: Confirme que o arquivo `.htaccess` está presente e configurado corretamente.

### Problema: HTTPS não funciona
**Solução**: No hPanel, vá em **Segurança** → **SSL/TLS** e ative o certificado SSL gratuito.

### Problema: PWA não instala
**Solução**: 
- Certifique-se de que está usando HTTPS
- Verifique se os arquivos `manifest.json` e `sw.js` foram enviados
- Limpe o cache do navegador

---

## 🔄 Atualizações Futuras

Para atualizar o site:

1. Faça as alterações no código local
2. Execute `npm run build` novamente
3. Faça upload dos novos arquivos da pasta `dist/`
4. Limpe o cache do navegador (Ctrl + Shift + R)

---

## 📱 PWA - Progressive Web App

Após o deploy, os usuários poderão:
- **Instalar o app** no celular (iOS/Android)
- **Usar offline** (funcionalidades básicas)
- **Receber notificações** (se implementado)

Para instalar:
1. Acesse o site pelo navegador mobile
2. Toque em **"Adicionar à Tela de Início"** ou **"Instalar"**
3. O VitrineX AI funcionará como app nativo

---

## ✅ Checklist Final

- [ ] Build de produção gerado (`npm run build`)
- [ ] Arquivos da pasta `dist/` enviados para `public_html`
- [ ] Arquivo `.htaccess` configurado
- [ ] SSL/HTTPS ativado no Hostinger
- [ ] Site acessível via domínio
- [ ] Roteamento funcionando (teste navegação)
- [ ] PWA instalável (teste no mobile)
- [ ] API configurada (via interface ou env)

---

## 🎉 Pronto!

Seu **VitrineX AI** está no ar! 🚀

Compartilhe o link e comece a usar sua plataforma de automação de marketing com IA.

---

**Desenvolvido com 💜 por Jean (VitrineX)**
