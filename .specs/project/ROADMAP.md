# Roadmap

**Milestone Atual:** Fundação
**Status:** Planning

---

## Milestone 1: Fundação

**Meta:** Estrutura do projeto, banco de dados e autenticação funcional

### Features

**Setup do Projeto** - PLANNED

- Monorepo com frontend + backend
- Configuração TypeScript
- ESLint + Prettier
- Docker Compose (PostgreSQL)

**Schema do Banco** - PLANNED

- Modelo de dados completo
- Migrações Prisma
- Seed inicial

**Autenticação** - PLANNED

- Login/logout
- JWT com expiração 5h
- Middleware de proteção
- Recuperação de senha

---

## Milestone 2: Infraestrutura Core

**Meta:** CRUDs básicos, layout e páginas de autenticação

### Features

**CRUD Filiais** - PLANNED

- Cadastro de filiais
- Listagem e edição
- Validação CNPJ

**CRUD Lentes** - PLANNED

- Cadastro de lentes por tipo
- Gestão de grades
- Validação de campos

**Layout da Aplicação** - PLANNED

- Sidebar responsiva
- Header com ações
- Body dinâmico
- Menu hambúrguer mobile

**Páginas de Auth** - PLANNED

- Login
- Esqueci senha
- Redefinição de senha

**Home Institucional** - PLANNED

- Header com navegação
- Seções: Sobre, Produtos, Serviços
- Footer com contatos
- Formulário de login

**Upload PDF** - PLANNED

- Upload de tabela de preços
- Versionamento
- Download para filiais

---

## Milestone 3: Sistema de Pedidos

**Meta:** Máquina de estados completa com formulários e listagem

### Features

**Modelo de Pedido** - PLANNED

- Schema com estados
- Histórico de status
- Validação de transições

**API de Pedidos** - PLANNED

- CRUD completo
- Transições de estado
- Listagem com filtros
- Detalhes com histórico

**Formulário Grade** - PLANNED

- Tabela dinâmica
- Seleção de lente
- Quantidade por célula

**Formulário Par a Par** - PLANNED

- Campos OD/OE
- Seleção de quantidade
- Validação de grade

**Formulário Surfaçado** - PLANNED

- Campos OD/OE completos
- Dados da armação
- Cálculo de diâmetro

**Listagem de Pedidos** - PLANNED

- Visualização Matriz/Filial
- Filtros avançados
- Indicadores visuais

**Detalhes do Pedido** - PLANNED

- Histórico completo
- Ações de status
- Chat integrado

---

## Milestone 4: Comunicação

**Meta:** Chat em tempo real e notificações

### Features

**WebSocket Server** - PLANNED

- Socket.io configurado
- Autenticação de conexão
- Salas por pedido

**Sistema de Notificações** - PLANNED

- Notificação de recusa
- Indicador visual
- Marcar como lida

**Chat por Pedido** - PLANNED

- Thread única por pedido
- Mensagens em tempo real
- Histórico persistido

**Interface do Chat** - PLANNED

- Componente de chat
- Input de mensagem
- Lista de conversas

---

## Milestone 5: Funcionalidades Adicionais

**Meta:** Perfil, contatos e configurações

### Features

**Perfil do Usuário** - PLANNED

- Edição de dados
- Alteração de senha
- Confirmação de e-mail

**Gerenciamento de Contatos** - PLANNED

- Contatos internos
- Categorias (gerência, expedição, etc.)

**Cadastro de Filial (UI)** - PLANNED

- Formulário completo
- Validação
- Listagem

**Cadastro de Lentes (UI)** - PLANNED

- CRUD completo
- Gestão de grades
- Validação por tipo

---

## Milestone 6: Qualidade

**Meta:** Segurança, testes e validação

### Features

**Validação de Inputs** - PLANNED

- Validação backend completa
- Mensagens de erro claras
- Proteção contra injeção

**Segurança** - PLANNED

- Rate limiting
- Proteção CSRF
- Headers de segurança
- Auditoria de acessos

**Testes Unitários** - PLANNED

- Backend: Vitest
- Frontend: Vitest
- Cobertura mínima 80%

**Testes E2E** - PLANNED

- Fluxos principais
- Cypress
- Cenários críticos

**Auditoria Final** - PLANNED

- Revisão de segurança
- Testes de performance
- Validação completa

---

## Considarações Futuras

- App mobile (React Native)
- Integração com ERPs
- Relatórios e dashboards
- Notificações por e-mail/SMS
- Multi-idioma
