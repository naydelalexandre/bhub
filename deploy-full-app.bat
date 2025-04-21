@echo off
echo ===== Script de Deploy Completo para Vercel (Frontend + API) =====

:: Limpar pasta temporária se existir
if exist temp-deploy rmdir /s /q temp-deploy

:: Criar pasta temporária
mkdir temp-deploy
mkdir temp-deploy\api
mkdir temp-deploy\assets

echo Preparando arquivos para deploy...

:: Compilar o frontend
echo Compilando o frontend...
cd frontend
call npm run build
cd ..

:: Copiar assets e usar HTML customizado
echo Copiando assets do frontend...
xcopy /I /Y frontend\dist\assets\*.* temp-deploy\assets\
echo Copiando arquivo index.html customizado...
copy custom-index.html temp-deploy\index.html

:: Criar arquivos da API
echo Criando arquivos da API...
echo module.exports = (req, res) ^=^> { res.json({ status: 'ok', message: 'API BrokerBooster', timestamp: new Date().toISOString() }); }; > temp-deploy\api\index.js
echo module.exports = (req, res) ^=^> { res.json({ message: 'Status da API funcionando!', supabase: 'https://mnnzzppfhjnjawrykpgj.supabase.co' }); }; > temp-deploy\api\status.js

:: Criar package.json
echo {> temp-deploy\package.json
echo   "name": "brokerbooster-full",>> temp-deploy\package.json
echo   "version": "1.0.0",>> temp-deploy\package.json
echo   "private": true,>> temp-deploy\package.json
echo   "scripts": {>> temp-deploy\package.json
echo     "start": "node api/index.js">> temp-deploy\package.json
echo   },>> temp-deploy\package.json
echo   "engines": {>> temp-deploy\package.json
echo     "node": "18.x">> temp-deploy\package.json
echo   }>> temp-deploy\package.json
echo }>> temp-deploy\package.json

:: Criar vercel.json simplificado
echo {> temp-deploy\vercel.json
echo   "version": 2,>> temp-deploy\vercel.json
echo   "builds": [>> temp-deploy\vercel.json
echo     { "src": "api/*.js", "use": "@vercel/node" },>> temp-deploy\vercel.json
echo     { "src": "assets/**", "use": "@vercel/static" },>> temp-deploy\vercel.json
echo     { "src": "*.html", "use": "@vercel/static" }>> temp-deploy\vercel.json
echo   ],>> temp-deploy\vercel.json
echo   "routes": [>> temp-deploy\vercel.json
echo     { "src": "/api/status", "dest": "/api/status.js" },>> temp-deploy\vercel.json
echo     { "src": "/api/(.*)", "dest": "/api/index.js" },>> temp-deploy\vercel.json
echo     { "src": "/assets/(.*)", "dest": "/assets/$1" },>> temp-deploy\vercel.json
echo     { "handle": "filesystem" },>> temp-deploy\vercel.json
echo     { "src": "/(.*)", "dest": "/$1" },>> temp-deploy\vercel.json
echo     { "src": "/", "dest": "/index.html" }>> temp-deploy\vercel.json
echo   ]>> temp-deploy\vercel.json
echo }>> temp-deploy\vercel.json

cd temp-deploy

echo ===== Arquivos de deploy criados =====
echo.
echo Para realizar o deploy, execute:
echo.
echo   npx vercel --prod
echo.
echo ===== OU =====
echo.
echo Pressione qualquer tecla para realizar o deploy agora...
pause > nul

:: Deploy da aplicação completa
npx vercel --prod --force

cd ..
echo.
echo Deploy concluído! Verifique a URL fornecida acima.
echo.
pause 