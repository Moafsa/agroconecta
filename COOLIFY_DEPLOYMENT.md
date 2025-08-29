# 🚀 Deploy no Coolify - Agro-Conecta

## 📋 Pré-requisitos

- Repositório GitHub configurado (✅ Este repositório)
- Conta no Coolify configurada
- PostgreSQL configurado (o projeto usa PostgreSQL + Prisma)

## 🔧 Configuração no Coolify

### 1. Criar Novo Projeto

1. **Login no Coolify**
   - Acesse seu painel do Coolify
   - Clique em "Create New Project"

2. **Conectar Repositório**
   ```
   Repository URL: https://github.com/Moafsa/agroconecta
   Branch: main
   ```

### 2. Configurar Backend (API)

1. **Configurações Básicas**
   ```
   Service Name: agro-conecta-backend
   Port: 5001
   Build Path: ./backend
   Start Command: npm start
   ```

2. **Variáveis de Ambiente**
   ```env
   NODE_ENV=production
   PORT=5001
   DATABASE_URL=postgresql://usuario:senha@host:5432/agro_conecta
   JWT_SECRET=seu-jwt-secret-super-seguro-aqui
   FRONTEND_URL=https://agroconecta.conext.click
   ASAAS_API_KEY=sua-chave-asaas-producao
   ASAAS_ENVIRONMENT=production
   ```

3. **Build Commands**
   ```bash
   # Pre-build
   cd backend && npm install
   
   # Start Command
   npm start
   ```

### 3. Configurar Frontend

1. **Configurações Básicas**
   ```
   Service Name: agro-conecta-frontend
   Port: 3000
   Build Path: ./frontend
   Build Command: npm run build
   ```

2. **Variáveis de Ambiente**
   ```env
   VITE_API_URL=https://api.agroconecta.conext.click
   NODE_ENV=production
   ```

3. **Build Commands**
   ```bash
   # Pre-build
   cd frontend && npm install
   
   # Build Command
   npm run build
   
   # Start Command (para servir arquivos estáticos)
   npx serve -s dist -l 3000
   ```

### 4. Configurar Banco de Dados

#### Opção A: PostgreSQL no Coolify
1. **Criar Serviço PostgreSQL**
   ```
   Service Type: PostgreSQL
   Database Name: agro_conecta
   Username: agro_user
   Password: [senha segura]
   ```

2. **String de Conexão**
   ```
   DATABASE_URL=postgresql://agro_user:senha@postgres-service:5432/agro_conecta
   ```

#### Opção B: PostgreSQL Externo (Neon, Supabase, etc)
1. **Configurar no Provedor**
   - Criar banco PostgreSQL na nuvem
   - Obter string de conexão
   - Configurar regras de firewall se necessário

2. **String de Conexão**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/agro_conecta?sslmode=require
   ```

### 5. Configurar Domínios

🎯 **Com o domínio `agroconecta.conext.click`, o Coolify entenderá automaticamente:**

1. **Backend (API)**
   ```
   Custom Domain: api.agroconecta.conext.click
   Redirect HTTP to HTTPS: ✅
   ```

2. **Frontend (App Principal)**
   ```
   Custom Domain: agroconecta.conext.click
   Redirect HTTP to HTTPS: ✅
   ```

**💡 Dica:** No Coolify, você só precisa informar o domínio principal (`agroconecta.conext.click`). A plataforma automaticamente:
- Configura SSL/TLS
- Gera subdomínios para serviços (api.agroconecta.conext.click)
- Gerencia redirecionamentos HTTPS

## 🔄 Processo de Deploy

### Deploy Automático via Git

1. **Configurar Webhook**
   - Coolify criará automaticamente webhook no GitHub
   - Cada push na branch `main` disparará novo deploy

2. **Ordem de Deploy**
   ```
   1. Backend primeiro (dependências do banco)
   2. Frontend depois (depende da API)
   ```

### Deploy Manual

1. **No painel do Coolify**
   ```
   Project → Services → Deploy
   ```

2. **Verificar Logs**
   ```
   Acompanhar logs de build e runtime
   Verificar se não há erros
   ```

## 📊 Monitoramento

### 1. Health Checks

**Backend Health Check**
```bash
# Endpoint: https://api.agroconecta.conext.click/health
# Expected Response: {"status": "ok", "timestamp": "..."}
```

**Frontend Health Check**
```bash
# Endpoint: https://agroconecta.conext.click
# Expected: Página carrega corretamente
```

### 2. Logs

```bash
# Acessar logs no Coolify
Project → Services → Logs

