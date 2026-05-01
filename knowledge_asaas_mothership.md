# KI: Arquitetura de Monetização e Observabilidade (Asaas + Mothership)

**Data:** 2026-05-01
**Contexto:** Recruta.AI Production Hardening
**Tags:** #Asaas #Payments #Observability #Security #MCT-OS

---

## 💸 1. Motor Financeiro (Asaas API v3)

### Fluxo de Pagamento:
1. **Iniciação:** O frontend solicita um link de pagamento via `/api/candidate/buy-credits` ou `/api/payment/subscription`.
2. **Registro:** O servidor cria o cliente no Asaas (se não existir) e gera a cobrança com `externalReference` (ex: `b2c_credits_USERID`).
3. **Webhook:** O Asaas envia um `POST` para `/api/payment/asaas-webhook` quando o pagamento é confirmado.
4. **Liquidação:** O webhook chama `dual.recordPayment` para persistência financeira e libera o serviço (créditos/assinatura).

### Pontos de Atenção (Debug):
- Se o crédito não cair: Verifique os logs do sistema por `[asaas-webhook] No externalReference found`.
- **Idempotência:** O sistema está preparado para receber múltiplos webhooks do mesmo evento sem duplicar saldo.

---

## 📡 2. Observabilidade (Mothership Dashboard)

### Sistema de Logs (`system_logs`):
Implementamos um logger assíncrono que não trava a requisição do usuário.
- **Tabela:** `public.system_logs`
- **Níveis:** `info`, `warn`, `error`.
- **Filtro Admin:** O dashboard exibe apenas os últimos 10 `errors` no topo, mas permite busca completa via `/api/admin/system-logs`.

### Dashboard do Dono:
- **Receita:** Calculada em tempo real somando registros na tabela `payments` com status `paid`.
- **Alertas Pulsantes:** Erros críticos de IA ou Pagamento aparecem em vermelho neon no topo da tela.

---

## 🛡️ 3. Blindagem de Segurança (Hardening v2)

### RLS Policies:
- **Users:** `auth.uid()::text = id` (isolamento total).
- **Payments:** Somente o usuário dono e o Admin podem ver os registros.
- **Logs:** Somente Admins têm permissão de leitura.

### Database Security:
- A função `process_successful_payment` teve o privilégio `EXECUTE` revogado para os roles `anon` e `authenticated`. 
- **Risco Mitigado:** Ataques de injeção de crédito via RPC agora são impossíveis sem a chave de serviço do backend.

---

## 🛠️ Manutenção e Escala:
Para adicionar novos métodos de pagamento ou planos, edite `server/payment/asaas_webhook.ts` e siga o padrão de `externalReference`.
