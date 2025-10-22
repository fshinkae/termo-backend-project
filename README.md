# Termo Backend Project

Backend desenvolvido com Node.js, Express e SQLite.

## Estrutura do Projeto

```
src/
├── server.js          # Arquivo principal
├── routes/            # Rotas da API
├── controllers/       # Controladores
├── models/            # Modelos de dados
├── middlewares/       # Middlewares customizados
├── config/            # Configurações (database, seed)
└── utils/             # Utilitários
data/                  # Banco de dados SQLite
```

## Modelo de Dados

### Users
- User_Id (PK)
- Nickname (UNIQUE)
- Email (UNIQUE)
- Password (hash bcrypt)
- Status_ID (FK → Status)
- Avatar
- History_ID (FK → History, NULL até primeiro jogo)

### Status
- Status_ID (PK)
- Points (pontos acumulados)
- Wins (vitórias)
- Loses (derrotas)
- XP (experiência)
- Games (total de jogos)

### History
- Historic_ID (PK)
- Game_IDs (JSON array com IDs dos jogos)
- Created_at (timestamp)

### Game
- Game_ID (PK, TEXT - UUID hash)
- User_ID (FK → Users)
- Keyword_ID (FK → Keyword)
- Tries (tentativas usadas)
- isWin (0 ou 1, boolean)
- XP (experiência ganha)
- Points (pontos ganhos)
- Created_at (timestamp)

### Keyword
- Keyword_ID (PK)
- Keyword (palavra do jogo, UNIQUE)

### Friendships
- Friendship_ID (PK)
- User_ID (FK → Users, quem enviou/possui)
- Friend_ID (FK → Users, quem recebeu/é amigo)
- Status (pending/accepted/blocked)
- Created_At (timestamp)
- Updated_At (timestamp)
- UNIQUE(User_ID, Friend_ID)
- CHECK(User_ID != Friend_ID)

### Activity_Log (Auditoria)
- Log_ID (PK)
- User_ID (FK → Users)
- Action_Type (tipo de ação)
- Old_Value (valor anterior)
- New_Value (valor novo)
- Description (descrição da ação)
- Timestamp (timestamp automático)

## Triggers (Auditoria Automática)

O banco implementa triggers para auditoria automática de ações dos usuários:

- **log_user_insert**: Registra quando novo usuário é criado
- **log_user_nickname_update**: Registra mudanças de nickname
- **log_user_email_update**: Registra mudanças de email
- **log_user_avatar_update**: Registra mudanças de avatar
- **log_user_password_change**: Registra mudanças de senha
- **log_user_delete**: Registra quando usuário é deletado

Todos os logs ficam armazenados em `Activity_Log` com timestamp automático.

## Relacionamentos entre Tabelas

```
Status (1:1) ←──── Users (1:N) ────→ History
                      │
                      ├────→ Friendships (N:N, auto-relacionamento)
                      │
                      ├────→ Activity_Log (1:N, auditoria)
                      │
                      └────→ Game (1:N)

Keyword (1:N) ←──── Game
                      │
                      └────→ History.Game_IDs (JSON array)
```

### Observações:
- **Users ↔ History**: Relacionamento 1:1, mas History_ID começa NULL (criado no primeiro jogo)
- **Users ↔ Friendships**: Auto-relacionamento N:N (um usuário pode ter vários amigos)
- **Users ↔ Activity_Log**: Relacionamento 1:N para auditoria de ações
- **Users ↔ Game**: Relacionamento 1:N (um usuário pode ter vários jogos)
- **Game ↔ History**: IDs dos jogos armazenados como JSON array em History.Game_IDs
- **Game ID**: Usa UUID hash para identificação única

## Instalação

### Local

```bash
npm install
```

Crie um arquivo `.env`:
```bash
cp .env.example .env
```

### Docker

```bash
npm run docker:build
npm run docker:up
```

## Executar

### Local

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm start
```

### Docker

Iniciar container:
```bash
npm run docker:up
```

Ver logs:
```bash
npm run docker:logs
```

Parar container:
```bash
npm run docker:down
```

## Endpoints

### Health Check
- `GET /` - Mensagem de boas-vindas
- `GET /api/health` - Health check

### Autenticação

#### POST /api/auth/register
Cria um novo usuário no sistema.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Respostas:**
- `201 Created` - Usuário criado com sucesso
  ```json
  {
    "message": "User registered successfully",
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "nickname": "string",
      "email": "string"
    }
  }
  ```
- `400 Bad Request` - Campo inválido ou ausente
  ```json
  {
    "error": "Unavailable Field",
    "message": "Email is required"
  }
  ```
- `409 Conflict` - Email já cadastrado
  ```json
  {
    "error": "Conflict",
    "message": "Email already registered"
  }
  ```

#### POST /api/auth/login
Autentica um usuário e retorna um token JWT.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respostas:**
- `200 OK` - Login bem-sucedido
  ```json
  {
    "message": "Login successful",
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "nickname": "string",
      "email": "string"
    }
  }
  ```
- `400 Bad Request` - Campo inválido ou ausente
  ```json
  {
    "error": "Unavailable Field",
    "message": "Email is required"
  }
  ```
- `401 Unauthorized` - Credenciais inválidas
  ```json
  {
    "error": "Unauthorized",
    "message": "Invalid credentials"
  }
  ```

#### GET /api/auth/user
Obtém os dados completos do usuário autenticado.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN",
  "x-caller-id": "string"
}
```

