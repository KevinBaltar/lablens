# LabLens

Sistema web para envio e gestão de pedidos de lentes ópticas.

## Pré-requisitos

- Node.js 18+
- Docker (para PostgreSQL)
- npm

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar banco de dados
docker-compose up -d

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar cliente Prisma
npm run db:generate

# Criar migrações
npm run db:migrate

# Popular banco com dados iniciais
npm run db:seed
```

## Desenvolvimento

```bash
# Iniciar frontend e backend
npm run dev

# Ou individualmente
npm run dev:frontend
npm run dev:backend
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia frontend e backend |
| `npm run build` | Build de produção |
| `npm run test` | Executa testes |
| `npm run db:migrate` | Cria migrações |
| `npm run db:seed` | Popula banco |
| `npm run db:studio` | Abre Prisma Studio |

## Estrutura

```
LabLens/
├── frontend/          # React + TypeScript + Tailwind
├── backend/           # Node.js + Express + Prisma
├── shared/            # Tipos compartilhados
└── .specs/            # Documentação do projeto
```

## Stack

- **Frontend:** React.js, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Banco:** PostgreSQL
- **Testes:** Vitest
