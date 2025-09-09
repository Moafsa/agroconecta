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

    console.log('🔗 Resposta completa do n8n:', JSON.stringify(n8nResponse.data, null, 2));
    console.log('🔗 Status do n8n:', n8nResponse.status);
    console.log('🔗 Headers do n8n:', n8nResponse.headers);

    // Processar resposta do n8n - tentar diferentes formatos possíveis
    let responseText = 'Mensagem recebida, processando...';
    
    if (n8nResponse.data) {
      console.log('🔗 Tipo de dados recebidos:', typeof n8nResponse.data);
      console.log('🔗 É array?', Array.isArray(n8nResponse.data));
      
      // Se for array, pegar o primeiro item
      let responseData = n8nResponse.data;
      if (Array.isArray(n8nResponse.data) && n8nResponse.data.length > 0) {
        responseData = n8nResponse.data[0];
        console.log('🔗 Primeiro item do array:', responseData);
      }
      
      console.log('🔗 Chaves disponíveis:', Object.keys(responseData));
      
      // Tentar diferentes campos onde a resposta pode estar
      // Baseado no fluxo n8n: output -> message
      responseText = responseData.message || 
                    responseData.response || 
                    responseData.text || 
                    responseData.output ||
                    responseData.result ||
                    responseData.reply ||
                    responseData.answer ||
                    (typeof responseData === 'string' ? responseData : responseText);
      
      console.log('🔗 Texto de resposta extraído:', responseText);
    }

    // Retornar a resposta do n8n para o frontend
    const finalResponse = {
      message: 'Mensagem processada com sucesso',
      response: responseText
    };
    
    console.log('📤 Resposta final enviada para o frontend:', JSON.stringify(finalResponse, null, 2));
    
    res.json(finalResponse);

  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error.message);
    console.error('❌ Erro completo:', error);
    
    // Se for erro de timeout ou conexão com n8n
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('❌ Erro de conexão com n8n:', error.code);
      return res.json({
        message: 'Erro de conexão',
        response: 'Desculpe, não consegui conectar com o assistente. Tente novamente em alguns instantes.'
      });
    }
    
    // Se for erro HTTP do n8n
    if (error.response) {
      console.error('❌ Erro HTTP do n8n:', error.response.status, error.response.data);
      
      // Se for erro 404 (webhook não registrado)
      if (error.response.status === 404) {
        return res.json({
          message: 'Webhook não registrado',
          response: 'O assistente está sendo configurado. Por favor, tente novamente em alguns instantes ou entre em contato conosco.'
        });
      }
      
      return res.json({
        message: 'Erro no processamento',
        response: 'O assistente está temporariamente indisponível. Nossa equipe foi notificada.'
      });
    }
    
    // Resposta de fallback genérica
    res.json({
      message: 'Mensagem recebida',
      response: 'Obrigado pela sua mensagem! Nossa equipe irá analisá-la e entrar em contato em breve.'
    });
  }
});

module.exports = router;

