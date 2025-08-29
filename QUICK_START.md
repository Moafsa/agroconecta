# 🚀 Quick Start - Agro Conecta Docker

## Setup Rápido (5 minutos)

### 1. Pré-requisitos
- Docker Desktop instalado e rodando
- Git instalado

### 2. Configurar Ambiente
```bash
# Copiar arquivo de exemplo
copy env.example .env

# Editar .env com suas configurações
notepad .env
```

### 3. Iniciar Sistema
```bash
# Executar script de startup
start-docker.bat
```

### 4. Acessar Aplicação
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:5001
- **Database**: localhost:5433

## Comandos Úteis

### Verificar Saúde do Sistema
```bash
check-health.bat
```

### Parar Sistema
```bash
stop-docker.bat
```

### Ver Logs
```bash
docker-compose logs -f
```

### Rebuild (após mudanças)
```bash
docker-compose up --build -d
```

## Estrutura do Sistema

```
📁 agro-conecta/
├── 🐳 docker-compose.yml     # Orquestração dos serviços
├── 🚀 start-docker.bat       # Iniciar sistema
├── 🛑 stop-docker.bat        # Parar sistema
├── ✅ check-health.bat       # Verificar saúde
├── 📝 env.example           # Variáveis de ambiente
├── 📁 backend/              # API Node.js + Prisma
├── 📁 frontend/             # React + Vite
└── 📚 DOCKER_README.md      # Documentação completa
```

## Serviços

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Frontend | 3002 | React + Vite |
| Backend | 5000 | Node.js + Express |
| Database | 5432 | PostgreSQL |

## Troubleshooting

### Problema: Porta já em uso
```bash
# Verificar processos
netstat -ano | findstr :3002
netstat -ano | findstr :5001

# Matar processo se necessário
taskkill /PID <process_id> /F
```

### Problema: Docker não inicia
- Verificar se Docker Desktop está rodando
- Reiniciar Docker Desktop
- Verificar recursos do Docker (CPU/Memory)

### Problema: Banco não conecta
```bash
# Verificar logs do banco
docker-compose logs postgres

# Reiniciar apenas o banco
docker-compose restart postgres
```

## Próximos Passos

1. Configure suas credenciais no arquivo `.env`
2. Teste o sistema acessando http://localhost:3002
3. Verifique os logs se houver problemas
4. Consulte `DOCKER_README.md` para documentação completa

## Suporte

Se encontrar problemas:
1. Execute `check-health.bat`
2. Verifique os logs: `docker-compose logs -f`
3. Consulte a documentação completa em `DOCKER_README.md`
