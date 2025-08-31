# 🚨 CORREÇÃO URGENTE - Deployment Coolify AgroConecta

## 🔍 Problemas Identificados

Baseado nos logs do Coolify, os problemas são:

1. **Backend**: Falha na conexão com banco de dados durante startup
2. **Frontend**: Erro no build ou configuração nginx
3. **PostgreSQL**: Funcionando, mas pode ter problemas de conectividade
4. **Docker**: Configurações não otimizadas para ambiente Coolify

## 🚀 SOLUÇÃO RÁPIDA

### Passo 1: Usar Configuração Específica do Coolify

1. **No painel do Coolify, vá para o projeto AgroConecta**
2. **Configure para usar o arquivo docker-compose específico:**

```yaml
# No campo "Docker Compose File" do Coolify, use:
docker-compose.coolify.yml
```

### Passo 2: Configurar Variáveis de Ambiente OBRIGATÓRIAS

**No painel Environment Variables do Coolify:**

```env
# Database (OBRIGATÓRIO)
POSTGRES_PASSWORD=agroconecta_secure_2024

# JWT (OBRIGATÓRIO)
JWT_SECRET=agroconecta_jwt_super_secret_key_2024_production

# API URLs (CRÍTICO)
VITE_API_URL=https://api.agroconecta.conext.click/api
FRONTEND_URL=https://agroconecta.conext.click

# Asaas (OBRIGATÓRIO para pagamentos)
ASAAS_API_KEY=sua_chave_asaas_producao
ASAAS_ENVIRONMENT=production

# CORS (OBRIGATÓRIO)
CORS_ORIGINS=https://agroconecta.conext.click,https://www.agroconecta.conext.click
```

### Passo 3: Deploy com Nova Configuração

**Execute estes comandos no terminal do Coolify:**

```bash
# 1. Parar todos os containers
docker-compose -f docker-compose.coolify.yml down --remove-orphans

# 2. Limpar volumes antigos (CUIDADO: remove dados)
# docker volume prune -f

# 3. Pull da imagem base
docker-compose -f docker-compose.coolify.yml pull

# 4. Build com cache limpo
docker-compose -f docker-compose.coolify.yml build --no-cache

# 5. Iniciar serviços na ordem correta
docker-compose -f docker-compose.coolify.yml up -d postgres
sleep 30
docker-compose -f docker-compose.coolify.yml up -d backend
sleep 20
docker-compose -f docker-compose.coolify.yml up -d frontend

# 6. Verificar status
docker-compose -f docker-compose.coolify.yml ps
```

## 🔧 ALTERNATIVA: Deploy Individual dos Serviços

Se o docker-compose não funcionar, configure cada serviço separadamente no Coolify:

### PostgreSQL (Banco de Dados)
```
Type: Database
Image: postgres:15-alpine
Environment Variables:
  POSTGRES_DB=agro_conecta
  POSTGRES_USER=agro_user
  POSTGRES_PASSWORD=agroconecta_secure_2024
Port: 5432
```

### Backend (API)
```
Type: Application
Source: GitHub Repository
Build Path: ./backend
Dockerfile: Dockerfile.coolify
Port: 5000
Environment Variables:
  NODE_ENV=production
  PORT=5000
  DATABASE_URL=postgresql://agro_user:agroconecta_secure_2024@postgres:5432/agro_conecta
  JWT_SECRET=agroconecta_jwt_super_secret_key_2024_production
  ASAAS_API_KEY=sua_chave_asaas_producao
  ASAAS_ENVIRONMENT=production
  FRONTEND_URL=https://agroconecta.conext.click
  CORS_ORIGINS=https://agroconecta.conext.click,https://www.agroconecta.conext.click
```

### Frontend (App)
```
Type: Application
Source: GitHub Repository
Build Path: ./frontend
Dockerfile: Dockerfile.coolify
Port: 80
Build Arguments:
  VITE_API_URL=https://api.agroconecta.conext.click/api
```

## 🔍 DEBUG: Como Verificar se Funcionou

### 1. Verificar Logs
```bash
# Backend logs
docker-compose -f docker-compose.coolify.yml logs backend

# Frontend logs
docker-compose -f docker-compose.coolify.yml logs frontend

# PostgreSQL logs
docker-compose -f docker-compose.coolify.yml logs postgres
```

### 2. Testar Endpoints
```bash
# Health check do backend
curl https://api.agroconecta.conext.click/api/health

# Teste do frontend
curl -I https://agroconecta.conext.click

# Teste de conectividade do banco
docker-compose -f docker-compose.coolify.yml exec postgres psql -U agro_user -d agro_conecta -c "SELECT version();"
```

### 3. Verificar Status dos Containers
```bash
# Status geral
docker-compose -f docker-compose.coolify.yml ps

# Health checks
docker-compose -f docker-compose.coolify.yml exec backend curl -f http://localhost:5000/api/health
docker-compose -f docker-compose.coolify.yml exec frontend curl -f http://localhost:80
```

## 🚨 TROUBLESHOOTING

### Erro 1: Backend não conecta ao banco
```bash
# Verificar se o PostgreSQL está rodando
docker-compose -f docker-compose.coolify.yml exec postgres pg_isready -U agro_user

# Verificar variáveis de ambiente
docker-compose -f docker-compose.coolify.yml exec backend env | grep DATABASE_URL
```

### Erro 2: Frontend não carrega
```bash
# Verificar build do frontend
docker-compose -f docker-compose.coolify.yml logs frontend

# Verificar se arquivos foram copiados
docker-compose -f docker-compose.coolify.yml exec frontend ls -la /usr/share/nginx/html/
```

### Erro 3: Problemas de CORS
```bash
# Verificar configuração CORS no backend
docker-compose -f docker-compose.coolify.yml exec backend env | grep CORS_ORIGINS

# Testar CORS
curl -H "Origin: https://agroconecta.conext.click" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS https://api.agroconecta.conext.click/api/health
```

## 📊 CHECKLIST DE VALIDAÇÃO

Após o deploy, verificar:

- [ ] PostgreSQL rodando e acessível
- [ ] Backend respondendo em `/api/health`
- [ ] Frontend carregando a página inicial
- [ ] Login/registro funcionando
- [ ] Pagamentos funcionando (teste com sandbox)
- [ ] Logs sem erros críticos
- [ ] SSL/HTTPS ativo em ambos domínios

## 🔄 ROLLBACK (Se necessário)

Se algo der errado:

```bash
# Parar tudo
docker-compose -f docker-compose.coolify.yml down

# Voltar para configuração anterior
# Use o docker-compose.yml original
docker-compose up -d

# Ou restaurar backup do banco se necessário
```

## 📞 SUPORTE

Se os erros persistirem:

1. **Verificar logs detalhados** de cada serviço
2. **Copiar mensagens de erro específicas**
3. **Verificar se todas as variáveis de ambiente estão configuradas**
4. **Testar conectividade de rede entre containers**

---

**⚡ AÇÃO IMEDIATA**: Configure as variáveis de ambiente no Coolify e execute o deploy com `docker-compose.coolify.yml`!
