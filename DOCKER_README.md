# Agro Conecta - Docker Setup

This guide will help you set up and run the Agro Conecta system using Docker for local development and testing.

## Prerequisites

- Docker Desktop installed and running
- Git (to clone the repository)

## Quick Start

### 1. Environment Setup

Copy the environment example file and configure your variables:

```bash
copy env.example .env
```

Edit the `.env` file with your actual values:

```env
# Database Configuration
DATABASE_URL=postgresql://agro_user:agro_password@localhost:5432/agro_conecta

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Asaas Payment Configuration
ASAAS_API_KEY=your-asaas-api-key
ASAAS_ENVIRONMENT=sandbox

# Frontend Configuration
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. Start Services

#### Option A: Using the batch script (Windows)
```bash
start-docker.bat
```

#### Option B: Manual commands
```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps
```

### 3. Database Setup

Run the database migrations:

```bash
docker-compose exec backend npm run db:migrate
```

### 4. Access the Application

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:5001
- **Database**: localhost:5433

## Services Overview

### PostgreSQL Database
- **Port**: 5432
- **Database**: agro_conecta
- **User**: agro_user
- **Password**: agro_password

### Backend API (Node.js + Express)
- **Port**: 5000
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL

### Frontend (React + Vite)
- **Port**: 3002
- **Framework**: React 19
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services
```bash
# Using batch script
stop-docker.bat

# Manual command
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Services
```bash
docker-compose up --build -d
```

### Access Container Shell
```bash
# Backend container
docker-compose exec backend sh

# Frontend container
docker-compose exec frontend sh

# Database container
docker-compose exec postgres psql -U agro_user -d agro_conecta
```

## Development Workflow

### Hot Reload
The services are configured with volume mounts for hot reload:
- Backend changes will automatically restart the server
- Frontend changes will automatically reload in the browser

### Database Changes
When you modify the Prisma schema:

```bash
# Generate Prisma client
docker-compose exec backend npx prisma generate

# Run migrations
docker-compose exec backend npm run db:migrate

# Open Prisma Studio (optional)
docker-compose exec backend npm run db:studio
```

## Troubleshooting

### Port Conflicts
If you get port conflicts, check if the ports are already in use:
```bash
# Windows
netstat -ano | findstr :3002
netstat -ano | findstr :5001
netstat -ano | findstr :5433

# Kill process if needed
taskkill /PID <process_id> /F
```

### Container Issues
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs <service_name>

# Rebuild specific service
docker-compose up --build -d <service_name>
```

### Database Issues
```bash
# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run db:migrate
```

## Production Considerations

For production deployment:

1. **Security**: Change all default passwords and secrets
2. **Environment**: Set NODE_ENV=production
3. **SSL**: Configure HTTPS certificates
4. **Backup**: Set up database backup strategy
5. **Monitoring**: Add health checks and monitoring
6. **Scaling**: Consider using Docker Swarm or Kubernetes

## File Structure

```
agro-conecta/
├── docker-compose.yml          # Main orchestration file
├── start-docker.bat           # Windows startup script
├── stop-docker.bat            # Windows stop script
├── env.example                # Environment variables template
├── backend/
│   ├── Dockerfile             # Backend container definition
│   └── .dockerignore          # Backend ignore rules
├── frontend/
│   ├── Dockerfile             # Frontend container definition
│   └── .dockerignore          # Frontend ignore rules
└── .dockerignore              # Root ignore rules
```

## Support

If you encounter any issues:

1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running: `docker info`
3. Check port availability
4. Ensure environment variables are properly set
5. Try rebuilding: `docker-compose up --build -d`
