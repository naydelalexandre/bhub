@echo off
echo ===== Deploy React App para Vercel (Versao 2) =====

:: Limpar e criar pasta temporária
rmdir /s /q temp-deploy 2>nul
mkdir temp-deploy
mkdir temp-deploy\api
mkdir temp-deploy\assets

:: Compilar o frontend com Vite
echo Compilando o frontend com otimizacoes...
cd frontend
call npm run build
cd ..

:: Copiar os arquivos compilados para a pasta de deploy
echo Copiando arquivos compilados...
xcopy /E /I /Y frontend\dist\assets\* temp-deploy\assets\
copy frontend-index-clean.html temp-deploy\index.html

:: Criar arquivos da API
echo Criando arquivos da API...
echo module.exports = (req, res) => { res.json({ status: 'ok', message: 'API BrokerBooster', timestamp: new Date().toISOString() }); }; > temp-deploy\api\index.js
echo module.exports = (req, res) => { res.json({ message: 'Status da API funcionando!', supabase: 'https://mnnzzppfhjnjawrykpgj.supabase.co' }); }; > temp-deploy\api\status.js

:: Criar vercel.json otimizado
echo {> temp-deploy\vercel.json
echo   "version": 2,>> temp-deploy\vercel.json
echo   "framework": "vite",>> temp-deploy\vercel.json
echo   "builds": [>> temp-deploy\vercel.json
echo     { "src": "api/*.js", "use": "@vercel/node" },>> temp-deploy\vercel.json
echo     { "src": "assets/**", "use": "@vercel/static" },>> temp-deploy\vercel.json
echo     { "src": "index.html", "use": "@vercel/static" }>> temp-deploy\vercel.json
echo   ],>> temp-deploy\vercel.json
echo   "routes": [>> temp-deploy\vercel.json
echo     { "src": "/api/status", "dest": "/api/status.js" },>> temp-deploy\vercel.json
echo     { "src": "/api/(.*)", "dest": "/api/index.js" },>> temp-deploy\vercel.json
echo     { "src": "/assets/(.*)", "dest": "/assets/$1" },>> temp-deploy\vercel.json
echo     { "handle": "filesystem" },>> temp-deploy\vercel.json
echo     { "src": "/(.*)", "dest": "/index.html" }>> temp-deploy\vercel.json
echo   ]>> temp-deploy\vercel.json
echo }>> temp-deploy\vercel.json

:: Criar package.json para o deploy
echo {> temp-deploy\package.json
echo   "name": "brokerbooster-app",>> temp-deploy\package.json
echo   "version": "1.0.0",>> temp-deploy\package.json
echo   "type": "module",>> temp-deploy\package.json
echo   "private": true,>> temp-deploy\package.json
echo   "engines": {>> temp-deploy\package.json
echo     "node": ">=18.0.0">> temp-deploy\package.json
echo   }>> temp-deploy\package.json
echo }>> temp-deploy\package.json

echo Arquivos preparados. Pressione qualquer tecla para fazer o deploy...
pause

cd temp-deploy
echo Iniciando o deploy via Vercel...
npx vercel --prod --force
cd ..

echo Deploy concluido! 