# Feature: Sistema de Pedidos

**Status:** Draft
**Prioridade:** Alta
**Dependências:** Fase 0 (Fundação), Fase 1 (CRUD Lentes)

---

## Requisitos

### REQ-PED-01: Máquina de Estados

O sistema deve implementar uma máquina de estados para pedidos com os seguintes estados:
- `pendente`: estado inicial após criação
- `aceito`: pedido aprovado pela matriz
- `recusado`: pedido rejeitado (com motivo obrigatório)

**Transições válidas:**
- `pendente` → `aceito` (matriz aceita)
- `pendente` → `recusado` (matriz recusa)
- `aceito` → `recusado` (matriz recusa)
- `recusado` → `pendente` (filial reenvia)
- `pendente` → cancelado (filial cancela)
- `recusado` → cancelado (filial cancela)

**Regras:**
- Pedidos nunca podem ser deletados
- Reenvio sempre usa o mesmo ID
- Recusa sempre requer motivo
- Histórico completo deve ser preservado

---

### REQ-PED-02: Formulário Pedido em Grade

**Exclusivo para:** Visão Simples Pronta

**Campos:**
- Seleção de lente (busca por nome/ID)
- Tabela dinâmica com eixos:
  - X: Esférico (0,00 a +4,00 ou -0,25 a -4,00)
  - Y: Cilíndrico (0,00 a -4,00)
- Quantidade por célula (unidades)

**Validações:**
- Lente obrigatória
- Quantidade ≥ 0
- Valores dentro da grade da lente

---

### REQ-PED-03: Formulário Pedido Par a Par

**Exclusivo para:** Visão Simples Pronta

**Campos:**
- Seleção de lente (busca por nome/ID)
- Quantidade: 1 par ou 0,5 par
- Campos duplicados para OD e OE:
  - Esférico (obrigatório)
  - Cilíndrico (obrigatório)
  - Centro Óptico (opcional)
  - DNP (opcional)

**Validações:**
- Lente obrigatória
- Esférico e Cilíndrico dentro da grade
- Valores em passos de 0,25

---

### REQ-PED-04: Formulário Pedido Surfaçado

**Exclusivo para:** Visão Simples Surfaçada, Progressiva, Bifocal

**Campos:**
- Seleção de lente (busca por nome/ID)
- Quantidade: 1 par ou 0,5 par
- Campos duplicados para OD e OE:
  - Esférico, Cilíndrico, Eixo, Adição
  - Centro Óptico
  - DNP (obrigatório)
- Dados da Armação:
  - PA (Ponte + Aro)
  - AM (Ângulo Maior)
  - Vertical (informativo)
  - Diâmetro (calculado automaticamente)
  - Formato da Armação (seleção por imagem)

**Cálculo do Diâmetro:**
```
diâmetro = PA + AM + 4 - (DNP_menor × 2)
onde DNP_menor = MIN(DNP_olho_direito, DNP_olho_esquerdo)
```

**Validações:**
- DNP obrigatório
- PA e AM obrigatórios
- Diâmetro calculado e exibido com 1 casa decimal

---

### REQ-PED-05: Listagem de Pedidos

**Para Filial:**
- Lista paginada (10 por página)
- Campos: OS, Nome, Data, Status (bolinha), Quantidade
- Filtros: ID, Data (período), Tipo de lente, OS

**Para Matriz:**
- Seleção de filial primeiro
- Lista de pedidos da filial selecionada
- Campos: OS, Nome, ID, Quantidade, Status (editável), Grade, Data
- Ações: Aceitar, Recusar (com motivo)

---

### REQ-PED-06: Detalhes do Pedido

- Visualização completa do pedido
- Histórico de status (timeline)
- Chat integrado
- Ações disponíveis conforme estado

---

### REQ-PED-07: Histórico de Status

- Cada mudança de status gera um registro
- Registro contém: status anterior, status novo, motivo (se recusa), data, usuário
- Timeline visualizável
- Não sobrescreve registros anteriores

---

## Critérios de Aceite

- [ ] Máquina de estados implementada com todas as transições
- [ ] 3 formulários funcionais com validações
- [ ] Listagem com filtros e paginação
- [ ] Detalhes com histórico completo
- [ ] Chat integrado funcionando
- [ ] Notificações de recusa funcionando
- [ ] Testes unitários com cobertura ≥ 80%
- [ ] Testes E2E para fluxos principais

---

## Dependências

- Schema do banco (Fase 0)
- CRUD Lentes (Fase 1)
- Layout da aplicação (Fase 1)
- Autenticação (Fase 0)

---

## Riscos

- Complexidade do cálculo de diâmetro
- Validações de grade em tempo real
- Performance da listagem com muitos pedidos
- Sincronização do chat em tempo real
