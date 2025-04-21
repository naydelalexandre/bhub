# Build app
Write-Host "Buildando a aplicação..." -ForegroundColor Green
npm run build

# Garante que o arquivo vercel.json esteja na pasta dist
Write-Host "Copiando configurações para a pasta dist..." -ForegroundColor Green
Copy-Item -Path "vercel.json" -Destination "dist/vercel.json" -Force

# Navegar para a pasta dist
Write-Host "Navegando para a pasta dist..." -ForegroundColor Green
cd dist

# Executar o deploy
Write-Host "Executando o deploy na Vercel..." -ForegroundColor Green
vercel --prod

# Voltar para a pasta principal
Write-Host "Deploy concluído!" -ForegroundColor Green
cd .. 