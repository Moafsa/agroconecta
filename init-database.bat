@echo off
echo ========================================
echo    Initializing Database
echo ========================================
echo.

echo Waiting for database to be ready...
timeout /t 15 /nobreak >nul

echo Running database migrations...
docker-compose exec backend npm run db:migrate

echo.
echo Database initialization completed!
echo.

pause
