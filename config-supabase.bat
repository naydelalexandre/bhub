@echo off
echo ===================================================
echo Script Simplificado para Configurar Supabase
echo ===================================================
echo.

echo Iniciando programa...
echo Isto vai configurar o Supabase sem depender da funcao exec_sql
echo.

cd %~dp0
cd server

echo Instalando dependencias se necessario...
call npm install @supabase/supabase-js dotenv

echo.
echo ===================================================
echo Criando Tabelas no Supabase Diretamente
echo ===================================================
echo.

node criar-tabelas-manual.js

echo.
echo ===================================================
echo Processo concluido!
echo Para iniciar o servidor, execute:
echo   cd server
echo   npm run dev
echo ===================================================

pause 