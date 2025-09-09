const express = require('express');
const router = express.Router();

// Endpoint para debug de variáveis de ambiente
router.get('/env', (req, res) => {
  // Permitir em produção para debug de problemas críticos

  const envInfo = {
    // Informações do servidor
    server: {
      nodeEnv: process.env.NODE_ENV || 'undefined',
      timestamp: new Date().toISOString(),
      hostname: require('os').hostname()
    },
    ASAAS_API_KEY: {
      exists: !!process.env.ASAAS_API_KEY,
      length: process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.length : 0,
      startsWithCorrectPrefix: process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.startsWith('$aact_') : false,
      firstChars: process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.substring(0, 20) + '...' : 'undefined',
      lastChars: process.env.ASAAS_API_KEY ? '...' + process.env.ASAAS_API_KEY.substring(process.env.ASAAS_API_KEY.length - 10) : 'undefined'
    },
    ASAAS_ENVIRONMENT: process.env.ASAAS_ENVIRONMENT || 'undefined',
    ASAAS_WALLET_ID: {
      exists: !!process.env.ASAAS_WALLET_ID,
      value: process.env.ASAAS_WALLET_ID || 'undefined'
    },
    DATABASE_URL: {
      exists: !!process.env.DATABASE_URL,
      hasCorrectPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.startsWith('postgresql://') : false
    },
    JWT_SECRET: {
      exists: !!process.env.JWT_SECRET,
      length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
    },
    // Informações adicionais para debug
    processEnv: {
      keys: Object.keys(process.env).filter(key => key.includes('ASAAS')),
      totalKeys: Object.keys(process.env).length
    }
  };

  res.json({
    message: 'Environment variables debug info',
    timestamp: new Date().toISOString(),
    environment: envInfo
  });
});

// Endpoint para testar configuração do Asaas (sem fazer requisição real)
router.get('/asaas-config', (req, res) => {
  try {
    const { createCustomer } = require('../lib/asaas');
    
    const config = {
      ASAAS_API_KEY: {
        exists: !!process.env.ASAAS_API_KEY,
        length: process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.length : 0,
        startsWithCorrectPrefix: process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.startsWith('$aact_') : false,
        firstChars: process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.substring(0, 20) + '...' : 'undefined'
      },
      ASAAS_ENVIRONMENT: process.env.ASAAS_ENVIRONMENT || 'undefined',
      ASAAS_BASE_URL: process.env.ASAAS_ENVIRONMENT === 'production' 
        ? 'https://www.asaas.com/api/v3' 
        : 'https://sandbox.asaas.com/api/v3',
      axiosHeaders: {
        access_token: process.env.ASAAS_API_KEY ? 'SET' : 'NOT_SET',
        ContentType: 'application/json'
      }
    };

    res.json({
      success: true,
      message: 'Asaas configuration debug',
      config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error checking Asaas configuration',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para testar conexão com Asaas
router.get('/asaas-test', async (req, res) => {
  try {
    const { createCustomer } = require('../lib/asaas');
    
    if (!process.env.ASAAS_API_KEY) {
      return res.status(500).json({
        error: 'ASAAS_API_KEY not configured',
        message: 'The ASAAS_API_KEY environment variable is not set'
      });
    }

    // Test with minimal customer data
    const testCustomer = {
      id: 'test-' + Date.now(),
      nome: 'Test User',
      email: 'test@example.com',
      contato: '11999999999',
      cpf_cnpj: '12345678901'
    };

    const result = await createCustomer(testCustomer);
    
    res.json({
      success: true,
      message: 'Asaas connection test successful',
      customerId: result.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Asaas connection test failed',
      message: error.message,
      details: error.response?.data || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint para verificar configuração do N8N
router.get('/n8n-config', (req, res) => {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  
  res.json({
    success: true,
    message: 'N8N configuration debug',
    config: {
      N8N_WEBHOOK_URL: {
        exists: !!N8N_WEBHOOK_URL,
        length: N8N_WEBHOOK_URL ? N8N_WEBHOOK_URL.length : 0,
        startsWithHttp: N8N_WEBHOOK_URL ? N8N_WEBHOOK_URL.startsWith('http') : false,
        firstChars: N8N_WEBHOOK_URL ? N8N_WEBHOOK_URL.substring(0, 30) + '...' : 'undefined'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Endpoint para testar conexão com N8N
router.get('/n8n-test', async (req, res) => {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  
  if (!N8N_WEBHOOK_URL) {
    return res.status(500).json({
      success: false,
      error: 'N8N_WEBHOOK_URL not configured',
      message: 'The N8N_WEBHOOK_URL environment variable is not set'
    });
  }

  try {
    const axios = require('axios');
    
    const testMessage = {
      message: 'Health check from Agro-Conecta',
      produtor_id: null,
      timestamp: new Date().toISOString()
    };
    
    const response = await axios.post(N8N_WEBHOOK_URL, testMessage, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      message: 'N8N connection test successful',
      status: response.status,
      response: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    let errorInfo = {
      success: false,
      error: 'N8N connection test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    if (error.response) {
      errorInfo.status = error.response.status;
      errorInfo.responseData = error.response.data;
      
      if (error.response.status === 404) {
        errorInfo.solution = {
          step1: 'Acesse o n8n: https://wapp.conext.click',
          step2: 'Abra o workflow "Agroconecta Website"',
          step3: 'Clique no botão "Execute workflow" (botão vermelho)',
          step4: 'Isso registrará o webhook temporariamente',
          step5: 'Teste novamente este endpoint'
        };
      }
    } else if (error.code === 'ECONNABORTED') {
      errorInfo.message = 'Timeout - o n8n demorou mais de 10 segundos para responder';
    } else if (error.code === 'ENOTFOUND') {
      errorInfo.message = 'DNS não encontrado - verifique se a URL está correta';
    }
    
    res.status(500).json(errorInfo);
  }
});

// Endpoint de teste simples
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
