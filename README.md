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
- Nickname
- Email
- Password
- Status_ID (FK)
- Avatar

### Status
- Status_ID (PK)
- Points
- Wins
- Loses
- Rank

### Keyword
- Keyword_ID (PK)
- Keyword

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

- `GET /` - Mensagem de boas-vindas
- `GET /api/health` - Health check

## Tecnologias

- Node.js
- Express
- SQLite (better-sqlite3)
- Docker
- CORS
- dotenv

