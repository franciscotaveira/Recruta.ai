# Recruta.AI API Contracts (v1)

Version: `v1`
Last updated: `2026-04-23`

## Error Contract
All non-2xx responses must follow:

```json
{
  "error": "human readable message",
  "code": "OPTIONAL_MACHINE_CODE",
  "details": {}
}
```

## Pagination Contract
All paginated list responses should follow:

```json
{
  "data": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

## Auth
- `POST /api/auth/register`
  - req: `{ email, password, role, name? }` where `role` is `candidate` or `recruiter` (admin não é público)
  - res: `{ token, userId, role, email, name? }`
- `POST /api/auth/login`
  - req: `{ email, password }`
  - res: `{ token, userId, role, email, name? }`
- `GET /api/auth/me`
  - req header: `Authorization: Bearer <token>`
  - res: `{ id, email, role, name?, verified? }`

Admin bootstrap:
- Conta admin é provisionada no boot quando `ADMIN_EMAIL` e `ADMIN_PASSWORD` estiverem definidos no ambiente.

## Jobs
- `GET /api/jobs?location&limit&offset`
- `GET /api/recruiter/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `POST /api/jobs/:id/close`
- `GET /api/jobs/:id/applications?limit&offset`

### Jobs: applications recruiter contract
`GET /api/jobs/:id/applications` returns recruiter-facing applications already shaped for blind screening.

Relevant fields:
- `id: string`
- `job_id?: string`
- `candidate_name?: string | null`
- `blind_candidate?: { enabled: boolean; label: string; maskedName: string | null; maskedPhone: string | null }`
- `match_score?: number | null`
- `status?: string`
- `applied_at?: string`
- `updated_at?: string`

When `blindScreeningEnabled=true`, `candidate_name` may be `null` and the UI must prefer `blind_candidate.label`.

### Jobs: requirements contract
`POST /api/jobs` and `PUT /api/jobs/:id` accept `requirements` as array.

Structured requirement item (preferred):

```json
{
  "text": "Experiência com vendas consultivas B2B",
  "category": "skill",
  "importance": "must_have",
  "weight": 5,
  "knockout": true,
  "evidenceType": "behavioral",
  "knockoutQuestion": "Descreva um caso real de vendas complexas B2B que você conduziu."
}
```

Fields:
- `text: string` (required)
- `category: string` (recommended default: `skill`)
- `importance?: "must_have" | "preferred"` (default: `preferred`)
- `weight?: number` (1..5, default: `3`)
- `knockout?: boolean` (default: `false`)
- `evidenceType?: "objective" | "behavioral" | "technical" | "situational"` (default inferido por categoria)
- `knockoutQuestion?: string` (optional; used when `knockout=true`)

Legacy compatibility:
- Old/simple payload (`[{ "text": "...", "category": "skill" }]`) remains accepted.
- Backend normaliza variantes legadas (`should_have`, `nice_to_have`, `audio_answer`, `experience`, `portfolio`) para os valores canônicos.

## Candidate
- `GET /api/candidate/profile`
- `PUT /api/candidate/profile`
- `POST /api/candidate/cv/analyze`
- `POST /api/transcribe` (binary audio body, authenticated)
- `GET /api/candidate/cv/versions`
- `POST /api/candidate/apply`
- `GET /api/candidate/applications?limit&offset`
- `GET /api/recruiter/candidates`
- `GET /api/recruiter/candidates/export?format=csv|json&includePii=true|false&limit=1..2000`

### Recruiter candidate bank contract
`GET /api/recruiter/candidates` returns recruiter-facing profiles already shaped by blind screening governance.

Relevant fields:
- `id: string`
- `name?: string | null`
- `email?: string | null`
- `phone?: string | null`
- `location?: string | null`
- `target_role?: string | null`
- `seniority?: string | null`
- `diagnosis?: string | null`
- `cv_master?: string | null`
- `blind_candidate?: { enabled: boolean; label: string; maskedName: string | null; maskedPhone: string | null }`
- `history?: Array<{ id: string; status?: string; match_score?: number | null; applied_at?: string; updated_at?: string; public_jobs?: { title?: string | null; company?: string | null } | null }>`

When blind screening is active, `name`, `email` and `phone` may be nulled and `cv_master` / `diagnosis` may arrive sanitized.

