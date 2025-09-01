# 🔧 FIX: Variáveis de Ambiente Coolify

## 🎯 Problema Atual:
```
access_token_not_found: O cabeçalho de autenticação 'access_token' é obrigatório e não foi encontrado
```

**Isso significa:** A variável `ASAAS_API_KEY` não está sendo lida pelo Node.js!

## 🔍 Possíveis Causas:

### 1. **Variável não configurada no Coolify**
- Não foi adicionada nas Environment Variables
- Nome incorreto da variável

### 2. **Formato incorreto no Coolify**
- Aspas extras: `"$aact_xxxx"`
- Espaços no nome: ` ASAAS_API_KEY`
- Valor vazio

### 3. **Redeploy necessário**
- Variável foi adicionada mas container não foi reiniciado

## ✅ Verificação Imediata:

### No Coolify:
1. **Ir para Environment Variables**
2. **Verificar se existe:** `ASAAS_API_KEY`
3. **Formato correto:**
   ```
   Nome: ASAAS_API_KEY
   Valor: $aact_YTU5YTE0M2M2N2I4NTlhYT...
   ```

### 4. **Também adicionar:**
```
ASAAS_ENVIRONMENT=sandbox
```

## 🚀 Ação Imediata:

1. **✅ Configurar variáveis** no Coolify
2. **🔄 Fazer redeploy** do backend  
3. **📋 Verificar logs** - vai aparecer:
   ```
   🔑 ASAAS_API_KEY configurada: ✅ Sim
   🌍 ASAAS_ENVIRONMENT: sandbox
   ```

## 🎯 Teste:
Após redeploy, tente registrar usuário novamente e verifique os logs!

