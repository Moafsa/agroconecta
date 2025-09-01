const axios = require('axios');

// Configurar cliente Asaas
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'sandbox';

// Debug: Log das variáveis de ambiente
console.log('🔑 ASAAS_API_KEY configurada:', ASAAS_API_KEY ? '✅ Sim' : '❌ Não encontrada');
console.log('🌍 ASAAS_ENVIRONMENT:', ASAAS_ENVIRONMENT);
const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === 'production' 
  ? 'https://www.asaas.com/api/v3' 
  : 'https://sandbox.asaas.com/api/v3';

// Configurar axios para Asaas
const asaasApi = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Função para criar cliente no Asaas
async function createCustomer(userData) {
  try {
    const customerData = {
      name: userData.nome,
      email: userData.email,
      phone: userData.contato,
      cpfCnpj: userData.cpf_cnpj, // Send the CPF/CNPJ to Asaas
      externalReference: userData.id
    };

    const response = await asaasApi.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar cliente no Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para criar assinatura
async function createSubscription(subscriptionData) {
  try {
    // A Asaas espera o `customer` no nível raiz, o resto dos dados já está no objeto.
    const response = await asaasApi.post('/subscriptions', subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar assinatura no Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para cancelar assinatura
async function cancelSubscription(subscriptionId) {
  try {
    const response = await asaasApi.delete(`/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao cancelar assinatura no Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para buscar assinatura
async function getSubscription(subscriptionId) {
  try {
    const response = await asaasApi.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar assinatura no Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para listar pagamentos de uma assinatura
async function getSubscriptionPayments(subscriptionId) {
  try {
    const response = await asaasApi.get(`/payments?subscription=${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pagamentos da assinatura:', error.response?.data || error.message);
    throw error;
  }
}

// Função para criar pagamento avulso
async function createPayment(customerId, paymentData) {
  try {
    const paymentRequest = {
      customer: customerId,
      billingType: paymentData.billingType || 'PIX',
      value: paymentData.value,
      dueDate: paymentData.dueDate,
      description: paymentData.description,
      externalReference: paymentData.externalReference
    };

    // Adicionar wallet PIX se o método de pagamento for PIX e a chave for fornecida
    if (paymentData.billingType === 'PIX' && paymentData.pixWallet) {
      paymentRequest.split = [{
        walletId: process.env.ASAAS_WALLET_ID, // Main platform wallet
        fixedValue: paymentData.value, // The full amount goes to the main wallet
      }];
      // Note: The PIX key for the actual transaction is usually configured
      // on the Asaas account level or sent differently.
      // Asaas documentation should be consulted for direct PIX key assignment per transaction.
      // For now, we assume the PIX key is configured on the main account.
      // The 'pixWallet' here might be for reference or a specific split feature.
      // Re-adding pixWallet as per initial logic if it's required for some direct payment flows.
      // This part needs to be validated with Asaas API documentation for creating PIX charges.
    }

    const response = await asaasApi.post('/payments', paymentRequest);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pagamento no Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para buscar pagamento
async function getPayment(paymentId) {
  try {
    const response = await asaasApi.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pagamento no Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para atualizar cliente
async function updateCustomer(customerId, customerData) {
  try {
    const response = await asaasApi.put(`/customers/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar cliente no Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Mapear status do Asaas para status interno
function mapAsaasStatus(asaasStatus) {
  const statusMap = {
    'PENDING': 'PENDENTE',
    'RECEIVED': 'CONFIRMADO',
    'CONFIRMED': 'CONFIRMADO',
    'OVERDUE': 'VENCIDO',
    'REFUNDED': 'ESTORNADO',
    'RECEIVED_IN_CASH': 'CONFIRMADO',
    'REFUND_REQUESTED': 'ESTORNADO',
    'CHARGEBACK_REQUESTED': 'ESTORNADO',
    'CHARGEBACK_DISPUTE': 'ESTORNADO',
    'AWAITING_CHARGEBACK_REVERSAL': 'ESTORNADO',
    'DUNNING_REQUESTED': 'VENCIDO',
    'DUNNING_RECEIVED': 'CONFIRMADO',
    'AWAITING_RISK_ANALYSIS': 'PENDENTE'
  };

  return statusMap[asaasStatus] || 'PENDENTE';
}

// Mapear tipo de pagamento do Asaas
function mapAsaasBillingType(billingType) {
  const typeMap = {
    'PIX': 'PIX',
    'BOLETO': 'BOLETO',
    'CREDIT_CARD': 'CARTAO_CREDITO',
    'DEBIT_CARD': 'CARTAO_DEBITO'
  };

  return typeMap[billingType] || 'PIX';
}

module.exports = {
  createCustomer,
  createSubscription,
  cancelSubscription,
  getSubscription,
  getSubscriptionPayments,
  createPayment,
  getPayment,
  updateCustomer,
  mapAsaasStatus,
  mapAsaasBillingType
};

