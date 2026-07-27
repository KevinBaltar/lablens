# Estado do Projeto

**Projeto:** LabLens
**Última atualização:** 2026-07-24
**Status:** Em planejamento

---

## Decisões

### DEC-01: Stack Tecnológica
- **Data:** 2026-07-24
- **Decisão:** React.js + TypeScript + Tailwind (frontend), Node.js + Express (backend), PostgreSQL + Prisma (banco)
- **Justificativa:** Stack moderna, boa documentação, comunidade ativa
- **Status:** Confirmada

### DEC-02: Arquitetura Monorepo
- **Data:** 2026-07-24
- **Decisão:** Monorepo com frontend e backend no mesmo repositório
- **Justificativa:** Facilita desenvolvimento e deploy conjunto
- **Status:** Confirmada

### DEC-03: Autenticação JWT
- **Data:** 2026-07-24
- **Decisão:** JWT com expiração de 5 horas, sem refresh token
- **Justificativa:** Simplifica implementação, atende requisitos de segurança
- **Status:** Confirmada

### DEC-04: Chat via WebSocket
- **Data:** 2026-07-24
- **Decisão:** Socket.io para chat em tempo real
- **Justificativa:** Biblioteca madura, fácil integração com React
- **Status:** Confirmada

---

## Blockers

Nenhum bloqueador no momento.

---

## Lições Aprendidas

Nenhuma lição registrada ainda.

---

## Pendências

- [ ] Definir estrutura de pastas do frontend
- [ ] Definir padrão de componentes React
- [ ] Configurar CI/CD
- [ ] Definir ambiente de deploy

---

## Ideias Adiadas

- [ ] Dashboard administrativo com métricas
- [ ] Integração com WhatsApp para notificações
- [ ] App mobile (React Native)
- [ ] Multi-idioma (pt-BR, en)

---

## Preferências

- **Modelo para tarefas simples:** mimo-auto
- **Modelo para tarefas complexas:** mimo-v2.5-pro
- **Formato de commits:** conventional commits
- **Branch strategy:** git flow simplificado
