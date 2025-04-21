@echo off
TITLE BrokerBooster - Deploy Completo

echo ===== DEPLOY COMPLETO BROKERBOOSTER =====
echo.
echo Este script vai realizar o deploy completo do BrokerBooster (Frontend + API) na Vercel.
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

echo.
echo 1. DEPLOY DA API
echo ================
echo.

cd api
echo Instalando dependencias da API...
call npm install

echo.
echo Fazendo deploy da API...
call vercel --prod

echo.
echo API implantada com sucesso!
echo.
echo Anote a URL acima, pois sera necessaria para configurar o frontend.
echo.
echo Pressione qualquer tecla para continuar com o deploy do frontend...
pause > nul

cd ..

echo.
echo 2. ATUALIZANDO CONFIGURACAO DO FRONTEND
echo ======================================
echo.
echo Por favor, atualize a URL da API no arquivo:
echo frontend/src/lib/api-config.ts
echo.
echo Substitua a URL atual pela URL gerada acima.
echo.
echo Pressione qualquer tecla apos atualizar o arquivo...
pause > nul

echo.
echo 3. DEPLOY DO FRONTEND
echo ====================
echo.

cd frontend
echo Instalando dependencias do frontend...
call npm install

echo.
echo Construindo o frontend...
call npm run build

echo.
echo Copiando configuracoes para a pasta dist...
copy vercel.json dist

echo.
echo Fazendo deploy do frontend...
cd dist
call vercel --prod

echo.
echo ===== DEPLOY COMPLETO CONCLUIDO! =====
echo.
echo Frontend: URL exibida acima
echo API: URL anotada anteriormente
echo.
echo O aplicativo BrokerBooster ja esta disponivel online!
echo.

pause 