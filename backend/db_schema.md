## Esquema do Banco de Dados MongoDB para Agro-Conecta

### Coleção: `profissionais`

- `_id`: ObjectId (Chave primária)
- `nome`: String (Nome completo do profissional)
- `email`: String (Email, único, para login)
- `senha`: String (Hash da senha)
- `contato`: String (Telefone ou outro contato)
- `foto`: String (URL da foto de perfil)
- `especialidades`: Array de Strings (Tags de especialidades, ex: ["Agronomia", "Zootecnia"])
- `regiao_atuacao`: String (Região geográfica de atuação)
- `agenda_disponibilidade`: Array de Objetos (Ex: [{dia: "Segunda", horarios: ["09:00-12:00", "14:00-18:00"]}] ou um formato mais complexo para integração com n8n)
- `avaliacoes`: Array de Objetos (Ex: [{produtor_id: ObjectId, nota: Number, comentario: String, data: Date}])
- `status_assinatura`: String (Ex: "ativo", "inativo", "pendente")
- `data_cadastro`: Date
- `data_atualizacao`: Date

### Coleção: `produtores`

- `_id`: ObjectId (Chave primária)
- `nome`: String (Nome do produtor)
- `contato`: String (Telefone ou outro contato)
- `data_cadastro`: Date

### Coleção: `interacoes`

- `_id`: ObjectId (Chave primária)
- `produtor_id`: ObjectId (Referência ao produtor que iniciou a interação)
- `profissional_id`: ObjectId (Referência ao profissional envolvido, se houver)
- `mensagem_inicial`: String (Mensagem original do produtor)
- `status`: String (Ex: "agendado", "concluido", "em_andamento", "cancelado")
- `dor_cliente`: String (Descrição da "dor" ou problema do cliente, extraída pelo n8n)
- `data_interacao`: Date
- `historico_mensagens`: Array de Objetos (Log de mensagens trocadas, se aplicável, gerenciado pelo n8n)


