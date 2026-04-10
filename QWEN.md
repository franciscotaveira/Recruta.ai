# QWEN.md — Recruta.AI Context

## Project Overview

**Recruta.AI** is a Brazilian SaaS recruitment platform with a **dual-market model (B2C + B2B)** powered by Google Gemini AI.

- **For Candidates (B2C):** AI-driven CV optimization, SCPD diagnostic scoring, career cycle tracking, and ATS-friendly resume rewriting.
- **For Recruiters (B2B):** Automated candidate triage, job pipeline management, credit-based scoring system, and legacy database reactivation.

The core product thesis: candidates pay ~R$49 for an AI diagnostic that rewrites their CV to pass ATS filters; recruiters buy credit packs (50–1000 credits) and pay 1 credit per candidate activation (viewing contact info or sending an invite).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript (SPA) |
| **Build Tool** | Vite 6 |
| **Routing** | React Router v6 (HashRouter) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Typography** | Geist Variable, Inter |
| **AI Integration** | Google Gemini (`gemini-3.1-pro`, `gemini-3.1-flash`) via `@google/genai` |
| **State Management** | React Context API (`AuthContext`, `DataContext`) |
| **Persistence** | `localStorage` (mock — no real backend yet) |
| **Icons** | Lucide React |
| **Linting** | ESLint + Prettier |
| **UI Components** | shadcn/ui (base-nova style) |

---

## Project Structure

```
recruta.ai---recrutamento-inteligente/
├── src/
│   ├── App.tsx                  # Main router (/, /recruiter/*, /candidate/*)
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Tailwind + shadcn theme config (OKLCH colors)
│   ├── types.ts                 # Core TS types (Candidate, Job, Application, etc.)
│   ├── constants.ts             # Mock data (user, candidates, jobs, credit packages)
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Simulated auth with localStorage persistence
│   │   └── DataContext.tsx      # Candidates/jobs/analyses state (in-memory)
│   ├── services/
│   │   ├── geminiService.ts     # Real Gemini AI integration (analyzeCV, matchCVToJob, generateCVSuggestions)
│   │   └── mock.ts              # Mock services (CandidateService, JobService, CreditService)
│   ├── components/
│   │   ├── Layout.tsx           # Legacy generic layout (unused)
│   │   ├── CandidateLayout.tsx  # Candidate sidebar + dark mode + AI Copilot
│   │   ├── RecruiterLayout.tsx  # Recruiter sidebar + light mode + notifications
│   │   ├── AICopilot.tsx        # Floating AI assistant component
│   │   ├── ui/                  # shadcn/ui components
│   │   └── recruiter/           # Recruiter-specific components
│   └── pages/
│       ├── LandingPage.tsx      # Dual landing (candidate/recruiter toggle)
│       ├── recruiter/
│       │   ├── Dashboard.tsx    # Recruiter overview, KPIs, bulk activation
│       │   ├── Jobs.tsx         # Job listing
│       │   ├── JobKanban.tsx    # Kanban-style candidate pipeline
│       │   ├── Candidates.tsx   # Talent bank
│       │   └── Billing.tsx      # Credit wallet & packages
│       └── candidate/
│           └── Dashboard.tsx    # Candidate score, diagnosis, optimizer, jobs
├── pages/                       # Duplicate/legacy page copies (unused)
├── components/                  # Duplicate/legacy component copies (unused)
├── docs/                        # Additional documentation
├── migrated_prompt_history/     # AI prompt history from development
├── .env.local                   # GEMINI_API_KEY placeholder
├── package.json
├── tsconfig.json
├── vite.config.ts
└── [Documentation files]        # ARCHITECTURE.md, MAPPING_DO_SISTEMA.md, MOAT_STRATEGY_3YEARS.md, etc.
```

---

## Key Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Format code
npm run format
```

**Environment setup:** Set `GEMINI_API_KEY` in `.env.local` with a valid Google AI Studio API key. Current value is `PLACEHOLDER_APIKEY`.

---

## Architecture & Data Flow

### Current State (MVP — Frontend Only)

```
Landing Page (toggle B2C/B2B)
  ├── Candidate Dashboard
  │     ├── SCPD Score display
  │     ├── External job optimizer (paste job description → AI rewrites CV)
  │     ├── Diagnosis panel (strengths, weaknesses, attention points)
  │     └── Mock internal jobs list (bonus feature)
  │
  └── Recruiter Dashboard
        ├── KPI cards (active processes, triage funnel)
        ├── Job pipeline with candidate cards
        ├── Bulk activation modal (upload CSV/PDF → pay credits)
        └── Legacy database reactivation ("Reaquecimento")
