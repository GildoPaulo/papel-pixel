@echo off
echo ========================================
echo  FIX MYSQL XAMPP - AUTOMATICO
echo ========================================
echo.

echo 1. Parando processos MySQL...
taskkill /F /IM mysqld.exe 2>nul
timeout /t 2 >nul

echo 2. Deletando arquivos de log corrompidos...
cd C:\xampp\mysql\data
if exist ibdata1 del /F ibdata1
if exist ib_logfile0 del /F ib_logfile0
if exist ib_logfile1 del /F ib_logfile1
if exist ib_logfile101 del /F ib_logfile101

echo 3. Tentando iniciar MySQL...
cd C:\xampp
start /B mysql_start.bat

timeout /t 5 >nul

echo.
echo ========================================
echo  MYSQL DEVE ESTAR RODANDO AGORA!
echo ========================================
echo.
echo Teste em: http://localhost/phpmyadmin
echo.
pause

