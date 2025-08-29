# 🚀 Guia de Deploy - Agro-Conecta

## 📋 Checklist Pré-Deploy

- [ ] MongoDB Atlas configurado
- [ ] n8n instance configurada
- [ ] Domínios registrados
- [ ] SSL/TLS certificados
- [ ] Variáveis de ambiente de produção
- [ ] Testes locais aprovados

## 🗄️ Configuração do Banco de Dados

### MongoDB Atlas (Recomendado)

1. **Criar Cluster de Produção**
   ```bash
   # Acesse https://cloud.mongodb.com
   # Crie um cluster M2+ para produção (não use M0 em produção)
   # Escolha a região mais próxima dos usuários
   ```

2. **Configurar Usuário de Produção**
   ```bash
   # Database Access → Add New Database User
   # Username: agro_conecta_prod
   # Password: [senha forte gerada]
   # Role: Atlas Admin ou Read and write to any database
   ```

3. **Configurar Rede**
   ```bash
   # Network Access → Add IP Address
   # Adicionar IPs específicos:
   # - IP do servidor backend
   # - IP do servidor n8n
   # - IP do seu computador (para administração)
   ```

4. **String de Conexão**
   ```
   mongodb+srv://agro_conecta_prod:SENHA@cluster-prod.xxxxx.mongodb.net/agro_conecta_prod?retryWrites=true&w=majority
   ```

## 🔧 Deploy do Backend

### Opção 1: VPS/Servidor Dedicado

1. **Preparar Servidor**
   ```bash
   # Atualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Instalar Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Instalar PM2
   sudo npm install -g pm2
   
   # Instalar Nginx
   sudo apt install nginx -y
   ```

2. **Deploy da Aplicação**
   ```bash
   # Clonar repositório
   git clone <seu-repositorio> /var/www/agro-conecta
   cd /var/www/agro-conecta/backend
   
   # Instalar dependências
   npm install --production
   
   # Configurar variáveis de ambiente
   sudo nano .env
   ```

