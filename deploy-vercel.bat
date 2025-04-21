@echo off
echo ===== Iniciando Deploy no Vercel =====

:: Verifica se o Node.js está instalado
node -v >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Erro: Node.js não encontrado. Por favor, instale o Node.js.
  pause
  exit /b 1
)

:: Verifica se o Vercel CLI está instalado
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Instalando Vercel CLI...
  cmd /c npm install -g vercel
)

:: Instala dependências do projeto principal
echo Instalando dependências do projeto...
cmd /c npm install

:: Cópia do arquivo .env para garantir que o Supabase esteja configurado
echo Verificando arquivo .env...
if not exist .env (
  if exist server\.env (
    copy server\.env .env
    echo Arquivo .env copiado da pasta server.
  ) else (
    echo Criando arquivo .env com valores de exemplo...
    echo SUPABASE_URL=https://mnnzzppfhjnjawrykpgj.supabase.co >> .env
    echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubnp6cHBmaGpuamF3cnlrcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQyNjIsImV4cCI6MjA2MDc2MDI2Mn0.8k2GbD_iNPy95M58mA2r41BXJEJA_uAI9-S78co_oBc >> .env
  )
)

:: Navega para o diretório do cliente
echo Preparando o cliente para o deploy...
cd client

:: Instala dependências do cliente
echo Instalando dependências do cliente...
cmd /c npm install

:: Atualiza o browserslist
echo Atualizando browserslist...
cmd /c npx update-browserslist-db@latest

:: Faz o build do cliente
echo Fazendo build do cliente...
cmd /c npm run build

echo ===== Executando Deploy no Vercel =====
:: Retorna para o diretório raiz
cd ..

:: Faz o deploy no Vercel (interativo, permitindo que o usuário faça login e configure)
echo O processo de deploy solicitará confirmação. Por favor, siga as instruções.
cmd /c vercel

echo ===== Deploy concluído! =====
echo Você pode acessar a aplicação na URL fornecida pela Vercel acima.
echo Para ver novamente a URL do seu projeto, execute: vercel project
pause 