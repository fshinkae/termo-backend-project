# Guia Docker - Termo Backend

## Comandos Principais

### Build da imagem
```bash
npm run docker:build
# ou
docker-compose build
```

### Iniciar container
```bash
npm run docker:up
# ou
docker-compose up -d
```

### Ver logs
```bash
npm run docker:logs
# ou
docker-compose logs -f
```

### Parar container
```bash
npm run docker:down
# ou
docker-compose down
```

### Entrar no container
```bash
docker exec -it termo-backend sh
```

## Estrutura

- **Dockerfile**: Define a imagem Node.js Alpine com as dependências
- **docker-compose.yml**: Orquestra o container com volumes e portas
- **Volume data/**: Persiste o banco de dados SQLite entre reinicializações

## Banco de Dados

O banco SQLite é criado automaticamente em `data/termo.db` quando o servidor inicia.

A estrutura é definida em `src/config/schema.sql`.

### Acessar o banco diretamente
```bash
docker exec -it termo-backend sqlite3 /app/data/termo.db
```

Comandos úteis do SQLite:
```sql
.tables                  -- listar tabelas
.schema Users            -- ver estrutura da tabela
SELECT * FROM Users;     -- consultar usuários
.exit                    -- sair
```

## Desenvolvimento

O container está configurado com hot-reload (nodemon). Qualquer alteração nos arquivos será refletida automaticamente.

## Troubleshooting

### Container não inicia
```bash
docker-compose down
docker-compose up --build
```

### Ver logs de erro
```bash
docker-compose logs
```

### Resetar banco de dados
```bash
rm data/termo.db
docker-compose restart
```

### Permissões de pasta
Se houver problemas com o diretório data/:
```bash
chmod -R 777 data/
```

