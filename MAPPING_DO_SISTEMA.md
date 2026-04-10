# 🗺️ Mapeamento do Sistema: De Código para Produto

Este documento conecta os conceitos técnicos ("Jobs", "Contracts") com a experiência do usuário ("Chat", "Widgets").

## 1. O "Sistema Operacional" de Carreira (UX)
Não é um formulário gigante. É um feed de atividades inteligentes.

*   **Chat Interface:** O usuário interage com uma timeline.
    *   *Input:* "Analise meu CV."
    *   *System:* "Entendido. Vou analisar o arquivo `cv_v1.pdf`. Isso consumirá 1 crédito." (Isso é um pré-job).
    *   *Widget:* [Card de Aprovação: Risco Médio].
    *   *Action:* Usuário clica "Confirmar".
    *   *System:* "Processando..." (Barra de progresso conectada ao Job ID).
    *   *Result:* "Pronto! Seu Score é 78." (Widget de Resultado).

## 2. Governança do Terminal (Admin)
Para os operadores (Recrutadores/Admins), o sistema oferece poder controlado.

*   **Allowlist:** O terminal só aceita comandos definidos no `ACTION_CONTRACTS.json`.
    *   `> run analyze --all` -> ❌ Erro: Comando não permitido ou requer aprovação.
    *   `> help` -> Lista ações disponíveis para o Role atual.

## 3. Processamento de Jobs (The Engine)
O coração pulsante do Recruta.AI.

1.  **Fila (Queue):** Tabela `jobs` no Postgres.
2.  **Heartbeat:** Workers (Edge Functions) atualizam `last_ping` a cada 30s. Se parar, outro worker pega.
3.  **Timeout:** Jobs pendentes há > 5min são marcados como `failed` e créditos estornados automaticamente.

## 4. Aprendizado do Sistema (RLHF-lite)
Cada rejeição ou aprovação melhora o produto.

*   Se o usuário rejeita uma sugestão de reescrita (`job.reject`), salvamos o diff.
*   Isso cria um dataset de "O que usuários reais não gostam".
*   Futuro: Fine-tuning do Gemini com base nessas rejeições.

## 5. North Star Metrics (Painel do Operador)
O que define se o sistema está saudável?

1.  **Job Success Rate (%):** Quantos jobs terminam em `completed` vs `failed`. (Alvo: >98%).
2.  **Latency per Risk (ms):** Quanto tempo demora um job High Risk (com aprovação) vs Low Risk.
3.  **Credit Burn Rate ($):** Velocidade de consumo de créditos pelos usuários.
4.  **Rejection Rate (%):** Frequência com que usuários clicam em "Cancelar" no widget de aprovação (indica desalinhamento de expectativa).
5.  **Audit Integrity:** Verificação diária se `logs_count` bate com `jobs_executed`.
