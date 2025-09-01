# 🚨 EMERGENCY: Asaas API Debug

## Problema Identificado: 
- **Erro 500** durante criação de pagamento
- **API Request Error** nos logs do browser
- Possivelmente configuração incorreta do Asaas

## 🔍 Possíveis Causas:

### 1. **Chave API Inválida ou Expirada**
```bash
# No Coolify, verificar se ASAAS_API_KEY está configurada
echo $ASAAS_API_KEY
```

### 2. **Ambiente Incorreto (Sandbox vs Production)**
```bash
# Verificar ambiente
echo $ASAAS_ENVIRONMENT
```

### 3. **Headers da API Asaas Incorretos**
- Header deve ser: `access_token` (não `Authorization`)
- Formato correto: `'access_token': '$aact_YTU5YTE0M2M2N2I4NTlhYT...'`

## 🔧 Soluções Urgentes:

### OPÇÃO 1: Reiniciar Container Backend
```bash
# No terminal do Coolify
docker container restart backend-XXXXX
```

### OPÇÃO 2: Verificar Logs do Backend
```bash
# Abrir logs do container backend e procurar:
# - "Erro ao criar assinatura no Asaas:"
# - Detalhes do erro da API
```

### OPÇÃO 3: Testar API Asaas Manualmente
```bash
# No container backend:
curl -X GET \
  https://sandbox.asaas.com/api/v3/customers \
  -H "access_token: $ASAAS_API_KEY" \
  -H "Content-Type: application/json"
```

## 📋 Checklist Imediato:

- [ ] Verificar ASAAS_API_KEY no Coolify
- [ ] Confirmar ASAAS_ENVIRONMENT=sandbox
- [ ] Checar logs detalhados do backend
- [ ] Testar conectividade da API Asaas
- [ ] Verificar se conta Asaas não está suspensa

## 🚀 Ação Imediata:
**Preciso que você:**
1. **Abra os logs do container backend** no Coolify
2. **Tente registrar um usuário novamente**
3. **Me envie o erro específico** que aparece nos logs
