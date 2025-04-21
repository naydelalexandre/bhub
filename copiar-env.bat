@echo off
echo ===================================================
echo Verificando e Copiando Arquivo .env
echo ===================================================
echo.

if exist .env (
    echo Arquivo .env encontrado na pasta raiz.
    
    if not exist server\.env (
        echo Copiando .env para a pasta server...
        copy .env server\.env
        if errorlevel 1 (
            echo ERRO: Falha ao copiar o arquivo!
        ) else (
            echo Arquivo copiado com sucesso!
        )
    ) else (
        echo Arquivo .env já existe na pasta server.
    )
) else (
    echo ERRO: Arquivo .env não encontrado na raiz!
    echo Por favor, crie um arquivo .env na pasta raiz com o seguinte conteúdo:
    echo.
    echo SUPABASE_URL=https://mnnzzppfhjnjawrykpgj.supabase.co
    echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubnp6cHBmaGpuamF3cnlrcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQyNjIsImV4cCI6MjA2MDc2MDI2Mn0.8k2GbD_iNPy95M58mA2r41BXJEJA_uAI9-S78co_oBc
)

echo.
echo ===================================================
echo Pressione qualquer tecla para sair...
pause > nul 