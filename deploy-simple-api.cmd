@echo off
echo ===== Deploy API Simples (sem build) =====

if not exist vercel-api mkdir vercel-api
cd vercel-api

echo Criando arquivos essenciais...

:: Criar package.json com configuração para DESABILITAR builds
echo {> package.json
echo   "name": "brokerbooster-api",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "private": true,>> package.json
echo   "scripts": {>> package.json
echo     "build": "echo Skipping build step">> package.json
echo   }>> package.json
echo }>> package.json

:: Criar API minimalista
mkdir api
echo module.exports = (req, res) => {> api\index.js
echo   res.json({>> api\index.js
echo     status: "online",>> api\index.js
echo     name: "BrokerBooster API",>> api\index.js
echo     timestamp: new Date().toISOString()>> api\index.js
echo   });>> api\index.js
echo };>> api\index.js

:: Criar vercel.json com buildCommand explicitamente desativado
echo {> vercel.json
echo   "version": 2,>> vercel.json
echo   "buildCommand": "npm run build",>> vercel.json
echo   "outputDirectory": ".",>> vercel.json
echo   "rewrites": [>> vercel.json
echo     { "source": "/api", "destination": "/api/index.js" },>> vercel.json
echo     { "source": "/(.*)", "destination": "/index.html" }>> vercel.json
echo   ]>> vercel.json
echo }>> vercel.json

:: Criar HTML simples
echo ^<!DOCTYPE html^>> index.html
echo ^<html^>>> index.html
echo ^<head^>^<title^>BrokerBooster API^</title^>^</head^>>> index.html
echo ^<body^>>> index.html
echo   ^<h1^>BrokerBooster API^</h1^>>> index.html
echo   ^<p^>Esta API está funcionando. Acesse ^<a href="/api"^>/api^</a^> para testar.^</p^>>> index.html
echo ^</body^>>> index.html
echo ^</html^>>> index.html

echo.
echo Arquivos criados com sucesso!
echo.
echo Para fazer deploy, execute: npx vercel --prod
echo.
echo Pressione qualquer tecla para iniciar o deploy...
pause > nul

:: Iniciar deploy
echo.
echo Iniciando deploy na Vercel...
npx vercel --prod

echo.
echo Verifique o resultado acima para o status do deploy.
echo.
cd ..

pause 