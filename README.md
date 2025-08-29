# Agro-Conecta - PWA Marketplace do Agronegócio

## 📋 Visão Geral

O **Agro-Conecta** é um Progressive Web App (PWA) que conecta produtores rurais a uma rede de profissionais qualificados do agronegócio. A plataforma funciona como um marketplace onde a lógica de negócio é gerenciada por automações no n8n, enquanto o app serve como interface para usuários e sistema de gestão para profissionais.

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js + MongoDB + Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **PWA**: Service Worker + Web App Manifest
- **Integração**: n8n (automação e lógica de negócio)

### Modelo de Negócio
- **Assinatura para Profissionais**: Taxa mensal para estar listado na plataforma
- **Comissão por Sucesso**: Percentual sobre serviços fechados

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- MongoDB (local ou Atlas)
- pnpm ou npm

### 1. Clonagem e Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd agro-conecta

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
pnpm install
```

### 2. Configuração do Backend

Crie o arquivo `.env` no diretório `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agro-conecta
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
NODE_ENV=development
N8N_WEBHOOK_URL=https://seu-n8n-instance.com/webhook/agro-conecta
```

### 3. Configuração do Frontend

Crie o arquivo `.env` no diretório `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Executar a Aplicação

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
pnpm run dev --host
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔗 Como Conectar o n8n ao Banco de Dados

### Passo 1: Obter String de Conexão do MongoDB

#### Para MongoDB Atlas (Recomendado para Produção):

1. **Criar Conta no MongoDB Atlas**
   - Acesse https://cloud.mongodb.com
   - Crie uma conta gratuita

2. **Criar Cluster**
   - Clique em "Build a Database"
   - Escolha o plano gratuito (M0)
   - Selecione a região mais próxima

3. **Configurar Acesso**
   - Vá em "Database Access" → "Add New Database User"
   - Crie um usuário com permissões de leitura/escrita
   - Anote o usuário e senha

4. **Configurar Rede**
   - Vá em "Network Access" → "Add IP Address"
   - Para desenvolvimento: adicione `0.0.0.0/0` (permite qualquer IP)
   - Para produção: adicione apenas os IPs específicos do n8n

5. **Obter String de Conexão**
   - Vá em "Database" → "Connect" → "Connect your application"
   - Copie a string de conexão
   - Substitua `<password>` pela senha do usuário criado
   - Exemplo: `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/agro-conecta`

#### Para MongoDB Local:

```bash
# Instalar MongoDB localmente
# Ubuntu/Debian:
sudo apt-get install mongodb

# Iniciar serviço
sudo systemctl start mongodb

# String de conexão local:
mongodb://localhost:27017/agro-conecta
```

### Passo 2: Configurar n8n para Acesso ao Banco

#### Opção A: Usando MongoDB Node no n8n

1. **Instalar Node MongoDB no n8n**
   - No n8n, adicione um node "MongoDB"
   - Configure a conexão com a string obtida no Passo 1

2. **Configurar Credenciais**
   - Vá em "Credentials" no n8n
   - Adicione nova credencial "MongoDB"
   - Cole a string de conexão completa

#### Opção B: Usando HTTP Requests para API

1. **Configurar Webhook no n8n**
   - Crie um workflow com trigger "Webhook"
   - Configure a URL do webhook
   - Adicione a URL no arquivo `.env` do backend

2. **Usar Endpoints da API**
   - Base URL: `http://seu-backend.com/api`
   - Endpoints disponíveis:
     - `GET /profissionais` - Listar profissionais
     - `POST /interacoes` - Criar interação
     - `PUT /interacoes/:id` - Atualizar interação

### Passo 3: Configurar Permissões de Rede

#### Para MongoDB Atlas:
1. Vá em "Network Access" no painel do Atlas
2. Clique em "Add IP Address"
3. Adicione o IP do servidor onde o n8n está rodando
4. Para desenvolvimento, pode usar `0.0.0.0/0` (não recomendado para produção)

