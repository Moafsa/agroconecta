const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSamplePlans() {
  try {
    console.log('Criando planos de exemplo...');

    // Primeiro, vamos verificar se já existe um admin para associar aos planos
    let admin = await prisma.admin.findFirst();
    
    if (!admin) {
      console.log('Criando admin padrão...');
      const senhaCriptografada = await bcrypt.hash('admin123', 10);
      
      admin = await prisma.admin.create({
        data: {
          nome: 'Administrador',
          email: 'admin@agroconecta.com',
          senha: senhaCriptografada,
          nivel_acesso: 'SUPER_ADMIN',
          ativo: true
        }
      });
      console.log('Admin criado com sucesso!');
    }

    // Verificar se já existem planos
    const planosExistentes = await prisma.plano.count();
    if (planosExistentes > 0) {
      console.log('Planos já existem! Pulando criação...');
      return;
    }

    // Planos para Profissionais
    const planosProfissionais = [
      {
        nome: 'Plano Free Profissional',
        descricao: 'Plano gratuito para começar. Perfeito para conhecer a plataforma.',
        tipo_plano: 'BASICO',
        categoria: 'PROFISSIONAL',
        valor: 0.00,
        periodo: 'MENSAL',
        recursos: [
          'Perfil profissional básico',
          'Até 5 consultas por semana',
          'Acesso limitado a produtores',
          'Suporte por email',
          'Sem compromisso'
        ],
        limite_consultas: 5,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Básico Profissional - Mensal',
        descricao: 'Ideal para profissionais iniciantes no setor agrícola. Acesso básico à plataforma e recursos essenciais.',
        tipo_plano: 'BASICO',
        categoria: 'PROFISSIONAL',
        valor: 49.90,
        periodo: 'MENSAL',
        recursos: [
          'Perfil profissional completo',
          'Até 3 consultas por dia',
          'Acesso a produtores da região',
          'Suporte por email',
          'Relatórios básicos'
        ],
        limite_consultas: 3,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Básico Profissional - Semestral',
        descricao: 'Ideal para profissionais iniciantes no setor agrícola. Acesso básico à plataforma e recursos essenciais.',
        tipo_plano: 'BASICO',
        categoria: 'PROFISSIONAL',
        valor: 249.50,
        periodo: 'SEMESTRAL',
        recursos: [
          'Perfil profissional completo',
          'Até 3 consultas por dia',
          'Acesso a produtores da região',
          'Suporte por email',
          'Relatórios básicos',
          'Desconto de 15%'
        ],
        limite_consultas: 3,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Básico Profissional - Anual',
        descricao: 'Ideal para profissionais iniciantes no setor agrícola. Acesso básico à plataforma e recursos essenciais.',
        tipo_plano: 'BASICO',
        categoria: 'PROFISSIONAL',
        valor: 449.10,
        periodo: 'ANUAL',
        recursos: [
          'Perfil profissional completo',
          'Até 3 consultas por dia',
          'Acesso a produtores da região',
          'Suporte por email',
          'Relatórios básicos',
          'Desconto de 25%'
        ],
        limite_consultas: 3,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Premium Profissional - Mensal',
        descricao: 'Para profissionais experientes que querem maximizar sua presença e alcance no mercado agrícola.',
        tipo_plano: 'PREMIUM',
        categoria: 'PROFISSIONAL',
        valor: 99.90,
        periodo: 'MENSAL',
        recursos: [
          'Perfil profissional destacado',
          'Consultas ilimitadas',
          'Acesso a todos os produtores',
          'Suporte prioritário',
          'Relatórios avançados',
          'Destaque nos resultados de busca',
          'Acesso a eventos exclusivos',
          'Mentoria mensal'
        ],
        limite_consultas: null,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Premium Profissional - Semestral',
        descricao: 'Para profissionais experientes que querem maximizar sua presença e alcance no mercado agrícola.',
        tipo_plano: 'PREMIUM',
        categoria: 'PROFISSIONAL',
        valor: 499.50,
        periodo: 'SEMESTRAL',
        recursos: [
          'Perfil profissional destacado',
          'Consultas ilimitadas',
          'Acesso a todos os produtores',
          'Suporte prioritário',
          'Relatórios avançados',
          'Destaque nos resultados de busca',
          'Acesso a eventos exclusivos',
          'Mentoria mensal',
          'Desconto de 15%'
        ],
        limite_consultas: null,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Premium Profissional - Anual',
        descricao: 'Para profissionais experientes que querem maximizar sua presença e alcance no mercado agrícola.',
        tipo_plano: 'PREMIUM',
        categoria: 'PROFISSIONAL',
        valor: 899.10,
        periodo: 'ANUAL',
        recursos: [
          'Perfil profissional destacado',
          'Consultas ilimitadas',
          'Acesso a todos os produtores',
          'Suporte prioritário',
          'Relatórios avançados',
          'Destaque nos resultados de busca',
          'Acesso a eventos exclusivos',
          'Mentoria mensal',
          'Desconto de 25%'
        ],
        limite_consultas: null,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      }
    ];

    // Planos para Clientes
    const planosClientes = [
      {
        nome: 'Plano Free Cliente',
        descricao: 'Plano gratuito para começar. Conecte-se com profissionais qualificados.',
        tipo_plano: 'BASICO',
        categoria: 'CLIENTE',
        valor: 0.00,
        periodo: 'MENSAL',
        recursos: [
          'Acesso a profissionais da região',
          'Até 5 consultas por semana',
          'Chat básico com profissionais',
          'Avaliações e reviews',
          'Sem compromisso'
        ],
        limite_consultas: 5,
        limite_profissionais: 5,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Básico Cliente - Mensal',
        descricao: 'Perfeito para produtores que querem conectar com profissionais qualificados do setor agrícola.',
        tipo_plano: 'BASICO',
        categoria: 'CLIENTE',
        valor: 29.90,
        periodo: 'MENSAL',
        recursos: [
          'Acesso a profissionais da região',
          'Até 3 consultas por dia',
          'Chat direto com profissionais',
          'Avaliações e reviews',
          'Suporte básico'
        ],
        limite_consultas: 3,
        limite_profissionais: 10,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Básico Cliente - Semestral',
        descricao: 'Perfeito para produtores que querem conectar com profissionais qualificados do setor agrícola.',
        tipo_plano: 'BASICO',
        categoria: 'CLIENTE',
        valor: 149.50,
        periodo: 'SEMESTRAL',
        recursos: [
          'Acesso a profissionais da região',
          'Até 3 consultas por dia',
          'Chat direto com profissionais',
          'Avaliações e reviews',
          'Suporte básico',
          'Desconto de 15%'
        ],
        limite_consultas: 3,
        limite_profissionais: 10,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Básico Cliente - Anual',
        descricao: 'Perfeito para produtores que querem conectar com profissionais qualificados do setor agrícola.',
        tipo_plano: 'BASICO',
        categoria: 'CLIENTE',
        valor: 269.10,
        periodo: 'ANUAL',
        recursos: [
          'Acesso a profissionais da região',
          'Até 3 consultas por dia',
          'Chat direto com profissionais',
          'Avaliações e reviews',
          'Suporte básico',
          'Desconto de 25%'
        ],
        limite_consultas: 3,
        limite_profissionais: 10,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Premium Cliente - Mensal',
        descricao: 'Para produtores que precisam de acesso completo a todos os profissionais e recursos da plataforma.',
        tipo_plano: 'PREMIUM',
        categoria: 'CLIENTE',
        valor: 59.90,
        periodo: 'MENSAL',
        recursos: [
          'Acesso a todos os profissionais',
          'Consultas ilimitadas',
          'Chat prioritário',
          'Avaliações e reviews',
          'Suporte 24/7',
          'Relatórios personalizados',
          'Acesso a eventos exclusivos',
          'Consultoria especializada'
        ],
        limite_consultas: null,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Premium Cliente - Semestral',
        descricao: 'Para produtores que precisam de acesso completo a todos os profissionais e recursos da plataforma.',
        tipo_plano: 'PREMIUM',
        categoria: 'CLIENTE',
        valor: 299.50,
        periodo: 'SEMESTRAL',
        recursos: [
          'Acesso a todos os profissionais',
          'Consultas ilimitadas',
          'Chat prioritário',
          'Avaliações e reviews',
          'Suporte 24/7',
          'Relatórios personalizados',
          'Acesso a eventos exclusivos',
          'Consultoria especializada',
          'Desconto de 15%'
        ],
        limite_consultas: null,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      },
      {
        nome: 'Plano Premium Cliente - Anual',
        descricao: 'Para produtores que precisam de acesso completo a todos os profissionais e recursos da plataforma.',
        tipo_plano: 'PREMIUM',
        categoria: 'CLIENTE',
        valor: 539.10,
        periodo: 'ANUAL',
        recursos: [
          'Acesso a todos os profissionais',
          'Consultas ilimitadas',
          'Chat prioritário',
          'Avaliações e reviews',
          'Suporte 24/7',
          'Relatórios personalizados',
          'Acesso a eventos exclusivos',
          'Consultoria especializada',
          'Desconto de 25%'
        ],
        limite_consultas: null,
        limite_profissionais: null,
        ativo: true,
        admin_criador_id: admin.id
      }
    ];

    // Criar todos os planos
    const todosPlanos = [...planosProfissionais, ...planosClientes];
    
    for (const planoData of todosPlanos) {
      const plano = await prisma.plano.create({
        data: planoData
      });
      
      console.log(`✅ Plano criado: ${plano.nome} - R$ ${plano.valor}`);
    }

    console.log('\n🎉 Todos os planos foram criados com sucesso!');
    console.log('\n📋 Resumo dos planos criados:');
    console.log('\n--- PLANOS PARA PROFISSIONAIS ---');
    planosProfissionais.forEach(p => {
      console.log(`• ${p.nome}: R$ ${p.valor}/mês`);
    });
    
    console.log('\n--- PLANOS PARA CLIENTES ---');
    planosClientes.forEach(p => {
      console.log(`• ${p.nome}: R$ ${p.valor}/mês`);
    });

  } catch (error) {
    console.error('Erro ao criar planos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSamplePlans();
