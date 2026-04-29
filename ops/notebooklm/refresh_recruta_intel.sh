#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DEFAULT_VENV="$ROOT_DIR/.venv-notebooklm/bin/activate"
VENV_ACTIVATE="${VENV_ACTIVATE:-$DEFAULT_VENV}"
NOTEBOOK_ID="${NOTEBOOK_ID:-68f0c16b-63f3-40c7-9f96-712ebd9a167f}"
BASE_OUT="$ROOT_DIR/docs/research/notebooklm"
STAMP="$(date +%Y%m%d_%H%M%S)"
SNAPSHOT_DIR="$BASE_OUT/snapshots/$STAMP"
LATEST_DIR="$BASE_OUT/latest"

if [ ! -f "$VENV_ACTIVATE" ]; then
  echo "Venv nao encontrado em: $VENV_ACTIVATE"
  echo "Defina VENV_ACTIVATE=/caminho/activate e tente novamente."
  exit 1
fi

# shellcheck disable=SC1090
source "$VENV_ACTIVATE"

if ! command -v nlm >/dev/null 2>&1; then
  echo "Comando nlm indisponivel. Instale notebooklm-mcp-cli na venv." >&2
  exit 1
fi

mkdir -p "$SNAPSHOT_DIR"

run_query() {
  local idx="$1"
  local slug="$2"
  local prompt="$3"
  local out_json="$SNAPSHOT_DIR/${idx}_${slug}.json"
  local out_answer="$SNAPSHOT_DIR/${idx}_${slug}.answer.md"

  echo "[NotebookLM] Query ${idx}_${slug}"
  nlm notebook query "$NOTEBOOK_ID" "$prompt" --json > "$out_json"
  jq -r '.value.answer' "$out_json" > "$out_answer"
}

run_query "01" "audio_whatsapp_best_practices" "Liste 12 melhores praticas para triagem de candidatos por audio no WhatsApp para PMEs brasileiras, com criterios de avaliacao, riscos e controles."
run_query "02" "agent_architecture" "Proponha arquitetura de agentes para Recruta.ai com roteador hierarquico de skills, memoria, guardrails, fallback e handoff humano, incluindo componentes tecnicos e fluxo operacional."
run_query "03" "compliance_bias_controls" "Liste controles de vies, transparencia e compliance para recrutamento assistido por IA (LGPD/GDPR/EU AI Act), com checklist tecnico e de processo."
run_query "04" "competitive_90d_priorities" "Liste 15 iniciativas praticas para criar vantagem competitiva do Recruta.ai contra Gupy/ATS em 90 dias, priorizadas por impacto x esforco, com KPIs e sequenciamento de execucao."

echo "[NotebookLM] Source catalog"
nlm source list "$NOTEBOOK_ID" --json > "$SNAPSHOT_DIR/source_list.json"

for f in "$SNAPSHOT_DIR"/0[1-4]_*.json; do
  jq -r '.value.sources_used[]' "$f"
done | sort -u > "$SNAPSHOT_DIR/cited_source_ids.txt"

jq -R -s 'split("\n")[:-1]' "$SNAPSHOT_DIR/cited_source_ids.txt" > "$SNAPSHOT_DIR/cited_source_ids.json"
jq --slurpfile ids "$SNAPSHOT_DIR/cited_source_ids.json" '[.[] | .id as $id | select($ids[0] | index($id)) | {id, title, kind, updated_at}]' "$SNAPSHOT_DIR/source_list.json" > "$SNAPSHOT_DIR/cited_sources_catalog.json"

rm -rf "$LATEST_DIR"
mkdir -p "$LATEST_DIR"
cp -R "$SNAPSHOT_DIR"/. "$LATEST_DIR"/

echo "Concluido. Snapshot: $SNAPSHOT_DIR"
echo "Atual: $LATEST_DIR"
