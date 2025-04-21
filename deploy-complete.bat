@echo off
echo ===== Deploy Completo BrokerBooster (API + Frontend) =====

echo.
echo === Passo 1: Deploy da API ===
echo.

cd api

echo Iniciando deploy da API...
vercel --prod

echo.
echo === API Implantada ===
echo.
echo Anote a URL da API gerada acima para configurar o frontend.
echo.
echo Pressione qualquer tecla para continuar com o deploy do frontend...
pause > nul

cd ..

echo.
echo === Passo 2: Deploy do Frontend ===
echo.

echo Atualizando configuração do frontend com a URL da API...
echo.
echo Verifique se a URL da API está correta em:
echo frontend/src/lib/api-config.ts
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

cd frontend

echo.
echo Construindo o frontend...
call npm run build

echo.
echo Implantando o frontend...
cd dist
vercel --prod

echo.
echo === Frontend Implantado ===
echo.
echo O deploy completo foi finalizado!
echo.
echo Aplicação disponível em:
echo - Frontend: URL acima
echo - API: URL anotada anteriormente
echo.

cd ..
cd ..
pause 