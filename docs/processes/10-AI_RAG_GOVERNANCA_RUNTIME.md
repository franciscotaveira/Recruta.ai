# AI RAG + Governança Runtime

## Objetivo
Aplicar governança de IA em tempo de execução e usar RAG controlado para melhorar consistência da triagem, sem perder fallback seguro.

## Controles ativos
- `AI Squad`: define especialistas por domínio (`triage`, `interview`, `learning`, `compliance`, etc.) e regras globais.
- `AI Control`: liga/desliga IA, fallback textual, deep dive e limite de áudio.
- `AI RAG`: controla recuperação de contexto (`enabled`, `topK`, `minScore`, `maxContextChars`, `cacheTtlSeconds`, `includeCitations`).

## Regras no fluxo WhatsApp
1. Se especialista de entrevista estiver desativado, sessão vai para `handoff_requested`.
2. Se `maxParallelSessions` for atingido, sessão é desviada para handoff humano.
3. Se `consentRequired` estiver ativo, triagem exige aceite explícito de consentimento.
4. Se `blindScreeningEnabled` estiver ativo, respostas enviadas para análise têm e-mail/telefone/URL redigidos.
5. Se política de IA impedir automação (`fallback_only`), análise cai em fallback determinístico.
6. Se HITL for obrigatório (`humanInTheLoopRequired` ou especialista exigir revisão), saída inclui alerta de revisão humana.

## Endpoints admin
- `GET /api/admin/ai-control`
- `PUT /api/admin/ai-control`
- `GET /api/admin/ai-squad`
- `PUT /api/admin/ai-squad`
- `GET /api/admin/ai-rag` (retorna settings + diagnóstico de cache/corpus)
- `PUT /api/admin/ai-rag`
- `GET /api/admin/overview` agora inclui `aiRag`.

## RAG
- Fonte padrão: corpus interno embutido (`server/ai/rag.ts`).
- Fonte customizável: `AI_RAG_CORPUS_PATH` com JSON de documentos.
- Config customizável: `AI_RAG_SETTINGS_PATH`.
- Cache em memória por consulta + configuração + assinatura do corpus.

## Estrutura de documento do corpus
```json
[
  {
    "id": "string",
    "title": "string",
    "source": "string",
    "tags": ["string"],
    "text": "string"
  }
]
```

## Observabilidade mínima
- `GET /api/admin/ai-rag` mostra:
  - tamanho do corpus
  - entradas de cache
  - taxa de hit de cache
  - assinatura do corpus
