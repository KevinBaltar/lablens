# LabLens

**Visão:** Sistema web para gestão de pedidos de lentes ópticas entre matriz e filiais de óticas, com controle de estados, comunicação integrada e design minimalista.

**Para:** Óticas com estrutura de matriz/filiais que precisam gerenciar pedidos de lentes de forma eficiente.

**Resolve:** Fluxo controlado de pedidos com estados, comunicação em tempo real, gestão de produtos e rastreabilidade completa.

## Objetivos

- **Primário:** Automatizar o fluxo de pedidos de lentes com máquinas de estados e notificações
- **Secundário:** Integrar comunicação via chat para resolução de problemas
- **Terciário:** Fornecer gestão completa de produtos (lentes) e filiais

## Stack Tecnológica

**Core:**
- Frontend: React.js + TypeScript + Tailwind CSS
- Backend: Node.js + TypeScript + Express
- Banco: PostgreSQL + Prisma ORM
- Autenticação: JWT (sessão 5h)
- Comunicação: WebSocket (Socket.io)

**Dependências Críticas:**
- Zod (validação)
- React Query (state management)
- Vitest + Cypress (testes)

## Escopo

**v1 inclui:**
- Home page institucional com login
- Sistema de autenticação com 2 níveis (Matriz/Filial)
- CRUD de Filiais
- CRUD de Lentes com grades
- Máquina de estados de pedidos (pendente/aceito/recusado)
- 3 formulários de pedido (Grade, Par a Par, Surfaçado)
- Listagem e detalhes de pedidos
- Chat em tempo real por pedido
- Sistema de notificações
- Upload/download de tabela de preços (PDF)
- Gerenciamento de perfil e contatos

**Fora do escopo:**
- Múltiplas empresas/matrizes
- Produção, expedição, entrega
- Controle de estoque
- Pagamentos
- App mobile

## Restrições

- Pedidos nunca podem ser deletados
- Reenvio sempre usa mesmo ID
- Recusa sempre obrigatória com motivo
- Sessão expira em 5h (sem refresh)
- Senhas sempre com hash
- Diâmetro calculado automaticamente
- Grades geradas dinamicamente (não persistir combinações)
