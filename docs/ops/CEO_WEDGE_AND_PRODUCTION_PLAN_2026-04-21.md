# CEO Wedge and Production Plan

## Objective

Turn Recrutaria into a sellable, production-safe wedge product before expanding scope.

Core promise:

- company creates a job
- company invites candidate on WhatsApp
- candidate completes structured audio screening
- recruiter receives a usable diagnostic
- company pays for the workflow

Anything outside this path is secondary until this loop is stable and monetized.

## Wedge Definition

Primary ICP:

- small and medium-sized companies
- lean HR or founder-led hiring
- moderate hiring volume
- high friction in early screening

Primary use case:

- async pre-screening on WhatsApp
- audio answers with structured prompts
- AI-assisted diagnostic for recruiter review

What the product is not, for now:

- full ATS replacement
- enterprise HR suite
- generic candidate marketplace
- autonomous company with no human review

## Product Scope for Paid Pilots

In scope:

- recruiter auth
- job creation
- WhatsApp invite
- consent collection
- mic check
- structured screening questions
- audio ingestion/transcription
- recruiter diagnostic
- payment and credit activation
- operational logs and correlation IDs

Out of scope for pilot sales:

- advanced CRM automation
- broad candidate self-serve marketplace claims
- high-complexity multi-agent orchestration in customer-facing flows
- speculative “AI company” features not tied to revenue

## Production Gates

The product is pilot-ready only when all items below hold:

1. `landing -> register/login -> job -> invite -> candidate reply -> diagnosis` works end to end.
2. WhatsApp webhook rejects invalid signatures and ignores duplicate inbound events.
3. Consent requires explicit affirmative language and cannot be skipped by generic replies.
4. Concurrent inbound messages from the same phone do not corrupt session state.
5. Payment webhook is idempotent and credits are not duplicated.
6. Frontend has separate destinations for:
   - institutional
   - companies
   - candidates
   - admin
7. Production env check passes before deploy.

## Commercial Motion

Sell this as:

- “triagem inicial por WhatsApp com diagnóstico estruturado”

Do not sell this as:

- “plataforma completa de RH com tudo”

Commercial packaging:

- prepaid credits as default
- optional recurring plan for continuous operation
- implementation framed as fast pilot, not transformation project

## Metrics That Matter

Weekly scoreboard:

- invite sent rate
- invite delivery rate
- candidate response rate
- triage completion rate
- average time from invite to diagnostic
- recruiter review rate
- paid credits consumed
- pilot accounts activated

## Immediate Execution Order

1. Stabilize the WhatsApp flow and production credentials.
2. Align the institutional site to the wedge message.
3. Run 3 to 5 paid pilots with controlled onboarding.
4. Collect conversion and completion data.
5. Expand only after the loop is repeatable.

## Rule for Roadmap Decisions

If a feature does not improve:

- conversion
- completion
- decision quality
- operational reliability
- revenue

it should not delay production.
