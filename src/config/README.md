# Configuração do Banco de Dados

## Arquivos

### `schema.sql`
Define a estrutura completa do banco de dados:
- Tabela `Status` - Pontuação e ranking dos jogadores
- Tabela `Users` - Dados dos usuários
- Tabela `Keyword` - Palavras do jogo
- Índices para otimização de queries

**Execução:** Automática ao iniciar o servidor

### `database.js`
Módulo que:
- Cria conexão com SQLite
- Inicializa o banco lendo `schema.sql`
- Configura WAL mode para melhor performance
- Exporta instância do banco para uso nos models

## Modelo de Dados

```
┌─────────┐         ┌────────────┐
│  Status │◄────┐   │  Keyword   │
└─────────┘     │   └────────────┘
  - Status_ID   │     - Keyword_ID
  - Points      │     - Keyword
  - Wins        │
  - Loses       │
  - Rank        │
                │
            ┌───┴────┐
            │  Users │
            └────────┘
              - User_Id
              - Nickname
              - Email
              - Password
              - Status_ID (FK)
              - Avatar
```

## Comandos Úteis

### Acessar banco via CLI
```bash
sqlite3 data/termo.db
```

### Queries úteis
```sql
.tables                           -- Listar tabelas
.schema Users                     -- Ver estrutura
SELECT * FROM Users;              -- Consultar dados
PRAGMA table_info(Users);         -- Ver colunas
.exit                             -- Sair
```

### Resetar banco
```bash
rm data/termo.db
npm run dev  # Recria automaticamente
```

