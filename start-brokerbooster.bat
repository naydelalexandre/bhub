@echo off
echo ======================================================
echo    INICIALIZAÇÃO DO SISTEMA BROKERBOOSTER
echo ======================================================
echo.
echo Verificando por processos anteriores...

REM Verifica se há processos rodando e os termina
taskkill /f /im python.exe /fi "WINDOWTITLE eq Demonstration Python Server" 2>NUL
taskkill /f /im node.exe /fi "WINDOWTITLE eq Visual Examples Server" 2>NUL
taskkill /f /im node.exe /fi "WINDOWTITLE eq B.Hub Demonstration Server" 2>NUL
taskkill /f /im node.exe /fi "WINDOWTITLE eq B.Hub Visual Examples Server" 2>NUL
taskkill /f /im node.exe /fi "WINDOWTITLE eq Gamification Server" 2>NUL
taskkill /f /im node.exe /fi "WINDOWTITLE eq BrokerBooster Server" 2>NUL
taskkill /f /im node.exe /fi "WINDOWTITLE eq BrokerBooster Client" 2>NUL

echo Verificando se portas estão disponíveis...

REM Verifica se portas estão sendo usadas
netstat -ano | findstr :3001 >NUL
if not %ERRORLEVEL% == 0 (
    echo Porta 3001 está livre.
) else (
    echo ATENÇÃO: Porta 3001 está em uso. Tentando liberar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /f /pid %%a 2>NUL
)

netstat -ano | findstr :3003 >NUL
if not %ERRORLEVEL% == 0 (
    echo Porta 3003 está livre.
) else (
    echo ATENÇÃO: Porta 3003 está em uso. Tentando liberar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do taskkill /f /pid %%a 2>NUL
)

netstat -ano | findstr :3004 >NUL
if not %ERRORLEVEL% == 0 (
    echo Porta 3004 está livre.
) else (
    echo ATENÇÃO: Porta 3004 está em uso. Tentando liberar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3004') do taskkill /f /pid %%a 2>NUL
)

netstat -ano | findstr :3007 >NUL
if not %ERRORLEVEL% == 0 (
    echo Porta 3007 está livre.
) else (
    echo ATENÇÃO: Porta 3007 está em uso. Tentando liberar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3007') do taskkill /f /pid %%a 2>NUL
)

echo.
echo Iniciando servidores de demonstração...
echo.

REM Inicia servidores de demostração em novas janelas
start "Servidor Python - Demonstração" cmd /k "cd /d %~dp0 && python server.py"
start "Exemplos Visuais" cmd /k "cd /d %~dp0 && node server-examples.js 3003"
start "Demonstração B.Hub" cmd /k "cd /d %~dp0 && node server-bhub.js 3004"
start "Exemplos Visuais B.Hub" cmd /k "cd /d %~dp0 && node server-bhub-examples.js 3005"
start "Sistema de Gamificação" cmd /k "cd /d %~dp0 && node server-gamification.js 3007"

echo.
echo ======================================================
echo  LINKS DE ACESSO ÀS DEMONSTRAÇÕES:
echo ======================================================
echo.
echo  1. Demonstração Python: http://localhost:3001/demo.html
echo  2. Exemplos Visuais: http://localhost:3003
echo  3. Demonstração B.Hub: http://localhost:3004
echo  4. Exemplos Visuais B.Hub: http://localhost:3005
echo  5. Sistema de Gamificação: http://localhost:3007
echo.
echo ======================================================
echo.

REM O servidor principal e o cliente devem ser iniciados separadamente
echo Para iniciar o servidor e cliente principal da aplicação,
echo abra duas janelas de Prompt de Comando (cmd) e execute:
echo.
echo SERVIDOR (primeira janela CMD):
echo   cd %~dp0\server
echo   npm run dev
echo.
echo CLIENTE (segunda janela CMD):
echo   cd %~dp0\client
echo   npm run dev
echo.
echo ======================================================
echo.

pause 