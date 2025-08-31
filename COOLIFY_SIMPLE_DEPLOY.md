# 🚨 SOLUÇÃO SIMPLES - Deploy Individual no Coolify

## ❌ Problema Identificado

O erro `Bind for 0.0.0.0:5000 failed: port is already allocated` indica que o Coolify está tentando usar portas que já estão em uso. A solução é **NÃO usar docker-compose** e configurar cada serviço individualmente.

## ✅ SOLUÇÃO: Deploy Individual dos Serviços

### Passo 1: Deletar Configuração Atual

No Coolify:
1. Vá para o projeto atual
2. **Delete todos os services atuais**
3. Pare todos os containers que estão rodando

### Passo 2: Criar PostgreSQL Database

1. **No Coolify, clique em "Add Database"**
2. **Selecione "PostgreSQL"**
3. **Configure:**
   ```
   Name: agroconecta-db
   Username: agro_user
   Password: agroconecta_secure_2024
   Database: agro_conecta
   Port: 5432
   ```
4. **Deploy o banco primeiro**

### Passo 3: Criar Backend Service

1. **No Coolify, clique em "Add Application"**
2. **Configure:**
   ```
   Name: agroconecta-backend
   Source: GitHub Repository
   Repository: https://github.com/Moafsa/agroconecta
   Branch: main
   Build Path: ./backend
   Dockerfile: Dockerfile.coolify
   Port: 5000
   Domain: api.agroconecta.conext.click
   ```

3. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://agro_user:agroconecta_secure_2024@agroconecta-db:5432/agro_conecta
   JWT_SECRET=agroconecta_jwt_super_secret_key_2024_production
   FRONTEND_URL=https://agroconecta.conext.click
   ASAAS_API_KEY=sua_chave_asaas_aqui
   ASAAS_ENVIRONMENT=production
   CORS_ORIGINS=https://agroconecta.conext.click,https://www.agroconecta.conext.click
   ```

4. **Deploy o backend**

### Passo 4: Criar Frontend Service

1. **No Coolify, clique em "Add Application"**
2. **Configure:**
   ```
   Name: agroconecta-frontend
   Source: GitHub Repository
   Repository: https://github.com/Moafsa/agroconecta
   Branch: main
   Build Path: ./frontend
   Dockerfile: Dockerfile.coolify
   Port: 80
   Domain: agroconecta.conext.click
   ```

3. **Build Arguments:**
   ```
   VITE_API_URL=https://api.agroconecta.conext.click/api
   ```

4. **Deploy o frontend**

## 🔧 ALTERNATIVA: Usar Dockerfiles Mais Simples

Se ainda houver problemas, vou criar versões mais simples dos Dockerfiles.
