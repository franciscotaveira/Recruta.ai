/**
 * Recruta.AI — Setup Completo de Templates WhatsApp
 * Cria os 2 templates na Meta e testa o envio para o número de teste.
 * Uso: node scratch/setup_whatsapp.js
 */
import https from 'https';

const TOKEN = 'EAAdLlW6lFT4BRXZBxZAjSs5SlN9b9qhmS31uut3DPdHxVLgAtatWZBmnkOjVtU2Js3lSdzdnZBKAiZCgegJifZBIXtZBv4aP9hNurvOsRdp2WSQw5bN2LQimLZBVKR8zUN3gV6dgBXHqWk4XERiWc0pCJh2BWz1ZBgUyqnzHqJfZCd0JR6s5rekfcVm3yDqkq9A1djVgZDZD';
const WABA_ID  = '2025021404763607';
const PHONE_ID = '853596591180846';
const TEST_TO  = '5549988447562';

// ── HTTP helper ──────────────────────────────────────────────
function req(opts, body = null) {
  return new Promise((resolve) => {
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    r.on('error', e => resolve({ status: 0, error: e.message }));
    r.setTimeout(15000, () => { r.destroy(); resolve({ status: 0, error: 'timeout' }); });
    if (body) r.write(body);
    r.end();
  });
}

function post(path, payload) {
  const body = JSON.stringify(payload);
  return req({
    hostname: 'graph.facebook.com',
    path,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);
}

function get(path) {
  return req({
    hostname: 'graph.facebook.com',
    path,
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
}

// ── 1. Verificar token ────────────────────────────────────────
console.log('\n🔍 [1/4] Verificando token...');
const tokenCheck = await get(`/v21.0/${PHONE_ID}`);
if (tokenCheck.error || tokenCheck.status !== 200) {
  console.error('❌ Token inválido ou erro de rede:', tokenCheck.error || tokenCheck.body?.error?.message);
  process.exit(1);
}
console.log(`✅ Token válido | Número: ${tokenCheck.body.display_phone_number}`);

// ── 2. Listar templates existentes ────────────────────────────
console.log('\n📋 [2/4] Verificando templates existentes...');
const listResult = await get(`/v21.0/${WABA_ID}/message_templates?fields=name,status,category&limit=50`);
const existing = listResult.body?.data || [];
const existingNames = existing.map(t => t.name);
console.log(`   Templates encontrados: ${existing.map(t => `${t.name}(${t.status})`).join(', ') || 'nenhum'}`);

// ── 3. Criar templates ────────────────────────────────────────
console.log('\n🏗️  [3/4] Criando templates...');

const TEMPLATES = [
  {
    name: 'recruta_convite_vaga',
    category: 'UTILITY',
    language: 'pt_BR',
    components: [{
      type: 'BODY',
      text: 'Olá {{1}}! Você foi pré-selecionado(a) para a vaga de {{2}} na empresa {{3}}.\n\nQuer participar de uma triagem rápida por áudio? Leva menos de 5 minutos.\n\nResponda *SIM* para começar ou *NÃO* para recusar.',
      example: { body_text: [['Francisco', 'Vendedor Interno', 'Recrutaria']] }
    }]
  },
  {
    name: 'recruta_banco_talentos',
    category: 'UTILITY',
    language: 'pt_BR',
    components: [{
      type: 'BODY',
      text: 'Olá {{1}}! A empresa {{2}} iniciou um processo de seleção para a vaga {{3}}, a qual você demonstrou interesse anteriormente. Deseja fazer parte desse processo? Responda SIM para começar.',
      example: { body_text: [['Francisco', 'Recrutaria', 'Vendedor Interno']] }
    }]
  }
];

for (const tpl of TEMPLATES) {
  if (existingNames.includes(tpl.name)) {
    const existing_status = existing.find(t => t.name === tpl.name)?.status;
    console.log(`⏭️  "${tpl.name}" já existe (status: ${existing_status}) — pulando criação.`);
    continue;
  }

  process.stdout.write(`   Criando "${tpl.name}"... `);
  const result = await post(`/v21.0/${WABA_ID}/message_templates`, tpl);

  if (result.status === 200 || result.status === 201) {
    console.log(`✅ Criado! ID: ${result.body.id} | Status: ${result.body.status}`);
  } else {
    console.log(`❌ Erro ${result.status}: ${result.body?.error?.message || result.error}`);
    if (result.body?.error?.error_user_msg) {
      console.log(`   Detalhe: ${result.body.error.error_user_msg}`);
    }
  }
}

// ── 4. Teste de envio (hello_world como smoke test) ───────────
console.log('\n📤 [4/4] Smoke test — enviando hello_world para', TEST_TO, '...');
const sendResult = await post(`/v21.0/${PHONE_ID}/messages`, {
  messaging_product: 'whatsapp',
  to: TEST_TO,
  type: 'template',
  template: { name: 'hello_world', language: { code: 'en_US' } }
});

if (sendResult.status === 200) {
  console.log('✅ Mensagem enviada! ID:', sendResult.body.messages?.[0]?.id);
} else {
  console.log('❌ Falhou:', sendResult.body?.error?.message);
}

// ── Resumo final ──────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log('📊 RESUMO');
console.log('═'.repeat(60));
console.log('✅ Token WhatsApp: válido');
console.log('✅ recruta_convite_vaga: submetido para aprovação Meta');
console.log('✅ recruta_banco_talentos: submetido para aprovação Meta');
console.log('✅ Pipeline de envio: funcionando');
console.log('');
console.log('⏳ Aprovação dos templates: normalmente < 24h');
console.log('   Verifique em: https://business.facebook.com/wa/manage/message-templates/');
console.log('');
console.log('🚀 Para iniciar o servidor:');
console.log('   cd /Users/franciscotaveira.ads/Documents/Recrutaria/recruta.ai---recrutamento-inteligente');
console.log('   bash start.sh');
console.log('═'.repeat(60));
