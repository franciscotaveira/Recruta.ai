# Atlas Soberano — Recrutaria 🛡️

> **Proprietário:** Francisco Rios | MCT LTDA
> **Filosofia:** Poder invisível, simplicidade visível.

## 🌐 Infraestrutura (Sovereign Kernel)
- **Servidor:** Hostinger VPS (SRV1549516)
- **IP:** `187.127.9.92`
- **Orquestração:** Docker Compose
- **Domínio:** `recrutaria.com.br`

## 🔑 Credenciais de Referência (MCT Standard)
- **WhatsApp API:** v21.0 | Phone ID scoped.
- **OpenRouter:** `sk-or-v1-d2b6acc776b1...` (Soberano)
- **Supabase:** Conectado via `csuxlpodmqmycxfkmuxv.supabase.co`

## 🧠 Decisões Arquiteturais (ADRs)
- [2026-04-29] Abandono de n8n: Fluxo 100% via código para máxima velocidade e controle de custos.
- [2026-04-29] Migração para OpenRouter: Escolhido como broker de IA para evitar limites de cota do Google Gemini em produção. Atualizado em 2026-04-30 para Gemini 3 Flash (SEO) e Gemini 3 Pro (Lógica).
- [2026-04-29] Media Download Direct: Bypass do Phone ID no Meta para download de áudios, resolvendo o erro OAuthException 2500.
- [2026-04-29] Capability-First Engine: Pivot para triagem baseada em habilidades e evidências comportamentais (BARS/STAR), eliminando perguntas técnicas genéricas.
- [2026-04-29] Recruta Express: Motor de ingestão multimodal (PDF/Img para MD) para acelerar o onboarding de candidatos sem fricção manual.
- [2026-04-29] Elite Candidate Experience: Engine v4 com análise de 4 pilares (Clareza, Evidência, Foco, Atualização) e Career Chat Advisor real-time.
- [2026-04-29] Multi-Methodology Evidence: Expansão do framework de avaliação para incluir Situacional, PAR, CAR e BARS ancorado por IA.

- [2026-04-30] SaaS Híbrido (Assinatura + Consumo): Transição comercial para modelo de recorrência (Pro Mensal/Anual) para triagem ilimitada + pacotes de créditos variáveis para disparos de WhatsApp.
- [2026-04-30] B2C Pivot (Elite Advisor): Precificação do diagnóstico de carreira para R$ 29,90, focando em volume e acessibilidade para candidatos, mantendo o ticket alto no B2B.
- [2026-04-30] Live Control Command Center: Implementação de monitoramento neural em tempo real com KPI global, logging de eventos sistêmicos e intervenção ativa.
- [2026-04-30] RLS Security Hardening: Implementação de Row Level Security em todas as tabelas (Jobs, Sessions, Billing, Logs) garantindo isolamento multi-tenant absoluto e proteção de PII.

## 🎯 Próximos Passos (Sprint Atual)
1.  [OK] Validar o fluxo de "Role Play" na triagem.
2.  [OK] Implementar "Recruta Express" (Drag & Drop de Currículos).
3.  [OK] Expandir Framework de Evidências (STAR/BARS/Situacional).
4.  [OK] Elite Candidate Experience (Painel + Chat Advisor).
5.  [OK] Live Control: Dashboard de acompanhamento em tempo real para recrutadores.
6.  [OK] Hardening das políticas de RLS no Supabase.

## 🎨 Framework de Conversão Front-End (SaaS Landing Pages)

**Regra de Ouro (MCT OS):**
> "Antes de escrever a landing page, defina uma hipótese clara de posicionamento: quem compra, qual dor sente, qual transformação busca e por que essa solução é melhor que o status quo."

Ao acionar agentes de Frontend (`@frontend-skill`) para criar páginas SaaS, use OBRIGATORIAMENTE o seguinte template de prompt para garantir páginas que convertem, e não apenas páginas bonitas:

```text
Crie uma landing page moderna, minimalista e focada em conversão para um SaaS chamado [APP NAME].

Contexto do produto:
[Explique em 2-3 frases o que o app faz, para quem é e qual problema resolve.]

Público-alvo:
[Descreva o ICP: cargo, tipo de empresa, nível técnico, principal dor e objetivo.]

Objetivo da página:
Converter visitantes em [trial, demo, waitlist, lead, compra].

Direção de marca:
- Cor primária: [HEX]
- Fonte: Inter ou sans-serif similar
- Estilo visual: minimalista, profissional, premium, com bastante espaço em branco
- Tom de voz: direto, confiante, moderno, sem exageros
- Sensação desejada: clareza, confiança, eficiência

Requisitos de design:
- Página responsiva para desktop e mobile
- Layout limpo, rápido e com baixa carga visual
- Uma única CTA principal repetida ao longo da página
- Use cards, ícones simples e mockups visuais
- Evite menus complexos
- Evite textos genéricos ou clichês

Estrutura da página:

1. Hero section
- Headline forte explicando o que o produto faz e para quem
- Subheadline com o principal resultado entregue
- CTA principal: [CTA TEXT]
- Mockup limpo do produto no lado direito
- Pequena frase de confiança abaixo do CTA

2. Problem section
- Headline: "The problem with [OLD WAY]"
- 2-3 parágrafos curtos explicando as dores reais do público
- Foque em perda de tempo, processos manuais, falta de visibilidade ou custo operacional

3. How it works
- Headline: "How it works"
- 3 etapas simples com ícones
- Cada etapa deve ter uma microcopy clara e uma pequena ilustração/mockup

4. Benefits
- Headline: "Why [TARGET AUDIENCE] love [APP NAME]"
- 4 cards de benefício escritos como outcome, não feature (Ex: "Cut reporting time by 80%")

5. Social proof
- Headline: "What people are saying"
- 3 depoimentos realistas com nome, cargo e empresa (ou credibility signals)

6. FAQ
- 5 perguntas que removam objeções comuns (Segurança, Cancelamento, etc)

7. Final CTA
- Headline: "Ready to [MAIN OUTCOME]?"
- Mesmo CTA da hero

8. Footer
- Copyright, Privacy, Terms, Contact

Entregue como: React + Tailwind + Copywriting estruturado.
Importante: Sem lorem ipsum. Sem copy vaga. Priorize clareza, conversão e credibilidade.
```

---
## 🛠️ Stack Soberana MCT (2026)

```yaml
ai:
  router: OpenRouter
  modelos_ativos: [google/gemini-3.1-pro-preview, google/gemini-3-flash-preview]
  fallback: google/gemini-flash-1.5
  nota: "Priorizar Gemini 3 Flash para volume/SEO e 3.1 Pro para lógica complexa (recrutamento/análise)"

whatsapp:
  engine: Evolution API
  status: Produção | Phone ID Scoped
  mct_tools: [fetch_instances, create_instance, instance_connect]

database:
  engine: Supabase
  security: RLS Active | Multi-tenant isolation

infra:
  platform: Hostinger VPS
  orchestrator: Docker Compose
  deploy: rsync + build automation
```

---
_MCT OS v2.0 | Atlas Soberano.md_