### Recruiter candidate export contract
`GET /api/recruiter/candidates/export` supports `format=csv|json`.

Rules:
- blind by default, mesmo quando a governança global permite dados nominais
- `includePii=true` só aplica quando `blindScreeningEnabled=false`
- se `blindScreeningEnabled=true`, o payload permanece redigido mesmo com `includePii=true`

JSON response shape:
- `exportedAt: string`
- `format: "json"`
- `total: number`
- `includePiiRequested: boolean`
- `includePiiApplied: boolean`
- `governanceBlindScreeningEnabled: boolean`
- `data: Array<{ profile_id, blind_label, name, email, phone, location, target_role, seniority, scp_score, history_count, latest_job, latest_company, latest_status, attention_points, diagnosis, updated_at }>`

CSV response:
- same columns as JSON `data`
- content type `text/csv; charset=utf-8`
- filename `recruiter-candidates-YYYY-MM-DD.csv`

### Recruiter bulk analysis contract
- `POST /api/recruiter/bulk-analyze`
- `GET /api/recruiter/bulk-results/:jobId`

Relevant bulk candidate fields:
- `profile_id: string`
- `name: string | null`
- `phone: string | null`
- `email?: string | null`
- `cvText: string`
- `matchScore: number`
- `strengths: string[]`
- `concerns: string[]`
- `summary: string`
- `recommendation: "entrevistar" | "rejeitar" | "talvez"`
- `blind_candidate?: { enabled: boolean; label: string; maskedName: string | null; maskedPhone: string | null }`

`POST /api/recruiter/bulk-analyze` response also returns:
- `jobId: string`
- `totalAnalyzed: number`
- `errors: Array<{ profile_id: string; name: string; phone?: string | null; error: string; blind_candidate?: ... }>`
- `creditsSpent?: number`
- `creditsRefunded?: number`
- `creditsRemaining?: number`

When blind screening is active, `name`, `phone` and `email` may be nulled and the UI must prefer `blind_candidate`.

## Payment
- `POST /api/payment/credits`
  - req: `{ packageId, customer? }`
  - `customer` shape:
    - `name: string`
    - `email: string`
    - `phone: string` (DDI + DDD + número)
    - `taxId: string` (CPF/CNPJ)
- `POST /api/payment/diagnostic`
  - req: `{ customer? }`

In production, `customer` is mandatory at business level (backend validates required fields).

## WhatsApp
- `GET /api/whatsapp/webhook`
  - verify endpoint (Meta challenge)
- `POST /api/whatsapp/webhook`
  - signed event endpoint (`x-hub-signature-256`)
- `POST /api/whatsapp/invite`
- `POST /api/whatsapp/invite-bulk`
- `GET /api/whatsapp/sessions/:jobId?limit&offset`
- `GET /api/whatsapp/recruiter/sessions?limit&offset`
- `GET /api/recruiter/review-queue?limit&offset`
- `GET /api/whatsapp/sessions/:sessionId/audios`
- `GET /api/whatsapp/audio/:audioId/stream`

Invite contract:
- `POST /api/whatsapp/invite`
  - req: `{ jobId, candidatePhone?, candidateName?, profileId?, jobTitle?, companyName? }`
  - rule: recruiter must own `jobId`
  - rule: either `candidatePhone` or `profileId` is required
  - when `profileId` is sent, candidate phone/name are resolved server-side from `candidate_profiles`

Bulk invite contract:
- `POST /api/whatsapp/invite-bulk`
  - req: `{ jobId, candidates: [{ profileId?, phone?, name? }], jobTitle?, companyName? }`
  - rule: recruiter must own `jobId`
  - candidate rule: each item must resolve a usable phone via `phone` or `profileId`
  - res: `{ total, results }` where each result includes:
    - `profile_id: string | null`
    - `name: string | null`
    - `phone: string | null`
    - `sessionId?: string`
    - `error?: string`
    - `blind_candidate?: { enabled: boolean; label: string; maskedName: string | null; maskedPhone: string | null }`

When blind screening is active, bulk invite result rows may return `name/phone` nulled and the UI must prefer `blind_candidate`.

Recruiter session payload:
- `candidate_name: string | null`
- `candidate_phone: string | null`
- `blind_candidate?: { enabled: boolean; label: string; maskedName: string | null; maskedPhone: string | null }`

