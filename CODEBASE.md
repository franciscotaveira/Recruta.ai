# CODEBASE — Recrutaria 🛡️

> **Stack:** React (Vite) + Node.js (Express) + Supabase + Evolution API
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
- **`index.ts`**: Orquestração de APIs, webhooks de pagamento (AbacatePay) e integração WhatsApp.
- **`storage/db.ts`**: Camada de persistência com RLS (Row Level Security) hardcore.
- **`payment/abacate.ts`**: Gestão de faturamento e pacotes de créditos (10 a 500 disparos).

---

## 🔑 Segurança e Multi-tenancy
- **RLS Ativado:** Todas as tabelas críticas (`public_jobs`, `whatsapp_sessions`, etc.) isoladas por `auth.uid()`.
- **RBAC:** Separação rígida entre fluxos de Candidato (B2C) e Recrutador (B2B).

---

## 🚀 Status de Produção
- **Naming:** Recrutaria (Finalizado).
- **Branding:** 3D Neural Crystal (Finalizado).
- **Pricing:** R$ 29,90 (Elite Advisor) / R$ 397 (Pro Mensal).

---
_MCT OS v2.0 | CODEBASE.md_
