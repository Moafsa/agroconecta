# 🔧 CORREÇÃO: Erro 500 no Pagamento (Assinatura)

## 🎯 **PROBLEMA IDENTIFICADO**

✅ **Planos funcionando** - Problema resolvido!  
❌ **Erro 500**: `POST /api/assinaturas/pagamento-direto` - "Erro interno do servidor ao processar a assinatura"

## 🔍 **POSSÍVEIS CAUSAS DO ERRO 500:**

### **1. Problema na API do Asaas** 
- Chave API inválida ou ambiente errado
- Sandbox vs Produção

### **2. Problema no Banco de Dados**
- Relação entre tabelas
- Campo obrigatório faltando

### **3. Problema de Autenticação**
- Token JWT inválido
- Usuário não encontrado

## 🚀 **DEBUGGING ESPECÍFICO**

### **Passo 1: Verificar Logs do Backend**

No terminal do Coolify, **selecione o container backend** e execute:

```bash
# Ver logs recentes do erro
tail -50 /app/logs/* 2>/dev/null || echo "Sem arquivo de log específico"

# Ver logs do Docker (mais provável)
exit
```

Depois saia do terminal e **vá para "Logs"** na interface do Coolify e procure por:
- `Erro no processo de criação de assinatura`
- `ASAAS_API_KEY`
- `prisma`

### **Passo 2: Testar Variáveis de Ambiente**

**No container backend**, execute:

```bash
# Verificar se as variáveis críticas estão configuradas
echo "ASAAS_API_KEY: ${ASAAS_API_KEY:0:10}..."
echo "ASAAS_ENVIRONMENT: $ASAAS_ENVIRONMENT"
echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
```

### **Passo 3: Testar Conexão com Asaas**

**No container backend**, execute:

```bash
# Testar API do Asaas
curl -X GET "https://www.asaas.com/api/v3/customers" \
  -H "access_token: $ASAAS_API_KEY" \
  -H "Content-Type: application/json"
```

## 🔧 **SOLUÇÕES MAIS PROVÁVEIS:**

### **Solução 1: Verificar Chave Asaas**

O erro mais comum é a chave do Asaas estar errada. **No painel do Coolify:**

1. **Vá para "Configuration"**
2. **Procure por "Environment Variables"**
3. **Verifique:**
   - `ASAAS_API_KEY` - Deve começar com `$aact_` para produção ou sandbox
   - `ASAAS_ENVIRONMENT=production` ou `sandbox`

### **Solução 2: Problema de Schema do Banco**

**No container backend**, execute:

```bash
# Verificar se as tabelas existem
npx prisma db push
npx prisma db seed
```

### **Solução 3: Verificar Autenticação**

O erro pode ser que o usuário não está autenticado. **Teste no DevTools (F12):**

```javascript
// Verificar se tem token
console.log('Token:', localStorage.getItem('token'));

// Testar login primeiro
fetch('https://api.agroconecta.conext.click/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log);
```

## 🎯 **TESTE RÁPIDO:**

Execute este teste primeiro para identificar o problema:

**No container backend:**

```bash
# Teste simples da rota sem autenticação
curl -X POST http://localhost:5000/api/health
```

Se o health funcionar mas o pagamento não, é problema específico do Asaas ou autenticação.

## 📊 **ERRO MANIFEST.JSON**

O erro `Manifest: Line: 1, column: 1, Syntax error` é secundário - é só um arquivo PWA. Pode ignorar por agora.

---

## 📞 **PRÓXIMOS PASSOS:**

1. **Execute o Passo 1** (verificar logs)
2. **Execute o Passo 2** (verificar variáveis)
3. **Me diga o resultado** para eu dar a solução específica

**O problema é provavel na configuração do Asaas ou autenticação!** 🎯
