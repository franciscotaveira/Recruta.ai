#!/bin/bash
# create_templates.sh
# Cria os templates WhatsApp via cURL (alternativo ao Node.js)
# Uso: bash scratch/create_templates.sh
#
# Certifique-se que o .env está carregado ou exporte as variáveis antes:
#   export WHATSAPP_PHONE_NUMBER_ID=...
#   export WHATSAPP_ACCESS_TOKEN=...

set -e

# Carrega .env se existir
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

PHONE_NUMBER_ID="${WHATSAPP_PHONE_NUMBER_ID}"
TOKEN="${WHATSAPP_ACCESS_TOKEN}"
API="https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/message_templates"

if [ -z "$PHONE_NUMBER_ID" ] || [ -z "$TOKEN" ]; then
  echo "❌ WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN são obrigatórios."
  exit 1
fi

create_template() {
  local name="$1"
  local body="$2"
  local example="$3"

  echo ""
  echo "📤 Criando: $name"

  PAYLOAD=$(cat <<EOF
{
  "name": "$name",
  "language": "pt_BR",
  "category": "UTILITY",
  "components": [
    {
      "type": "BODY",
      "text": "$body",
      "example": {
        "body_text": [$example]
      }
    }
  ]
}
EOF
)

  RESPONSE=$(curl -s -X POST "$API" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

  ID=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)
  STATUS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null)
  ERR=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message',''))" 2>/dev/null)

  if [ -n "$ID" ]; then
    echo "   ✅ Criado — ID: $ID | Status: $STATUS"
  else
    echo "   ❌ Erro: $ERR"
    echo "   Resposta: $RESPONSE"
  fi
}

echo "🔍 Listando templates existentes..."
curl -s "$API?fields=name,status,category&limit=50" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
templates = data.get('data', [])
if not templates:
    print('   (nenhum encontrado)')
for t in templates:
    icon = '✅' if t['status'] == 'APPROVED' else '⏳' if t['status'] == 'PENDING' else '❌'
    print(f'   {icon} {t[\"name\"]} — {t[\"status\"]} [{t[\"category\"]}]')
"

echo ""
echo "─────────────────────────────────────────────────────────────"
echo "📋 Criando templates com linguagem UTILITY aprovada..."

# Template 1: Convite Vaga
create_template \
  "recruta_convite_vaga" \
  "Olá {{1}}, a empresa {{3}} iniciou o processo seletivo para a função de {{2}}.\n\nSua participação na etapa de triagem está pendente de confirmação.\n\nResponda *1* para confirmar ou *2* para declinar." \
  '["João Silva", "Analista Financeiro", "MCT LTDA"]'

# Template 2: Confirmação / Primeira Pergunta
create_template \
  "recruta_confirmacao" \
  "Confirmação recebida. O processo de triagem para a função de {{1}} foi iniciado.\n\n{{2}}" \
  '["Analista Financeiro", "Descreva sua experiência profissional na área financeira."]'

# Template 3: Banco de Talentos
create_template \
  "recruta_banco_talentos" \
  "Olá {{1}}, a empresa {{2}} abriu uma vaga para a função de {{3}} e seu perfil foi incluído no processo seletivo atual.\n\nConfirme sua disponibilidade para a etapa de triagem.\n\nResponda *1* para confirmar participação ou *2* para declinar." \
  '["Maria Souza", "MCT LTDA", "Assistente Administrativo"]'

# Template 4: Processo Ativo (backup)
create_template \
  "recruta_processo_ativo" \
  "Olá {{1}}, o processo seletivo para a função de {{2}} na empresa {{3}} foi registrado para seu perfil.\n\nA próxima etapa requer sua confirmação de participação.\n\nResponda *1* para prosseguir ou *2* para declinar." \
  '["Carlos Lima", "Motorista", "Transportadora XYZ"]'

echo ""
echo "─────────────────────────────────────────────────────────────"
echo "✅ Concluído. Acompanhe aprovações em:"
echo "   https://business.facebook.com/wa/manage/message-templates/"
