# 🚨 URGENTE: Chave API Asaas Inválida

## ✅ Problema Identificado:
```
Erro ao criar cliente no Asaas: {
  errors: [
    {
      code: 'invalid_access_token',
      description: 'A chave de API fornecida é inválida'
    }
  ]
}
```

## 🔧 Solução Imediata:

### 1. **Verificar Chave API no Coolify**

No painel do Coolify:
1. **Vá para seu projeto AgroConecta**
2. **Clique em "Environment Variables"**
3. **Procure por `ASAAS_API_KEY`**

### 2. **Formato Correto da Chave:**

A chave deve estar no formato:
```
ASAAS_API_KEY=$aact_YTU5YTE0M2M2N2I4NTlhYT...
```

**❌ Formatos Incorretos:**
- Sem o prefixo `$aact_`
- Com aspas extras
- Espaços no início/fim
- Chave de produção em ambiente sandbox

### 3. **Onde Encontrar a Chave Correta:**

1. **Entre na sua conta Asaas** (sandbox): https://sandbox.asaas.com
2. **Vá em Configurações > Integrações**
3. **Copie a chave API** (deve começar com `$aact_`)

### 4. **Configurar no Coolify:**

```bash
# Adicionar/Atualizar a variável:
ASAAS_API_KEY=$aact_SUA_CHAVE_AQUI
ASAAS_ENVIRONMENT=sandbox
```

### 5. **Redeploy Obrigatório:**

Após configurar a chave:
1. **Salvar as variáveis** no Coolify
2. **Fazer redeploy** do container backend
3. **Aguardar 1-2 minutos**
4. **Testar registro novamente**

## 🎯 Ação Imediata:
1. Verificar `ASAAS_API_KEY` no Coolify
2. Corrigir se necessário  
3. Redeploy
4. Testar pagamento

**Este é o problema!** 🚀
