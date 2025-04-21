# Script PowerShell para iniciar o ambiente de desenvolvimento
Write-Host "Iniciando o ambiente de desenvolvimento do BrokerBooster..." -ForegroundColor Green

# Verifica se json-server está instalado
if (-not (Get-Command json-server -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando json-server globalmente..." -ForegroundColor Yellow
    npm install -g json-server
}

# Inicia o servidor mock e o frontend em janelas separadas
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run mock-api; Read-Host 'Pressione Enter para fechar'"
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev; Read-Host 'Pressione Enter para fechar'"

Write-Host "Ambiente iniciado! Acesse:" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Mock API: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para encerrar este script (as janelas continuarão abertas)" -ForegroundColor Yellow 