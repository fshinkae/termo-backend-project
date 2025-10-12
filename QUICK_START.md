# Quick Start - Docker + SQLite

## 1. Subir com Docker

```bash
docker-compose up --build
```

API rodando em: `http://localhost:3000`

## 2. Testar endpoints

### Opção 1: Script automático
```bash
./test-api.sh
```

### Opção 2: Manual

#### Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

#### Register
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "teste",
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

#### Profile (substitua SEU_TOKEN)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Parar containers

```bash
docker-compose down
```

## Ver banco de dados SQLite

O arquivo fica em `data/database.db`. Use qualquer cliente SQLite para visualizar.

