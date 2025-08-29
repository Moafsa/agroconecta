@echo off
echo ========================================
echo    Stopping Agro Conecta Services
echo ========================================
echo.

echo Stopping containers...
docker-compose down

echo.
echo Containers stopped successfully!
echo.

pause
