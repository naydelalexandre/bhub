@echo off
echo ===== Deploy React App (Versao Final) =====

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

:: Copiar assets
echo Copiando arquivos de assets...
xcopy /I /Y frontend\dist\assets\*.* temp-deploy\assets\

:: Criar um HTML com suporte a fallback
echo Criando página React com fallback...
echo ^<!DOCTYPE html^> > temp-deploy\index.html
echo ^<html lang="pt-BR"^> >> temp-deploy\index.html
echo ^<head^> >> temp-deploy\index.html
echo   ^<meta charset="UTF-8"^> >> temp-deploy\index.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> temp-deploy\index.html
echo   ^<title^>BrokerBooster^</title^> >> temp-deploy\index.html
echo   ^<link rel="stylesheet" href="/assets/index-CAKS8lBI.css"^> >> temp-deploy\index.html
echo   ^<style^> >> temp-deploy\index.html
echo     body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; } >> temp-deploy\index.html
echo     #fallback { display: none; max-width: 800px; margin: 0 auto; padding: 2rem; } >> temp-deploy\index.html
echo     #root:empty + #fallback { display: block; } >> temp-deploy\index.html
echo     .header { text-align: center; margin-bottom: 2rem; } >> temp-deploy\index.html
echo     .title { color: #0066cc; font-size: 2.5rem; margin-bottom: 0.5rem; } >> temp-deploy\index.html
echo     .features { margin-top: 2rem; } >> temp-deploy\index.html
echo     .feature-list li { padding: 0.5rem 0; } >> temp-deploy\index.html
echo   ^</style^> >> temp-deploy\index.html
echo ^</head^> >> temp-deploy\index.html
echo ^<body^> >> temp-deploy\index.html
echo   ^<div id="root"^>^</div^> >> temp-deploy\index.html
echo   ^<div id="fallback"^> >> temp-deploy\index.html
echo     ^<div class="header"^> >> temp-deploy\index.html
echo       ^<h1 class="title"^>BrokerBooster^</h1^> >> temp-deploy\index.html
echo       ^<p^>Sistema de Gamificação para Corretores Imobiliários^</p^> >> temp-deploy\index.html
echo     ^</div^> >> temp-deploy\index.html
echo     ^<p^>Bem-vindo ao BrokerBooster, uma plataforma de gerenciamento imobiliário com recursos avançados de gamificação para aumentar o engajamento e produtividade da sua equipe.^</p^> >> temp-deploy\index.html
echo     ^<div class="features"^> >> temp-deploy\index.html
echo       ^<h2^>Principais Recursos^</h2^> >> temp-deploy\index.html
echo       ^<ul class="feature-list"^> >> temp-deploy\index.html
echo         ^<li^>Dashboard personalizado com métricas de desempenho^</li^> >> temp-deploy\index.html
echo         ^<li^>Sistema de pontos e conquistas para motivar sua equipe^</li^> >> temp-deploy\index.html
echo         ^<li^>Ranking semanal com líderes em vendas e captações^</li^> >> temp-deploy\index.html
echo         ^<li^>Gerenciamento completo de atividades e tarefas^</li^> >> temp-deploy\index.html
echo       ^</ul^> >> temp-deploy\index.html
echo     ^</div^> >> temp-deploy\index.html
echo   ^</div^> >> temp-deploy\index.html
echo   ^<script type="module" crossorigin src="/assets/index-DDdahP6I.js"^>^</script^> >> temp-deploy\index.html
echo   ^<script^> >> temp-deploy\index.html
echo     // Verificar se o React carregou corretamente >> temp-deploy\index.html
echo     setTimeout(function() { >> temp-deploy\index.html
echo       if (document.getElementById('root').children.length === 0) { >> temp-deploy\index.html
echo         console.log('React não foi inicializado corretamente. Mostrando fallback.'); >> temp-deploy\index.html
echo         document.getElementById('fallback').style.display = 'block'; >> temp-deploy\index.html
echo       } >> temp-deploy\index.html
echo     }, 1000); >> temp-deploy\index.html
echo   ^</script^> >> temp-deploy\index.html
echo ^</body^> >> temp-deploy\index.html
echo ^</html^> >> temp-deploy\index.html

:: Criar arquivos da API
echo Criando arquivos da API...
echo module.exports = (req, res) => { res.json({ status: 'ok', message: 'API BrokerBooster', timestamp: new Date().toISOString() }); }; > temp-deploy\api\index.js
echo module.exports = (req, res) => { res.json({ message: 'Status da API funcionando!', supabase: 'https://mnnzzppfhjnjawrykpgj.supabase.co' }); }; > temp-deploy\api\status.js

:: Criar vercel.json otimizado
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