**Respostas:**
- `200 OK` - Usuário obtido com sucesso
  ```json
  {
    "message": "User retrieved successfully",
    "user": {
      "id": 1,
      "nickname": "string",
      "email": "string",
      "avatar": null,
      "status": {
        "statusId": 1,
        "points": 150,
        "wins": 5,
        "loses": 2,
        "xp": 300,
        "games": 7
      }
    }
  }
  ```
- `400 Bad Request` - Header x-caller-id ausente
  ```json
  {
    "error": "Unavailable Field",
    "message": "x-caller-id header is required"
  }
  ```
- `401 Unauthorized` - Token inválido ou ausente
  ```json
  {
    "error": "Unauthorized",
    "message": "Invalid or expired token"
  }
  ```
- `404 Not Found` - Usuário não encontrado
  ```json
  {
    "error": "Not Found",
    "message": "User not found"
  }
  ```

### Game

#### PUT /api/game/finish
Finaliza um jogo e registra o resultado.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN",
  "x-caller-id": "USER_ID",
  "x-tiger-token": "JWT_TOKEN"
}
```

**Request Body:**
```json
{
  "score": 100,
  "win": true,
  "lose": false,
  "tries": 3,
  "keyword": "SAGAZ"
}
```

**Respostas:**
- `200 OK` - Jogo finalizado com sucesso
  ```json
  {
    "message": "Game finished successfully",
    "game": {
      "id": "31d1b951-0838-4fd5-a8c5-467c664a72e4",
      "keyword": "SAGAZ",
      "tries": 3,
      "isWin": true,
      "xp": 200,
      "points": 100,
      "createdAt": "2025-10-20 18:24:48"
    }
  }
  ```
- `400 Bad Request` - Campos inválidos ou ausentes
- `401 Unauthorized` - Token inválido
- `404 Not Found` - Usuário não encontrado

#### GET /api/game/random-keyword
Obtém uma palavra aleatória para o jogo.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Respostas:**
- `200 OK` - Palavra obtida com sucesso
  ```json
  {
    "keywordId": 1,
    "keyword": "SAGAZ"
  }
  ```
- `401 Unauthorized` - Token inválido
- `404 Not Found` - Nenhuma palavra disponível

#### GET /api/game/history
Obtém o histórico de jogos do usuário autenticado.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Respostas:**
- `200 OK` - Histórico obtido com sucesso
  ```json
  {
    "message": "Game history retrieved successfully",
    "totalGames": 2,
    "games": [
      {
        "id": "394dbdba-0495-44cc-b19b-87272ee78b14",
        "keyword": "TESTE",
        "tries": 3,
        "isWin": true,
        "xp": 200,
        "points": 100,
        "createdAt": "2025-10-20 21:00:51"
      }
    ]
  }
  ```
- `401 Unauthorized` - Token inválido

### Amizades

#### POST /api/friend/add
Envia pedido de amizade para outro usuário.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Request Body:**
```json
{
  "friendId": 2
}
```

**Respostas:**
- `200 OK` - Pedido enviado
  ```json
  {
    "message": "Friend request sent successfully",
    "friendship": {
      "id": 1,
      "userId": 1,
      "friendId": 2,
      "status": "pending"
    }
  }
  ```
- `400 Bad Request` - Erro de validação
- `401 Unauthorized` - Token inválido
- `404 Not Found` - Usuário não encontrado
- `409 Conflict` - Pedido já existe

#### POST /api/friend/accept/:friendId
Aceita pedido de amizade.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Respostas:**
- `200 OK` - Pedido aceito
  ```json
  {
    "message": "Friend request accepted",
    "friend": {
      "id": 2,
      "nickname": "Alice",
      "email": "alice@test.com",
      "avatar": null
    }
  }
  ```

#### DELETE /api/friend/remove/:friendId
Remove amizade ou cancela pedido.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Respostas:**
- `200 OK` - Amizade removida
  ```json
  {
    "message": "Friendship removed successfully"
  }
  ```

#### POST /api/friend/block/:friendId
Bloqueia um usuário.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Respostas:**
- `200 OK` - Usuário bloqueado
  ```json
  {
    "message": "User blocked successfully"
  }
  ```

#### GET /api/friend/list
Lista todos os amigos do usuário autenticado.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Respostas:**
- `200 OK`
  ```json
  {
    "message": "Friends retrieved successfully",
    "count": 2,
    "friends": [
      {
        "id": 2,
        "nickname": "Alice",
        "email": "alice@test.com",
        "avatar": null,
        "friendsSince": "2025-10-19 21:35:07"
      }
    ]
  }
  ```

#### GET /api/friend/requests/pending
Lista pedidos de amizade recebidos (pendentes).

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Respostas:**
- `200 OK`
  ```json
  {
    "message": "Pending requests retrieved successfully",
    "count": 1,
    "requests": [
      {
        "id": 3,
        "nickname": "Bob",
        "email": "bob@test.com",
        "avatar": null,
        "requestedAt": "2025-10-19 21:35:07"
      }
    ]
  }
  ```

#### GET /api/friend/requests/sent
Lista pedidos de amizade enviados.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

#### GET /api/friend/blocked
Lista usuários bloqueados.

**Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

## Exemplos de Uso

### Consultar Logs de Auditoria

```bash
# Ver todos os logs de um usuário
sqlite3 data/termo.db "SELECT * FROM Activity_Log WHERE User_ID = 1 ORDER BY Timestamp DESC;"

