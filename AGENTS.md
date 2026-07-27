# LabLens - Plano de Descrição

## Visão Geral

Aplicação web para envio e gestão de pedidos de lentes ópticas. Sistema **single-tenant**: existe uma única empresa (Matriz), que cadastra e gerencia suas Filiais.

**Para:** Óticas que precisam gerenciar pedidos de lentes entre matriz e filiais
**Resolve:** Fluxo de pedidos de lentes com estados controlados, comunicação integrada e gestão de produtos

## Stack Tecnológica

- **Frontend:** React.js + TypeScript + Tailwind CSS
- **Backend:** Node.js + TypeScript + Express
- **Banco:** PostgreSQL (Neon DB) + Prisma ORM
- **Autenticação:** JWT (sessão 5h)
- **Comunicação:** WebSocket (chat em tempo real)
- **Testes:** Vitest (unit) + Cypress (E2E)

---

## Fases de Desenvolvimento

### Fase 0: Fundação (Sequencial - Sem paralelismo)

**Objetivo:** Estrutura do projeto, banco de dados e autenticação básica

| Tarefa | Descrição | Dependências | Status |
|--------|-----------|--------------|--------|
| T0.1 | Setup monorepo (frontend + backend) | Nenhuma | ✅ Concluído |
| T0.2 | Schema Prisma (Users, Filiais, Lentes, Pedidos) | T0.1 | ✅ Concluído |
| T0.3 | Sistema de autenticação (login, JWT, middleware) | T0.2 | ✅ Concluído |
| T0.4 | Seed do usuário Master inicial | T0.3 | ✅ Concluído |

**Agentes isolados:** Nenhum - todas dependem sequencialmente

---

### Fase 1: Infraestrutura Core (Parcialmente Paralela)

**Objetivo:** CRUDs básicos e layout da aplicação

| Tarefa | Descrição | Dependências | Paralela? | Status |
|--------|-----------|--------------|-----------|--------|
| T1.1 | Backend: CRUD Filiais | T0.3 | Sim | ✅ Concluído |
| T1.2 | Backend: CRUD Lentes + Grades | T0.3 | Sim | ✅ Concluído |
| T1.3 | Backend: CRUD Usuários | T0.3 | Sim | ✅ Concluído |
| T1.4 | Frontend: Layout (Sidebar + Header + Body) | T0.3 | Sim | ✅ Concluído |
| T1.5 | Frontend: Páginas de auth (Login, Esqueci senha) | T0.3 | Sim | ✅ Concluído |
| T1.6 | Frontend: Página Home institucional | T0.3 | Sim | ✅ Concluído |
| T1.7 | Backend: Upload/download PDF (Tabela Preços) | T0.3 | Sim | ✅ Concluído |

**Agentes isolados:** T1.1, T1.2, T1.3, T1.4, T1.5, T1.6, T1.7 podem rodar em paralelo

---

### Fase 2: Sistema de Pedidos (Sequencial - Complexa)

**Objetivo:** Máquina de estados, formulários e listagem de pedidos

| Tarefa | Descrição | Dependências | Paralela? | Status |
|--------|-----------|--------------|-----------|--------|
| T2.1 | Backend: Modelo de Pedido + Histórico de Status | T0.2 | Não | ✅ Concluído |
| T2.2 | Backend: API de Pedidos (CRUD + transições) | T2.1, T1.2 | Não | ✅ Concluído |
| T2.3 | Backend: Cálculo de diâmetro (fórmula) | T2.1 | Não | ✅ Concluído |
| T2.4 | Frontend: Formulário Pedido em Grade | T1.2, T1.4 | Não | ✅ Concluído |
| T2.5 | Frontend: Formulário Pedido Par a Par | T1.2, T1.4 | Não | ✅ Concluído |
| T2.6 | Frontend: Formulário Pedido Surfaçado | T1.2, T1.4, T2.3 | Não | ✅ Concluído |
| T2.7 | Frontend: Listagem de Pedidos (Matriz/Filial) | T2.2, T1.4 | Não | ✅ Concluído |
| T2.8 | Frontend: Detalhes do Pedido + Histórico | T2.2, T1.4 | Não | ✅ Concluído |

**Agentes isolados:** Nenhum - dependências encadeadas (T2.4-T2.6 podem paralelizar após T2.3)

---

### Fase 3: Comunicação (Parcialmente Paralela)

**Objetivo:** Chat em tempo real e notificações

| Tarefa | Descrição | Dependências | Paralela? | Status |
|--------|-----------|--------------|-----------|--------|
| T3.1 | Backend: WebSocket server | T0.3 | Sim | ✅ Concluído |
| T3.2 | Backend: Sistema de Notificações | T3.1 | Não | ✅ Concluído |
| T3.3 | Backend: Chat por pedido (thread única) | T3.1, T2.1 | Não | ✅ Concluído |
| T3.4 | Frontend: Hook de WebSocket | T3.1 | Sim | ✅ Concluído |
| T3.5 | Frontend: Componente de Chat | T3.3, T3.4 | Não | ✅ Concluído |
| T3.6 | Frontend: Indicador de Notificações | T3.2, T3.4 | Não | ✅ Concluído |

