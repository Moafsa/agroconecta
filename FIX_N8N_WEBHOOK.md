# 🔧 Como Resolver o Problema do Chat com N8N

## 🚨 Problema Identificado

O chat da home está enviando mensagens para o n8n, mas não consegue lidar com a resposta porque:

1. **Webhook não registrado**: O erro 404 indica que o webhook "siteagroconecta" não está ativo
2. **Variável de ambiente**: N8N_WEBHOOK_URL não estava configurada no docker-compose.yml
3. **Workflow não executado**: O workflow do n8n precisa ser executado para registrar o webhook

## ✅ Soluções Implementadas

### 1. Configuração da Variável de Ambiente
- ✅ Adicionado `N8N_WEBHOOK_URL` no `docker-compose.yml`
- ✅ Adicionado exemplo no `env.example`
- ✅ Melhorado tratamento de erro 404 no backend

### 2. Endpoints de Debug
- ✅ `/api/debug/n8n-config` - Verifica configuração
- ✅ `/api/debug/n8n-test` - Testa conexão com n8n
- ✅ Script `test-n8n-webhook.js` para testes locais

### 3. Melhor Tratamento de Erros
- ✅ Mensagens mais claras para usuários
- ✅ Logs detalhados para debug
- ✅ Fallback quando n8n não está disponível

## 🚀 Como Resolver Agora

### Passo 1: Configurar a Variável de Ambiente
```bash
# No seu arquivo .env ou nas variáveis do Coolify
N8N_WEBHOOK_URL=https://wapp.conext.click/webhook-test/siteagroconecta
```

### Passo 2: Ativar o Webhook no N8N
1. Acesse: https://wapp.conext.click
2. Abra o workflow "Agroconecta Website"
3. **Clique no botão "Execute workflow" (botão vermelho)**
4. Isso registrará o webhook temporariamente

### Passo 3: Testar a Conexão
```bash
# Teste via API
curl https://api.agroconecta.conext.click/api/debug/n8n-test

# Ou teste localmente
cd backend
node scripts/test-n8n-webhook.js
```

### Passo 4: Reiniciar o Backend
```bash
# Se usando Docker
docker-compose restart backend

# Ou se usando Coolify, faça redeploy
```

## 🔍 Verificações

### 1. Verificar Configuração
```bash
curl https://api.agroconecta.conext.click/api/debug/n8n-config
```

### 2. Testar Chat
- Acesse: https://agroconecta.conext.click
- Vá para a seção de chat
- Envie uma mensagem de teste
- Deve receber resposta do assistente

## 🐛 Troubleshooting

### Erro 404 (Webhook não registrado)
- **Causa**: Workflow não foi executado
- **Solução**: Execute o workflow no n8n (botão vermelho)

### Erro de Timeout
- **Causa**: N8N demora para responder
- **Solução**: Verifique se o workflow está funcionando

### Erro de DNS
- **Causa**: URL incorreta
- **Solução**: Verifique se a URL do webhook está correta

## 📝 Logs Importantes

### Backend (Sucesso)
```
🔗 Resposta do n8n: [{"message": "Hello! How can I assist you today?"}]
```

### Backend (Erro 404)
```
❌ Erro HTTP do n8n: 404 {
  code: 404,
  message: 'The requested webhook "siteagroconecta" is not registered.'
}
```

## 🎯 Próximos Passos

1. **Configurar N8N_WEBHOOK_URL** nas variáveis de ambiente
2. **Executar o workflow** no n8n para ativar o webhook
3. **Testar o chat** na home
4. **Monitorar logs** para garantir funcionamento

## 📞 Suporte

Se o problema persistir:
1. Verifique os logs do backend
2. Teste a conexão com `/api/debug/n8n-test`
3. Confirme se o workflow está ativo no n8n
4. Verifique se a URL do webhook está correta
