# GTM Decision Memo — Recruta.AI (Q2 2026)

Date: 2026-04-15

## 1. Executive Summary
Recruta.AI should focus the next 90 days on **mid-market and high-volume recruiters in Brazil** (varejo, logística, operações, saúde) with one wedge:
- "**triagem com IA + convite/continuidade no WhatsApp + cobrança por crédito**"

This wedge is aligned with:
- market messaging from incumbent leaders in Brazil (IA + velocidade + WhatsApp no fluxo),
- buyer pressure for time-to-hire and triagem de volume,
- current product strengths already implementadas no backend/frontend.

## 2. Key Findings

### Finding A — O mercado-alvo em BR é grande o suficiente para wedge B2B de recrutamento
- **Fact:** O boletim oficial do governo (Mapa de Empresas, 1º quadrimestre/2025) indica volume muito alto de abertura de empresas e destaca estados com forte dinâmica de novos CNPJs (ex.: SP com 522.563 empresas abertas no período). Fonte oficial do Governo Federal.
- **Inference:** Existe base ampla e ativa de empresas potenciais para oferta de software de recrutamento; primeiro foco deve ser onde há maior churn de contratação operacional.

### Finding B — Líderes de mercado já educam o comprador para IA no RH
- **Fact:** A Gupy se posiciona explicitamente como "plataforma de IA" e destaca funcionalidades como candidatura via WhatsApp e triagem com agentes de IA, além de claims de redução de tempo operacional. Fonte: site oficial da Gupy.
- **Inference:** O problema não é "convencer sobre IA"; o problema é provar resultado operacional mais rápido com onboarding simples.

### Finding C — Adoção de IA em Talent Acquisition está em aceleração
- **Fact:** O material LinkedIn Future of Recruiting 2025 mostra forte concordância de profissionais de TA quanto ao impacto de IA no hiring e percepção de ganho em quality-of-hire. Fonte oficial LinkedIn.
- **Inference:** Existe janela favorável para produto assistivo com humano no loop, desde que governança e confiabilidade sejam explícitas.

### Finding D — Mercado global de software de talento segue crescimento relevante
- **Fact:** Grand View Research estima mercado global de talent management software em USD 9.96B (2023) com projeção para USD 22.67B (2030).
- **Inference:** Tendência macro favorece verticalização e especialização local (Brasil + WhatsApp-first + volume hiring).

### Finding E — Pricing do segmento ATS/HR é comparável com modelo de assinatura e/ou volume
- **Fact:** Workable comunica pricing transparente e trial no site oficial, com segmentação por plano/porte.
- **Inference:** Para competir em entrada, modelo híbrido (assinatura base + consumo por créditos) pode reduzir fricção e melhorar conversão inicial.

## 3. TAM / SAM / SOM (estimativo operacional)

## Assumptions
- Segmento inicial: empresas com contratação recorrente (operações/volume), foco Brasil Sudeste + Sul no primeiro ciclo.
- Ticket médio objetivo fase 1: R$ 500 a R$ 2.500/mês por conta (base + créditos).
- Conversão comercial inicial conservadora: 1% a 3% do pipeline qualificado em 90 dias.

## Estimativa
- **TAM (top-down):** software de gestão/atração de talentos em crescimento global + alta base de empresas ativas/novas no Brasil.
- **SAM (servível em 12 meses):** recrutadores SMB/mid-market no Brasil com dor de triagem em volume e uso intensivo de WhatsApp.
- **SOM (90 dias):** meta realista de 20-60 contas pagantes iniciais, priorizando poucos segmentos e ICP estrito.

Observação: os números acima são deliberadamente conservadores e devem ser recalibrados após 10-15 entrevistas e 4-6 semanas de pipeline real.

## 4. Implicações de Produto
- Manter foco em **confiabilidade operacional** (webhook, idempotência, segurança de pagamento, contratos API).
- Embalar valor comercial em 3 métricas simples: tempo de triagem, taxa de resposta no WhatsApp, custo por candidato qualificado.
- Evitar expansão horizontal prematura de features não ligadas ao core loop de contratação.

## 5. Riscos e Contrarian Cases
- Incumbentes já possuem distribuição forte e carteira enterprise (risco de competição por marca).
- Sem prova de ROI em menos de 30 dias, churn inicial tende a ser alto.
- IA sem controle de qualidade/human-in-the-loop pode gerar perda de confiança rápida.
- Dependência de canais externos (Meta/API de pagamento) exige observabilidade e fallback.

## 6. Recomendação
Adotar estratégia de execução 90 dias:
1. Produto: estabilidade + governança + métricas de ROI por vaga.
2. Comercial: ICP único (volume hiring), oferta única (triagem IA + WhatsApp + crédito).
3. Operação: onboarding curto com playbook padrão e revisão semanal de funil.

## 7. Sources
- Governo Federal (Mapa de Empresas, 1º quadrimestre 2025):
  - https://www.gov.br/empresas-e-negocios/pt-br/mapa-de-empresas/boletins/mapa-de-empresas-boletim-1o-quadrimestre-2025-pdf.pdf
- Gupy (site oficial, posicionamento e funcionalidades):
  - https://www.gupy.io/
- LinkedIn Future of Recruiting 2025 (material oficial):
  - https://business.linkedin.com/content/dam/lem/business/en/hire/resources/future-of-recruiting/future-of-recruiting-2025.pdf
- Grand View Research (Talent Management Software Market):
  - https://www.grandviewresearch.com/industry-analysis/talent-management-software-market
- Workable pricing page (referência de packaging/pricing no segmento):
  - https://www.workable.com/pricing
