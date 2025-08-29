# Guia de Migração - Agro-Conecta v1 → v2

## 🔄 Visão Geral da Migração

Este guia detalha o processo de migração do Agro-Conecta v1 (MongoDB) para v2 (PostgreSQL + novas funcionalidades).

## 📋 Principais Mudanças

### 1. Banco de Dados
- **Antes**: MongoDB com Mongoose
- **Depois**: PostgreSQL com Prisma ORM

### 2. Autenticação
- **Antes**: Apenas email/senha
- **Depois**: Email/senha + Google OAuth

### 3. Pagamentos
- **Antes**: Não implementado
- **Depois**: Integração completa com Asaas

### 4. Estrutura de Arquivos
- **Antes**: Rotas MongoDB
- **Depois**: Rotas Prisma + novas funcionalidades

## 🗃️ Migração de Dados

### Passo 1: Backup dos Dados MongoDB

```bash
# Backup completo
mongodump --db agro_conecta --out backup_v1/

# Backup específico por coleção
mongodump --db agro_conecta --collection profissionais --out backup_v1/
mongodump --db agro_conecta --collection produtores --out backup_v1/
mongodump --db agro_conecta --collection interacoes --out backup_v1/
```

### Passo 2: Configurar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE agro_conecta;
CREATE USER agro_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE agro_conecta TO agro_user;
```

### Passo 3: Executar Migrações Prisma

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Passo 4: Script de Migração de Dados

Crie o arquivo `backend/scripts/migrate-data.js`:

```javascript
const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client');

const mongoUrl = 'mongodb://localhost:27017/agro_conecta';
const prisma = new PrismaClient();

async function migrateProfissionais() {
  const mongo = new MongoClient(mongoUrl);
  await mongo.connect();
  
  const profissionais = await mongo.db().collection('profissionais').find({}).toArray();
  
  for (const prof of profissionais) {
    await prisma.profissional.create({
      data: {
        nome: prof.nome,
        email: prof.email,
        senha: prof.senha, // Já hasheada
        contato: prof.contato || '',
        regiao_atuacao: prof.regiao_atuacao || '',
        foto: prof.foto || '',
        status_assinatura: 'PENDENTE', // Novo campo
        data_cadastro: prof.data_cadastro || new Date()
      }
    });
  }
  
  await mongo.close();
  console.log(`Migrados ${profissionais.length} profissionais`);
}

async function migrateProdutores() {
  const mongo = new MongoClient(mongoUrl);
  await mongo.connect();
  
  const produtores = await mongo.db().collection('produtores').find({}).toArray();
  
  for (const prod of produtores) {
    await prisma.produtor.create({
      data: {
        nome: prod.nome,
        contato: prod.contato || '',
        email: prod.email || '',
        data_cadastro: prod.data_cadastro || new Date()
      }
    });
  }
  
  await mongo.close();
  console.log(`Migrados ${produtores.length} produtores`);
}

async function migrateInteracoes() {
  const mongo = new MongoClient(mongoUrl);
  await mongo.connect();
  
  const interacoes = await mongo.db().collection('interacoes').find({}).toArray();
  
  for (const inter of interacoes) {
    // Buscar IDs correspondentes no PostgreSQL
    const produtor = await prisma.produtor.findFirst({
      where: { nome: inter.produtor_nome }
    });
    
    const profissional = inter.profissional_id ? 
      await prisma.profissional.findFirst({
        where: { email: inter.profissional_email }
      }) : null;
    
    if (produtor) {
      await prisma.interacao.create({
        data: {
          produtor_id: produtor.id,
          profissional_id: profissional?.id || null,
          mensagem_inicial: inter.mensagem_inicial,
          dor_cliente: inter.dor_cliente || '',
          status: inter.status || 'EM_ANDAMENTO',
          data_interacao: inter.data_interacao || new Date()
        }
      });
    }
  }
  
  await mongo.close();
  console.log(`Migradas ${interacoes.length} interações`);
}

