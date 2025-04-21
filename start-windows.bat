@echo off
TITLE BrokerBooster - Inicializacao

echo ===== Iniciando BrokerBooster =====
echo.
echo 1. Verificando portas em uso...

netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo Porta 3000 em uso. Encerrando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a
    )
) else (
    echo Porta 3000 livre.
)

netstat -ano | findstr :5173 > nul
if %errorlevel% equ 0 (
    echo Porta 5173 em uso. Encerrando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        taskkill /F /PID %%a
    )
) else (
    echo Porta 5173 livre.
)

echo.
echo 2. Iniciando o Backend (API)...
echo.

cd api
start "BrokerBooster API" cmd.exe /k "node index.js"
cd ..

echo.
echo 3. Iniciando o Frontend...
echo.

cd frontend
start "BrokerBooster Frontend" cmd.exe /k "npm run dev"

echo.
echo ===== BrokerBooster iniciado! =====
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
echo IMPORTANTE: Para encerrar, feche as janelas dos terminais.
echo.

exit 