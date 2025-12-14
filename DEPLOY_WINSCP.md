# 🚀 Deploy via WinSCP - Hostinger

## 📋 Pré-requisitos

- [x] Build concluído (`npm run build`)
- [x] WinSCP instalado
- [ ] Credenciais FTP do Hostinger

---

## 📥 Passo 1: Baixar WinSCP

1. Acesse: https://winscp.net/eng/download.php
2. Baixe **WinSCP Portable** ou **Installation package**
3. Instale ou extraia

---

## 🔑 Passo 2: Obter Credenciais FTP

### No Painel Hostinger:

1. Login em https://www.hostinger.com.br/
2. **Hospedagem** → **Gerenciar**
3. **Arquivos** → **Contas FTP**
4. Anote:
   - **Host/Servidor**: `ftp.seudominio.com` ou IP
   - **Usuário**: `u123456789` (exemplo)
   - **Senha**: sua senha FTP
   - **Porta**: `21` (FTP) ou `22` (SFTP)

---

## ⚙️ Passo 3: Configurar WinSCP

### 3.1 Abrir WinSCP

1. Abra o WinSCP
2. Clique em **Nova Sessão**

### 3.2 Configurar Conexão

```
Protocolo de arquivo: SFTP (recomendado) ou FTP
Nome do host: ftp.seudominio.com
Número da porta: 22 (SFTP) ou 21 (FTP)
Nome de usuário: u123456789
Senha: sua_senha_ftp
```

### 3.3 Salvar Sessão

1. Clique em **Salvar**
2. Nome da sessão: `Hostinger - VitrineX`
3. Marque **Salvar senha** (opcional)
4. Clique em **OK**

---

## 📤 Passo 4: Conectar e Upload

### 4.1 Conectar

1. Selecione a sessão salva
2. Clique em **Login**
3. Se aparecer aviso de certificado, clique em **Sim**

### 4.2 Navegar até public_html

**Painel Esquerdo** (seu computador):
```
C:\Users\Jeanc\OneDrive\Área de Trabalho\VITRINIX-AI-main\dist\
```

**Painel Direito** (servidor):
```
/public_html/
```

### 4.3 Limpar Pasta (Primeira vez)

1. No painel direito, selecione todos os arquivos em `public_html/`
2. Pressione **Delete**
3. Confirme exclusão

### 4.4 Upload dos Arquivos

**Método 1: Arrastar e Soltar**
1. Selecione TODOS os arquivos dentro de `dist/`
2. Arraste para o painel direito (`public_html/`)
3. Aguarde upload completar

**Método 2: Menu**
1. Selecione arquivos em `dist/`
2. Clique direito → **Upload**
3. Confirme destino: `/public_html/`
4. Clique em **OK**

### 4.5 Upload do .htaccess

**IMPORTANTE**: Certifique-se de fazer upload do arquivo `.htaccess`!

1. No painel esquerdo, navegue até a raiz do projeto
2. Encontre arquivo `.htaccess`
3. Arraste para `public_html/`

---

## ✅ Passo 5: Verificar Upload

### Arquivos que DEVEM estar em public_html/:

```
public_html/
├── .htaccess          ✅ IMPORTANTE!
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── logo.png
└── outros arquivos...
```

### Verificar Permissões

1. Clique direito em `index.html`
2. **Propriedades** → **Permissões**
3. Deve ser: `644` ou `-rw-r--r--`
4. Para pastas: `755` ou `drwxr-xr-x`

---

## 🔧 Passo 6: Configurações Adicionais

### 6.1 Verificar .htaccess

1. Abra `.htaccess` no WinSCP (duplo clique)
2. Verifique se o conteúdo está correto
3. Deve conter regras de rewrite para SPA

### 6.2 Configurar Variáveis de Ambiente

**Opção 1: Via Painel Hostinger**
1. **Avançado** → **Variáveis de Ambiente**
2. Adicione cada variável:
   - `VITE_GEMINI_API_KEY`
   - `VITE_PEXELS_API_KEY`
   - etc.

**Opção 2: Arquivo .env (NÃO RECOMENDADO)**
- Não faça upload de `.env` com chaves reais!
- Use variáveis de ambiente do servidor

---

## 🔒 Passo 7: Instalar SSL

1. Feche WinSCP
2. Volte ao painel Hostinger
3. **SSL** → **Instalar SSL**
4. Escolha **Let's Encrypt** (grátis)
5. Aguarde 1-5 minutos

---

## ✅ Passo 8: Testar Deploy

1. Acesse: `https://seudominio.com`
2. Verifique se carrega corretamente
3. Teste funcionalidades:
   - [ ] Login
   - [ ] Creative Studio
   - [ ] Media Library
   - [ ] Smart Scheduler
   - [ ] Chat IA

---

## 🔄 Atualizações Futuras

### Para atualizar o site:

1. Faça novo build: `npm run build`
2. Abra WinSCP
3. Conecte na sessão salva
4. Selecione arquivos atualizados em `dist/`
5. Arraste para `public_html/`
6. Confirme sobrescrever: **Sim para todos**

---

## 💡 Dicas WinSCP

### Sincronização Automática

1. **Comandos** → **Manter diretório remoto atualizado**
2. Selecione pasta `dist/`
3. WinSCP sincroniza automaticamente

### Comparar Diretórios

1. **Comandos** → **Comparar diretórios**
2. Veja diferenças entre local e remoto
3. Sincronize apenas arquivos modificados

### Editar Arquivos Remotamente

1. Duplo clique em qualquer arquivo
2. Edite no editor padrão
3. Salve → Upload automático

---

## 🚨 Troubleshooting

### Não Consegue Conectar?

**Erro: "Connection refused"**
- Verifique se porta está correta (21 ou 22)
- Tente trocar de FTP para SFTP ou vice-versa
- Verifique firewall

**Erro: "Authentication failed"**
- Confirme usuário e senha
- Verifique se conta FTP está ativa
- Tente resetar senha no painel Hostinger

### Upload Muito Lento?

- Use SFTP em vez de FTP (mais rápido)
- Comprima arquivos antes (.zip)
- Use horários de menor tráfego

### Arquivos Não Aparecem?

- Pressione **F5** para atualizar
- Verifique se está em `public_html/`
- Verifique permissões

### .htaccess Não Funciona?

- Verifique se arquivo foi enviado
- Confirme nome exato: `.htaccess` (com ponto)
- Verifique permissões: 644

---

## 📊 Checklist Final

- [ ] WinSCP instalado
- [ ] Credenciais FTP obtidas
- [ ] Conexão configurada e testada
- [ ] Pasta `public_html/` limpa
- [ ] Todos os arquivos de `dist/` enviados
- [ ] Arquivo `.htaccess` enviado
- [ ] Permissões verificadas (644/755)
- [ ] SSL instalado
- [ ] Site testado e funcionando

---

## 🎉 Deploy Completo!

**Seu VitrineX AI está no ar via WinSCP!** 🚀

**URL:** https://seudominio.com

---

**Tempo estimado:** 10-20 minutos  
**Dificuldade:** Fácil  
**Método:** WinSCP (Recomendado)
