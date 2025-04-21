@echo off
echo ===== Deploy de API Serverless (Apenas Backend) =====

:: Criar pasta temporária
if not exist api-deploy mkdir api-deploy
if not exist api-deploy\api mkdir api-deploy\api

echo Preparando arquivos para deploy...

:: Criar package.json mínimo na raiz
echo {> api-deploy\package.json
echo   "name": "brokerbooster-api",>> api-deploy\package.json
echo   "version": "1.0.0",>> api-deploy\package.json
echo   "private": true,>> api-deploy\package.json
echo   "engines": {>> api-deploy\package.json
echo     "node": "18.x">> api-deploy\package.json
echo   },>> api-deploy\package.json
echo   "scripts": {>> api-deploy\package.json
echo     "start": "node api/index.js">> api-deploy\package.json
echo   },>> api-deploy\package.json
echo   "dependencies": {>> api-deploy\package.json
echo     "@supabase/supabase-js": "^2.38.4",>> api-deploy\package.json
echo     "dotenv": "^16.3.1">> api-deploy\package.json
echo   }>> api-deploy\package.json
echo }>> api-deploy\package.json

:: Criar arquivos da API
echo module.exports = (req, res) => { res.json({ status: 'ok', message: 'BrokerBooster API', timestamp: new Date().toISOString() }); }; > api-deploy\api\index.js
echo module.exports = (req, res) => { res.json({ status: 'ok', message: 'Status da API funcionando!', supabase: 'https://mnnzzppfhjnjawrykpgj.supabase.co' }); }; > api-deploy\api\status.js
echo module.exports = (req, res) => { res.json({ version: '1.0.0', name: 'BrokerBooster API', endpoints: ['/api', '/api/status', '/api/supabase'] }); }; > api-deploy\api\info.js
echo module.exports = (req, res) => { res.json({ supabaseUrl: 'https://mnnzzppfhjnjawrykpgj.supabase.co', message: 'Conexão com Supabase configurada' }); }; > api-deploy\api\supabase.js

:: Criar vercel.json com configuração específica para API
echo {> api-deploy\vercel.json
echo   "version": 2,>> api-deploy\vercel.json
echo   "buildCommand": "echo Skipping build...",>> api-deploy\vercel.json
echo   "functions": {>> api-deploy\vercel.json
echo     "api/*.js": {>> api-deploy\vercel.json
echo       "runtime": "nodejs18.x">> api-deploy\vercel.json
echo     }>> api-deploy\vercel.json
echo   },>> api-deploy\vercel.json
echo   "routes": [>> api-deploy\vercel.json
echo     { "src": "/api/status", "dest": "/api/status.js" },>> api-deploy\vercel.json
echo     { "src": "/api/info", "dest": "/api/info.js" },>> api-deploy\vercel.json 
echo     { "src": "/api/supabase", "dest": "/api/supabase.js" },>> api-deploy\vercel.json
echo     { "src": "/api", "dest": "/api/index.js" },>> api-deploy\vercel.json
echo     { "src": "/(.*)", "dest": "/api/index.js" }>> api-deploy\vercel.json
echo   ],>> api-deploy\vercel.json
echo   "env": {>> api-deploy\vercel.json
echo     "SUPABASE_URL": "https://mnnzzppfhjnjawrykpgj.supabase.co",>> api-deploy\vercel.json
echo     "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubnp6cHBmaGpuamF3cnlrcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQyNjIsImV4cCI6MjA2MDc2MDI2Mn0.8k2GbD_iNPy95M58mA2r41BXJEJA_uAI9-S78co_oBc">> api-deploy\vercel.json
echo   }>> api-deploy\vercel.json
echo }>> api-deploy\vercel.json

:: Criar um README.md explicativo
echo # BrokerBooster API> api-deploy\README.md
echo. >> api-deploy\README.md
echo API para acesso ao sistema BrokerBooster com integração com Supabase>> api-deploy\README.md

echo ===== Arquivos preparados =====
echo.
echo Navegando para a pasta...
cd api-deploy

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