3. **Configurar PM2**
   ```bash
   # Criar arquivo ecosystem.config.js
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'agro-conecta-api',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   }
   EOF
   
   # Iniciar aplicação
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

4. **Configurar Nginx**
   ```bash
   # Criar configuração do site
   sudo nano /etc/nginx/sites-available/agro-conecta-api
   ```
   
   ```nginx
   server {
       listen 80;
       server_name api.seudominio.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Ativar site
   sudo ln -s /etc/nginx/sites-available/agro-conecta-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Configurar SSL com Let's Encrypt**
   ```bash
   # Instalar Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Obter certificado
   sudo certbot --nginx -d api.seudominio.com
   ```

### Opção 2: Heroku

1. **Preparar para Heroku**
   ```bash
   # Instalar Heroku CLI
   npm install -g heroku
   
   # Login
   heroku login
   
   # Criar app
   heroku create agro-conecta-api
   ```

2. **Configurar Variáveis**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="sua-string-mongodb"
   heroku config:set JWT_SECRET="seu-jwt-secret"
   heroku config:set N8N_WEBHOOK_URL="sua-url-n8n"
   ```

3. **Deploy**
   ```bash
   # No diretório backend/
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

## 🌐 Deploy do Frontend

### Opção 1: Netlify

1. **Build Local**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via CLI**
   ```bash
   # Instalar Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Configurar Variáveis**
   - Acesse o painel do Netlify
   - Vá em Site Settings → Environment Variables
   - Adicione: `VITE_API_URL=https://api.seudominio.com/api`

### Opção 2: Vercel

1. **Deploy via CLI**
   ```bash
   # Instalar Vercel CLI
   npm install -g vercel
   
   # No diretório frontend/
   vercel --prod
   ```

2. **Configurar Variáveis**
   ```bash
   vercel env add VITE_API_URL production
   # Digite: https://api.seudominio.com/api
   ```

### Opção 3: Servidor Próprio

1. **Build e Upload**
   ```bash
   # Build
   cd frontend
   npm run build
   
   # Upload para servidor
   scp -r dist/* user@servidor:/var/www/agro-conecta-frontend/
   ```

2. **Configurar Nginx**
   ```nginx
   server {
       listen 80;
       server_name app.seudominio.com;
       root /var/www/agro-conecta-frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache para assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

## 🤖 Configuração do n8n

### Instalação do n8n

1. **Via Docker (Recomendado)**
   ```bash
   # Criar docker-compose.yml
   cat > docker-compose.yml << EOF
   version: '3.8'
   services:
     n8n:
       image: n8nio/n8n
       restart: always
       ports:
         - "5678:5678"
       environment:
         - N8N_BASIC_AUTH_ACTIVE=true
         - N8N_BASIC_AUTH_USER=admin
         - N8N_BASIC_AUTH_PASSWORD=sua-senha-segura
         - WEBHOOK_URL=https://n8n.seudominio.com/
       volumes:
         - n8n_data:/home/node/.n8n
   volumes:
     n8n_data:
   EOF
   
   # Iniciar
   docker-compose up -d
   ```

2. **Configurar Proxy Reverso**
   ```nginx
   server {
       listen 80;
       server_name n8n.seudominio.com;
       
       location / {
           proxy_pass http://localhost:5678;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Configuração do Workflow n8n

1. **Criar Workflow de Chat**
   - Trigger: Webhook
   - URL: `https://n8n.seudominio.com/webhook/agro-conecta`
   - Método: POST

2. **Processar Mensagem**
   ```javascript
   // Node de processamento
   const mensagem = $json.message;
   const produtorId = $json.produtor_id;
   
   // Lógica de análise da mensagem
   // Buscar profissionais adequados
   // Retornar resposta
   
   return {
     response: "Sua resposta processada aqui"
   };
   ```

## 🔐 Configurações de Segurança

### 1. Firewall
```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000  # API (apenas se necessário)
```

### 2. Backup Automático
```bash
# Script de backup MongoDB
cat > /home/ubuntu/backup-mongo.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="sua-string-mongodb" --out="/backups/agro-conecta-$DATE"
find /backups -name "agro-conecta-*" -mtime +7 -delete
EOF

# Adicionar ao crontab
crontab -e
# Adicionar: 0 2 * * * /home/ubuntu/backup-mongo.sh
```

### 3. Monitoramento
```bash
# Instalar htop e iotop
sudo apt install htop iotop -y

# Configurar logs do PM2
pm2 install pm2-logrotate
```

## 📊 Monitoramento e Logs

### 1. Logs do Backend
```bash
# Ver logs em tempo real
pm2 logs agro-conecta-api

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Métricas do Sistema
```bash
# Status dos serviços
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod
```

### 3. Alertas (Opcional)
- Configurar alertas de uptime (UptimeRobot, Pingdom)
- Monitoramento de recursos (New Relic, DataDog)
- Alertas de erro (Sentry)

## 🔄 Processo de Atualização

### 1. Backend
```bash
# Backup antes da atualização
pm2 save

# Atualizar código
cd /var/www/agro-conecta/backend
git pull origin main
npm install --production

# Reiniciar aplicação
pm2 restart agro-conecta-api
```

### 2. Frontend
```bash
# Build nova versão
cd frontend
npm run build

# Upload para servidor/serviço
# (processo varia conforme plataforma)
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **API não responde**
   ```bash
   # Verificar status
   pm2 status
   
   # Verificar logs
   pm2 logs agro-conecta-api
   
   # Reiniciar se necessário
   pm2 restart agro-conecta-api
   ```

2. **Erro de conexão MongoDB**
   ```bash
   # Testar conexão
   mongo "sua-string-de-conexao"
   
   # Verificar IPs permitidos no Atlas
   # Verificar credenciais
   ```

3. **CORS errors**
   ```bash
   # Verificar configuração de CORS no backend
   # Confirmar URLs de origem
   ```

4. **SSL/HTTPS issues**
   ```bash
   # Renovar certificado
   sudo certbot renew
   
   # Verificar configuração Nginx
   sudo nginx -t
   ```

## 📞 Suporte Pós-Deploy

### Checklist Final
- [ ] Todas as URLs funcionando
- [ ] Chat enviando/recebendo mensagens
- [ ] Login/registro funcionando
- [ ] PWA instalável
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] SSL válido
- [ ] Performance otimizada

### Contatos de Emergência
- Provedor de hospedagem
- Suporte MongoDB Atlas
- Registrar de domínio
- Equipe de desenvolvimento

---

**Deploy realizado com sucesso! 🎉**

