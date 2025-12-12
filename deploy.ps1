# Script de Deploy Rápido - VitrineX AI (PowerShell)
# Execute este script para preparar o projeto para deploy

Write-Host "🚀 Iniciando preparação para deploy..." -ForegroundColor Cyan
Write-Host ""

# 1. Limpar builds anteriores
Write-Host "📦 Limpando builds anteriores..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ Pasta dist removida" -ForegroundColor Green
}

# 2. Verificar dependências
Write-Host ""
Write-Host "📥 Verificando dependências..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✓ Dependências já instaladas" -ForegroundColor Green
}

# 3. Gerar build de produção
Write-Host ""
Write-Host "🔨 Gerando build de produção..." -ForegroundColor Yellow
npm run build

# 4. Verificar se o build foi criado
Write-Host ""
if (Test-Path "dist") {
    Write-Host "✅ Build gerado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Conteúdo da pasta dist:" -ForegroundColor Cyan
    Get-ChildItem -Path "dist" -Recurse | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
    Write-Host ""
    $size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📊 Tamanho total: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Pronto para deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Acesse o Hostinger hPanel"
    Write-Host "2. Vá para Gerenciador de Arquivos → public_html"
    Write-Host "3. Delete tudo que estiver lá"
    Write-Host "4. Faça upload de TODOS os arquivos da pasta 'dist/'"
    Write-Host "5. Acesse seu domínio e teste!"
    Write-Host ""
    Write-Host "📚 Consulte DEPLOYMENT_HOSTINGER.md para mais detalhes" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro: Build não foi gerado" -ForegroundColor Red
    Write-Host "Verifique os erros acima e tente novamente"
}
