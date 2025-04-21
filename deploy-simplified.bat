@echo off
echo ===== Script Simplificado de Deploy para Vercel =====

:: Criação de pasta temporária para o deploy
if not exist .vercel-deploy mkdir .vercel-deploy
if not exist .vercel-deploy\api mkdir .vercel-deploy\api

:: Copia arquivos fundamentais
echo Preparando arquivos para deploy...
copy vercel.json .vercel-deploy\
copy api\index.js .vercel-deploy\api\
copy api\vercel.json .vercel-deploy\api\
copy .env .vercel-deploy\

:: Copia pasta dist se existir
if exist client\dist (
  echo Cliente já está compilado, usando build existente...
  xcopy /E /I client\dist .vercel-deploy\client\dist
) else (
  echo Pasta dist não encontrada. Execute "npm run build" no diretório client primeiro.
)

:: Instruções para o deploy
echo.
echo ===== INSTRUÇÕES PARA DEPLOY =====
echo.
echo 1. Navegue até a pasta .vercel-deploy:
echo    cd .vercel-deploy
echo.
echo 2. Execute o comando para fazer login no Vercel:
echo    npx vercel login
echo.
echo 3. Execute o comando para fazer o deploy:
echo    npx vercel --prod
echo.
echo ===== FIM DAS INSTRUÇÕES =====

echo.
echo Deseja continuar e navegar para o diretório .vercel-deploy? (S/N)
set /p CONTINUE=

if /i "%CONTINUE%" == "S" (
  cd .vercel-deploy
  echo Você está agora na pasta .vercel-deploy. Execute os comandos acima para fazer o deploy.
) else (
  echo Operação cancelada. Você pode navegar manualmente para a pasta .vercel-deploy quando quiser.
)

pause 