#### Para MongoDB Local:
1. Edite o arquivo de configuração do MongoDB (`/etc/mongod.conf`)
2. Modifique a seção `net`:
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0  # Permite conexões externas
```
3. Reinicie o MongoDB: `sudo systemctl restart mongod`

### Passo 4: Testar Conexão

#### Teste via MongoDB Compass:
1. Baixe o MongoDB Compass
2. Use a string de conexão para conectar
3. Verifique se consegue ver o banco `agro-conecta`

#### Teste via n8n:
1. Crie um workflow simples no n8n
2. Adicione um node MongoDB
3. Configure para listar documentos da coleção `profissionais`
4. Execute para verificar se a conexão funciona

## 📊 Esquema do Banco de Dados

### Coleção: `profissionais`
```javascript
{
  _id: ObjectId,
  nome: String,
  email: String (único),
  senha: String (hash),
  contato: String,
  foto: String (URL),
  especialidades: [String],
  regiao_atuacao: String,
  agenda_disponibilidade: [{
    dia: String,
    horarios: [String]
  }],
  avaliacoes: [{
    produtor_id: ObjectId,
    nota: Number,
    comentario: String,
    data: Date
  }],
  status_assinatura: String,
  data_cadastro: Date,
  data_atualizacao: Date
}
```

### Coleção: `produtores`
```javascript
{
  _id: ObjectId,
  nome: String,
  contato: String,
  data_cadastro: Date
}
```

### Coleção: `interacoes`
```javascript
{
  _id: ObjectId,
  produtor_id: ObjectId,
  profissional_id: ObjectId,
  mensagem_inicial: String,
  status: String,
  dor_cliente: String,
  data_interacao: Date,
  historico_mensagens: [{
    remetente: String,
    mensagem: String,
    timestamp: Date
  }]
}
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar profissional
- `POST /api/auth/login` - Login profissional

### Profissionais
- `GET /api/profissionais/me` - Perfil do profissional autenticado
- `POST /api/profissionais` - Criar/atualizar perfil
- `PUT /api/profissionais/:id` - Atualizar perfil específico
- `GET /api/profissionais/:id` - Buscar perfil específico

### Produtores
- `POST /api/produtores` - Criar produtor
- `GET /api/produtores/:id` - Buscar produtor
- `GET /api/produtores` - Listar produtores

### Interações
- `POST /api/interacoes` - Criar interação
- `PUT /api/interacoes/:id` - Atualizar interação
- `GET /api/interacoes/:id` - Buscar interação
- `GET /api/interacoes` - Listar interações

### Chat
- `POST /api/chat/message` - Enviar mensagem (webhook para n8n)

## 🎯 Funcionalidades

### Área do Produtor (Público)
- ✅ Interface de chat intuitiva
- ✅ Envio de mensagens para n8n
- ✅ Recebimento de respostas automáticas
- ✅ Design responsivo mobile-first

### Área do Profissional (Autenticada)
- ✅ Sistema de login/registro
- ✅ Dashboard com estatísticas
- ✅ Gestão completa de perfil
- ✅ Sistema de especialidades (tags)
- ✅ Configuração de disponibilidade
- ✅ Histórico de atendimentos

### PWA Features
- ✅ Instalável em dispositivos móveis
- ✅ Funciona offline (cache básico)
- ✅ Ícones e splash screen
- ✅ Manifest configurado

## 🔧 Configuração para Produção

### 1. Variáveis de Ambiente

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agro-conecta
JWT_SECRET=jwt_secret_super_seguro_producao
NODE_ENV=production
N8N_WEBHOOK_URL=https://n8n.seudominio.com/webhook/agro-conecta
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.seudominio.com/api
```

### 2. Deploy do Backend

```bash
# Build e deploy (exemplo com PM2)
npm install -g pm2
pm2 start server.js --name agro-conecta-api
pm2 startup
pm2 save
```

### 3. Deploy do Frontend

```bash
# Build para produção
pnpm run build

# Deploy (exemplo com Netlify/Vercel)
# Upload da pasta dist/ para o serviço de hosting
```

### 4. Configuração de CORS

Para produção, configure CORS específico no backend:

```javascript
app.use(cors({
  origin: ['https://seudominio.com', 'https://app.seudominio.com'],
  credentials: true
}));
```

## 🧪 Testes

### Executar Testes do Backend
```bash
cd backend
npm test
```

### Executar Testes do Frontend
```bash
cd frontend
pnpm test
```

### Teste Manual
1. Acesse http://localhost:5173
2. Teste o chat na página inicial
3. Teste login/registro de profissionais
4. Verifique responsividade mobile

## 📱 Instalação como PWA

### Android
1. Abra o app no Chrome
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"

### iOS
1. Abra o app no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT com expiração
- ✅ Validação de entrada nos endpoints
- ✅ CORS configurado
- ✅ Middleware de autenticação

## 🐛 Troubleshooting

### Erro de Conexão MongoDB
```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Verificar conectividade
mongo "sua-string-de-conexao"
```

### Erro de CORS
- Verifique se a URL do frontend está nas origens permitidas
- Confirme se as variáveis de ambiente estão corretas

### n8n não recebe mensagens
- Verifique se N8N_WEBHOOK_URL está configurado
- Teste o webhook diretamente com curl
- Confirme se o n8n está acessível

## 📞 Suporte

Para dúvidas sobre implementação ou configuração:
1. Verifique a documentação do MongoDB Atlas
2. Consulte a documentação do n8n
3. Revise os logs do backend para erros específicos

## 📄 Licença

Este projeto foi desenvolvido como solução personalizada para o agronegócio.

---

**Desenvolvido com ❤️ para conectar o agronegócio brasileiro**

