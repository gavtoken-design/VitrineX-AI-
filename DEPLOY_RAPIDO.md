# 🚀 Deploy Rápido - Hostinger

## ✅ Checklist Pré-Deploy

- [ ] Build do projeto concluído (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Arquivos `.htaccess` criados
- [ ] Conta Hostinger ativa

---

## 📦 Passo 1: Build do Projeto

```bash
npm run build
```

Isso criará a pasta `dist/` com todos os arquivos otimizados.

---

## 🔑 Passo 2: Configurar Variáveis de Ambiente

Crie arquivo `.env.production` na raiz:

```env
VITE_PEXELS_API_KEY=sua_chave
VITE_UNSPLASH_ACCESS_KEY=sua_chave
VITE_PIXABAY_API_KEY=sua_chave
VITE_LOTTIEFILES_API_KEY=sua_chave
VITE_GOOGLE_DRIVE_CLIENT_ID=seu_id
VITE_GOOGLE_DRIVE_API_KEY=sua_chave
VITE_GEMINI_API_KEY=sua_chave
```

---

## 📤 Passo 3: Upload para Hostinger

### Opção A: Gerenciador de Arquivos (Mais Fácil)

1. Login em https://www.hostinger.com.br/
2. **Hospedagem** → **Gerenciar** → **Arquivos**
3. Navegue até `public_html/`
4. **Deletar** todos os arquivos existentes
5. **Upload** todos os arquivos da pasta `dist/`
6. Aguardar conclusão

### Opção B: FTP (Mais Rápido)

1. Baixe FileZilla: https://filezilla-project.org/
2. Conecte usando credenciais do Hostinger
3. Arraste pasta `dist/` para `public_html/`

---

## ⚙️ Passo 4: Configurar .htaccess

Crie arquivo `.htaccess` em `public_html/`:

```apache
# Roteamento SPA
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

# Cache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 🔒 Passo 5: Instalar SSL (HTTPS)

1. No painel Hostinger: **SSL** → **Instalar SSL**
2. Escolha **Let's Encrypt** (grátis)
3. Aguardar 1-5 minutos

---

## ✅ Passo 6: Testar

Acesse: `https://seu-dominio.com`

Teste:
- [ ] Página carrega
- [ ] Login funciona
- [ ] Creative Studio abre
- [ ] Media Library busca imagens
- [ ] Smart Scheduler agenda posts
- [ ] Chat IA responde

---

## 🎉 Deploy Completo!

Seu VitrineX AI está no ar! 🚀

**URL:** https://seu-dominio.com

---

## 🔧 Troubleshooting Rápido

### Página em Branco?
- Verifique console (F12)
- Confirme `.htaccess` está correto
- Verifique permissões (755)

### APIs não funcionam?
- Verifique variáveis de ambiente
- Confirme chaves de API estão corretas

### Erro 404 em rotas?
- Confirme `.htaccess` existe
- Verifique mod_rewrite está ativo

---

**Tempo estimado:** 15-30 minutos  
**Dificuldade:** Fácil
