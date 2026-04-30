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
- [2026-04-29] Migração para OpenRouter: Escolhido como broker de IA para evitar limites de cota do Google Gemini em produção.
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

---
_MCT OS v2.0 | Atlas Soberano.md_
