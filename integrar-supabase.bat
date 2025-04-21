@echo off
echo ===================================================
echo Inicializando Integracao com Supabase
echo ===================================================
echo.

echo Verificando instalacao do Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Erro: Node.js nao encontrado! Por favor, instale o Node.js.
    exit /b 1
)

echo Verificando arquivo .env...
if not exist .env (
    echo Erro: Arquivo .env nao encontrado!
    exit /b 1
)

echo Verificando pacotes...
cd server
npm list @supabase/supabase-js > nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando dependencias do Supabase...
    npm install @supabase/supabase-js dotenv
)

echo.
echo ===================================================
echo Testando conexao com Supabase...
echo ===================================================
node -e "require('./supabase').testSupabaseConnection().then(connected => { if(connected) { console.log('Conexao estabelecida com sucesso!'); process.exit(0); } else { console.error('Falha na conexao'); process.exit(1); }})"

if %errorlevel% neq 0 (
    echo Erro: Nao foi possivel conectar ao Supabase. Verifique as credenciais.
    exit /b 1
)

echo.
echo ===================================================
echo Verificando funcao exec_sql...
echo ===================================================
node create-exec-sql-function.js

echo.
echo ===================================================
echo Configurando o banco de dados Supabase...
echo ===================================================
echo IMPORTANTE: Antes de continuar, certifique-se de criar a funcao exec_sql no console do Supabase.
echo.
set /p CONTINUE=Voce ja criou a funcao exec_sql no console do Supabase? (S/N): 

if /i "%CONTINUE%" neq "S" (
    echo Configuracao interrompida. Execute novamente quando a funcao estiver criada.
    exit /b 0
)

node setup-supabase.js

if %errorlevel% neq 0 (
    echo Erro na configuracao do banco de dados Supabase.
    exit /b 1
)

echo.
echo ===================================================
echo Alteracoes concluidas com sucesso!
echo.
echo O sistema BrokerBooster agora esta configurado para usar o Supabase.
echo.
echo Para iniciar o servidor, execute:
echo   cd server
echo   npm run dev
echo ===================================================

cd .. 