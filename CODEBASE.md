# CODEBASE — Recrutaria 🛡️

> **Stack:** React (Vite) + Node.js (Express) + Supabase + Evolution API + Asaas
> **Filosofia:** Truth in Data — Dado real ou estado vazio.

---

## 🏗️ Arquitetura do Sistema

### 🎨 Frontend (`/src`)
- **Páginas Core:**
  - `LandingPage.tsx`: Vitrine institucional com o novo branding **Recrutaria**.
  - `Dashboard.tsx`: Central de métricas e controle neural.
  - `Billing.tsx`: Gestão de créditos e assinaturas do SaaS Híbrido.
- **Componentes:**
  - `s-glass`: Sistema de Glassmorphism (MCT Sovereign Standard).
  - `CandidateComparison.tsx`: Inteligência de análise de talentos.

### ⚙️ Backend (`/server`)
- **`index.ts`**: Orquestração de APIs, observabilidade neural e integração WhatsApp.
- **`storage/db.ts`**: Camada de persistência com RLS (Row Level Security) e logging de eventos (`system_logs`).
- **`payment/asaas_webhook.ts`**: Gestão de faturamento B2B/B2C via Asaas com suporte a assinaturas e créditos.
- **`lib/asaas.ts`**: Biblioteca de integração soberana com a API do Asaas.

---

## 🔑 Segurança e Multi-tenancy
- **RLS Ativado:** Todas as tabelas críticas (`public_jobs`, `whatsapp_sessions`, etc.) isoladas por `auth.uid()`.
- **RBAC:** Separação rígida entre fluxos de Candidato (B2C) e Recrutador (B2B).

---

## 🚀 Status de Produção
- **Naming:** Recrutaria (Finalizado).
- **Branding:** 3D Neural Crystal (Finalizado).
- **Pricing:** R$ 29,90 (Elite Advisor) / R$ 397 (Pro Mensal).
- **Security:** Hardened (v2) - RLS + Revoked Public Functions.
- **Observability:** Mothership Dashboard Active.

---
_MCT OS v2.0 | CODEBASE.md_
