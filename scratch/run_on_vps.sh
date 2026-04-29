TOKEN="EAAdLlW6lFT4BRXZBxZAjSs5SlN9b9qhmS31uut3DPdHxVLgAtatWZBmnkOjVtU2Js3lSdzdnZBKAiZCgegJifZBIXtZBv4aP9hNurvOsRdp2WSQw5bN2LQimLZBVKR8zUN3gV6dgBXHqWk4XERiWc0pCJh2BWz1ZBgUyqnzHqJfZCd0JR6s5rekfcVm3yDqkq9A1djVgZDZD"
WABA_ID="2025021404763607"
API="https://graph.facebook.com/v21.0/${WABA_ID}/message_templates"

echo "=== TEMPLATES EXISTENTES ==="
curl -s "${API}?fields=name,status,category&limit=50" -H "Authorization: Bearer ${TOKEN}" | python3 -c "
import sys,json
d=json.load(sys.stdin)
templates=d.get('data',[])
if not templates: print('  (nenhum)')
for t in templates:
    icon='✅' if t['status']=='APPROVED' else '⏳' if t['status']=='PENDING' else '❌'
    print(f'  {icon} {t[\"name\"]} [{t[\"status\"]}] [{t[\"category\"]}]')
"

create() {
  local NAME="$1"; local BODY="$2"; local EXAMPLE="$3"
  echo ""
  echo "📤 Criando: $NAME"
  RES=$(curl -s -X POST "$API" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"language\":\"pt_BR\",\"category\":\"UTILITY\",\"components\":[{\"type\":\"BODY\",\"text\":\"$BODY\",\"example\":{\"body_text\":[$EXAMPLE]}}]}")
  echo "$RES" | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'id' in d:
    print(f'  ✅ ID: {d[\"id\"]} | Status: {d.get(\"status\",\"?\")}')
else:
    e=d.get('error',{})
    if e.get('error_subcode')==2388085:
        print('  ⚠️  Já existe')
    else:
        print(f'  ❌ {e.get(\"code\")}: {e.get(\"message\")}')
        print(f'  Raw: {json.dumps(d)}')
"
}

echo ""
echo "=== CRIANDO 4 TEMPLATES UTILITY ==="

create "recruta_convite_vaga" \
  "Olá {{1}}, a empresa {{3}} iniciou o processo seletivo para a função de {{2}}.\n\nSua participação na etapa de triagem está pendente de confirmação.\n\nResponda *1* para confirmar ou *2* para declinar." \
  '[["João Silva","Analista Financeiro","MCT LTDA"]]'

create "recruta_confirmacao" \
  "Confirmação recebida. O processo de triagem para a função de {{1}} foi iniciado.\n\n{{2}}" \
  '[["Analista Financeiro","Descreva sua experiência profissional na área financeira."]]'

create "recruta_banco_talentos" \
  "Olá {{1}}, a empresa {{2}} abriu uma vaga para a função de {{3}} e seu perfil foi incluído no processo seletivo atual.\n\nConfirme sua disponibilidade para a etapa de triagem.\n\nResponda *1* para confirmar participação ou *2* para declinar." \
  '[["Maria Souza","MCT LTDA","Assistente Administrativo"]]'

create "recruta_processo_ativo" \
  "Olá {{1}}, o processo seletivo para a função de {{2}} na empresa {{3}} foi registrado para seu perfil.\n\nA próxima etapa requer sua confirmação de participação.\n\nResponda *1* para prosseguir ou *2* para declinar." \
  '[["Carlos Lima","Motorista","Transportadora XYZ"]]'

echo ""
echo "=== CONCLUÍDO ==="
echo "Acompanhe: https://business.facebook.com/wa/manage/message-templates/"
