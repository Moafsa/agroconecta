# 🚨 CORREÇÃO DE EMERGÊNCIA - Coolify Port Conflict

## ⚡ AÇÃO IMEDIATA

O erro `Bind for 0.0.0.0:5000 failed: port is already allocated` significa que há conflito de portas. Execute estes comandos **AGORA** no terminal do Coolify:

### 1️⃣ PARAR TUDO
```bash
# Parar todos os containers
docker stop $(docker ps -aq)

# Remover containers parados
docker rm $(docker ps -aq)

# Verificar se não há nada rodando
docker ps
```

### 2️⃣ LIMPAR PORTAS
```bash
# Verificar quais portas estão em uso
netstat -tlnp | grep :5000
netstat -tlnp | grep :80
netstat -tlnp | grep :5432

# Se houver processos, matar eles
sudo fuser -k 5000/tcp
sudo fuser -k 80/tcp
sudo fuser -k 5432/tcp
```

### 3️⃣ TENTAR CONFIGURAÇÃO SEM PORTAS
```bash
# Use a nova configuração sem conflitos de porta
docker-compose -f docker-compose.no-ports.yml down --remove-orphans
docker-compose -f docker-compose.no-ports.yml build --no-cache
docker-compose -f docker-compose.no-ports.yml up -d
```

### 4️⃣ SE AINDA NÃO FUNCIONAR: DEPLOY INDIVIDUAL

**OPÇÃO A: Configure cada serviço separadamente no painel do Coolify:**

1. **Delete o projeto atual**
2. **Crie 3 serviços separados:**
   - Database: PostgreSQL
   - Backend: Application
   - Frontend: Application

**OPÇÃO B: Use apenas o backend/frontend sem docker-compose:**

```bash
# Apenas subir o banco
docker run -d \
  --name postgres-agro \
  -e POSTGRES_DB=agro_conecta \
  -e POSTGRES_USER=agro_user \
  -e POSTGRES_PASSWORD=agro_secure_2024 \
  postgres:15-alpine

# Aguardar banco ficar pronto
sleep 10

# Build e run do backend
cd backend
docker build -f Dockerfile.simple -t agro-backend .
docker run -d \
  --name agro-backend \
  --link postgres-agro:postgres \
  -e DATABASE_URL=postgresql://agro_user:agro_secure_2024@postgres:5432/agro_conecta \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_jwt_secret \
  agro-backend

# Build e run do frontend
cd ../frontend
docker build -f Dockerfile.simple --build-arg VITE_API_URL=https://api.agroconecta.conext.click/api -t agro-frontend .
docker run -d \
  --name agro-frontend \
  agro-frontend
```

## 🔍 VERIFICAR SE FUNCIONOU

```bash
# Ver containers rodando
docker ps

# Testar backend (substituir ID do container)
docker exec -it agro-backend curl http://localhost:5000/api/health

# Ver logs se houver problemas
docker logs agro-backend
docker logs agro-frontend
docker logs postgres-agro
```

## 🆘 SE NADA FUNCIONAR

**Use o serviço de Database do próprio Coolify:**

1. **No Coolify, crie apenas um Database PostgreSQL**
2. **Configure backend e frontend como Applications separadas**
3. **Use o hostname interno do banco que o Coolify fornece**

### Configuração Backend Individual:
```
Type: Application
Repository: https://github.com/Moafsa/agroconecta
Build Path: ./backend
Dockerfile: Dockerfile.simple
Port: 5000
Domain: api.agroconecta.conext.click

Environment Variables:
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://agro_user:password@[COOLIFY_DB_HOST]:5432/agro_conecta
JWT_SECRET=your_secret
ASAAS_API_KEY=your_key
CORS_ORIGINS=https://agroconecta.conext.click
```

### Configuração Frontend Individual:
```
Type: Application
Repository: https://github.com/Moafsa/agroconecta
Build Path: ./frontend
Dockerfile: Dockerfile.simple
Port: 80
Domain: agroconecta.conext.click

Build Arguments:
VITE_API_URL=https://api.agroconecta.conext.click/api
```

---

## 📞 RESUMO DA EMERGÊNCIA

1. ✅ Parar todos os containers
2. ✅ Limpar portas em conflito
3. ✅ Usar configuração sem portas expostas
4. ✅ Se falhar, deploy individual de cada serviço
5. ✅ Se ainda falhar, usar Database nativo do Coolify

**🎯 OBJETIVO**: Ter pelo menos o backend rodando para resolver o erro de registro!
