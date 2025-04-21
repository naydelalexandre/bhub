@echo off
echo ===== Deploy de API Serverless (Final) =====

:: Criar pasta temporária
if not exist api-vercel mkdir api-vercel
if not exist api-vercel\api mkdir api-vercel\api

echo Preparando arquivos para deploy...

:: Criar package.json mínimo na raiz
echo {> api-vercel\package.json
echo   "name": "brokerbooster-api",>> api-vercel\package.json
echo   "version": "1.0.0",>> api-vercel\package.json
echo   "private": true,>> api-vercel\package.json
echo   "engines": {>> api-vercel\package.json
echo     "node": "18.x">> api-vercel\package.json
echo   },>> api-vercel\package.json
echo   "scripts": {>> api-vercel\package.json
echo     "start": "node api/index.js">> api-vercel\package.json
echo   },>> api-vercel\package.json
echo   "dependencies": {>> api-vercel\package.json
echo     "@supabase/supabase-js": "^2.38.4",>> api-vercel\package.json
echo     "dotenv": "^16.3.1">> api-vercel\package.json
echo   }>> api-vercel\package.json
echo }>> api-vercel\package.json

:: Criar arquivos da API
echo // Arquivo da API principal> api-vercel\api\index.js
echo const { createClient } = require('@supabase/supabase-js');>> api-vercel\api\index.js
echo require('dotenv').config();>> api-vercel\api\index.js
echo.>> api-vercel\api\index.js
echo module.exports = (req, res) => {>> api-vercel\api\index.js
echo   res.json({>> api-vercel\api\index.js
echo     status: 'ok',>> api-vercel\api\index.js
echo     message: 'BrokerBooster API',>> api-vercel\api\index.js
echo     timestamp: new Date().toISOString(),>> api-vercel\api\index.js
echo     endpoints: ['/api', '/api/status', '/api/info']>> api-vercel\api\index.js
echo   });>> api-vercel\api\index.js
echo };>> api-vercel\api\index.js

echo // Arquivo de status da API> api-vercel\api\status.js
echo module.exports = (req, res) => {>> api-vercel\api\status.js
echo   res.json({>> api-vercel\api\status.js
echo     status: 'ok',>> api-vercel\api\status.js
echo     message: 'Status da API funcionando!',>> api-vercel\api\status.js
echo     timestamp: new Date().toISOString()>> api-vercel\api\status.js
echo   });>> api-vercel\api\status.js
echo };>> api-vercel\api\status.js

echo // Arquivo com informações do API> api-vercel\api\info.js
echo module.exports = (req, res) => {>> api-vercel\api\info.js
echo   res.json({>> api-vercel\api\info.js
echo     name: 'BrokerBooster API',>> api-vercel\api\info.js
echo     version: '1.0.0',>> api-vercel\api\info.js
echo     description: 'API para acesso ao sistema BrokerBooster',>> api-vercel\api\info.js
echo     supabase: 'Integrado'>> api-vercel\api\info.js
echo   });>> api-vercel\api\info.js
echo };>> api-vercel\api\info.js

:: Criar vercel.json com configuração específica para API Serverless
echo {> api-vercel\vercel.json
echo   "version": 2,>> api-vercel\vercel.json
echo   "rewrites": [>> api-vercel\vercel.json
echo     { "source": "/api/status", "destination": "/api/status" },>> api-vercel\vercel.json
echo     { "source": "/api/info", "destination": "/api/info" },>> api-vercel\vercel.json
echo     { "source": "/(.*)", "destination": "/api" }>> api-vercel\vercel.json
echo   ]>> api-vercel\vercel.json
echo }>> api-vercel\vercel.json

:: Criar página HTML básica
echo ^<!DOCTYPE html^>> api-vercel\index.html
echo ^<html^>>> api-vercel\index.html
echo ^<head^>>> api-vercel\index.html
echo   ^<title^>BrokerBooster API^</title^>>> api-vercel\index.html
echo   ^<style^>>> api-vercel\index.html
echo     body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }>>> api-vercel\index.html
echo     h1 { color: #4a6da7; }>>> api-vercel\index.html
echo     .endpoint { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 10px; }>>> api-vercel\index.html
echo   ^</style^>>> api-vercel\index.html
echo ^</head^>>> api-vercel\index.html
echo ^<body^>>> api-vercel\index.html
echo   ^<h1^>BrokerBooster API^</h1^>>> api-vercel\index.html
echo   ^<p^>Esta é uma API RESTful para o sistema BrokerBooster com integração ao Supabase.^</p^>>> api-vercel\index.html
echo   ^<h2^>Endpoints Disponíveis:^</h2^>>> api-vercel\index.html
echo   ^<div class="endpoint"^>>> api-vercel\index.html
echo     ^<strong^>/api^</strong^> - Informações básicas da API>>> api-vercel\index.html
echo   ^</div^>>> api-vercel\index.html
echo   ^<div class="endpoint"^>>> api-vercel\index.html
echo     ^<strong^>/api/status^</strong^> - Status atual da API>>> api-vercel\index.html
echo   ^</div^>>> api-vercel\index.html
echo   ^<div class="endpoint"^>>> api-vercel\index.html
echo     ^<strong^>/api/info^</strong^> - Detalhes da versão da API>>> api-vercel\index.html
echo   ^</div^>>> api-vercel\index.html
echo ^</body^>>> api-vercel\index.html
echo ^</html^>>> api-vercel\index.html

echo ===== Arquivos preparados =====
echo.
echo Navegando para a pasta...
cd api-vercel

echo.
echo Para realizar o deploy, execute:
echo.
echo   npx vercel --prod
echo.
echo ===== Iniciando deploy =====
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

npx vercel --prod

cd ..
echo.
echo Deploy concluído! Verifique a URL fornecida acima.
echo.
pause 