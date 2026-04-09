# 🚀 Bootstrap Checklist: Recruta.AI v4

> **Objetivo:** Sair do zero para um "Hello World Governed" em 2 horas.

## Fase 1: Setup & Infra (30 min)
- [ ] **Criar Repositório:** `git init` com estrutura de pastas definida em PROJECT_CONTEXT.
- [ ] **Setup Supabase:**
    - Criar projeto novo no Supabase.
    - Rodar `supabase init` localmente.
    - Configurar Env Vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY`.
- [ ] **Database Schema (SQL):**
    - Tabela `profiles` (extends auth.users).
    - Tabela `jobs` (id, type, status, payload, result, user_id, created_at).
    - Tabela `audit_logs` (immutable).
    - Tabela `credits_ledger` (transactional).
- [ ] **Setup Frontend:**
    - `npm create vite@latest recruta-ai -- --template react-ts`
    - `npx shadcn-ui@latest init`
    - Instalar `@google/genai`, `@supabase/supabase-js`, `zod`.

## Fase 2: Governance Engine (45 min)
- [ ] **Action Manager:**
    - Criar `src/lib/ActionManager.ts`.
    - Carregar `ACTION_CONTRACTS.json`.
    - Implementar função `validateIntent(actionId, payload)`.
- [ ] **Job System (Mock):**
    - Criar `src/lib/JobQueue.ts` (usando `setTimeout` para simular worker inicialmente).
    - Ao criar um job, salvar em Supabase `jobs` table.
    - Usar `supabase.channel('jobs')` para ouvir updates em tempo real.

## Fase 3: UI "Lovable-like" (45 min)
- [ ] **Chat Layout:**
    - Criar layout com Sidebar (Histórico) e Main (Chat Stream).
- [ ] **Intent Parsers:**
    - Botão simples "Analisar CV" que dispara a action `candidate.analyze_cv`.
- [ ] **Approval Widget:**
    - Componente que aparece quando `risk_level >= high`.
    - Botões "Aprovar" (Executa Job) e "Rejeitar" (Cancela Job).

## Fase 4: Integração AI (Final)
- [ ] **Edge Function:**
    - Criar `supabase functions new analyze-cv`.
    - Instalar SDK do Gemini na Edge Function.
    - Conectar Worker (Fase 2) para chamar essa função.

## 🛡️ Verificação de Segurança
- [ ] RLS (Row Level Security) ativado no Supabase? (Candidato só vê seus jobs).
- [ ] API Keys do Gemini apenas no Server-side (Edge Functions)?
- [ ] `ACTION_CONTRACTS.json` validando inputs?
