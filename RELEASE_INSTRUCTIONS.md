# Guia: Publicando o VitrineX AI no GitHub

Como o comando `git` não foi detectado no seu terminal atual, siga estes passos para publicar seu projeto.

## Passo 1: Instalar o Git (Se não tiver)
Se você não tem o Git instalado:
1. Baixe e instale o Git para Windows: [git-scm.com/download/win](https://git-scm.com/download/win)
2. Durante a instalação, aceite as opções padrão.
3. Após instalar, reinicie o VS Code.

## Passo 2: Criar o Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. **Repository name**: `vitrinex-ai` (ou o nome que preferir).
3. **Public/Private**: Escolha "Public" (Público) já que verificamos que não há chaves secretas.
4. **Não** marque "Initialize with a README" (já temos um).
5. Clique em **Create repository**.

## Passo 3: Enviar o Código (Via Terminal)
Abra um **novo** terminal no VS Code (`Ctrl + "`) e execute os comandos abaixo, um por um:

```bash
# 1. Inicializar o Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Criar o primeiro "commit" (versão)
git commit -m "Primeiro commit: VitrineX AI Platform"

# 4. Mudar para a branch principal 'main'
git branch -M main

# 5. Conectar com o repositório que você criou no passo 2
# SUBSTITUA "SEU_USUARIO" PELO SEU NOME DE USUÁRIO NO GITHUB
git remote add origin https://github.com/SEU_USUARIO/vitrinex-ai.git

# 6. Enviar os arquivos
git push -u origin main
```

## Opção Alternativa: Usando o VS Code (Visual)
1. Clique no ícone de "Source Control" (Controle de Fonte) na barra lateral esquerda (ícone com 3 bolinhas conectadas).
2. Clique no botão azul **"Publish to GitHub"** (se aparecer) ou **"Initialize Repository"**.
3. Siga as instruções na tela para autenticar e escolher o repositório.
