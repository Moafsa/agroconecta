# 🔗 Configuração n8n + AgroConecta no Coolify

## 📋 Comandos para Terminal do Coolify

### 1. 🚀 Deploy com Nova Configuração

```bash
# 1. Parar os containers atuais
docker-compose down

# 2. Rebuild e iniciar com nova configuração
docker-compose up -d --build

# 3. Verificar se os containers estão rodando
docker-compose ps

# 4. Verificar logs do PostgreSQL
docker-compose logs postgres

# 5. Verificar se a porta 5432 está exposta
docker port agro-conecta-db 5432
```

### 2. 🔧 Configurar Usuário n8n (Executar dentro do container backend)

```bash
# Entrar no container do backend
docker-compose exec backend bash

# Executar script de configuração do usuário n8n
cd /app
node scripts/setup-n8n-user.js

# Sair do container
exit
```

### 3. 🔍 Verificar Conectividade Externa

```bash
# Testar conexão PostgreSQL de fora do container
# (Execute este comando no servidor Coolify, fora dos containers)

# Instalar cliente PostgreSQL se necessário
apt-get update && apt-get install -y postgresql-client

# Testar conexão local
psql -h localhost -p 5432 -U agro_user -d agro_conecta -c "SELECT version();"

# Testar conexão com usuário n8n
psql -h localhost -p 5432 -U n8n_user -d agro_conecta -c "SELECT COUNT(*) FROM profissionais;"
```

### 4. 🛡️ Configurar Firewall (Se necessário)

```bash
# Verificar status do firewall
ufw status

# Permitir conexões na porta 5432 (PostgreSQL)
ufw allow 5432/tcp

# Verificar se a regra foi adicionada
ufw status numbered

# Opcional: Restringir acesso apenas ao IP do n8n
# ufw allow from [IP_DO_N8N] to any port 5432
```

### 5. 🔄 Comandos de Manutenção

```bash
# Reiniciar apenas o PostgreSQL
docker-compose restart postgres

# Ver logs em tempo real
docker-compose logs -f postgres

# Backup do banco de dados
docker-compose exec postgres pg_dump -U agro_user agro_conecta > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup (se necessário)
# docker-compose exec -T postgres psql -U agro_user agro_conecta < backup_file.sql
```

## 🔐 Variáveis de Ambiente Necessárias

Adicione estas variáveis no painel do Coolify:

```env
# Senha do PostgreSQL (já existente)
POSTGRES_PASSWORD=sua_senha_postgresql_segura

# Nova variável para usuário n8n
N8N_DB_PASSWORD=n8n_secure_password_2024

# Host do banco (para referência)
DB_HOST=65.109.224.186
```

## 📊 Dados de Conexão para n8n

### Conexão Principal (Usuário Admin)
```
Host: 65.109.224.186
Port: 5432
Database: agro_conecta
User: agro_user
Password: [POSTGRES_PASSWORD do seu .env]
SSL Mode: prefer
```

### Conexão Limitada (Usuário n8n - Recomendado)
```
Host: 65.109.224.186
Port: 5432
Database: agro_conecta
User: n8n_user
Password: n8n_secure_password_2024
SSL Mode: prefer
```

## 🧪 Teste de Conexão

### Query de Teste Simples
```sql
-- Verificar se a conexão funciona
SELECT 
  'AgroConecta DB Connected!' as status,
  NOW() as timestamp,
  version() as postgresql_version;
```

### Queries Úteis para n8n
```sql
-- 1. Profissionais ativos
SELECT id, nome, email, regiao_atuacao, status_assinatura 
FROM profissionais 
WHERE status_assinatura = 'ATIVO' 
LIMIT 10;

-- 2. Interações recentes
SELECT i.id, p.nome as produtor, i.mensagem_inicial, i.data_interacao
FROM interacoes i
JOIN produtores p ON i.produtor_id = p.id
WHERE i.data_interacao >= NOW() - INTERVAL '24 hours'
ORDER BY i.data_interacao DESC;

-- 3. Estatísticas gerais
SELECT 
  (SELECT COUNT(*) FROM profissionais WHERE status_assinatura = 'ATIVO') as profissionais_ativos,
  (SELECT COUNT(*) FROM clientes WHERE status_assinatura = 'ATIVO') as clientes_ativos,
  (SELECT COUNT(*) FROM interacoes WHERE data_interacao >= CURRENT_DATE) as interacoes_hoje;
```

## ⚠️ Considerações de Segurança

### 1. Restrição de IP (Recomendado)
```bash
# Permitir apenas IP específico do n8n
ufw delete allow 5432/tcp
ufw allow from [IP_DO_N8N] to any port 5432
```

### 2. Monitoramento de Conexões
```sql
-- Ver conexões ativas
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  client_port,
  backend_start,
  state
FROM pg_stat_activity
WHERE datname = 'agro_conecta';
```

### 3. Logs de Auditoria
```bash
# Verificar logs de conexão PostgreSQL
docker-compose exec postgres tail -f /var/lib/postgresql/data/log/postgresql-*.log
```

## 🔧 Troubleshooting

### Problema: Conexão Recusada
```bash
# Verificar se o container está rodando
docker-compose ps

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Verificar se a porta está exposta
netstat -tlnp | grep 5432
```

### Problema: Autenticação Falhou
```bash
# Verificar usuários no PostgreSQL
docker-compose exec postgres psql -U agro_user -d agro_conecta -c "\du"

# Recriar usuário n8n se necessário
docker-compose exec backend node scripts/setup-n8n-user.js
```

### Problema: Firewall Bloqueando
```bash
# Verificar regras do firewall
ufw status verbose

# Testar conectividade
telnet 65.109.224.186 5432
```

## 📞 Comandos de Emergência

```bash
# Parar tudo
docker-compose down

# Limpar volumes (CUIDADO: Remove dados!)
# docker-compose down -v

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d

# Verificar saúde dos containers
docker-compose exec backend curl -f http://localhost:5000/health || echo "Backend não está saudável"
docker-compose exec postgres pg_isready -U agro_user || echo "PostgreSQL não está pronto"
```

---

## ✅ Checklist Pós-Configuração

- [ ] Docker containers rodando (`docker-compose ps`)
- [ ] PostgreSQL acessível externamente (`telnet 65.109.224.186 5432`)
- [ ] Usuário n8n criado (`psql -h localhost -U n8n_user -d agro_conecta`)
- [ ] Firewall configurado (`ufw status`)
- [ ] Conexão n8n testada
- [ ] Queries de teste funcionando
- [ ] Logs sem erros críticos

**🎉 Configuração concluída! Seu banco AgroConecta está pronto para conectar com n8n.**