When blind screening is active, recruiter-facing session endpoints may null the raw candidate fields and expose only `blind_candidate`.

Session state machine:
- `invited` -> convite enviado
- `consent_pending` -> aguardando consentimento explícito de uso de IA
- `mic_check` -> aguardando teste de áudio não avaliativo
- `accepted` -> pronto para iniciar perguntas
- `questioning` -> respondendo perguntas de triagem
- `handoff_requested` -> automação pausada e encaminhada para RH humano
- `completed` -> triagem finalizada com análise
- `declined` -> candidato recusou ou não consentiu

Session payload (additional analysis fields when `state=completed`):
- `summary: string | null`
- `strengths?: string[]`
- `concerns?: string[]`
- `recommendation?: "entrevista" | "rejeitar" | "mais_info" | null`
- `question_scores?: number[]`
- `competency_scores?: Array<{ requirement_id: string; requirement_text: string; category: string; weight: number; score: number; bars_level: 1|2|3|4|5; evidence: "fraca" | "moderada" | "forte"; rationale: string }>`
- `knockout?: { failed: boolean; reason: string; requirement_id: string | null; requirement_text: string | null; answer: string | null }`
- `confidence?: { score: number; level: "low" | "medium" | "high"; autoRecommendationAllowed: boolean; reasons: string[]; signals: { answeredQuestions: number; totalQuestions: number; substantiveAnswers: number; scoreCoveragePct: number; averageQuestionScore: number | null; deepDiveCount: number; textFallbackUsed: boolean; fallbackAnalysisUsed: boolean; knockoutEvaluated: boolean } }`
- `review?: { status: "pending" | "reviewed" | "handoff" | "not_required"; requiresHumanReview: boolean; priority: "low" | "medium" | "high" | "urgent"; reasons: string[]; reviewedAt: string | null; reviewedBy: string | null; finalRecommendation: "entrevista" | "rejeitar" | "mais_info" | null; notes: string | null }`
- `blind_candidate?: { enabled: boolean; label: string; maskedName: string | null; maskedPhone: string | null }`

Operational rules:
- Conteúdo de resposta do candidato é sanitizado antes de ir para análise de IA.
- Triagem pode acionar pergunta de aprofundamento (`deep dive`) sem avançar índice.
- Pedido explícito de atendimento humano aciona `handoff_requested`.

## Recruiter Review Queue
- `GET /api/recruiter/review-queue?limit&offset`
  - retorna fila priorizada para revisão humana
  - aplica blind screening quando habilitado
  - ordena por prioridade (`urgent` > `high` > `medium` > `low`) e atualização mais recente

Resposta paginada:

```json
{
  "data": [
    {
      "session_id": "string",
      "job_id": "string",
      "recruiter_id": "string",
      "state": "completed",
      "candidate": {
        "enabled": true,
        "label": "Perfil ABC123",
        "maskedName": "F********",
        "maskedPhone": "***1234"
      },
      "analysis": {
        "summary": "string|null",
        "recommendation": "entrevista",
        "strengths": ["string"],
        "concerns": ["string"],
        "confidence": {
          "score": 81,
          "level": "high",
          "autoRecommendationAllowed": true,
          "reasons": []
        }
      },
      "review": {
        "status": "pending",
        "requiresHumanReview": true,
        "priority": "medium",
        "reasons": ["human_review_required"]
      }
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

## Webhook Security Rules
- WhatsApp webhook requires valid `x-hub-signature-256`.
- Payment webhook requires valid `x-abacate-signature`.
- Signatures are mandatory in production.

## Admin
- `GET /api/admin/overview` (role: `admin`)
- `GET /api/admin/ai-control` (role: `admin`)
- `PUT /api/admin/ai-control` (role: `admin`)

`GET /api/admin/overview` response includes:
- `users.total`, `users.byRole`
- `jobs.total|active|closed`
- `triage.total|byState|completionRate|declineRate|avgMatchScore`
- `revenue.paidPayments|paidRevenueCents`
- `aiControl` snapshot

`PUT /api/admin/ai-control` accepts patch fields:
- `aiEnabled: boolean`
- `deepDiveEnabled: boolean`
- `textFallbackEnabled: boolean`
- `maxAudioBytes: number` (512000..20971520)
- `modelPolicy: "auto" | "gemini" | "fallback_only"`
