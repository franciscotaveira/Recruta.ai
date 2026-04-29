import https from 'https';

const TOKEN = 'EAAdLlW6lFT4BRXZBxZAjSs5SlN9b9qhmS31uut3DPdHxVLgAtatWZBmnkOjVtU2Js3lSdzdnZBKAiZCgegJifZBIXtZBv4aP9hNurvOsRdp2WSQw5bN2LQimLZBVKR8zUN3gV6dgBXHqWk4XERiWc0pCJh2BWz1ZBgUyqnzHqJfZCd0JR6s5rekfcVm3yDqkq9A1djVgZDZD';
const WABA_ID = '2025021404763607'; // WhatsApp Business Account ID

async function createTemplate(template) {
  const body = JSON.stringify(template);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/v21.0/${WABA_ID}/message_templates`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({ status: r.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.write(body);
    req.end();
  });
}

const templates = [
  {
    name: 'recruta_convite_vaga',
    category: 'UTILITY',
    language: 'pt_BR',
    components: [
      {
        type: 'BODY',
        text: 'Olá {{1}}! Você foi pré-selecionado(a) para a vaga de {{2}} na empresa {{3}}.\n\nQuer participar de uma triagem rápida por áudio? Leva menos de 5 minutos.\n\nResponda *SIM* para começar ou *NÃO* para recusar.',
        example: {
          body_text: [['Francisco', 'Vendedor Interno', 'Recrutaria']]
        }
      }
    ]
  },
  {
    name: 'recruta_banco_talentos',
    category: 'UTILITY',
    language: 'pt_BR',
    components: [
      {
        type: 'BODY',
        text: 'Olá {{1}}! A empresa {{2}} iniciou um processo de seleção para a vaga {{3}}, a qual você demonstrou interesse anteriormente. Deseja fazer parte desse processo? Responda SIM para começar.',
        example: {
          body_text: [['Francisco', 'Recrutaria', 'Vendedor Interno']]
        }
      }
    ]
  }
];

for (const tpl of templates) {
  console.log(`\n📤 Criando template: ${tpl.name} ...`);
  const result = await createTemplate(tpl);

  if (result.status === 200 || result.status === 201) {
    console.log(`✅ Template "${tpl.name}" criado com sucesso!`);
    console.log(`   ID: ${result.body.id}`);
    console.log(`   Status: ${result.body.status}`);
  } else {
    console.error(`❌ Erro ao criar "${tpl.name}": ${result.status}`);
    if (result.error) {
      console.error(`   Erro de rede: ${result.error}`);
    } else {
      console.error(`   Code: ${result.body?.error?.code}`);
      console.error(`   Mensagem: ${result.body?.error?.message}`);
      console.error(`   Raw: ${JSON.stringify(result.body, null, 2)}`);
    }
  }
}

console.log('\n✅ Processo concluído. Verifique o status no Gerenciador do WhatsApp.');
