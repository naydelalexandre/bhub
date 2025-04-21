@echo off
TITLE Inicialização do BrokerBooster

REM Verifica se já existem processos rodando nas portas
echo Verificando portas em uso...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo Porta 3000 em uso. Encerrando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a
    )
) else (
    echo Porta 3000 livre.
)

netstat -ano | findstr :3001 > nul
if %errorlevel% equ 0 (
    echo Porta 3001 em uso. Encerrando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /F /PID %%a
    )
) else (
    echo Porta 3001 livre.
)

netstat -ano | findstr :3003 > nul
if %errorlevel% equ 0 (
    echo Porta 3003 em uso. Encerrando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do (
        taskkill /F /PID %%a
    )
) else (
    echo Porta 3003 livre.
)

netstat -ano | findstr :3004 > nul
if %errorlevel% equ 0 (
    echo Porta 3004 em uso. Encerrando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3004') do (
        taskkill /F /PID %%a
    )
) else (
    echo Porta 3004 livre.
)

netstat -ano | findstr :3007 > nul
if %errorlevel% equ 0 (
    echo Porta 3007 em uso. Encerrando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3007') do (
        taskkill /F /PID %%a
    )
) else (
    echo Porta 3007 livre.
)

echo.
echo Iniciando servidores de demonstração...

REM Iniciar o servidor Python na porta 3001
start "Servidor Python" cmd /c "python server.py"

REM Iniciar o servidor de exemplos visuais na porta 3003
start "Exemplos Visuais" cmd /c "cd visual-examples && npm start"

REM Iniciar o servidor B.Hub de demonstração na porta 3004
start "B.Hub Demonstração" cmd /c "cd bhub && npm start"

REM Iniciar o servidor de gamificação na porta 3007
start "Gamificação" cmd /c "cd gamification && npm start"

echo.
echo Servidores de demonstração iniciados! URLs:
echo - Demonstração Python: http://localhost:3001/demo.html
echo - Exemplos Visuais: http://localhost:3003
echo - B.Hub Demonstração: http://localhost:3004
echo - B.Hub Exemplos Visuais: http://localhost:3005
echo - Gamificação: http://localhost:3007
echo.

REM Iniciar os servidores principais (backend e frontend)
echo Para iniciar o servidor principal, execute em terminais separados:
echo cd backend && npm run dev
echo cd frontend && npm run dev
echo.

REM Estes comandos estão comentados por padrão devido às restrições do PowerShell
REM Descomente se estiver usando CMD ou se já alterou a política de execução do PowerShell

REM start "Servidor Backend" cmd /c "cd backend && npm run dev"
REM start "Servidor Frontend" cmd /c "cd frontend && npm run dev"

echo Após iniciar os servidores principais, acesse:
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:5173
echo.

pause 