const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');
const prisma = require('./lib/prisma');
const testePagamentoRoutes = require('./routes/teste-pagamento'); // Rota de teste

// Carregar variáveis de ambiente
dotenv.config();

// Executar migração de verificação na inicialização
const { migrateVerificationSystem } = require('./scripts/migrate-verification');

// Executar migração de forma assíncrona
migrateVerificationSystem().catch(error => {
  console.error('⚠️ Erro na migração de verificação (continuando...):', error.message);
});

const app = express();

// Middleware
// Configurar CORS origins
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3002', 
      'http://localhost:5173', 
      'https://agroconecta.conext.click',
      process.env.FRONTEND_URL
    ].filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuração de sessão para Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de log
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Rotas
app.use('/api/auth', require('./routes/auth-prisma'));
app.use('/api/profissionais', require('./routes/profissionais-prisma'));
app.use('/api/interacoes', require('./routes/interacoes-prisma'));
app.use('/api/assinaturas', require('./routes/assinaturas'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/verificacao', require('./routes/verificacao')); // Rota de verificação
app.use('/api/faturas', require('./routes/faturas')); // Rota de faturas
app.use('/api/teste-pagamento', testePagamentoRoutes); // Adicionando a rota de teste
app.use('/api/debug', require('./routes/debug')); // Rota de debug

// Rotas do Painel Administrativo
app.use('/api/admin/auth', require('./routes/admin-auth'));
app.use('/api/admin/planos', require('./routes/admin-planos'));
app.use('/api/admin/clientes', require('./routes/admin-clientes'));
app.use('/api/admin/profissionais', require('./routes/admin-profissionais'));
app.use('/api/admin/pagamentos', require('./routes/admin-pagamentos'));

// Rotas públicas
app.use('/api/planos', require('./routes/planos-publicos'));

// Rota de saúde
app.get('/api/health', async (req, res) => {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      version: '2.0.0-prisma'
    });
  } catch (error) {
    console.error('Erro na verificação de saúde:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Rota para listar especialidades disponíveis
app.get('/api/especialidades', async (req, res) => {
  try {
    const especialidades = await prisma.especialidade.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json(especialidades);
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Função para inicializar dados básicos
async function initializeData() {
  try {
    // Criar especialidades básicas se não existirem
    const especialidadesBasicas = [
      'Agronomia',
      'Veterinária',
      'Zootecnia',
      'Irrigação',
      'Solos',
      'Nutrição Animal',
      'Controle de Pragas',
      'Agricultura Orgânica',
      'Pecuária',
      'Horticultura'
    ];

    for (const nome of especialidadesBasicas) {
      await prisma.especialidade.upsert({
        where: { nome },
        update: {},
        create: { nome, ativo: true }
      });
    }

    console.log('Dados básicos inicializados com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar dados básicos:', error);
  }
}

// Função para desconectar do Prisma ao encerrar a aplicação
async function gracefulShutdown() {
  console.log('Encerrando aplicação...');
  await prisma.$disconnect();
  process.exit(0);
}

// Capturar sinais de encerramento
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
  
  // Inicializar dados básicos
  await initializeData();
  
  console.log('Servidor pronto para receber requisições');
});

module.exports = app;

