/**
 * Recria recruta_banco_talentos com texto mais transacional (UTILITY)
 * Deleta o atual e submete nova versão
 */
import https from 'https';

const TOKEN =
  'EAAdLlW6lFT4BRXZBxZAjSs5SlN9b9qhmS31uut3DPdHxVLgAtatWZBmnkOjVtU2Js3lSdzdnZBKAiZCgegJifZBIXtZBv4aP9hNurvOsRdp2WSQw5bN2LQimLZBVKR8zUN3gV6dgBXHqWk4XERiWc0pCJh2BWz1ZBgUyqnzHqJfZCd0JR6s5rekfcVm3yDqkq9A1djVgZDZD';
const WABA_ID = '2025021404763607';

// Template IDs criados anteriormente
const TEMPLATE_ID_BANCO = '733862796415699';
const TEMPLATE_ID_CONVITE = '933048439793201';

function request(opts, body = null) {
  return new Promise((resolve) => {
    const req = https.request(opts, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => {
        try {
          resolve({ status: r.statusCode, body: JSON.parse(d) });
        } catch {
          resolve({ status: r.statusCode, body: d });
        }
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.setTimeout(12000, () => {
      req.destroy();
      resolve({ status: 0, error: 'timeout' });
    });
    if (body) req.write(body);
    req.end();
  });
}

function post(path, payload) {
  const body = JSON.stringify(payload);
  return request(
    {
      hostname: 'graph.facebook.com',
      path,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );
}

function del(path) {
  return request({
    hostname: 'graph.facebook.com',
    path,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
}

function get(path) {
  return request({
    hostname: 'graph.facebook.com',
    path,
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
}

// ── Verificar status atual dos templates ──────────────────────
console.log('\n📋 [1/4] Verificando status atual dos templates...');
const listResult = await get(
  `/v21.0/${WABA_ID}/message_templates?fields=name,status,category&limit=50`
);
const templates = listResult.body?.data || [];
for (const t of templates) {
  if (t.name.startsWith('recruta_')) {
    console.log(`   ${t.name}: ${t.status} (${t.category})`);
  }
}

// ── Deletar recruta_banco_talentos ────────────────────────────
console.log('\n🗑️  [2/4] Deletando recruta_banco_talentos (categorizado incorretamente)...');
const delResult = await del(`/v21.0/${WABA_ID}/message_templates?name=recruta_banco_talentos`);
if (delResult.status === 200 && delResult.body?.success) {
  console.log('✅ Deletado com sucesso.');
} else {
  console.warn('⚠️  Possível erro ao deletar:', delResult.body?.error?.message || delResult.status);
  console.warn('   Continuando com a criação mesmo assim...');
}

// ── Criar nova versão com texto transacional ──────────────────
console.log('\n🏗️  [3/4] Criando nova versão como UTILITY (texto transacional)...');

/*
 * ESTRATÉGIA UTILITY:
 * - Sem palavras de re-engajamento ("demonstrou interesse", "oportunidade", "participe")
 * - Foco em notificação de processo ativo (appointment/process notification)
 * - Tom neutro e informativo, não persuasivo
 */
const newTemplate = {
  name: 'recruta_processo_ativo', // nome diferente para evitar conflito
  category: 'UTILITY',
  language: 'pt_BR',
  components: [
    {
      type: 'BODY',
      text: 'Olá {{1}}, seu cadastro foi selecionado para o processo seletivo da vaga {{2}} em {{3}}. Para prosseguir com a triagem, responda SIM. Para recusar, responda NAO.',
      example: {
        body_text: [['Francisco', 'Analista de Vendas', 'Recrutaria']],
      },
    },
  ],
};

const createResult = await post(`/v21.0/${WABA_ID}/message_templates`, newTemplate);
if (createResult.status === 200 || createResult.status === 201) {
  console.log(`✅ Template "${newTemplate.name}" criado!`);
  console.log(`   ID: ${createResult.body.id} | Status: ${createResult.body.status}`);
  console.log(`   Categoria solicitada: ${createResult.body.category || 'UTILITY'}`);
} else {
  console.error('❌ Erro:', createResult.body?.error?.message);
}

// ── Status final de todos os templates recruta_ ───────────────
console.log('\n📊 [4/4] Status final dos templates...');
await new Promise((r) => setTimeout(r, 2000)); // aguarda propagação
const finalList = await get(
  `/v21.0/${WABA_ID}/message_templates?fields=name,status,category&limit=50`
);
const finalTemplates = (finalList.body?.data || []).filter(
  (t) => t.name.startsWith('recruta_') || t.name === 'hello_world'
);
for (const t of finalTemplates) {
  const icon = t.status === 'APPROVED' ? '✅' : t.status === 'PENDING' ? '⏳' : '❌';
  console.log(`   ${icon} ${t.name}: ${t.status} (${t.category})`);
}

console.log('\n════════════════════════════════════════════════════════════');
console.log('PRÓXIMO PASSO: Atualizar o código para usar "recruta_processo_ativo"');
console.log('como template de banco de talentos.');
console.log('════════════════════════════════════════════════════════════');
