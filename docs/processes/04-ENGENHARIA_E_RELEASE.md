# Processo 04 — Engenharia e Release

## Objetivo
Publicar mudancas com previsibilidade e baixo risco.

## Dono
- Dev

## Referencias existentes
- `docs/RELEASE_CHECKLIST.md`
- `docs/testing/TEST_STRATEGY.md`
- `docs/API_CONTRACTS_V1.md`

## Fluxo padrao de mudanca
1. Criar issue com escopo e risco
2. Implementar em branch isolada
3. Rodar gates locais (build/test/lint)
4. Atualizar docs
5. Deploy
6. Smoke test em producao
7. Registrar resultado

## Gates obrigatorios
- `npm run build`
- `npm run test`
- `cd server && npm run build`
- `cd server && npm test`

## Checklist de release
- [ ] variaveis de ambiente validadas
- [ ] webhooks com assinatura validada
- [ ] healthcheck retornando `ok`
- [ ] rollback conhecido e testado
- [ ] changelog da release registrado

