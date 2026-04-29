/**
 * create_templates.mjs
 * Cria/atualiza os templates WhatsApp na Meta com linguagem UTILITY aprovada.
 * 
 * Uso: node scratch/create_templates.mjs
 */

import 'dotenv/config';

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/message_templates`;

if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
  console.error('❌ WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN são obrigatórios.');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES — linguagem 100% factual, zero linguagem de marketing
// ─────────────────────────────────────────────────────────────────────────────

const templates = [
  {
    name: 'recruta_convite_vaga',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Olá {{1}}, a empresa {{3}} iniciou o processo seletivo para a função de {{2}}.\n\nSua participação na etapa de triagem está pendente de confirmação.\n\nResponda *1* para confirmar ou *2* para declinar.',
        example: {
          body_text: [['João Silva', 'Analista Financeiro', 'MCT LTDA']],
        },
      },
    ],
  },

  {
    name: 'recruta_confirmacao',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Confirmação recebida. O processo de triagem para a função de {{1}} foi iniciado.\n\n{{2}}',
        example: {
          body_text: [['Analista Financeiro', 'Descreva sua experiência profissional na área financeira.']],
        },
      },
    ],
  },

  {
    name: 'recruta_banco_talentos',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Olá {{1}}, a empresa {{2}} abriu uma vaga para a função de {{3}} e seu perfil foi incluído no processo seletivo atual.\n\nConfirme sua disponibilidade para a etapa de triagem.\n\nResponda *1* para confirmar participação ou *2* para declinar.',
        example: {
          body_text: [['Maria Souza', 'MCT LTDA', 'Assistente Administrativo']],
        },
      },
    ],
  },

  {
    name: 'recruta_processo_ativo',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Olá {{1}}, o processo seletivo para a função de {{2}} na empresa {{3}} foi registrado para seu perfil.\n\nA próxima etapa requer sua confirmação de participação.\n\nResponda *1* para prosseguir ou *2* para declinar.',
        example: {
          body_text: [['Carlos Lima', 'Motorista', 'Transportadora XYZ']],
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

async function createTemplate(template) {
  console.log(`\n📤 Criando template: ${template.name}`);

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });

  const data = await res.json();

  if (res.ok && data.id) {
    console.log(`   ✅ Criado com sucesso — ID: ${data.id} | Status: ${data.status}`);
    return { success: true, name: template.name, id: data.id, status: data.status };
  } else {
    const errCode = data.error?.code;
    const errMsg = data.error?.message;

    // Código 100 subcode 2388085 = template já existe (não é erro crítico)
    if (errCode === 100 && data.error?.error_subcode === 2388085) {
      console.log(`   ⚠️  Template já existe — pulando (não é erro)`);
      return { success: true, name: template.name, status: 'ALREADY_EXISTS' };
    }

    console.error(`   ❌ Erro ${errCode}: ${errMsg}`);
    console.error(`   Detalhes:`, JSON.stringify(data.error, null, 2));
    return { success: false, name: template.name, error: errMsg };
  }
}

async function listExistingTemplates() {
  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/message_templates?fields=name,status,category&limit=50`,
    {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    }
  );
  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Erro ao listar templates:', data.error?.message);
    return [];
  }

  return data.data || [];
}

async function main() {
  console.log('🔍 Templates existentes:');
  const existing = await listExistingTemplates();
  
  if (existing.length === 0) {
    console.log('   (nenhum encontrado ou erro de acesso)');
  } else {
    for (const t of existing) {
      const icon = t.status === 'APPROVED' ? '✅' : t.status === 'PENDING' ? '⏳' : '❌';
      console.log(`   ${icon} ${t.name} — ${t.status} [${t.category}]`);
    }
  }

  const existingNames = new Set(existing.map(t => t.name));

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('📋 Criando templates necessários...');

  const results = [];
  for (const template of templates) {
    if (existingNames.has(template.name)) {
      const existing_t = existing.find(e => e.name === template.name);
      console.log(`\n⏭️  ${template.name} — já existe (${existing_t.status}), pulando criação`);
      results.push({ name: template.name, status: existing_t.status, skipped: true });
    } else {
      const result = await createTemplate(template);
      results.push(result);
    }
  }

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('📊 RESUMO FINAL:');
  for (const r of results) {
    if (r.skipped) {
      console.log(`   ⏭️  ${r.name} — já existia (${r.status})`);
    } else if (r.success) {
      console.log(`   ✅ ${r.name} — ${r.status}`);
    } else {
      console.log(`   ❌ ${r.name} — FALHOU: ${r.error}`);
    }
  }

  const failed = results.filter(r => !r.success && !r.skipped);
  if (failed.length > 0) {
    console.log('\n⚠️  Alguns templates falharam. Verifique os erros acima.');
    console.log('   Dica: Se o erro for "Invalid parameter", revise o body text.');
    console.log('   Nunca contest uma rejeição — resubmeta com nome diferente.');
  } else {
    console.log('\n🎉 Todos os templates estão prontos. Aguarde aprovação da Meta (até 24h).');
    console.log('   Acompanhe em: https://business.facebook.com/wa/manage/message-templates/');
  }
}

main();
