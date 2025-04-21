@echo off
echo ===== Deploy React App para Vercel (Versao Dinamica) =====

:: Limpar e criar pasta temporária
rmdir /s /q temp-deploy 2>nul
mkdir temp-deploy
mkdir temp-deploy\api
mkdir temp-deploy\assets

:: Compilar o frontend com Vite
echo Compilando o frontend...
cd frontend
call npm run build
cd ..

:: Detectar nomes de arquivos JS e CSS
echo Detectando nomes de arquivos...
for /f "tokens=*" %%a in ('dir /b frontend\dist\assets\*.js') do set JS_FILE=%%a
for /f "tokens=*" %%a in ('dir /b frontend\dist\assets\*.css') do set CSS_FILE=%%a
echo Encontrados: %JS_FILE% e %CSS_FILE%

:: Criar um index.html dinamicamente com os nomes corretos dos arquivos
echo Criando index.html...
echo ^<!DOCTYPE html^> > temp-deploy\index.html
echo ^<html lang="pt-BR"^> >> temp-deploy\index.html
echo   ^<head^> >> temp-deploy\index.html
echo     ^<meta charset="UTF-8" /^> >> temp-deploy\index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^> >> temp-deploy\index.html
echo     ^<title^>BrokerBooster^</title^> >> temp-deploy\index.html
echo     ^<script type="module" crossorigin src="/assets/%JS_FILE%"^>^</script^> >> temp-deploy\index.html
echo     ^<link rel="stylesheet" href="/assets/%CSS_FILE%"^> >> temp-deploy\index.html
echo   ^</head^> >> temp-deploy\index.html
echo   ^<body^> >> temp-deploy\index.html
echo     ^<div id="root"^>^</div^> >> temp-deploy\index.html
echo   ^</body^> >> temp-deploy\index.html
echo ^</html^> >> temp-deploy\index.html

:: Copiar os arquivos compilados para a pasta de deploy
echo Copiando arquivos compilados...
xcopy /I /Y frontend\dist\assets\*.* temp-deploy\assets\

:: Criar arquivos da API
echo Criando arquivos da API...
echo module.exports = (req, res) => { res.json({ status: 'ok', message: 'API BrokerBooster', timestamp: new Date().toISOString() }); }; > temp-deploy\api\index.js
echo module.exports = (req, res) => { res.json({ message: 'Status da API funcionando!', supabase: 'https://mnnzzppfhjnjawrykpgj.supabase.co' }); }; > temp-deploy\api\status.js

:: Criar vercel.json otimizado
echo {> temp-deploy\vercel.json
echo   "version": 2,>> temp-deploy\vercel.json
echo   "functions": {>> temp-deploy\vercel.json
echo     "api/*.js": { "runtime": "nodejs18.x" }>> temp-deploy\vercel.json
echo   },>> temp-deploy\vercel.json
echo   "routes": [>> temp-deploy\vercel.json
echo     { "src": "/api/status", "dest": "/api/status.js" },>> temp-deploy\vercel.json
echo     { "src": "/api/(.*)", "dest": "/api/index.js" },>> temp-deploy\vercel.json
echo     { "src": "/assets/(.*)", "dest": "/assets/$1" },>> temp-deploy\vercel.json
echo     { "handle": "filesystem" },>> temp-deploy\vercel.json
echo     { "src": "/(.*)", "dest": "/index.html" }>> temp-deploy\vercel.json
echo   ]>> temp-deploy\vercel.json
echo }>> temp-deploy\vercel.json

echo Arquivos preparados. Pressione qualquer tecla para fazer o deploy...
pause

cd temp-deploy
echo Iniciando o deploy via Vercel...
npx vercel --prod --force
cd ..

echo Deploy concluido! 