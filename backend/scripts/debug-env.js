// Script para debugar variáveis de ambiente
console.log('🔍 Environment Variables Debug:');
console.log('================================');

// Verificar ASAAS_API_KEY
console.log('ASAAS_API_KEY:');
console.log('  - Exists:', !!process.env.ASAAS_API_KEY);
console.log('  - Length:', process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.length : 0);
console.log('  - Starts with $aact_:', process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.startsWith('$aact_') : false);
console.log('  - First 20 chars:', process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.substring(0, 20) : 'undefined');

// Verificar ASAAS_ENVIRONMENT
console.log('\nASAAS_ENVIRONMENT:');
console.log('  - Value:', process.env.ASAAS_ENVIRONMENT || 'undefined');

// Verificar outras variáveis importantes
console.log('\nOther important variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('  - DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('  - JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Testar se a chave está sendo passada corretamente para o axios
console.log('\n🔧 Testing axios configuration:');
const axios = require('axios');

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'sandbox';
const ASAAS_BASE_URL = ASAAS_ENVIRONMENT === 'production' 
  ? 'https://www.asaas.com/api/v3' 
  : 'https://sandbox.asaas.com/api/v3';

console.log('  - Base URL:', ASAAS_BASE_URL);
console.log('  - API Key configured:', !!ASAAS_API_KEY);

// Criar instância do axios para testar
const asaasApi = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

console.log('  - Axios instance created successfully');
console.log('  - Headers configured:', asaasApi.defaults.headers);

console.log('\n✅ Debug complete!');
