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
- Game_ID (PK)
- Keyword_ID (FK → Keyword)
- Tries (tentativas usadas)
- isWin (0 ou 1, boolean)
- XP (experiência ganha)
- Points (pontos ganhos)

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
                      └────→ Activity_Log (1:N, auditoria)

Keyword (1:N) ←──── Game
                      │
                      └────→ History.Game_IDs (JSON array)
```

### Observações:
- **Users ↔ History**: Relacionamento 1:1, mas History_ID começa NULL (criado no primeiro jogo)
- **Users ↔ Friendships**: Auto-relacionamento N:N (um usuário pode ter vários amigos)
- **Users ↔ Activity_Log**: Relacionamento 1:N para auditoria de ações
- **Game ↔ History**: IDs dos jogos armazenados como JSON array em History.Game_IDs

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

## Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite (better-sqlite3)** - Banco de dados
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT
- **CORS** - Middleware para CORS
- **dotenv** - Gerenciamento de variáveis de ambiente

### Infraestrutura
- **Docker** - Containerização
- **Nodemon** - Hot reload (desenvolvimento)

### Recursos do Banco
- **Triggers SQL** - Auditoria automática
- **Foreign Keys** - Integridade referencial
- **Indexes** - Otimização de queries
- **Constraints** - UNIQUE, CHECK, NOT NULL

