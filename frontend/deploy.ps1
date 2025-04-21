# Script PowerShell para build e deploy
Write-Host "Preparando build para produção..." -ForegroundColor Green

# Limpar diretório de build anterior
if (Test-Path dist) {
    Write-Host "Limpando diretório de build anterior..." -ForegroundColor Yellow
    Remove-Item -Path dist -Recurse -Force
}

# Instalar dependências se necessário
if (-not (Test-Path node_modules)) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Gerar build de produção
Write-Host "Gerando build de produção..." -ForegroundColor Cyan
npm run build

# Verificar se o build foi bem-sucedido
if (Test-Path dist) {
    Write-Host "Build concluído com sucesso!" -ForegroundColor Green
    
    # Verificar se vercel CLI está instalado
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "Vercel CLI não encontrado. Deseja instalá-lo? (S/N)" -ForegroundColor Yellow
        $instalar = Read-Host
        
        if ($instalar -eq "S" -or $instalar -eq "s") {
            npm install -g vercel
        } else {
            Write-Host "Para fazer deploy, instale o Vercel CLI: npm install -g vercel" -ForegroundColor Yellow
            Write-Host "Após instalar, execute: vercel login" -ForegroundColor Yellow
            Write-Host "Em seguida: vercel" -ForegroundColor Yellow
            exit
        }
    }
    
    # Perguntar se deseja fazer deploy
    Write-Host "Deseja fazer deploy no Vercel agora? (S/N)" -ForegroundColor Cyan
    $deploy = Read-Host
    
    if ($deploy -eq "S" -or $deploy -eq "s") {
        vercel
    } else {
        Write-Host "Build pronto em ./dist" -ForegroundColor Green
        Write-Host "Execute 'vercel' quando estiver pronto para fazer deploy." -ForegroundColor Yellow
    }
} else {
    Write-Host "Erro ao gerar build!" -ForegroundColor Red
} 