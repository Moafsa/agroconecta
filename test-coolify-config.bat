@echo off
echo 🧪 Testing Coolify Configuration Locally...
echo.

REM Set environment variables for testing
set POSTGRES_PASSWORD=test_password
set JWT_SECRET=test_jwt_secret
set VITE_API_URL=http://localhost:5000/api
set ASAAS_API_KEY=test_key
set ASAAS_ENVIRONMENT=sandbox

echo 🔧 Environment variables set for testing
echo.

echo 📦 Building containers with Coolify configuration...
docker-compose -f docker-compose.coolify.yml down --remove-orphans
docker-compose -f docker-compose.coolify.yml build --no-cache

echo.
echo 🚀 Starting services...
docker-compose -f docker-compose.coolify.yml up -d postgres
echo ⏳ Waiting for PostgreSQL to be ready...
timeout /t 30 /nobreak > nul

docker-compose -f docker-compose.coolify.yml up -d backend
echo ⏳ Waiting for Backend to be ready...
timeout /t 20 /nobreak > nul

docker-compose -f docker-compose.coolify.yml up -d frontend
echo ⏳ Waiting for Frontend to be ready...
timeout /t 10 /nobreak > nul

echo.
echo 📊 Checking service status...
docker-compose -f docker-compose.coolify.yml ps

echo.
echo 🔍 Testing endpoints...
echo Testing PostgreSQL...
docker-compose -f docker-compose.coolify.yml exec -T postgres pg_isready -U agro_user

echo.
echo Testing Backend Health...
curl -f http://localhost:5000/api/health 2>nul && echo ✅ Backend OK || echo ❌ Backend Failed

echo.
echo Testing Frontend...
curl -I http://localhost:80 2>nul && echo ✅ Frontend OK || echo ❌ Frontend Failed

echo.
echo 📋 Summary:
echo - PostgreSQL: Check logs above
echo - Backend: http://localhost:5000/api/health
echo - Frontend: http://localhost:80
echo.
echo To stop: docker-compose -f docker-compose.coolify.yml down
echo To view logs: docker-compose -f docker-compose.coolify.yml logs [service]
echo.
pause
