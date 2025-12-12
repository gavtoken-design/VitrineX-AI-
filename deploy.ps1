# Deploy Automatizado - VitrineX AI
# Versao Simplificada

$Host.UI.RawUI.WindowTitle = "Deploy VitrineX AI"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY AUTOMATIZADO - VitrineX AI    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracoes
$SSH_HOST = "82.112.247.163"
$SSH_PORT = "65002"
$SSH_USER = "u786088869"
$SSH_PASS = "VitrineX.AI2025"
$REMOTE_PATH = "/home/u786088869/domains/vitrinex.online/public_html"
$LOCAL_PATH = "dist"

# Verificar pasta dist
Write-Host "[1/3] Verificando arquivos locais..." -ForegroundColor Yellow

if (-not (Test-Path $LOCAL_PATH)) {
    Write-Host ""
    Write-Host "ERRO: Pasta dist nao encontrada!" -ForegroundColor Red
    Write-Host "Execute: npm run build" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$fileCount = (Get-ChildItem -Path $LOCAL_PATH -Recurse -File).Count
Write-Host "      Arquivos encontrados: $fileCount" -ForegroundColor Green
Write-Host ""

# Verificar PSCP
Write-Host "[2/3] Verificando PSCP..." -ForegroundColor Yellow

$pscpPath = "C:\Program Files\PuTTY\pscp.exe"
if (-not (Test-Path $pscpPath)) {
    $pscpPath = "C:\Program Files (x86)\PuTTY\pscp.exe"
}

if (-not (Test-Path $pscpPath)) {
    Write-Host ""
    Write-Host "ERRO: PSCP nao encontrado!" -ForegroundColor Red
    Write-Host "Instale o PuTTY primeiro." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "      PSCP encontrado!" -ForegroundColor Green
Write-Host ""

# Upload
Write-Host "[3/3] Fazendo upload..." -ForegroundColor Yellow
Write-Host "      Destino: vitrinex.online" -ForegroundColor Gray
Write-Host "      Isso pode levar alguns minutos..." -ForegroundColor Gray
Write-Host ""

# Executar PSCP
$destino = "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/"

try {
    # Upload com PSCP
    & $pscpPath -P $SSH_PORT -pw $SSH_PASS -r "$LOCAL_PATH\*" $destino 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "       DEPLOY CONCLUIDO!               " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Seu site esta no ar em:" -ForegroundColor Cyan
        Write-Host "https://vitrinex.online" -ForegroundColor White
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Yellow
        Write-Host "1. Acesse o site" -ForegroundColor White
        Write-Host "2. Teste o motor de IA" -ForegroundColor White
        Write-Host "3. Instale como PWA" -ForegroundColor White
        Write-Host ""
    }
    else {
        throw "Erro no upload"
    }
    
}
catch {
    Write-Host ""
    Write-Host "ERRO durante o upload!" -ForegroundColor Red
    Write-Host "Detalhes: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tente usar WinSCP (interface grafica):" -ForegroundColor Cyan
    Write-Host "https://winscp.net" -ForegroundColor White
    Write-Host ""
    exit 1
}