**Agentes isolados:** T3.1 e T3.4 podem paralelizar

---

### Fase 4: Funcionalidades Adicionais (Paralela)

**Objetivo:** Gerenciamento de perfil, contatos e configurações

| Tarefa | Descrição | Dependências | Paralela? | Status |
|--------|-----------|--------------|-----------|--------|
| T4.1 | Backend: Perfis de usuário (edição, senha) | T0.3 | Sim | ✅ Concluído |
| T4.2 | Backend: Gerenciamento de Contatos | T0.3 | Sim | ✅ Concluído |
| T4.3 | Frontend: Página de Perfil | T4.1, T1.4 | Sim | ✅ Concluído |
| T4.4 | Frontend: Página de Contatos | T4.2, T1.4 | Sim | ✅ Concluído |
| T4.5 | Frontend: Cadastro de Filial (formulário) | T1.1, T1.4 | Sim | ✅ Concluído |
| T4.6 | Frontend: Cadastro de Lentes (CRUD UI) | T1.2, T1.4 | Sim | ✅ Concluído |

**Agentes isolados:** T4.1-T4.6 podem paralelizar

---

### Fase 5: Segurança e Testes (Sequencial)

**Objetivo:** Hardening de segurança e testes E2E

| Tarefa | Descrição | Dependências | Paralela? | Status |
|--------|-----------|--------------|-----------|--------|
| T5.1 | Validação de inputs (backend) | Todas APIs | Não | ✅ Concluído |
| T5.2 | Rate limiting e proteção contra ataques | T0.3 | Não | ✅ Concluído |
| T5.3 | Testes unitários (backend) | Todas APIs | Não | ✅ Concluído |
| T5.4 | Testes unitários (frontend) | Todos componentes | Não | ✅ Concluído |
| T5.5 | Testes E2E (fluxos principais) | T5.3, T5.4 | Não | ✅ Concluído |
| T5.6 | Auditoria de segurança final | T5.1, T5.2 | Não | ✅ Concluído |

**Agentes isolados:** T5.3 e T5.4 podem paralelizar

---

## Mapa de Execução Paralela

```
Fase 0 (Sequencial):
  T0.1 → T0.2 → T0.3 → T0.4

Fase 1 (Paralela):
  T0.4 completo, então:
    ├── T1.1 [P]
    ├── T1.2 [P]
    ├── T1.3 [P]
    ├── T1.4 [P]
    ├── T1.5 [P]
    ├── T1.6 [P]
    └── T1.7 [P]

Fase 2 (Sequencial com paralelismo parcial):
  T1.* completo, então:
    T2.1 → T2.2 → T2.3
                          ├── T2.4 [P]
                          ├── T2.5 [P]
                          └── T2.6 [P]
                                    ↓
                              T2.7 → T2.8

Fase 3 (Parcialmente paralela):
  T2.* completo, então:
    T3.1 → T3.2 → T3.3
    T3.4 [P] (paralelo com T3.1-T3.3)
              ↓
        T3.5 → T3.6

Fase 4 (Paralela):
  T3.* completo, então:
    ├── T4.1 [P]
    ├── T4.2 [P]
    ├── T4.3 [P]
    ├── T4.4 [P]
    ├── T4.5 [P]
    └── T4.6 [P]

Fase 5 (Sequencial):
  T4.* completo, então:
    T5.1 → T5.2
    T5.3 [P] (paralelo com T5.4)
    T5.4 [P] (paralelo com T5.3)
              ↓
        T5.5 → T5.6
```

---

## Entregáveis por Fase

### Fase 0 - Fundação
- Monorepo configurado
- Schema do banco de dados
- Sistema de autenticação funcional
- Usuário Master criado

### Fase 1 - Infraestrutura
- CRUD de Filiais
- CRUD de Lentes com Grades
- Layout da aplicação
- Páginas de autenticação
- Home page institucional
- Upload de PDF

### Fase 2 - Pedidos
- Máquina de estados implementada
- 3 formulários de pedido
- Listagem e detalhes de pedidos
- Histórico de status

### Fase 3 - Comunicação
- Chat em tempo real
- Sistema de notificações
- Indicadores visuais

### Fase 4 - Adicionais
- Gerenciamento de perfil
- Página de contatos
- Formulários de cadastro

### Fase 5 - Qualidade
- Validação robusta
- Proteção contra ataques
- Testes unitários e E2E
- Auditoria de segurança

---

## Restrições e Regras

1. **Nunca deletar pedidos** - apenas status change
2. **Reenvio sempre mesmo ID** - nunca gerar novo pedido
3. **Recusa obrigatória com motivo** - sempre
4. **Sessão expira em 5h** - sem refresh token
5. **Senhas com hash** - nunca texto puro
6. **Diâmetro calculado automaticamente** - fórmula fixa
7. **Grade gerada dinamicamente** - não persistir combinações

---

## Tecnologias Complementares Sugeridas

- **Zod** - Validação de schemas
- **React Query** - Cache e state management
- **Socket.io** - WebSocket simplificado
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de e-mails
- **Vitest** - Testes unitários
- **Cypress** - Testes E2E
