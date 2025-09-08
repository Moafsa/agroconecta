const express = require('express');
const axios = require('axios');

const router = express.Router();

// Endpoint para receber mensagens do chat e enviar para o n8n
router.post('/message', async (req, res) => {
  try {
    const { message, produtor_id } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Mensagem é obrigatória' });
    }

    // URL do webhook do n8n (deve ser configurada via variável de ambiente)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return res.status(500).json({ 
        message: 'Webhook do n8n não configurado',
        response: 'Desculpe, o sistema está temporariamente indisponível. Tente novamente mais tarde.'
      });
    }

    // Enviar mensagem para o n8n
    const n8nResponse = await axios.post(n8nWebhookUrl, {
      message,
      produtor_id,
      timestamp: new Date().toISOString()
    }, {
      timeout: 10000 // 10 segundos de timeout
    });

    console.log('🔗 Resposta do n8n:', JSON.stringify(n8nResponse.data, null, 2));

    // Processar resposta do n8n - tentar diferentes formatos possíveis
    let responseText = 'Mensagem recebida, processando...';
    
    if (n8nResponse.data) {
      // Tentar diferentes campos onde a resposta pode estar
      responseText = n8nResponse.data.response || 
                    n8nResponse.data.message || 
                    n8nResponse.data.text || 
                    n8nResponse.data.output ||
                    n8nResponse.data.result ||
                    (typeof n8nResponse.data === 'string' ? n8nResponse.data : responseText);
    }

    // Retornar a resposta do n8n para o frontend
    res.json({
      message: 'Mensagem processada com sucesso',
      response: responseText
    });

  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    
    // Resposta de fallback caso o n8n não esteja disponível
    res.json({
      message: 'Mensagem recebida',
      response: 'Obrigado pela sua mensagem! Nossa equipe irá analisá-la e entrar em contato em breve.'
    });
  }
});

module.exports = router;

