@echo off
echo ========================================
echo    Agro Conecta - Backend Only
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

echo Building and starting backend services...
docker compose -f docker-compose-backend.yml up --build -d

echo.
echo ========================================
echo    Services Status
echo ========================================
echo.
docker compose -f docker-compose-backend.yml ps

echo.
echo ========================================
echo    Access URLs
echo ========================================
echo Backend API: http://localhost:5000
echo Database: localhost:5432
echo.

echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo Checking service health...
docker compose -f docker-compose-backend.yml ps

echo.
echo ========================================
echo    Database Setup
echo ========================================
echo Running database migrations...
docker compose -f docker-compose-backend.yml exec backend npm run db:migrate

echo.
echo ========================================
echo    Backend Ready!
echo ========================================
echo Backend API: http://localhost:5000
echo Health Check: http://localhost:5000/api/health
echo Database: localhost:5432
echo.
echo To stop services: docker compose -f docker-compose-backend.yml down
echo To view logs: docker compose -f docker-compose-backend.yml logs -f
echo.

pause
