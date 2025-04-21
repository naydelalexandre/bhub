@echo off
echo ===== Deploy da API BrokerBooster para Vercel =====

cd api

echo.
echo Iniciando deploy da API...

vercel --prod

echo.
echo Deploy da API concluído!
echo.
echo Anote a URL da API para atualizar a configuração do frontend em:
echo frontend/src/lib/api-config.ts
echo.

cd ..
pause 