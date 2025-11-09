@echo off
chcp 65001 >nul
echo ========================================
echo   SETUP MYSQL - Papel ^& Pixel
echo ========================================
echo.

echo [1/3] Instalando dependencias do backend...
cd backend
call npm install
echo.

echo [2/3] Verificando conexao MySQL...
echo (Verifique se XAMPP esta rodando)
echo.

echo [3/3] Pronto!
echo.
echo ========================================
echo   PROXIMOS PASSOS:
echo ========================================
echo 1. Abra XAMPP Control Panel
echo 2. Inicie Apache e MySQL
echo 3. Acesse: http://localhost/phpmyadmin
echo 4. Crie banco: papel_pixel
echo 5. Execute: backend/sql/schema.sql
echo 6. Execute: npm run dev (na pasta backend)
echo.
echo Pressione qualquer tecla para fechar...
pause >nul

