@echo off
echo ========================================
echo    Health Check - Agro Conecta
echo ========================================
echo.

echo Checking container status...
docker-compose ps

echo.
echo ========================================
echo    Service Health Checks
echo ========================================

echo.
echo 1. Checking Backend API...
curl -s http://localhost:5000/api/health
if %errorlevel% equ 0 (
    echo ✓ Backend is healthy
) else (
    echo ✗ Backend is not responding
)

echo.
echo 2. Checking Frontend...
curl -s -I http://localhost:3002 | findstr "HTTP"
if %errorlevel% equ 0 (
    echo ✓ Frontend is responding
) else (
    echo ✗ Frontend is not responding
)

echo.
echo 3. Checking Database connection...
docker-compose exec backend npx prisma db execute --stdin <<< "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database is connected
) else (
    echo ✗ Database connection failed
)

echo.
echo ========================================
echo    Health Check Complete
echo ========================================
echo.

pause
