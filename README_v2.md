# Agro-Conecta v2.0 - PWA Completo

## 🚀 Novidades da Versão 2.0

### ✨ Principais Melhorias

- **🐘 PostgreSQL**: Migração completa do MongoDB para PostgreSQL com Prisma ORM
- **🔐 Autenticação Google**: Login social integrado com Google OAuth 2.0
- **💳 Sistema de Pagamentos**: Integração completa com Asaas para gestão de assinaturas
- **📱 PWA Aprimorado**: Interface otimizada e novas funcionalidades

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação e Configuração](#instalação-e-configuração)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Configuração do Google OAuth](#configuração-do-google-oauth)
7. [Configuração do Asaas](#configuração-do-asaas)
8. [Executando o Projeto](#executando-o-projeto)
9. [Estrutura do Projeto](#estrutura-do-projeto)
10. [API Endpoints](#api-endpoints)
11. [Deploy](#deploy)
12. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Agro-Conecta é uma plataforma PWA que conecta produtores rurais com profissionais especializados do agronegócio. A versão 2.0 introduz um sistema robusto de autenticação, pagamentos e banco de dados relacional.

### Funcionalidades Principais

#### Para Produtores Rurais
- Chat inteligente sem necessidade de cadastro
- Integração com n8n para processamento de mensagens
- Interface mobile-first otimizada

#### Para Profissionais
- **Autenticação**: Login com Google ou email/senha
- **Perfil Completo**: Gestão de especialidades e disponibilidade
- **Sistema de Assinaturas**: Planos Básico, Premium e Enterprise
- **Dashboard**: Gestão de interações e leads
- **Pagamentos**: Integração com Asaas (PIX, Boleto, Cartão)

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** com **Prisma ORM**
- **Passport.js** para autenticação
- **JWT** para tokens de acesso
- **Asaas SDK** para pagamentos

### Frontend
- **React 19** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **React Router** para navegação
- **Google OAuth** para autenticação social
- **PWA** com Service Worker

### Infraestrutura
- **n8n** para automação de workflows
- **PostgreSQL** para persistência
- **Asaas** para processamento de pagamentos

## 📋 Pré-requisitos

- **Node.js** 18+ e **npm/pnpm**
- **PostgreSQL** 12+
- **Conta Google Cloud** (para OAuth)
- **Conta Asaas** (para pagamentos)
- **n8n** (opcional, para automação)

## 🔧 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd agro-conecta
```

### 2. Instale as Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
pnpm install
```

## 🐘 Configuração do Banco de Dados

### 1. Instalar PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Baixe e instale do [site oficial](https://www.postgresql.org/download/windows/)

### 2. Criar Banco e Usuário

```bash
sudo -u postgres psql

-- No console do PostgreSQL:
CREATE DATABASE agro_conecta;
CREATE USER agro_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE agro_conecta TO agro_user;
\q
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://agro_user:sua_senha_segura@localhost:5432/agro_conecta?schema=public"
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Asaas
ASAAS_API_KEY=sua_asaas_api_key
ASAAS_ENVIRONMENT=sandbox

# n8n (opcional)
N8N_WEBHOOK_URL=https://sua-instancia-n8n.com/webhook/agro-conecta
```

### 4. Executar Migrações

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

## 🔐 Configuração do Google OAuth

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API** e **Google OAuth2 API**

### 2. Configurar OAuth 2.0

1. Vá para **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth 2.0 Client ID**
3. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`

### 3. Configurar Frontend

Crie o arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
```

## 💳 Configuração do Asaas

### 1. Criar Conta no Asaas

1. Acesse [Asaas](https://www.asaas.com/)
2. Crie uma conta e acesse o painel
3. Vá para **Configurações > API**

### 2. Obter Chaves da API

- **Sandbox**: Para testes
- **Production**: Para produção

### 3. Configurar Webhooks

No painel do Asaas, configure os webhooks para:
- URL: `https://seu-dominio.com/api/webhooks/asaas`
- Eventos: Todos os eventos de pagamento e assinatura

## 🚀 Executando o Projeto

### 1. Iniciar Backend

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:5000`

### 2. Iniciar Frontend

```bash
cd frontend
pnpm run dev
```

O frontend estará disponível em `http://localhost:5173`

### 3. Verificar Funcionamento

- Acesse `http://localhost:5173` para o chat do produtor
- Acesse `http://localhost:5173/login` para área do profissional
- Teste `http://localhost:5000/api/health` para verificar o backend

## 📁 Estrutura do Projeto

```
agro-conecta/
├── backend/
│   ├── config/
│   │   └── passport.js          # Configuração Passport.js
│   ├── lib/
│   │   ├── prisma.js           # Cliente Prisma
│   │   └── asaas.js            # Cliente Asaas
│   ├── middleware/
│   │   └── auth.js             # Middleware de autenticação
│   ├── models/                 # Modelos Prisma (schema.prisma)
│   ├── prisma/
│   │   └── schema.prisma       # Schema do banco
│   ├── routes/
│   │   ├── auth-prisma.js      # Autenticação tradicional
│   │   ├── auth-google.js      # Autenticação Google
│   │   ├── profissionais-prisma.js # Gestão de profissionais
│   │   ├── interacoes-prisma.js     # Gestão de interações
│   │   ├── assinaturas.js      # Gestão de assinaturas
│   │   ├── webhooks.js         # Webhooks Asaas
│   │   └── chat.js             # Integração n8n
│   ├── server-prisma.js        # Servidor principal
│   └── .env                    # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Componentes shadcn/ui
│   │   │   ├── Header.jsx      # Cabeçalho
│   │   │   ├── ChatWindow.jsx  # Janela de chat
│   │   │   └── GoogleLoginButton.jsx # Botão Google
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Contexto de autenticação
│   │   ├── lib/
│   │   │   └── api.js          # Configuração da API
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Chat do produtor
│   │   │   ├── Login.jsx       # Login do profissional
│   │   │   ├── Register.jsx    # Registro
│   │   │   ├── Dashboard.jsx   # Dashboard
│   │   │   ├── Profile.jsx     # Perfil
│   │   │   ├── Subscription.jsx # Assinaturas
│   │   │   └── AuthCallback.jsx # Callback OAuth
│   │   └── App.jsx             # App principal
│   └── .env                    # Variáveis de ambiente
└── README_v2.md               # Esta documentação
```


## 🔌 API Endpoints

### Autenticação

#### Tradicional
- `POST /api/auth/register` - Registro de profissional
- `POST /api/auth/login` - Login com email/senha
- `GET /api/auth/me` - Dados do usuário autenticado

#### Google OAuth
- `GET /api/auth/google` - Iniciar autenticação Google
- `GET /api/auth/google/callback` - Callback do Google
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Status de autenticação

### Profissionais
- `GET /api/profissionais/me` - Perfil do profissional autenticado
- `PUT /api/profissionais/me` - Atualizar perfil
- `GET /api/profissionais` - Listar profissionais (público)
- `GET /api/profissionais/:id` - Buscar profissional específico

### Interações
- `POST /api/interacoes` - Criar nova interação (público)
- `GET /api/interacoes/minhas` - Listar interações do profissional
- `GET /api/interacoes/:id` - Buscar interação específica
- `PUT /api/interacoes/:id` - Atualizar interação
- `POST /api/interacoes/:id/mensagens` - Adicionar mensagem
- `GET /api/interacoes/nao-atribuidas` - Interações não atribuídas

### Assinaturas
- `GET /api/assinaturas/planos` - Listar planos disponíveis
- `POST /api/assinaturas/criar` - Criar nova assinatura
- `GET /api/assinaturas/minhas` - Listar assinaturas do profissional
- `GET /api/assinaturas/:id` - Buscar assinatura específica
- `POST /api/assinaturas/:id/cancelar` - Cancelar assinatura
- `POST /api/assinaturas/:id/reativar` - Reativar assinatura

### Webhooks
- `POST /api/webhooks/asaas` - Webhook do Asaas

### Chat/n8n
- `POST /api/chat/webhook` - Webhook do n8n

### Utilitários
- `GET /api/health` - Status da API
- `GET /api/especialidades` - Listar especialidades

## 💰 Planos de Assinatura

### Básico - R$ 49,90/mês
- Perfil na plataforma
- Recebimento de leads
- Suporte por email

### Premium - R$ 99,90/mês ⭐
- Tudo do Básico
- Destaque no perfil
- Relatórios avançados
- Suporte prioritário

### Enterprise - R$ 199,90/mês
- Tudo do Premium
- API personalizada
- Gerente de conta
- Integração customizada

## 🚀 Deploy

### Backend (Node.js)

#### Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login e criar app
heroku login
heroku create agro-conecta-api

# Configurar variáveis de ambiente
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set JWT_SECRET="..."
heroku config:set GOOGLE_CLIENT_ID="..."
heroku config:set GOOGLE_CLIENT_SECRET="..."
heroku config:set ASAAS_API_KEY="..."

# Deploy
git push heroku main
```

#### Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

### Frontend (React)

#### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Configurar variáveis de ambiente no painel
```

#### Netlify
```bash
# Build
cd frontend
pnpm run build

# Deploy manual ou conectar repositório
```

### Banco de Dados

#### Supabase (PostgreSQL)
1. Crie conta em [Supabase](https://supabase.com/)
2. Crie novo projeto
3. Copie a string de conexão
4. Execute as migrações

#### Railway PostgreSQL
```bash
railway add postgresql
railway variables
# Copie DATABASE_URL
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com PostgreSQL
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar porta
sudo netstat -tlnp | grep postgres

# Testar conexão
psql -h localhost -p 5432 -U agro_user -d agro_conecta
```

#### 2. Erro do Prisma "Cannot fetch data from service"
```bash
# Regenerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# Verificar schema
npx prisma studio
```

#### 3. Erro de CORS
Verifique se `FRONTEND_URL` está configurado corretamente no backend.

#### 4. Google OAuth não funciona
- Verifique se as URLs de callback estão corretas
- Confirme se o Client ID está correto
- Verifique se as APIs estão ativadas no Google Cloud

#### 5. Webhooks Asaas não funcionam
- Verifique se a URL está acessível publicamente
- Use ngrok para testes locais
- Confirme se os eventos estão configurados

### Logs e Debug

#### Backend
```bash
# Logs detalhados do Prisma
DEBUG=prisma:* npm run dev

# Logs do servidor
NODE_ENV=development npm run dev
```

#### Frontend
```bash
# Console do navegador
# Verificar Network tab para requisições
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- 📧 Email: suporte@agro-conecta.com
- 💬 Chat: Disponível na plataforma
- 📚 Documentação: [docs.agro-conecta.com](https://docs.agro-conecta.com)

---

**Agro-Conecta v2.0** - Conectando o agronegócio com tecnologia 🌱

