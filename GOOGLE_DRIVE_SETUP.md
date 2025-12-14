# 🔧 Configuração do Google Drive - Guia Completo

## 📋 Pré-requisitos

- Conta Google (Gmail)
- Projeto no Google Cloud Console
- 10 minutos para configuração

---

## 🚀 Passo a Passo

### 1. **Criar Projeto no Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Clique em "Select a project" (topo da página)
3. Clique em "NEW PROJECT"
4. Nome do projeto: `VitrineX AI`
5. Clique em "CREATE"

---

### 2. **Ativar a Google Drive API**

1. No menu lateral, vá em: **APIs & Services** → **Library**
2. Busque por: `Google Drive API`
3. Clique em **Google Drive API**
4. Clique em **ENABLE**

---

### 3. **Criar Credenciais OAuth 2.0**

#### 3.1. Configurar Tela de Consentimento

1. Vá em: **APIs & Services** → **OAuth consent screen**
2. Selecione: **External**
3. Clique em **CREATE**

**Preencha:**
- App name: `VitrineX AI`
- User support email: `seu@email.com`
- Developer contact: `seu@email.com`
- Clique em **SAVE AND CONTINUE**

**Scopes:**
- Clique em **ADD OR REMOVE SCOPES**
- Busque: `Google Drive API`
- Selecione: `.../auth/drive.file` (Ver e gerenciar arquivos criados pelo app)
- Clique em **UPDATE**
- Clique em **SAVE AND CONTINUE**

**Test users:**
- Clique em **ADD USERS**
- Adicione seu email
- Clique em **SAVE AND CONTINUE**

---

#### 3.2. Criar Client ID

1. Vá em: **APIs & Services** → **Credentials**
2. Clique em **CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `VitrineX Web Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5173
https://vitrinex.online
```

**Authorized redirect URIs:**
```
http://localhost:3000
http://localhost:5173
https://vitrinex.online
```

5. Clique em **CREATE**
6. **COPIE** o **Client ID** (começa com algo como `123456789-abc...apps.googleusercontent.com`)

---

### 4. **Criar API Key**

1. Ainda em **Credentials**
2. Clique em **CREATE CREDENTIALS** → **API key**
3. **COPIE** a API Key
4. Clique em **RESTRICT KEY**
5. Em **API restrictions**, selecione: **Restrict key**
6. Marque: **Google Drive API**
7. Clique em **SAVE**

---

### 5. **Configurar no VitrineX**

Adicione ao arquivo `.env`:

```env
# Google Drive Integration
VITE_GOOGLE_DRIVE_CLIENT_ID=SEU_CLIENT_ID_AQUI.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_API_KEY=SUA_API_KEY_AQUI
```

**Exemplo:**
```env
VITE_GOOGLE_DRIVE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_API_KEY=AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPp
```

---

### 6. **Reiniciar o Servidor**

```bash
npm run dev
```

---

## ✅ Testar a Integração

### 1. Acesse o VitrineX AI
### 2. Vá para qualquer página com Google Drive Integration
### 3. Clique em "Conectar com Google"
### 4. Faça login com sua conta Google
### 5. Autorize o acesso ao Drive
### 6. Pronto! ✅

---

## 🎯 Como Usar

### No Creative Studio

```typescript
import GoogleDriveIntegration from '../components/GoogleDriveIntegration';

<GoogleDriveIntegration
  folderName="Meus Criativos"
  onFileUploaded={(url) => console.log('Arquivo salvo:', url)}
/>
```

### Upload Automático

```typescript
// Após gerar um criativo, enviar automaticamente para o Drive
const handleGenerateCreative = async () => {
  const imageBlob = await generateCreative();
  const file = new File([imageBlob], 'criativo.png', { type: 'image/png' });
  
  <GoogleDriveIntegration
    autoUploadFiles={[file]}
    folderName="Criativos Gerados"
  />
};
```

---

## 📊 Estrutura de Pastas no Drive

```
Google Drive/
└── VitrineX Criativos/          (Pasta principal)
    ├── criativo_1.png
    ├── criativo_2.jpg
    ├── video_ad.mp4
    └── campanha_completa.zip
```

Você pode personalizar o nome da pasta:

```typescript
<GoogleDriveIntegration folderName="Minha Pasta Personalizada" />
```

---

## 🔒 Segurança

### O que o VitrineX pode fazer:
- ✅ Criar pastas no seu Drive
- ✅ Fazer upload de arquivos
- ✅ Listar arquivos que ele criou
- ✅ Baixar arquivos que ele criou
- ✅ Deletar arquivos que ele criou

### O que o VitrineX NÃO pode fazer:
- ❌ Ver outros arquivos do seu Drive
- ❌ Modificar arquivos que você criou
- ❌ Acessar pastas que você não autorizou
- ❌ Compartilhar seus arquivos

**Escopo usado**: `https://www.googleapis.com/auth/drive.file`  
(Acesso apenas aos arquivos criados pelo app)

---

## 🆘 Troubleshooting

### Erro: "Access blocked: This app's request is invalid"

**Solução:**
1. Vá em **OAuth consent screen**
2. Clique em **PUBLISH APP**
3. Confirme a publicação

---

### Erro: "redirect_uri_mismatch"

**Solução:**
1. Verifique se a URL atual está em **Authorized redirect URIs**
2. Adicione a URL exata (incluindo porta)
3. Aguarde 5 minutos para propagar

---

### Erro: "API key not valid"

**Solução:**
1. Verifique se a API Key está correta no `.env`
2. Verifique se a Google Drive API está habilitada
3. Verifique se a API Key tem restrições corretas

---

### Erro: "The user did not grant your application the requested scopes"

**Solução:**
1. Desconecte do Drive
2. Conecte novamente
3. Aceite todas as permissões solicitadas

---

## 💡 Dicas

### 1. **Organização de Pastas**
Crie pastas diferentes para cada tipo de criativo:

```typescript
<GoogleDriveIntegration folderName="Posts Instagram" />
<GoogleDriveIntegration folderName="Anúncios Facebook" />
<GoogleDriveIntegration folderName="Stories" />
```

### 2. **Upload em Lote**
Envie múltiplos arquivos de uma vez:

```typescript
const files = [file1, file2, file3];
<GoogleDriveIntegration autoUploadFiles={files} />
```

### 3. **Callback de Sucesso**
Execute ações após o upload:

```typescript
<GoogleDriveIntegration
  onFileUploaded={(url) => {
    console.log('Arquivo salvo:', url);
    addToast({ type: 'success', message: 'Salvo no Drive!' });
  }}
/>
```

---

## 📈 Limites da API

### Gratuito (Padrão):
- **10.000 requisições/dia** por projeto
- **100 requisições/100 segundos** por usuário
- **Armazenamento**: 15 GB grátis no Drive

### Produção:
Se precisar de mais, pode solicitar aumento de quota no Google Cloud Console.

---

## 🎉 Pronto!

Agora seus clientes podem:
- ✅ Conectar seu próprio Google Drive
- ✅ Salvar criativos automaticamente
- ✅ Organizar arquivos em pastas
- ✅ Baixar quando quiser
- ✅ Tudo 100% seguro e privado

---

**Desenvolvido por Jean Carlos - VitrineX AI**  
**Data**: 2025-12-12  
**Versão**: 2.5.0-google-drive-integration
