
Write-Host "Iniciando VitrineX AI - Sistema Desktop..." -ForegroundColor Cyan

# Check if node_modules exists, if not, install
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências iniciais..." -ForegroundColor Yellow
    npm install
}

# Install desktop specific tools if missing
Write-Host "Verificando ferramentas de Desktop..." -ForegroundColor Yellow
npm list electron --depth=0 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalando suporte a Desktop App..." -ForegroundColor Yellow
    npm install electron wait-on concurrently --save-dev
}

Write-Host "Iniciando Servidor e Aplicativo..." -ForegroundColor Green
Write-Host "Aguarde a janela do aplicativo abrir..." -ForegroundColor Gray

# Run the desktop command
npm run desktop
