# 🔍 DEBUG: Problema Real com API de Planos

## 🎯 **PROBLEMA IDENTIFICADO**

Você está certo - não é falta de planos no banco. O problema é mais sutil:

### **URLs Encontradas no Código:**

1. **Home.jsx** (público): `${API_BASE_URL}/planos`
   - Se VITE_API_URL = `https://api.agroconecta.conext.click/api`
   - Chama: `https://api.agroconecta.conext.click/api/planos` ✅

2. **AdminPlanos.jsx** (admin): Hardcoded `http://localhost:5001/api/admin/planos` ❌

### 🔧 **TESTES PARA IDENTIFICAR O PROBLEMA:**

Execute estes comandos no terminal do Coolify:

```bash
# 1. Testar diretamente no container
docker exec -it agro-conecta-backend curl http://localhost:5000/api/planos

# 2. Testar externamente
curl https://api.agroconecta.conext.click/api/planos

# 3. Verificar se há planos no banco
docker exec -it agro-conecta-backend bash
psql -h postgres -U agro_user -d agro_conecta -c "SELECT COUNT(*) FROM planos WHERE ativo = true;"

# 4. Verificar logs do backend para essa requisição
docker logs agro-conecta-backend | grep -i planos
```

### 🚨 **POSSÍVEIS CAUSAS:**

1. **Build do Frontend**: Se VITE_API_URL não foi configurada corretamente no build
2. **CORS**: Backend bloqueando requisições do frontend
3. **Roteamento**: Problema no path `/api/planos` 
4. **Cache**: Browser/CDN cacheando resposta 404

### 🔧 **SOLUÇÕES:**

#### **Solução 1: Verificar Build do Frontend**
```bash
# Verificar variáveis de ambiente no build
docker exec -it agro-conecta-frontend env | grep API

# Verificar arquivos buildados
docker exec -it agro-conecta-frontend cat /usr/share/nginx/html/assets/*.js | grep -i "api.agroconecta"
```

#### **Solução 2: Rebuild Frontend com Variável Correta**
```bash
# Rebuild frontend com variável explícita
docker-compose -f docker-compose.debug.yml build --no-cache frontend \
  --build-arg VITE_API_URL=https://api.agroconecta.conext.click/api

# Restart
docker-compose -f docker-compose.debug.yml up -d frontend
```

#### **Solução 3: Verificar CORS no Backend**
```bash
# Ver logs de CORS
docker logs agro-conecta-backend | grep -i cors

# Testar com headers CORS
curl -H "Origin: https://agroconecta.conext.click" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.agroconecta.conext.click/api/planos
```

### 🎯 **DEBUGGING ESPECÍFICO:**

No DevTools do browser (F12), execute:

```javascript
// 1. Verificar URL sendo usada
console.log('API_BASE_URL:', window.location.origin);

// 2. Testar chamada manual
fetch('https://api.agroconecta.conext.click/api/planos')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// 3. Verificar headers da resposta
fetch('https://api.agroconecta.conext.click/api/planos')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
    return r.text();
  })
  .then(console.log);
```

### 🔍 **RÁPIDO CHECK:**

Execute primeiro este teste simples:

```bash
# Se este funcionar, o problema é no frontend:
curl -v https://api.agroconecta.conext.click/api/planos

# Se retornar dados, o problema é CORS ou build do frontend
# Se retornar 404, o problema é no backend/roteamento
```

---

## 📞 **PRÓXIMOS PASSOS:**

1. **Execute o "RÁPIDO CHECK" acima primeiro**
2. **Se curl funcionar**: Problema é no frontend (rebuild necessário)
3. **Se curl não funcionar**: Problema é no backend (roteamento/dados)

**Me diga o resultado do curl para eu dar a próxima solução específica!** 🎯
