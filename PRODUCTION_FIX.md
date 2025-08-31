# 🚨 Fix para Problema de Produção - AgroConecta

## 🔍 Problema Identificado

O erro "Erro interno do servidor ao processar a assinatura" está ocorrendo porque:

1. **URL da API incorreta**: Frontend está tentando acessar `localhost:5001` em vez de `api.agroconecta.conext.click`
2. **Configuração de portas**: Inconsistência entre as portas configuradas
3. **Variáveis de ambiente**: VITE_API_URL não está configurada corretamente no Coolify

## 🔧 Correções Aplicadas

### 1. Frontend API Configuration
✅ **Arquivo**: `frontend/src/config/api.js`
```javascript
// ANTES (problemático)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// DEPOIS (corrigido)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 2. Docker Compose Configuration
✅ **Arquivo**: `docker-compose.yml`
- Adicionada configuração CORS específica para produção
- Exposta porta 5000 do backend temporariamente para debug
- Adicionada variável CORS_ORIGINS

## 📋 Comandos para Aplicar no Coolify

### Passo 1: Atualizar Variáveis de Ambiente no Coolify

No painel do Coolify, adicione/atualize estas variáveis:

```env
# Frontend - CRÍTICO: Corrigir esta variável
VITE_API_URL=https://api.agroconecta.conext.click/api

# Backend (verificar se existem)
POSTGRES_PASSWORD=sua_senha_postgresql_segura
JWT_SECRET=seu_jwt_secret_super_seguro
ASAAS_API_KEY=sua_chave_asaas_producao
ASAAS_ENVIRONMENT=production

# Nova variável para CORS
CORS_ORIGINS=https://agroconecta.conext.click,https://www.agroconecta.conext.click
```

### Passo 2: Rebuild e Deploy

```bash
# 1. Parar containers atuais
docker-compose down

# 2. Limpar cache do Docker (opcional, mas recomendado)
docker system prune -f

# 3. Rebuild com as novas configurações
docker-compose build --no-cache

# 4. Iniciar com as novas configurações
docker-compose up -d

# 5. Verificar se os containers estão rodando
docker-compose ps

# 6. Verificar logs do backend
docker-compose logs -f backend
```

### Passo 3: Verificar Conectividade

```bash
# Testar se o backend está respondendo
curl -f https://api.agroconecta.conext.click/api/health

# Verificar se a rota de assinaturas está funcionando
curl -f https://api.agroconecta.conext.click/api/planos-publicos/listar
```

## 🔍 Debug Específico do Erro

### Verificar Logs do Backend
```bash
# Ver logs em tempo real
docker-compose logs -f backend

# Ver logs específicos da rota de assinaturas
docker-compose logs backend | grep "assinatura\|pagamento-direto"
```

### Testar Endpoint Específico
```bash
# Testar a rota que está falhando (substitua pelo token real)
curl -X POST https://api.agroconecta.conext.click/api/assinaturas/pagamento-direto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"planoId": "PLANO_ID", "billingType": "PIX"}'
```

## 🚨 Verificações Críticas no Coolify

### 1. Configuração de Domínios
Certifique-se de que no Coolify esteja configurado:
- **Frontend**: `agroconecta.conext.click`
- **Backend**: `api.agroconecta.conext.click`

### 2. Variável VITE_API_URL
**CRÍTICO**: Esta variável DEVE estar configurada como:
```
VITE_API_URL=https://api.agroconecta.conext.click/api
```

### 3. SSL/HTTPS
Verifique se ambos os domínios têm SSL ativo no Coolify.

## 🔄 Rollback (Se Necessário)

Se algo der errado, para fazer rollback:

```bash
# Voltar para a versão anterior
git checkout HEAD~1 -- frontend/src/config/api.js docker-compose.yml

# Rebuild
docker-compose down
docker-compose up -d --build
```

## 📊 Monitoramento Pós-Fix

### 1. Verificar Registro de Usuário
- Testar criação de novo usuário
- Verificar se o pagamento é gerado corretamente
- Confirmar se a URL de checkout é válida

### 2. Logs para Monitorar
```bash
# Logs de erro
docker-compose logs backend | grep -i error

# Logs de assinatura
docker-compose logs backend | grep -i assinatura

# Logs de pagamento
docker-compose logs backend | grep -i pagamento
```

### 3. Health Check
```bash
# Verificar saúde do sistema
curl https://api.agroconecta.conext.click/api/health

# Deve retornar algo como:
# {"message":"API Agro-Conecta funcionando!","timestamp":"...","environment":"production"}
```

## ⚡ Script de Deploy Rápido

```bash
#!/bin/bash
echo "🚀 Iniciando deploy de correção AgroConecta..."

# Parar containers
echo "📦 Parando containers..."
docker-compose down

# Limpar cache
echo "🧹 Limpando cache Docker..."
docker system prune -f

# Rebuild
echo "🔨 Rebuilding containers..."
docker-compose build --no-cache

# Iniciar
echo "▶️ Iniciando containers..."
docker-compose up -d

# Verificar status
echo "✅ Verificando status..."
sleep 10
docker-compose ps

echo "🎉 Deploy concluído!"
echo "🔍 Verificar logs: docker-compose logs -f backend"
echo "🌐 Testar: curl https://api.agroconecta.conext.click/api/health"
```

## 📞 Próximos Passos

1. **Aplicar as correções no Coolify**
2. **Testar o registro de usuário**
3. **Verificar se o pagamento funciona**
4. **Monitorar logs por 24h**
5. **Remover a exposição da porta 5000 se tudo estiver funcionando**

---

**⚠️ IMPORTANTE**: Após confirmar que tudo está funcionando, remova a linha `ports: - "5000:5000"` do docker-compose.yml para manter a segurança.
