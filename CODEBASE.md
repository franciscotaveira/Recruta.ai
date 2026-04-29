# CODEBASE — Recruta.AI 🚀

> **Estado Atual:** Estabilizado e em Produção (Hostinger VPS)
> **Data:** 29 de Abril de 2026

## 🏗️ Stack Tecnológica
- **Frontend:** React + Vite + TailwindCSS (MCT Design System)
- **Backend:** Node.js (TypeScript) + Fastify
- **Database:** Supabase (PostgreSQL + RLS)
- **WhatsApp:** WhatsApp Cloud API (Graph API v21.0)
- **IA/ML:** 
  - **OpenRouter:** Motor principal para Transcrição e Geração de Perguntas (Gemini 3 Flash / 2.5 Flash).
  - **Google Gemini SDK:** Usado como fallback.

## 🛠️ Padrões de Código
- **Truth in Data:** Dados reais ou estado vazio, nunca placeholders.
- **Agentic Flow:** Conversas gerenciadas via `server/conversation/flow.ts` com trava por número de telefone.
- **Multimodalidade:** Suporte nativo a áudio via `input_audio` no OpenRouter.

## 📍 Patches de Hoje
1.  **WA Media Fix:** `server/whatsapp/client.ts` diferencia Phone ID vs Graph URL para mídia.
2.  **Multimodal CV Parser:** `server/ai/cv-parser.ts` usa Gemini para converter PDF/Imagens em Markdown + JSON estruturado.
3.  **Strategic Screening (BARS/STAR):** Refatorado `server/conversation/questions.ts` para triagem comportamental com foco em evidências e cenários de role-play.
4.  **Recruta Express ⚡:** Implementada ingestão Drag & Drop no Dashboard para criação e convite automático de candidatos via upload de currículo.

## 🧠 Skills Ativas
- **CV-Parser:** Conversão Multimodal de alta fidelidade para Markdown (conformidade LGPD).
- **Strategic-Interviewer:** Motor de 3-5 perguntas dinâmicas baseadas em STAR e metodologias BARS.
- **WhatsApp-Orchestrator:** Gestão de estados de conversa com trava por concorrência.

---
_MCT OS v2.0 | CODEBASE.md_
