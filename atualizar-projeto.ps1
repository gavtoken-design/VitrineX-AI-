# 🚀 Script de Atualização - VitrineX AI
# Automatiza verificação e atualização do projeto

Write-Host "🔍 Iniciando verificação e atualização do VitrineX AI..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar versão do Node
Write-Host "📦 Verificando versão do Node.js..." -ForegroundColor Yellow
node --version
npm --version
Write-Host ""

# 2. Limpar cache e reinstalar dependências
Write-Host "🧹 Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host ""
Write-Host "📥 Verificando dependências desatualizadas..." -ForegroundColor Yellow
npm outdated

Write-Host ""
$updateDeps = Read-Host "Deseja atualizar as dependências? (s/n)"
if ($updateDeps -eq "s") {
    Write-Host "⬆️ Atualizando dependências..." -ForegroundColor Green
    npm update
    Write-Host "✅ Dependências atualizadas!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Reinstalando dependências..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
npm install

Write-Host ""
Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green

# 3. Verificar integridade do projeto
Write-Host ""
Write-Host "🔍 Verificando integridade do TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit

# 4. Testar build
Write-Host ""
Write-Host "🏗️ Testando build de produção..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Estatísticas do build:" -ForegroundColor Cyan
    Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum | Select-Object Count, @{Name="Size (MB)";Expression={[math]::Round($_.Sum / 1MB, 2)}}
} else {
    Write-Host ""
    Write-Host "❌ Erro no build. Verifique os logs acima." -ForegroundColor Red
    exit 1
}

# 5. Análise de segurança
Write-Host ""
Write-Host "🔐 Executando auditoria de segurança..." -ForegroundColor Yellow
npm audit --production

# 6. Verificar arquivo .env
Write-Host ""
Write-Host "🔑 Verificando configuração de API Keys..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Arquivo .env não encontrado. Criando template..." -ForegroundColor Yellow
    "# VitrineX AI - Environment Variables`nVITE_GEMINI_API_KEY=`nVITE_BACKEND_URL=http://localhost:3000" | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Template .env criado. Configure suas chaves de API." -ForegroundColor Green
}

# 7. Verificar .gitignore
Write-Host ""
Write-Host "🔒 Verificando .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -match "\.env") {
    Write-Host "✅ .env está protegido no .gitignore" -ForegroundColor Green
} else {
    Write-Host "⚠️ Adicionando .env ao .gitignore..." -ForegroundColor Yellow
    Add-Content -Path ".gitignore" -Value "`n# Environment Variables`n.env`n.env.local`n.env.production"
    Write-Host "✅ .gitignore atualizado" -ForegroundColor Green
}

# 8. Relatório final
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Configure sua API Key do Google Gemini no arquivo .env"
Write-Host "  2. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
Write-Host "  3. Acesse http://localhost:3000"
Write-Host ""
Write-Host "📚 Documentação disponível em:" -ForegroundColor Yellow
Write-Host "  - README.md"
Write-Host "  - REVISAO_CODIGO_2025.md"
Write-Host "  - DEPLOY_HOSTINGER.md"
Write-Host ""
Write-Host "🎉 Bom trabalho!" -ForegroundColor Green