# Ver registros de usuários
sqlite3 data/termo.db "SELECT * FROM Activity_Log WHERE Action_Type = 'USER_REGISTERED';"

# Ver mudanças de senha nas últimas 24h
sqlite3 data/termo.db "SELECT * FROM Activity_Log WHERE Action_Type = 'PASSWORD_CHANGED' AND Timestamp > datetime('now', '-1 day');"
```

### Testar Triggers

```bash
# Registrar usuário (trigger log_user_insert será executado)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@mail.com","password":"1234"}'

# Verificar log criado
sqlite3 data/termo.db "SELECT * FROM Activity_Log WHERE Action_Type = 'USER_REGISTERED';"
```

### Verificar Estrutura do Banco

```bash
# Listar todas as tabelas
sqlite3 data/termo.db ".tables"

# Ver estrutura de uma tabela
sqlite3 data/termo.db "PRAGMA table_info(Users);"

# Listar todos os triggers
sqlite3 data/termo.db "SELECT name FROM sqlite_master WHERE type='trigger';"

# Ver índices criados
sqlite3 data/termo.db "SELECT name FROM sqlite_master WHERE type='index';"
```

## Funcionalidades

### 🎮 Sistema de Jogos
- **Finalização de Jogos**: Registro completo de resultados com UUID hash
- **Histórico por Usuário**: Cada usuário tem seu próprio histórico de jogos
- **Palavras Aleatórias**: Sistema de palavras de 5 letras para jogos
- **Cálculo de XP**: Sistema de experiência baseado em vitórias/derrotas
- **Game IDs Únicos**: Identificação única usando UUID hash

### 👥 Sistema de Usuários
- **Registro e Login**: Autenticação JWT completa
- **Perfis de Usuário**: Nickname, email, avatar
- **Status Preparado**: Estrutura pronta para sistema de estatísticas
- **Auditoria Completa**: Log de todas as ações do usuário

### 🤝 Sistema de Amizades
- **Pedidos de Amizade**: Envio e recebimento de convites
- **Status de Amizade**: Pending, accepted, blocked
- **Listagem de Amigos**: Amigos aceitos e pedidos pendentes
- **Bloqueio de Usuários**: Sistema de bloqueio

### 🔒 Segurança
- **Autenticação JWT**: Tokens seguros para autenticação
- **Validação de Dados**: Middlewares de validação robustos
- **Hash de Senhas**: Senhas protegidas com bcrypt
- **Headers de Segurança**: Validação de headers customizados

### 📊 Banco de Dados
- **SQLite**: Banco leve e eficiente
- **Relacionamentos**: Estrutura normalizada com foreign keys
- **Triggers de Auditoria**: Log automático de mudanças
- **Índices Otimizados**: Performance otimizada para consultas

## Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite (better-sqlite3)** - Banco de dados
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT
- **CORS** - Middleware para CORS
- **dotenv** - Gerenciamento de variáveis de ambiente
- **crypto** - Geração de UUID para Game IDs

### Infraestrutura
- **Docker** - Containerização
- **Nodemon** - Hot reload (desenvolvimento)

### Recursos do Banco
- **Triggers SQL** - Auditoria automática
- **Foreign Keys** - Integridade referencial
- **Indexes** - Otimização de queries
- **Constraints** - UNIQUE, CHECK, NOT NULL
- **UUID Hash** - Game IDs únicos
- **JSON Arrays** - Armazenamento de Game IDs no History
- **Cascade Deletes** - Limpeza automática de dados relacionados

## Estado Atual do Projeto

### ✅ Implementado
- **Sistema de Autenticação**: Registro, login e JWT
- **Sistema de Jogos**: Finalização, histórico e palavras aleatórias
- **Sistema de Amizades**: Pedidos, aceitação e bloqueio
- **Auditoria**: Log automático de ações
- **Banco de Dados**: Estrutura completa com relacionamentos

### 🔄 Em Desenvolvimento
- **Sistema de Estatísticas**: Estrutura preparada no banco, desenvolvimento em branch separada

### 📋 Próximos Passos
- Implementação completa do sistema de stats
- Sistema de ranking/leaderboard
- Notificações em tempo real
- Sistema de conquistas/badges

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

