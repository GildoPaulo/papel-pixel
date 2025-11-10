@echo off
echo.
echo ╔════════════════════════════════════════╗
echo ║  SETUP DO BANCO DE DADOS RAILWAY      ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar se o arquivo .env existe
if not exist "backend\.env" (
    echo ❌ ERRO: Arquivo .env nao encontrado!
    echo.
    echo INSTRUÇÕES:
    echo 1. Abra o arquivo: backend\railway.env.example
    echo 2. Preencha com as credenciais do Railway MySQL
    echo 3. Renomeie para: backend\.env
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Arquivo .env encontrado!
echo.
echo Vamos configurar o banco de dados...
echo.
pause
echo.

cd backend
node scripts/init-railway-db.js

echo.
echo.
pause

