const { createCustomer } = require('../lib/asaas');

async function testAsaasConnection() {
  console.log('🔍 Testing Asaas API Connection...');
  console.log('ASAAS_API_KEY configured:', process.env.ASAAS_API_KEY ? '✅ Yes' : '❌ No');
  console.log('ASAAS_ENVIRONMENT:', process.env.ASAAS_ENVIRONMENT || 'not set');
  
  if (!process.env.ASAAS_API_KEY) {
    console.error('❌ ASAAS_API_KEY is not configured!');
    console.log('Please set ASAAS_API_KEY in your environment variables.');
    return;
  }

  try {
    // Test with minimal customer data
    const testCustomer = {
      id: 'test-' + Date.now(),
      nome: 'Test User',
      email: 'test@example.com',
      contato: '11999999999',
      cpf_cnpj: '12345678901'
    };

    console.log('🧪 Testing customer creation...');
    const result = await createCustomer(testCustomer);
    console.log('✅ Success! Customer created:', result.id);
    
  } catch (error) {
    console.error('❌ Error testing Asaas connection:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testAsaasConnection();