# Tipos de logs disponíveis:
- Build logs
- Runtime logs
- Error logs
```

## 🔧 Configurações Avançadas

### 1. CORS Configuration

No backend, configurar CORS para produção:

```javascript
// backend/server.js ou server-prisma.js
app.use(cors({
  origin: [
    'https://agroconecta.conext.click',
    'https://www.agroconecta.conext.click'
  ],
  credentials: true
}));
```

### 2. Redirecionamentos

Configurar redirecionamentos no Coolify:
```
www.agroconecta.conext.click → agroconecta.conext.click
```

### 3. SSL/TLS

- Coolify gerencia SSL automaticamente via Let's Encrypt
- Certificados renovam automaticamente
- Force HTTPS habilitado

## 🔐 Segurança

### 1. Variáveis de Ambiente

```env
# ⚠️ NUNCA commitar estas variáveis no código!
# Configurar apenas no painel do Coolify

# Produção
JWT_SECRET=jwt-super-secreto-256-bits-minimo
ASAAS_API_KEY=chave-producao-asaas
DATABASE_URL=string-conexao-producao

# Desenvolvimento/Staging
JWT_SECRET=jwt-dev-secret
ASAAS_API_KEY=chave-sandbox-asaas
DATABASE_URL=string-conexao-dev
```

### 2. Backup

```bash
# Configurar backup automático do banco
# Via painel do Coolify ou script externo
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Build Failure**
   ```bash
   # Verificar logs de build
   # Comum: dependências não instaladas
   # Solução: npm install no pre-build
   ```

2. **Database Connection Error**
   ```bash
   # Verificar string de conexão
   # Verificar whitelist de IPs
   # Verificar credenciais
   ```

3. **CORS Errors**
   ```bash
   # Verificar configuração de CORS no backend
   # Verificar URLs de origem
   # Verificar protocolo (HTTP vs HTTPS)
   ```

4. **Environment Variables**
   ```bash
   # Verificar se todas as variáveis estão definidas
   # Verificar sintaxe das variáveis
   # Restart do serviço após mudanças
   ```

## 📞 Suporte

### Checklist Pós-Deploy

- [ ] Backend responde em `https://api.agroconecta.conext.click/health`
- [ ] Frontend carrega em `https://agroconecta.conext.click`
- [ ] Chat funciona (envia/recebe mensagens)
- [ ] Login/registro funcionando
- [ ] Banco de dados conectado
- [ ] SSL/HTTPS ativo
- [ ] Logs sem erros críticos

### Contatos

- **Coolify Support**: Documentação oficial
- **GitHub Issues**: Para problemas específicos do código
- **Database Provider**: MongoDB Atlas ou PostgreSQL

---

## 🎯 Comandos Úteis

### Restart Services
```bash
# Via Coolify Dashboard:
Project → Services → Restart
```

### View Logs
```bash
# Via Coolify Dashboard:
Project → Services → Logs → Real-time
```

### Update Environment Variables
```bash
# Via Coolify Dashboard:
Project → Services → Environment → Edit
```

---

**Deploy no Coolify realizado com sucesso! 🚀**

Para mais informações, consulte a [documentação oficial do Coolify](https://coolify.io/docs).
