# WhatsApp E2E em Produção (Convite -> Áudio -> Diagnóstico)

## Objetivo
Validar o fluxo crítico comercial completo com evidência:
1. Recrutador cria vaga.
2. Sistema dispara convite WhatsApp.
3. Candidato aceita/recusa.
4. Triagem por áudio é conduzida corretamente.
5. Sessão finaliza com diagnóstico visível ao recrutador.

## Pré-condições obrigatórias
- DNS/SSL ok:
  - `https://app.recrutaria.com.br`
  - `https://recrutaria.com.br`
  - API acessível no mesmo host via `/api/*`
- Backend com variáveis obrigatórias preenchidas:
  - `WHATSAPP_PROVIDER` (`meta` ou `automatik`)
  - `WHATSAPP_APP_SECRET` (se `meta`)
  - `WHATSAPP_ACCESS_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` (se `meta`)
  - `WHATSAPP_GATEWAY_*` (se `automatik`)
  - `ABACATE_PAY_TOKEN`, `ABACATE_WEBHOOK_SECRET`
- Webhook configurado no provedor apontando para:
  - `POST https://app.recrutaria.com.br/api/whatsapp/webhook`
  - `GET https://app.recrutaria.com.br/api/whatsapp/webhook` (verificação)

## Cenário A — Aceite e conclusão
1. Login como recrutador.
2. Criar vaga realista (ex.: Gestor de Tráfego).
3. Enviar convite para número de teste.
4. No WhatsApp do candidato:
   - responder `SIM`
   - responder `CONCORDO` (se consentimento ativo)
   - enviar áudio de teste
   - responder às perguntas da triagem
5. Confirmar no painel do recrutador:
   - sessão com status `completed`
   - `summary` preenchido
   - `match_score` preenchido

## Cenário B — Recusa com motivo
1. Enviar novo convite para o mesmo número.
2. Candidato responde `NÃO` ou "não tenho interesse".
3. Selecionar motivo no menu.
4. Confirmar no painel:
   - sessão com status `declined`
   - motivo gravado no resumo/metadata

## Cenário C — Idempotência de webhook
1. Reenviar o mesmo evento do provedor (mesmo `message.id`) ou usar replay.
2. Confirmar:
   - sessão não avança duas vezes
   - não duplica mensagens de processamento

## Critérios de aceite
- `A`: convite -> aceite -> consentimento -> áudio -> diagnóstico conclui sem intervenção manual.
- `B`: recusa encerra corretamente com motivo rastreável.
- `C`: eventos duplicados não alteram estado indevidamente.
- `D`: todas as respostas de erro da API incluem `correlationId`.

## Evidências mínimas a salvar
- Prints do WhatsApp (etapas A e B).
- Print do painel com sessão `completed` e `declined`.
- Trecho de logs com `correlationId` da execução.
- Data/hora do teste e número testado.

