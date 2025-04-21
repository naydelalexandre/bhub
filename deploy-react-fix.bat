@echo off
echo ===== Deploy React App para Vercel =====

:: Limpar e criar pasta temporária
rmdir /s /q temp-deploy 2>nul
mkdir temp-deploy
mkdir temp-deploy\api

:: Compilar o frontend com Vite
echo Compilando o frontend...
cd frontend
call npm run build
cd ..

:: Copiar os arquivos compilados para a pasta de deploy
echo Copiando arquivos compilados...
xcopy /E /I /Y frontend\dist\* temp-deploy\

:: Criar arquivos da API
echo Criando arquivos da API...
echo module.exports = (req, res) => { res.json({ status: 'ok', message: 'API BrokerBooster', timestamp: new Date().toISOString() }); }; > temp-deploy\api\index.js
echo module.exports = (req, res) => { res.json({ message: 'Status da API funcionando!', supabase: 'https://mnnzzppfhjnjawrykpgj.supabase.co' }); }; > temp-deploy\api\status.js

:: Criar vercel.json com configurações simples
echo {> temp-deploy\vercel.json
echo   "version": 2,>> temp-deploy\vercel.json
echo   "builds": [>> temp-deploy\vercel.json
echo     { "src": "api/*.js", "use": "@vercel/node" },>> temp-deploy\vercel.json
echo     { "src": "assets/**", "use": "@vercel/static" },>> temp-deploy\vercel.json
echo     { "src": "index.html", "use": "@vercel/static" }>> temp-deploy\vercel.json
echo   ],>> temp-deploy\vercel.json
echo   "routes": [>> temp-deploy\vercel.json
echo     { "src": "/api/status", "dest": "/api/status.js" },>> temp-deploy\vercel.json
echo     { "src": "/api/(.*)", "dest": "/api/index.js" },>> temp-deploy\vercel.json
echo     { "handle": "filesystem" }>> temp-deploy\vercel.json
echo   ]>> temp-deploy\vercel.json
echo }>> temp-deploy\vercel.json

echo Arquivos preparados. Pressione qualquer tecla para fazer o deploy...
pause
cd temp-deploy
npx vercel --prod
cd ..
echo Deploy concluído! 