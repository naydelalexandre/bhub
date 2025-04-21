@echo off
echo ===== Deploy Básico para Vercel =====

if not exist api-basic mkdir api-basic
cd api-basic

echo ==================
echo Criando arquivo HTML
echo ==================
echo ^<!DOCTYPE html^> > index.html
echo ^<html^>^<body^>^<h1^>BrokerBooster API^</h1^>^<p^>API em funcionamento^</p^>^</body^>^</html^> >> index.html

echo ==================
echo Criando arquivos da API
echo ==================
mkdir api
echo module.exports = (req, res) => { res.json({ message: 'BrokerBooster API funcionando!', timestamp: new Date() }); }; > api\index.js

echo ==================
echo Criando vercel.json
echo ==================
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "rewrites": [ >> vercel.json
echo     { "source": "/api", "destination": "/api/index.js" }, >> vercel.json
echo     { "source": "/(.*)", "destination": "/" } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

echo ==================
echo Deploy preparado
echo ==================
echo.
echo Execute: npx vercel --prod
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

npx vercel --prod

cd ..
pause 