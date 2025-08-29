## Estrutura do Frontend (React) para Agro-Conecta

### Componentes Principais

- `App.js`: Componente raiz que gerencia o roteamento e o estado global.
- `AuthContext.js`: Contexto para gerenciar o estado de autenticação do profissional.

### Área do Produtor Rural (Sem Autenticação)

- `pages/ProducerChat.js`: Página principal do chat para o produtor.
  - `components/ChatWindow.js`: Exibe as mensagens.
  - `components/MessageInput.js`: Campo para digitar e enviar mensagens.

### Área do Profissional do Agro (Requer Autenticação)

- `pages/ProfessionalLogin.js`: Página de login do profissional.
- `pages/ProfessionalRegister.js`: Página de registro do profissional.
- `pages/ProfessionalProfile.js`: Página para visualização e edição do perfil do profissional.
  - `components/ProfileForm.js`: Formulário para CRUD de perfil.
  - `components/SpecialtyTags.js`: Componente para gerenciar tags de especialidades.
  - `components/AvailabilityScheduler.js`: Interface para gerenciar agenda/disponibilidade.
- `pages/ProfessionalDashboard.js`: Dashboard do profissional.
  - `components/AppointmentsList.js`: Lista de agendamentos.
  - `components/HistoryList.js`: Histórico de atendimentos.
- `pages/SubscriptionManagement.js`: Página para gestão de assinatura.

### Componentes Compartilhados

- `components/Header.js`: Cabeçalho da aplicação.
- `components/Footer.js`: Rodapé da aplicação.
- `components/LoadingSpinner.js`: Indicador de carregamento.
- `components/AlertDialog.js`: Componente para exibir mensagens de alerta/erro.

### Estrutura de Pastas

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── App.js
│   ├── index.js
│   ├── AuthContext.js
│   ├── api/
│   │   └── professionalApi.js (funções para interagir com a API do backend)
│   ├── components/
│   │   ├── ChatWindow.js
│   │   ├── MessageInput.js
│   │   ├── ProfileForm.js
│   │   ├── SpecialtyTags.js
│   │   ├── AvailabilityScheduler.js
│   │   ├── AppointmentsList.js
│   │   ├── HistoryList.js
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── LoadingSpinner.js
│   │   └── AlertDialog.js
│   ├── pages/
│   │   ├── ProducerChat.js
│   │   ├── ProfessionalLogin.js
│   │   ├── ProfessionalRegister.js
│   │   ├── ProfessionalProfile.js
│   │   ├── ProfessionalDashboard.js
│   │   └── SubscriptionManagement.js
│   └── styles/
│       └── App.css (ou outros arquivos CSS/SCSS)
└── package.json
```


