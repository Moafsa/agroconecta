const axios = require('axios');
require('dotenv').config();

async function testN8nWebhook() {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  
  console.log('🔍 Testando conexão com n8n...');
  console.log('📡 URL do webhook:', n8nWebhookUrl);
  
  if (!n8nWebhookUrl) {
    console.error('❌ N8N_WEBHOOK_URL não está configurado!');
    console.log('💡 Configure a variável de ambiente N8N_WEBHOOK_URL');
    return;
  }
  
  try {
    console.log('📤 Enviando mensagem de teste...');
    
    const testMessage = {
      message: 'Teste de conexão do Agro-Conecta',
      produtor_id: null,
      timestamp: new Date().toISOString()
    };
    
    console.log('📦 Dados enviados:', JSON.stringify(testMessage, null, 2));
    
    const response = await axios.post(n8nWebhookUrl, testMessage, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro na conexão:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📥 Dados do erro:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.log('\n💡 SOLUÇÃO:');
        console.log('1. Acesse o n8n: https://wapp.conext.click');
        console.log('2. Abra o workflow "Agroconecta Website"');
        console.log('3. Clique no botão "Execute workflow" (botão vermelho)');
        console.log('4. Isso registrará o webhook temporariamente');
        console.log('5. Teste novamente este script');
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout - o n8n demorou mais de 10 segundos para responder');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 DNS não encontrado - verifique se a URL está correta');
    } else {
      console.error('🔧 Erro:', error.message);
    }
  }
}

// Executar o teste
testN8nWebhook();
