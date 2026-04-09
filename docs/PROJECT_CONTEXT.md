# 🧠 Project Context: Recruta.AI (Governance Edition)

> **Versão:** 4.0 (Governance Ready)
> **Arquitetura:** Event-Driven / Job-Based
> **Status:** Bootstrapping Governance Layer

## 1. Objetivo do Produto
**Recruta.AI** é uma plataforma de inteligência de decisão para recrutamento.
*   **Core Loop:** Ingestão de Candidatos/Vagas → Normalização via IA → Matching Semântico → Decisão Humana.
*   **Diferencial de Governança:** Nenhuma ação crítica (ex: rejeitar candidato, cobrar cartão) acontece "no escuro". Tudo é um **Job** auditável, com contratos definidos (Action Contracts).

## 2. Stack Tecnológico [DECISÃO CTO]
*   **Frontend:** React 18 + TypeScript + Vite + Tailwind (shadcn/ui).
*   **Backend (BaaS):** **Supabase** (PostgreSQL, Auth, Realtime, Edge Functions).
*   **AI Orchestration:** Google Gemini API (`@google/genai`) via Edge Functions.
*   **Infra:** Vercel (Frontend) + Supabase Cloud (Backend).
*   **Job Queue:** Supabase PgBoss ou Tabela `jobs_queue` com Realtime.

## 3. Arquitetura de Alto Nível (The Governance Flow)
O sistema não executa funções diretamente. Ele cria intenções.

1.  **User Intent:** Usuário clica em "Otimizar CV".
2.  **Contract Check:** Frontend valida contra `ACTION_CONTRACTS.json`.
3.  **Job Creation:** Cria registro em `jobs` (status: `pending_approval` ou `queued`).
4.  **Worker/Edge:** Escuta fila, executa lógica (ex: chamar Gemini).
5.  **State Update:** Atualiza `jobs` (status: `completed`, result: `{...}`).
6.  **UI Feedback:** Frontend recebe update via WebSocket (Realtime) e notifica usuário.

## 4. Estrutura de Arquivos (Proposta)
```
/
├── .github/workflows       # CI/CD pipelines
├── docs/                   # Trinity Files + Contracts
│   ├── ACTION_CONTRACTS.json
│   ├── PROJECT_CONTEXT.md
│   ├── VISIONARY_DIAGNOSIS.md
│   └── VIRTUAL_BOARD_ROOM.md
├── src/
│   ├── contracts/          # Zod schemas importados do JSON
│   ├── components/         # UI (dumb components)
│   ├── features/           # UI (smart widgets por domínio)
│   ├── lib/                # Supabase client, utils
│   ├── jobs/               # Workers (simulated or real)
│   ├── services/           # AI & Domain Services
│   └── pages/              # Rotas
├── supabase/               # Migrations, Seeds, Edge Functions
└── tests/                  # E2E e Contract Tests
```

## 5. Estado das Funcionalidades

| Módulo | Funcionalidade | Status | Risco | Governança |
| :--- | :--- | :--- | :--- | :--- |
| **Identity** | Auth & Roles (B2B/B2C) | 🟡 Planejado | High | RBAC Rigoroso |
| **Engine** | Action Contracts Engine | 🟡 Planejado | Critical | Schema Validation |
| **Core** | CV Analysis Job | 🟡 Planejado | Medium | Rate Limit + Audit |
| **Core** | Job Matching Job | 🟡 Planejado | Medium | Rate Limit |
| **Billing** | Credit Consumption | 🔴 Planejado | Critical | Transactional |
| **Ops** | Admin Dashboard (God Mode) | 🔴 Planejado | High | Approval Required |

## 6. Regras de Ouro (Inquebráveis)
1.  **No Ghost Actions:** Nenhuma mudança de estado ocorre sem um `job_id` associado.
2.  **Schema First:** Inputs e Outputs de IA são validados com Zod antes de processar. Se falhar, o job falha.
3.  **Optimistic UI, Pessimistic Execution:** A UI mostra sucesso imediato (quando seguro), mas o backend valida tudo.
4.  **Audit Log Imutável:** Nunca deletamos histórico de jobs ou créditos. Apenas arquivamos ("Soft Delete").
5.  **Privacy by Default:** PII (Email, Telefone) é mascarado nos logs de auditoria e só revelado sob demanda (consumindo crédito).

## 7. Estratégia de Ambiente
*   **Local:** Supabase CLI (Docker local). Mocks para Gemini.
*   **Staging:** Projeto Supabase "Sandbox". Dados sanitizados.
*   **Prod:** Projeto Supabase "Live". Chaves de API reais.

## 8. Laboratório de Simulação
*   **Túnel:** Teste de latência (simular 3G no Chrome DevTools).
*   **Dedão:** Teste de usabilidade mobile (áreas de toque > 44px).
*   **Custo:** Calculadora de tokens Gemini por job.
*   **Caos:** Script para disparar 100 jobs falhos e testar resiliência da fila.

## 9. Changelog
*   **v4.0.0 (Hoje):** Definição da Arquitetura de Governança, Trinity Files e Action Contracts.
