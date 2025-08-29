require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'sandbox';
const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === 'production' 
  ? 'https://www.asaas.com/api/v3' 
  : 'https://sandbox.asaas.com/api/v3';

const asaasApi = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

async function runTest() {
  console.log('--- Iniciando Teste de Integração com Asaas ---');
  console.log(`Ambiente: ${ASAAS_ENVIRONMENT}`);
  console.log(`URL Base: ${ASAAS_BASE_URL}`);
  
  if (!ASAAS_API_KEY) {
    console.error('ERRO CRÍTICO: Variável de ambiente ASAAS_API_KEY não encontrada.');
    return;
  }
  
  console.log('ASAAS_API_KEY encontrada.');

  try {
    // 1. Criar um cliente de teste
    console.log('\nPasso 1: Criando cliente de teste...');
    const customerPayload = {
      name: `Teste Agro-Conecta ${new Date().getTime()}`,
      email: `teste${new Date().getTime()}@agroconecta.com`,
      cpfCnpj: '00001152076' // CPF/CNPJ de teste válido (use um gerado se necessário)
    };
    const customerResponse = await asaasApi.post('/customers', customerPayload);
    const customerId = customerResponse.data.id;
    console.log(`Cliente criado com sucesso! ID: ${customerId}`);

    // 2. Criar uma assinatura de teste
    console.log('\nPasso 2: Criando assinatura de teste...');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const subscriptionPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: 5.00,
      nextDueDate: dueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: 'Assinatura de Teste Direto',
    };
    const subscriptionResponse = await asaasApi.post('/subscriptions', subscriptionPayload);
    const subscription = subscriptionResponse.data;
    console.log('Assinatura criada com sucesso!');
    console.log('--- DADOS DA ASSINATURA ---');
    console.log(JSON.stringify(subscription, null, 2));

    if (subscription.invoiceUrl) {
      console.log('\n✅ SUCESSO! Link de checkout gerado:');
      console.log(subscription.invoiceUrl);
    } else {
      console.error('\n❌ FALHA: A assinatura foi criada, mas a Asaas não retornou um `invoiceUrl`.');
    }

  } catch (error) {
    console.error('\n❌ ERRO NA COMUNICAÇÃO COM A ASAAS:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados do Erro:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
  } finally {
    console.log('\n--- Teste Finalizado ---');
  }
}

runTest();
