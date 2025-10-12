# Termo Backend Project

Backend desenvolvido com Node.js, Express e Supabase seguindo arquitetura MVC.

## Arquitetura MVC

```
src/
├── server.js                    # Servidor principal
├── config/
│   └── database.js              # Configuração Supabase
├── models/
│   └── User.js                  # Model: lógica de dados
├── controllers/
│   └── userController.js        # Controller: lógica de requisição
├── routes/
│   ├── index.js                 # Rotas principais
│   └── userRoutes.js            # Rotas de usuário
├── middlewares/
│   └── authMiddleware.js        # Autenticação JWT
├── sql/
│   └── supabase-setup.sql       # Script SQL Supabase
└── utils/                       # Utilitários
```

## Instalação

### Opção 1: Docker (Recomendado para dev local)

```bash
docker-compose up --build
```

A API estará disponível em `http://localhost:3000` usando SQLite.

### Opção 2: Local sem Docker

```bash
npm install
```

## Configuração

### Desenvolvimento Local (SQLite)

Crie arquivo `.env`:

```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
JWT_SECRET=sua_chave_secreta_forte_aqui
```

Execute:
```bash
npm run dev
```

O banco SQLite será criado automaticamente em `data/database.db`.

### Produção (Supabase)

1. Crie projeto em [supabase.com](https://supabase.com)

2. Execute no SQL Editor:

```sql
CREATE TABLE "Users" (
  "User_id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Nickname" VARCHAR(255) NOT NULL,
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "Password" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON "Users"("Email");
```

3. Configure `.env`:

```env
PORT=3000
NODE_ENV=production
DB_TYPE=supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
JWT_SECRET=sua_chave_secreta_forte_aqui
```

## Executar

### Com Docker
```bash
docker-compose up
```

### Sem Docker
Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm start
```

## Endpoints

### Gerais
- `GET /` - Mensagem de boas-vindas
- `GET /api/health` - Health check

### Usuários
- `POST /api/users/register` - Criar conta
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Perfil (protegido)

## Exemplos de Uso

### Register
```bash
POST /api/users/register
Content-Type: application/json

{
  "nickname": "usuario",
  "email": "user@email.com",
  "password": "senha123"
}
```

### Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "user@email.com",
  "password": "senha123"
}
```

### Profile (requer autenticação)
```bash
GET /api/users/profile
Authorization: Bearer seu_token_jwt
```

## Tecnologias

- Node.js
- Express
- Docker & Docker Compose
- SQLite (desenvolvimento local)
- Supabase/PostgreSQL (produção)
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- dotenv

## Estrutura de Banco de Dados

O projeto suporta dois tipos de banco:

- **SQLite**: Para desenvolvimento local (padrão no Docker)
- **Supabase/PostgreSQL**: Para produção

A troca é feita automaticamente via variável `DB_TYPE` no `.env`.

## Arquivos Docker

- `Dockerfile`: Imagem Node.js com SQLite
- `docker-compose.yml`: Orquestração do container
- `.dockerignore`: Arquivos ignorados no build

## Comandos Docker

### Com Makefile (recomendado)

```bash
make up        # Subir containers
make down      # Parar containers
make logs      # Ver logs
make restart   # Reiniciar
make clean     # Limpar tudo
make shell     # Acessar shell do container
```

### Sem Makefile

```bash
docker-compose up                # Subir
docker-compose up --build        # Reconstruir e subir
docker-compose up -d             # Rodar em background
docker-compose logs -f           # Ver logs
docker-compose down              # Parar
docker exec -it termo-backend sh # Shell do container
```

