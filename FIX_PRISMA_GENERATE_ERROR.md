# 🔧 Correção: Erro npx prisma generate

## 🔍 Problema Identificado

O erro `npx prisma generate --verbose did not complete successfully: exit code: 1` indica problema específico com a geração do cliente Prisma.

## ✅ SOLUÇÕES RÁPIDAS

### Opção 1: Testar Dockerfiles Alternativos

Execute no terminal do Coolify:

```bash
# Teste 1: Dockerfile.prisma-fix
cd backend
docker build -f Dockerfile.prisma-fix -t agro-backend-prisma .

# Teste 2: Dockerfile.minimal  
docker build -f Dockerfile.minimal -t agro-backend-minimal .

# Verificar qual funcionou
docker images | grep agro-backend
```

### Opção 2: Debug Manual do Prisma

```bash
# Criar container temporário para debug
docker run -it --rm node:20-slim bash

# Dentro do container:
apt-get update && apt-get install -y openssl curl git
cd /tmp
git clone https://github.com/Moafsa/agroconecta.git
cd agroconecta/backend

# Testar instalação passo a passo
npm install
npx prisma generate --verbose

# Se falhar, testar alternativas:
npm install prisma@latest @prisma/client@latest
npx prisma generate --schema=./prisma/schema.prisma
```

### Opção 3: Simplificar Schema Prisma (Temporário)

Se o problema for no schema, teste esta versão simplificada:

```bash
# Backup do schema atual
cp prisma/schema.prisma prisma/schema.prisma.backup

# Criar schema mínimo para teste
cat > prisma/schema.minimal.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id    String @id @default(cuid())
  nome  String
  email String @unique
  
  @@map("admins")
}
EOF

# Testar geração
npx prisma generate --schema=./prisma/schema.minimal.prisma
```

## 🔧 COMANDO DE EMERGÊNCIA

Se nada funcionar, use uma abordagem diferente:

```bash
# Parar tudo
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# Usar configuração individual de serviços no Coolify
# 1. Database: PostgreSQL nativo do Coolify
# 2. Backend: Application separada
# 3. Frontend: Application separada
```

## 🚀 ALTERNATIVA: Backend Sem Prisma (Temporário)

Para testar se o resto funciona, crie uma versão temporária sem Prisma:

```bash
# Criar server-simple.js temporário
cat > server-simple.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend funcionando sem Prisma',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
EOF

# Dockerfile temporário
cat > Dockerfile.temp << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install express cors dotenv
COPY server-simple.js ./
EXPOSE 5000
CMD ["node", "server-simple.js"]
EOF

# Build e test
docker build -f Dockerfile.temp -t agro-backend-temp .
docker run -d --name agro-backend-temp -p 5000:5000 agro-backend-temp

# Testar
curl http://localhost:5000/api/health
```

## 📊 VERIFICAÇÃO

```bash
# 1. Ver logs detalhados do erro Prisma
docker logs [container-id] 2>&1 | grep -A 10 -B 10 "prisma generate"

# 2. Verificar versões
docker exec [container-id] npx prisma --version
docker exec [container-id] node --version

# 3. Verificar arquivos Prisma
docker exec [container-id] ls -la prisma/
docker exec [container-id] cat prisma/schema.prisma
```

---

## 📞 RESUMO DAS OPÇÕES

1. ✅ **Dockerfile.prisma-fix**: Configuração específica para Prisma
2. ✅ **Dockerfile.minimal**: Versão Alpine minimalista  
3. ✅ **Backend temporário**: Sem Prisma para testar conectividade
4. ✅ **Debug manual**: Investigar causa raiz do erro

**🎯 Execute a Opção 1 primeiro, depois Opção 2 se necessário!**
