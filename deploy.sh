#!/bin/bash
# Script de Deploy Rápido - VitrineX AI
# Execute este script para preparar o projeto para deploy

echo "🚀 Iniciando preparação para deploy..."
echo ""

# 1. Limpar builds anteriores
echo "📦 Limpando builds anteriores..."
if [ -d "dist" ]; then
  rm -rf dist
  echo "✓ Pasta dist removida"
fi

# 2. Instalar dependências (se necessário)
echo ""
echo "📥 Verificando dependências..."
if [ ! -d "node_modules" ]; then
  echo "Instalando dependências..."
  npm install
else
  echo "✓ Dependências já instaladas"
fi

# 3. Gerar build de produção
echo ""
echo "🔨 Gerando build de produção..."
npm run build

# 4. Verificar se o build foi criado
echo ""
if [ -d "dist" ]; then
  echo "✅ Build gerado com sucesso!"
  echo ""
  echo "📁 Conteúdo da pasta dist:"
  ls -lh dist/
  echo ""
  echo "📊 Tamanho total:"
  du -sh dist/
  echo ""
  echo "🎉 Pronto para deploy!"
  echo ""
  echo "📤 Próximos passos:"
  echo "1. Acesse o Hostinger hPanel"
  echo "2. Vá para Gerenciador de Arquivos → public_html"
  echo "3. Delete tudo que estiver lá"
  echo "4. Faça upload de TODOS os arquivos da pasta 'dist/'"
  echo "5. Acesse seu domínio e teste!"
else
  echo "❌ Erro: Build não foi gerado"
  echo "Verifique os erros acima e tente novamente"
fi
