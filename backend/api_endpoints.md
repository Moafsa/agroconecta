## Endpoints da API REST para Agro-Conecta

### Autenticação (para Profissionais)

- `POST /api/auth/register`
  - **Descrição**: Registra um novo profissional.
  - **Corpo da Requisição**: `{ nome, email, senha, contato, foto, especialidades, regiao_atuacao }`
  - **Resposta**: `{ message: "Profissional registrado com sucesso", profissional: { _id, email } }`

- `POST /api/auth/login`
  - **Descrição**: Autentica um profissional e retorna um token JWT.
  - **Corpo da Requisição**: `{ email, senha }`
  - **Resposta**: `{ token: "<jwt_token>", profissional: { _id, email, nome } }`

### Gestão de Perfil de Profissional (CRUD)

- `POST /api/profissionais`
  - **Descrição**: Cria um novo perfil de profissional (usado após o registro).
  - **Corpo da Requisição**: `{ nome, email, contato, foto, especialidades, regiao_atuacao, agenda_disponibilidade }`
  - **Resposta**: `{ message: "Perfil criado com sucesso", profissional: { _id, ... } }`
  - **Autenticação**: Requer token JWT.

- `PUT /api/profissionais/:id`
  - **Descrição**: Atualiza um perfil de profissional existente.
  - **Parâmetros**: `id` (ID do profissional)
  - **Corpo da Requisição**: `{ nome?, email?, contato?, foto?, especialidades?, regiao_atuacao?, agenda_disponibilidade? }` (campos opcionais)
  - **Resposta**: `{ message: "Perfil atualizado com sucesso", profissional: { _id, ... } }`
  - **Autenticação**: Requer token JWT.

- `GET /api/profissionais/:id`
  - **Descrição**: Busca os dados de um perfil de profissional específico.
  - **Parâmetros**: `id` (ID do profissional)
  - **Resposta**: `{ profissional: { _id, ... } }`
  - **Autenticação**: Requer token JWT.

### Produtores (CRUD Básico - Gerenciado principalmente pelo n8n)

- `POST /api/produtores`
  - **Descrição**: Cria um novo produtor (pode ser usado pelo n8n ou pelo frontend para registrar um novo usuário que inicia o chat).
  - **Corpo da Requisição**: `{ nome, contato }`
  - **Resposta**: `{ message: "Produtor criado com sucesso", produtor: { _id, ... } }`

- `GET /api/produtores/:id`
  - **Descrição**: Busca os dados de um produtor específico.
  - **Parâmetros**: `id` (ID do produtor)
  - **Resposta**: `{ produtor: { _id, ... } }`

### Interações (Gerenciado Principalmente pelo n8n)

- `POST /api/interacoes`
  - **Descrição**: Registra uma nova interação (usado pelo n8n).
  - **Corpo da Requisição**: `{ produtor_id, mensagem_inicial, status, dor_cliente }`
  - **Resposta**: `{ message: "Interação registrada com sucesso", interacao: { _id, ... } }`

- `PUT /api/interacoes/:id`
  - **Descrição**: Atualiza o status de uma interação (usado pelo n8n).
  - **Parâmetros**: `id` (ID da interação)
  - **Corpo da Requisição**: `{ status?, profissional_id?, historico_mensagens? }`
  - **Resposta**: `{ message: "Interação atualizada com sucesso", interacao: { _id, ... } }`


