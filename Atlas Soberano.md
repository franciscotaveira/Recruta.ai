# Atlas Soberano — Recruta.AI 🛡️

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
- **Supabase:** Conectado via Client SDK e Service Key no backend.

## 🧠 Decisões Arquiteturais (ADRs)
- [2026-04-29] Abandono de n8n: Fluxo 100% via código para máxima velocidade e controle de custos.
- [2026-04-29] Migração para OpenRouter: Escolhido como broker de IA para evitar limites de cota do Google Gemini em produção.
- [2026-04-29] Media Download Direct: Bypass do Phone ID no Meta para download de áudios, resolvendo o erro OAuthException 2500.
- [2026-04-29] Capability-First Engine: Pivot para triagem baseada em habilidades e evidências comportamentais (BARS/STAR), eliminando perguntas técnicas genéricas.
- [2026-04-29] Recruta Express: Motor de ingestão multimodal (PDF/Img para MD) para acelerar o onboarding de candidatos sem fricção manual.

## 🎯 Próximos Passos (Sprint Atual)
1.  [OK] Validar o fluxo de "Role Play" na triagem.
2.  [OK] Implementar "Recruta Express" (Drag & Drop de Currículos).
3.  Expandir o Dashboard de acompanhamento em tempo real para recrutadores.
4.  Hardening das políticas de RLS no Supabase.

---
_MCT OS v2.0 | Atlas Soberano.md_
