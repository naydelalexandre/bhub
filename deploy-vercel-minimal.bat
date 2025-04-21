@echo off
echo ===== Script Minimalista de Deploy para Vercel =====

:: Criar pasta temporária
if not exist temp-deploy mkdir temp-deploy
if not exist temp-deploy\api mkdir temp-deploy\api

echo Preparando arquivos para deploy...

:: Criar arquivos mínimos necessários
echo module.exports = (req, res) => { res.json({ status: 'ok', message: 'API BrokerBooster', timestamp: new Date().toISOString() }); }; > temp-deploy\api\index.js
echo module.exports = (req, res) => { res.json({ message: 'Status da API funcionando!', supabase: 'https://mnnzzppfhjnjawrykpgj.supabase.co' }); }; > temp-deploy\api\status.js

:: Criar package.json
echo {> temp-deploy\package.json
echo   "name": "brokerbooster-api",>> temp-deploy\package.json
echo   "version": "1.0.0",>> temp-deploy\package.json
echo   "private": true,>> temp-deploy\package.json
echo   "scripts": {>> temp-deploy\package.json
echo     "start": "node api/index.js">> temp-deploy\package.json
echo   },>> temp-deploy\package.json
echo   "engines": {>> temp-deploy\package.json
echo     "node": "18.x">> temp-deploy\package.json
echo   }>> temp-deploy\package.json
echo }>> temp-deploy\package.json

:: Criar vercel.json
echo {> temp-deploy\vercel.json
echo   "version": 2,>> temp-deploy\vercel.json
echo   "routes": [>> temp-deploy\vercel.json
echo     { "src": "/api/status", "dest": "/api/status.js" },>> temp-deploy\vercel.json
echo     { "src": "/api/(.*)", "dest": "/api/index.js" },>> temp-deploy\vercel.json
echo     { "src": "/(.*)", "dest": "/api/index.js" }>> temp-deploy\vercel.json
echo   ]>> temp-deploy\vercel.json
echo }>> temp-deploy\vercel.json

:: Criar arquivo HTML básico
echo ^<!DOCTYPE html^> > temp-deploy\index.html
echo ^<html^>^<body^>^<h1^>BrokerBooster API^</h1^>^<p^>Esta é uma API RESTful. Use /api/status para testar.^</p^>^</body^>^</html^> >> temp-deploy\index.html

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

npx vercel --prod

cd ..
echo.
echo Deploy concluído! Verifique a URL fornecida acima.
echo.
pause 