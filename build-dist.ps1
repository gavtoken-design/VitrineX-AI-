# Script para Build da Pasta Dist
Write-Host "🏗️ Iniciando build da pasta dist..." -ForegroundColor Cyan

# Limpar dist anterior
if (Test-Path "dist") {
    Write-Host "🗑️ Removendo dist anterior..." -ForegroundColor Yellow
    Remove-Item -Path "dist" -Recurse -Force
}

# Executar build
Write-Host "⚙️ Executando Vite build..." -ForegroundColor Yellow
npm run build

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    
    if (Test-Path "dist") {
        Write-Host ""
        Write-Host "📊 Estatísticas da pasta dist:" -ForegroundColor Cyan
        $files = Get-ChildItem -Path "dist" -Recurse -File
        $totalSize = ($files | Measure-Object -Property Length -Sum).Sum
        $fileCount = $files.Count
        
        Write-Host "   Arquivos: $fileCount" -ForegroundColor White
        Write-Host "   Tamanho: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor White
        
        Write-Host ""
        Write-Host "📁 Estrutura da pasta dist:" -ForegroundColor Cyan
        tree /F dist | Select-Object -First 20
        
        Write-Host ""
        Write-Host "✅ A pasta dist foi atualizada com todas as melhorias!" -ForegroundColor Green
        Write-Host "   - Meta tags SEO adicionadas" -ForegroundColor White
        Write-Host "   - Open Graph configurado" -ForegroundColor White
        Write-Host "   - Twitter Cards implementadas" -ForegroundColor White
        Write-Host "   - PWA otimizado" -ForegroundColor White
    }
    else {
        Write-Host "❌ Pasta dist não foi criada!" -ForegroundColor Red
    }
}
else {
    Write-Host ""
    Write-Host "❌ Erro no build!" -ForegroundColor Red
    Write-Host "Verifique os logs acima para detalhes." -ForegroundColor Yellow
}
