@echo off
echo ========================================
echo    Agro Conecta - System Test
echo ========================================
echo.

echo Checking container status...
docker compose ps

echo.
echo ========================================
echo    Service Health Checks
echo ========================================

echo.
echo 1. Testing Frontend (http://localhost:3002)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3002' -Method GET -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✓ Frontend is working' } else { Write-Host '✗ Frontend error' } } catch { Write-Host '✗ Frontend not responding' }"

echo.
echo 2. Testing Backend API (http://localhost:5001)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/health' -Method GET -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✓ Backend API is working' } else { Write-Host '✗ Backend API error' } } catch { Write-Host '✗ Backend API not responding' }"

echo.
echo 3. Testing Database connection...
docker compose exec backend npx prisma db execute --stdin <<< "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database is connected
) else (
    echo ✗ Database connection failed
)

echo.
echo ========================================
echo    System Status Summary
echo ========================================
echo.
echo 🎉 System is ready for testing!
echo.
echo 📱 Frontend: http://localhost:3002
echo 🔧 Backend API: http://localhost:5001
echo 🗄️  Database: localhost:5433
echo.
echo 📚 Documentation: DOCKER_README.md
echo 🚀 Quick Start: QUICK_START.md
echo.

pause

