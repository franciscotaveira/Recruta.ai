# NotebookLM Ops - Recruta.ai

Automacao para coletar inteligencia atual do NotebookLM e gerar artefatos reutilizaveis de pesquisa.

## Requisitos
- venv com `notebooklm-mcp-cli` instalado
- login ativo no `nlm`

## Uso
```bash
bash ops/notebooklm/refresh_recruta_intel.sh
```

## Saidas
- Snapshot versionado: `docs/research/notebooklm/snapshots/<timestamp>/`
- Atalho para o ultimo snapshot: `docs/research/notebooklm/latest/`
- Catalogo de fontes citadas: `cited_sources_catalog.json`

## Observacoes
- O script nao altera o notebook. Apenas le dados.
- Em caso de expiracao de autenticacao, rode `nlm login`.