```

**Data persistence:** All data lives in `localStorage` via mock services (`CandidateService`, `JobService`, `CreditService`). There is no real backend, database, or multi-user support.

**AI services:** `geminiService.ts` has fully functional Gemini integration with JSON-structured responses for CV analysis, job matching, and CV suggestions. However, these are **not connected to the UI** — dashboards use hardcoded mock data instead.

---

## Critical Known Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | **No real backend** | 🔴 Critical | Everything is `localStorage`. No multi-tenant, no real auth, no server-side processing. |
| 2 | **Auth not wired up** | 🔴 Critical | `AuthProvider` and `DataProvider` are **not** wrapping `App.tsx`. No login flow exists. Routes have no guards. |
| 3 | **Gemini AI disconnected from UI** | 🟡 High | Services exist but dashboards use mock data. No CV upload → analysis flow. |
| 4 | **Duplicate types** | 🟡 Medium | `Candidate` and `Job` defined in both `types.ts` and `DataContext.tsx`. |
| 5 | **Env variable mismatch** | 🟡 Medium | `vite.config.ts` maps `process.env.API_KEY` and `process.env.GEMINI_API_KEY` — the service uses `API_KEY` which may not resolve correctly. |
| 6 | **Placeholder pages** | 🟡 Medium | Diagnosis, CV Editor, Career Evolution routes render stub "coming soon" components. |
| 7 | **Duplicate folders** | 🟢 Low | `pages/` and `components/` at root are duplicates of `src/pages/` and `src/components/`. |
| 8 | **No tests** | 🟡 Medium | Zero test coverage. Refactoring is risky. |
| 9 | **No error handling** | 🟡 Medium | Gemini fallbacks are generic. No user-facing error states. |

---

## Key Business Concepts

### SCPD Score (Candidate Diagnostic)
A 0–100 score based on 4 pillars:
- **Clarity** — Is the career trajectory clear?
- **Evidence** — Are results backed by metrics/data?
- **Focus** — Is the CV targeted at the desired role?
- **Freshness** — Are skills and keywords up-to-date?

### Credit System (Recruiter B2B)
- Recruiters buy credit packs: Starter (50cr/R$199), Growth (200cr/R$699), Scale (1000cr/R$2990)
- 1 credit = 1 candidate activation (view contact info or send invite)
- Bulk triage: upload CSV/PDF, choose how many to process, pay per activation
- Auto-recharge: configurable threshold + amount

### Payment Flow (MVP)
Currently redirects to **WhatsApp** with a pre-filled message. No Stripe/MercadoPago integration exists.

---

## Development Conventions

- **TypeScript strict mode** — all files are `.tsx`/`.ts` with explicit types
- **Tailwind-first styling** — utility classes inline in JSX; no CSS modules
- **Dark mode support** — class-based via `document.documentElement.classList`
- **Component naming** — PascalCase for components, camelCase for services/hooks
- **Mock data pattern** — constants in `constants.ts`, services in `services/mock.ts`
- **No code comments** inside components (self-documenting JSX)
- **Animations** — custom keyframes in `index.css` (`fadeInUp`, `pulse-slow`, `bounce-slow`)

---

## Strategic Context (from Documentation)

The project has extensive strategic documentation (`MOAT_STRATEGY_3YEARS.md`, `MVP_RISK_ADJUSTMENTS.md`, `IMPLEMENTATION_MOAT_MVP.md`) outlining a 3-year defensibility plan:

1. **Layer 1 (Months 1–6):** Behavioral data moat — log every CV analysis to fine-tune prompts
2. **Layer 2 (Months 6–18):** Integration lock-in — Gupy/LinkedIn ATS integrations
3. **Layer 3 (Months 18–36):** Predictive hiring engine + vertical specialization

The architecture document (`ARCHITECTURE.md`) has a 5-phase refactor plan: backend → auth integration → context wiring → design system unification → deployment.

---

## When Working on This Codebase

1. **Before editing:** Check if the file is in `src/` (active) or root `pages/`/`components/` (likely duplicates).
2. **For new features:** Use `src/components/` and `src/pages/` — not the root-level duplicates.
3. **AI integration:** `geminiService.ts` is production-ready but unused. Wire it into UI components to make AI features functional.
4. **Auth first:** Any real feature work requires wiring `AuthProvider`/`DataProvider` into `App.tsx` and adding route guards.
5. **Backend eventually:** The mock services (`services/mock.ts`) are designed to be replaced by real API calls — keep the interface consistent.
6. **Key env:** The Gemini service reads `process.env.API_KEY`. Ensure `.env.local` has `GEMINI_API_KEY` set (mapped in `vite.config.ts`).
