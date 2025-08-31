# 🔧 Correção: Erro npm ci --only=production

## 🔍 Problema Identificado

O erro `npm ci --only=production did not complete successfully: exit code: 1` indica problema com as dependências do Node.js no backend.

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Usar Dockerfile Ultra-Simple

No Coolify, configure o backend para usar:
```
Dockerfile: Dockerfile.ultra-simple
```

### Opção 2: Comandos de Emergência

Execute no terminal do Coolify:

```bash
# 1. Parar o backend atual
docker stop agro-conecta-backend
docker rm agro-conecta-backend

# 2. Build com o novo Dockerfile
cd backend
docker build -f Dockerfile.ultra-simple -t agro-backend-fixed .

# 3. Verificar se o build funcionou
docker images | grep agro-backend-fixed

# 4. Rodar o backend corrigido
docker run -d \
  --name agro-backend-fixed \
  --network agro-network \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DATABASE_URL=postgresql://agro_user:agro_password_default@postgres:5432/agro_conecta \
  -e JWT_SECRET=agroconecta_jwt_super_secret_key_2024_production \
  -e FRONTEND_URL=https://agroconecta.conext.click \
  -e CORS_ORIGINS=https://agroconecta.conext.click \
  agro-backend-fixed

# 5. Verificar logs
docker logs agro-backend-fixed
```

### Opção 3: Simplificar package.json

Se ainda falhar, execute:

```bash
# Entrar no container de build temporário
docker run -it --rm node:20-slim sh

# Dentro do container, testar instalação
apt-get update && apt-get install -y curl openssl git python3 make g++
cd /tmp
git clone https://github.com/Moafsa/agroconecta.git
cd agroconecta/backend
npm install --verbose
```

## 🔧 ALTERNATIVA: Remover Dependências Problemáticas

Se o problema persistir, pode ser uma dependência específica. Execute no terminal do Coolify:

```bash
# Verificar quais dependências estão causando problema
cd backend
npm ls
npm audit

# Se for o bcrypt, use esta versão alternativa:
npm uninstall bcrypt
npm install bcryptjs

# Se for o mongoose (que não deveria estar aqui), remover:
npm uninstall mongoose
```

## 🚀 DOCKERFILE TESTADO

O `Dockerfile.ultra-simple` inclui:
- ✅ Todas as dependências de sistema necessárias
- ✅ Python3 e build tools para dependências nativas
- ✅ Instalação completa (não só production)
- ✅ Logs detalhados para debug
- ✅ Health check integrado

## 📊 VERIFICAR SE FUNCIONOU

```bash
# 1. Ver se o container está rodando
docker ps | grep backend

# 2. Ver logs detalhados
docker logs agro-backend-fixed

# 3. Testar endpoint
docker exec agro-backend-fixed curl -f http://localhost:5000/api/health

# 4. Verificar Prisma
docker exec agro-backend-fixed npx prisma db ping
```

## 🔄 UPDATE DOCKER COMPOSE

Se quiser usar o docker-compose, atualize para usar o novo Dockerfile:

```yaml
# No docker-compose.no-ports.yml, altere:
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile.ultra-simple  # <-- MUDANÇA AQUI
```

---

## 📞 RESUMO DA CORREÇÃO

1. ✅ PostgreSQL funcionando ✅
2. 🔧 Backend: usar `Dockerfile.ultra-simple`
3. ⚠️ Frontend: aguardar backend funcionar
4. 🎯 Objetivo: resolver erro de dependências npm

**Execute a Opção 1 ou 2 imediatamente para resolver o problema do backend!**
