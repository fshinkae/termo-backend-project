# Termo Backend Project

Backend desenvolvido com Node.js e Express.

## Estrutura do Projeto

```
src/
├── server.js          # Arquivo principal
├── routes/            # Rotas da API
├── controllers/       # Controladores
├── models/            # Modelos de dados
├── middlewares/       # Middlewares customizados
├── config/            # Configurações
└── utils/             # Utilitários
```

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

## Executar

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm start
```

## Endpoints

- `GET /` - Mensagem de boas-vindas
- `GET /api/health` - Health check

## Tecnologias

- Node.js
- Express
- CORS
- dotenv

