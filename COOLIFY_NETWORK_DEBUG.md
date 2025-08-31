# 🔧 Debug de Conectividade no Coolify

## 🔍 Problema Identificado

Os containers estão rodando mas não conseguem se comunicar. O erro `docker: not found` indica que estamos em um ambiente Coolify específico.

## ✅ COMANDOS PARA O COOLIFY

### 1. Verificar Containers Rodando

```bash
# Ver todos os containers
podman ps
# ou
crictl ps

# Se nenhum funcionar, tente:
ls /var/lib/docker/containers/
```

### 2. Testar Conectividade Interna

```bash
# Entrar no container do backend
podman exec -it agro-conecta-backend /bin/sh
# ou
docker exec -it backend-t0wo8gkwow8s0ckk0sookcg4-165433701046 /bin/sh

# Dentro do container, testar:
curl -f http://localhost:5000/api/health
netstat -tlnp | grep 5000
ps aux | grep node
```

### 3. Testar Comunicação Entre Containers

```bash
# Entrar no frontend
podman exec -it agro-conecta-frontend /bin/sh

# Tentar pingar o backend
ping agro-conecta-backend
ping postgres

# Testar DNS interno
nslookup agro-conecta-backend
```

### 4. Verificar Configuração de Rede do Coolify

```bash
# Ver networks
podman network ls

# Inspecionar network
podman network inspect agro-network

# Ver configuração do proxy
ps aux | grep caddy
ps aux | grep traefik
ps aux | grep nginx
```

## 🚀 SOLUÇÃO ALTERNATIVA: Expor Portas Temporariamente

Como teste, vamos expor as portas diretamente:

### Opção 1: Modificar Docker Compose

Execute estes comandos no terminal do Coolify:

```bash
# Parar containers atuais
systemctl stop coolify
# ou
pkill -f docker-compose

# Criar versão com portas expostas para teste
cat > docker-compose.debug.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: agro-conecta-db
    environment:
      POSTGRES_DB: agro_conecta
      POSTGRES_USER: agro_user
      POSTGRES_PASSWORD: agro_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prisma-fix
    container_name: agro-conecta-backend
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://agro_user:agro_password@postgres:5432/agro_conecta
      JWT_SECRET: agroconecta_jwt_secret
      FRONTEND_URL: https://agroconecta.conext.click
      CORS_ORIGINS: https://agroconecta.conext.click
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.simple
      args:
        VITE_API_URL: https://api.agroconecta.conext.click/api
    container_name: agro-conecta-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
EOF

# Subir com a nova configuração
docker-compose -f docker-compose.debug.yml up -d
```

### Opção 2: Testar Individualmente

```bash
# Testar backend diretamente
curl http://65.109.224.186:5000/api/health

# Testar frontend
curl -I http://65.109.224.186:80

# Se funcionar, o problema é no proxy do Coolify
```

## 🔧 VERIFICAÇÕES NO PAINEL COOLIFY

### 1. Configuração de Domínios

No painel do Coolify, verificar:
- **Backend**: Domain = `api.agroconecta.conext.click`
- **Frontend**: Domain = `agroconecta.conext.click`
- **Port Mapping**: Backend 5000, Frontend 80

### 2. SSL/HTTPS

- Verificar se SSL está habilitado
- Forçar renovação de certificados se necessário

### 3. Proxy Configuration

- Verificar se o Coolify proxy está rodando
- Restart do proxy se necessário

## 🎯 TESTE RÁPIDO DE CONECTIVIDADE

```bash
# Teste 1: Verificar se as portas estão realmente abertas
netstat -tlnp | grep :5000
netstat -tlnp | grep :80

# Teste 2: Verificar processos
ps aux | grep node
ps aux | grep nginx

# Teste 3: Verificar logs do sistema
journalctl -u coolify -f
# ou
tail -f /var/log/coolify.log
```

## 📊 CHECKLIST DE DEBUG

- [ ] Containers rodando (`podman ps` ou similar)
- [ ] Portas abertas internamente
- [ ] Comunicação entre containers funcionando
- [ ] Proxy/load balancer configurado
- [ ] Domínios apontando para o IP correto
- [ ] SSL/certificados válidos

---

## 🆘 SOLUÇÃO DE EMERGÊNCIA

Se nada funcionar, use esta configuração mínima:

```bash
# Container backend simples
podman run -d \
  --name backend-emergency \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://agro_user:agro_password@65.109.224.186:5432/agro_conecta \
  -e NODE_ENV=production \
  -e JWT_SECRET=emergency_secret \
  node:20-slim sh -c "
    apt-get update && apt-get install -y git curl openssl &&
    git clone https://github.com/Moafsa/agroconecta.git /app &&
    cd /app/backend &&
    npm install &&
    npx prisma generate &&
    node server-prisma.js
  "

# Testar
curl http://65.109.224.186:5000/api/health
```

**Execute as verificações na ordem para identificar onde está o problema!**
