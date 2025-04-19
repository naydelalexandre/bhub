@echo off
REM Script de inicialização unificado para BrokerBooster
REM Criado para facilitar o processo de inicialização e configuração

echo ===================================================
echo             INICIANDO BROKERBOOSTER
echo ===================================================
echo.

REM Verifica e mata processos existentes
echo Encerrando processos anteriores...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq BrokerBooster*" 2>nul
taskkill /F /IM python.exe /FI "WINDOWTITLE eq BrokerBooster*" 2>nul
echo.

REM Verifica portas em uso
echo Verificando portas em uso...
set PORTS_TO_CHECK=3000 3001 3003 3004 3005 3007 5173 8080
for %%p in (%PORTS_TO_CHECK%) do (
    netstat -ano | findstr :%%p > nul
    if not errorlevel 1 (
        echo Porta %%p em uso. Liberando...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
            echo Encerrando processo: %%a
            taskkill /F /PID %%a 2>nul
        )
    )
)
echo.

REM Iniciar servidores em janelas separadas
echo Iniciando servidores de demonstração...

start "BrokerBooster - Python Server" cmd /c "cd %~dp0 && python server.py"
timeout /t 2 > nul

start "BrokerBooster - Exemplos Visuais" cmd /c "cd %~dp0 && node serve-examples.mjs"
timeout /t 2 > nul

start "BrokerBooster - B.Hub" cmd /c "cd %~dp0 && node serve-bhub.mjs"
timeout /t 2 > nul

start "BrokerBooster - Gamificação" cmd /c "cd %~dp0 && node serve-gamification.mjs"
timeout /t 2 > nul

REM Iniciar servidor e cliente (descomentado, se executar com npm)
REM echo Iniciando aplicação principal...
REM start "BrokerBooster - Server" cmd /c "cd %~dp0\server && npm run dev"
REM timeout /t 5 > nul
REM start "BrokerBooster - Client" cmd /c "cd %~dp0\client && npm run dev"

echo.
echo ===================================================
echo             BROKERBOOSTER INICIADO!
echo ===================================================
echo.
echo Acesse as demonstrações nos seguintes endereços:
echo - Demonstração Python: http://localhost:3001/demo.html
echo - Exemplos Visuais: http://localhost:3003
echo - B.Hub Demonstração: http://localhost:3004
echo - B.Hub Exemplos Visuais: http://localhost:3005
echo - Gamificação: http://localhost:3007
echo.
echo Para iniciar o servidor principal: 
echo   cd server && npm run dev
echo.
echo Para iniciar o cliente: 
echo   cd client && npm run dev
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul 