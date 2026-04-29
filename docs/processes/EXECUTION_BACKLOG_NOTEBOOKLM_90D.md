# Backlog 90 Dias - Derivado de NotebookLM (Recruta.ai)

## Regras de priorizacao
- Impacto: efeito esperado em receita, conversao ou confiabilidade.
- Esforco: complexidade tecnica/operacional para entregar.
- Ordem: executar do topo para baixo salvo bloqueio tecnico.

| # | Iniciativa | Impacto | Esforco | KPI principal | Dono sugerido | Status |
|---|---|---|---|---|---|---|
| 1 | Candidatura WhatsApp em 1 minuto | Alto | Baixo | Conversao LP -> fluxo concluido (>80%) | Produto + Front | TODO |
| 2 | Knockout dinamico (3-5 perguntas) | Alto | Baixo | Economia de triagem / taxa de rejeicao valida | Back + IA | TODO |
| 3 | Agendamento e lembretes automatizados | Alto | Medio | Reducao de no-show | Back + Ops | TODO |
| 4 | Feedback imediato orientado por evidencias | Alto | Medio | cNPS candidato | IA + Produto | TODO |
| 5 | Click-to-WhatsApp tracking de origem | Medio | Baixo | CAC por canal | GTM + Front | TODO |
| 6 | Deep-dive contextual (pergunta de aprofundamento) | Alto | Medio | Score de completude de resposta | IA | DONE (v1) |
| 7 | Living Profiles com clipes de audio no painel RH | Alto | Alto | Tempo medio de avaliacao RH | Front + Back | TODO |
| 8 | Skill extraction semantico (anti keyword-only) | Alto | Alto | Precisao de matching RH | IA + Data | TODO |
| 9 | Learning loop pos-contratacao (90 dias) | Alto | Medio | Quality of hire / retencao 90d | Produto + CS | TODO |
| 10 | Blind screening no painel inicial | Alto | Medio | Paridade demografica dos finalistas | Produto + Compliance | TODO |
| 11 | Mic-check nao avaliativo | Medio | Baixo | Taxa de falha tecnica de audio | Produto | DONE (v1) |
| 12 | Fallback texto/acessibilidade | Medio | Baixo | Conclusao de fluxo alternativo | Produto + UX | DONE (v1) |
| 13 | TalentOS candidato (perfil e rematch) | Medio | Alto | MAU candidato | Produto | TODO |
| 14 | White-label para consultorias pequenas | Medio | Medio | MRR B2B parceiro | GTM | TODO |
| 15 | Entrevista de desligamento via WhatsApp | Baixo/Medio | Baixo | Taxa de resposta offboarding | Produto + CS | TODO |

## Gates obrigatorios por item
1. Contrato de API atualizado.
2. Testes de regressao do fluxo critico atualizados.
3. Evento de observabilidade com correlation_id.
4. Critico de compliance marcado (quando aplicavel).

## Cadencia
- Revisao semanal: atualizar status e KPI.
- Revisao quinzenal: repriorizar pelo resultado real e nao por opiniao.

## Atualizacoes aplicadas em 2026-04-16
- Fluxo WhatsApp com consentimento explicito antes da triagem automatizada.
- Etapa de mic-check obrigatoria (nao avaliativa) antes da primeira pergunta real.
- Fallback de acessibilidade/texto ampliado para problemas tecnicos e pedido explicito.
- Deep-dive contextual automatico para respostas superficiais (uma vez por pergunta).
- Handoff humano explicitamente suportado via intencao do candidato.
- Sanitizacao de input para analise de IA e flag de tentativa de prompt injection.
