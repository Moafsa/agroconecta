@echo off
echo ========================================
echo    Agro Conecta - Docker Setup
echo ========================================
echo.

echo Checking if Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running!
echo.

echo Building and starting containers...
docker-compose up --build -d

echo.
echo ========================================
echo    Services Status
echo ========================================
echo.
docker-compose ps

echo.
echo ========================================
echo    Access URLs
echo ========================================
echo Frontend: http://localhost:3002
echo Backend API: http://localhost:5001
echo Database: localhost:5433
echo.

echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo Checking service health...
docker-compose ps

echo.
echo ========================================
echo    Database Setup
echo ========================================
echo Running database migrations...
docker-compose exec backend npm run db:migrate

echo.
echo ========================================
echo    System Ready!
echo ========================================
echo Frontend: http://localhost:3002
echo Backend API: http://localhost:5001
echo Database: localhost:5433
echo.
echo To stop services: docker-compose down
echo To view logs: docker-compose logs -f
echo.

pause
