# 🔒 Guia de Segurança - Agro Conecta

## ⚠️ IMPORTANTE: Configuração de Produção

### Chaves de API e Variáveis de Ambiente

**NUNCA** commite chaves de API reais no código! Use sempre variáveis de ambiente.

#### Para Desenvolvimento:
- O sistema usa uma chave de teste do Asaas sandbox
- Esta chave é segura para desenvolvimento e testes
- Não funciona em produção

#### Para Produção:
1. **Configure as variáveis de ambiente** no servidor:
   ```bash
   ASAAS_API_KEY=sua_chave_real_de_producao
   ASAAS_ENVIRONMENT=production
   ```

2. **Use um gerenciador de secrets** como:
   - Docker Secrets
   - Kubernetes Secrets
   - AWS Secrets Manager
   - Azure Key Vault

3. **Nunca** coloque chaves reais em:
   - Código fonte
   - Arquivos de configuração versionados
   - Logs
   - Mensagens de commit

### Configuração Segura do Docker

#### Desenvolvimento:
```yaml
# docker-compose.yml
environment:
  ASAAS_API_KEY: ${ASAAS_API_KEY}  # Carrega do .env
```

#### Produção:
```yaml
# docker-compose.prod.yml
secrets:
  asaas_api_key:
    external: true
environment:
  ASAAS_API_KEY_FILE: /run/secrets/asaas_api_key
```

### Checklist de Segurança

- [ ] ✅ Chaves de API em variáveis de ambiente
- [ ] ✅ Arquivo .env no .gitignore
- [ ] ✅ Chaves de produção nunca no código
- [ ] ✅ Logs não expõem informações sensíveis
- [ ] ✅ HTTPS em produção
- [ ] ✅ Validação de entrada em todas as APIs
- [ ] ✅ Rate limiting implementado
- [ ] ✅ CORS configurado corretamente

### Monitoramento

- Monitore tentativas de acesso não autorizado
- Configure alertas para falhas de autenticação
- Mantenha logs de auditoria
- Revise permissões regularmente

### Contato de Segurança

Para reportar vulnerabilidades de segurança, entre em contato com a equipe de desenvolvimento.

---

**Lembre-se**: Segurança é responsabilidade de todos! 🛡️