async function main() {
  try {
    console.log('Iniciando migração de dados...');
    
    await migrateProfissionais();
    await migrateProdutores();
    await migrateInteracoes();
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

Execute a migração:

```bash
cd backend
npm install mongodb
node scripts/migrate-data.js
```

## 🔧 Atualizações de Código

### 1. Variáveis de Ambiente

Atualize o arquivo `.env`:

```env
# Remover
MONGODB_URI=mongodb://localhost:27017/agro_conecta

# Adicionar
DATABASE_URL="postgresql://agro_user:senha@localhost:5432/agro_conecta?schema=public"
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
ASAAS_API_KEY=sua_asaas_api_key
ASAAS_ENVIRONMENT=sandbox
```

### 2. Dependências

Atualize o `package.json`:

```bash
# Remover dependências antigas
npm uninstall mongoose

# Instalar novas dependências
npm install prisma @prisma/client pg passport passport-google-oauth20 express-session asaas
```

### 3. Arquivos de Configuração

#### Antes (v1)
```javascript
// models/Profissional.js
const mongoose = require('mongoose');
const profissionalSchema = new mongoose.Schema({...});
```

#### Depois (v2)
```javascript
// lib/prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```

### 4. Rotas de API

#### Antes (v1)
```javascript
// routes/profissionais.js
const Profissional = require('../models/Profissional');

router.get('/me', auth, async (req, res) => {
  const profissional = await Profissional.findById(req.profissional.id);
});
```

#### Depois (v2)
```javascript
// routes/profissionais-prisma.js
const prisma = require('../lib/prisma');

router.get('/me', auth, async (req, res) => {
  const profissional = await prisma.profissional.findUnique({
    where: { id: req.profissional.id }
  });
});
```

## 🔐 Configuração de Autenticação Google

### 1. Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie projeto ou selecione existente
3. Ative Google+ API
4. Crie credenciais OAuth 2.0
5. Configure URLs de callback

### 2. Configuração no Código

```javascript
// config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Lógica de autenticação
}));
```

## 💳 Configuração do Asaas

### 1. Conta Asaas

1. Crie conta em [Asaas](https://www.asaas.com/)
2. Acesse painel de API
3. Copie chaves de sandbox/produção
4. Configure webhooks

### 2. Integração no Código

```javascript
// lib/asaas.js
const { AsaasClient } = require('asaas');

const asaas = new AsaasClient({
  apiKey: process.env.ASAAS_API_KEY,
  environment: process.env.ASAAS_ENVIRONMENT
});
```

## 🧪 Testes de Migração

### 1. Verificar Dados

```sql
-- Contar registros migrados
SELECT COUNT(*) FROM profissionais;
SELECT COUNT(*) FROM produtores;
SELECT COUNT(*) FROM interacoes;

-- Verificar integridade
SELECT p.nome, COUNT(i.id) as interacoes 
FROM profissionais p 
LEFT JOIN interacoes i ON p.id = i.profissional_id 
GROUP BY p.id, p.nome;
```

### 2. Testar Funcionalidades

```bash
# Testar API
curl http://localhost:5000/api/health
curl http://localhost:5000/api/profissionais

# Testar autenticação
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","senha":"123456"}'
```

### 3. Testar Frontend

```bash
cd frontend
pnpm run dev

# Verificar:
# - Login tradicional funciona
# - Login Google funciona
# - Páginas carregam corretamente
# - Chat funciona
```

## 🚨 Problemas Comuns

### 1. Erro de Conexão PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar configuração
sudo -u postgres psql -c "SELECT version();"
```

### 2. Erro de Migração Prisma

```bash
# Limpar e recriar
npx prisma migrate reset
npx prisma migrate dev --name init
```

### 3. Dados Não Migrados

```bash
# Verificar logs
node scripts/migrate-data.js > migration.log 2>&1

# Verificar conexões
psql -h localhost -p 5432 -U agro_user -d agro_conecta
mongo mongodb://localhost:27017/agro_conecta
```

## 📝 Checklist de Migração

### Preparação
- [ ] Backup completo MongoDB
- [ ] PostgreSQL instalado e configurado
- [ ] Variáveis de ambiente atualizadas
- [ ] Dependências instaladas

### Migração
- [ ] Schema Prisma criado
- [ ] Migrações executadas
- [ ] Dados migrados com sucesso
- [ ] Integridade verificada

### Configuração
- [ ] Google OAuth configurado
- [ ] Asaas configurado
- [ ] Webhooks configurados
- [ ] Frontend atualizado

### Testes
- [ ] API funcionando
- [ ] Autenticação funcionando
- [ ] Frontend funcionando
- [ ] Pagamentos funcionando (sandbox)

### Deploy
- [ ] Ambiente de produção configurado
- [ ] Variáveis de produção definidas
- [ ] DNS configurado
- [ ] SSL configurado

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. **Monitoramento**: Configure logs e métricas
2. **Backup**: Configure backup automático PostgreSQL
3. **Performance**: Otimize queries e índices
4. **Segurança**: Revise permissões e acessos
5. **Documentação**: Atualize documentação da equipe

## 📞 Suporte

Em caso de problemas na migração:
- Consulte logs detalhados
- Verifique configurações de ambiente
- Teste conexões de banco
- Entre em contato com suporte técnico

---

**Boa migração!** 🚀

