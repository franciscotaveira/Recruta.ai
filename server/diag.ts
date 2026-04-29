import './env.js';
import { smartAI } from './ai/provider.js';
import { dual } from './storage/db.js';

async function diag() {
  console.log('🚀 [DIAG] Iniciando Diagnóstico de Produção (Recruta.AI)\n');

  // 1. Variáveis de Ambiente
  const envVars = [
    'WHATSAPP_PROVIDER',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
    'WHATSAPP_APP_SECRET',
    'ABACATE_PAY_TOKEN',
    'ABACATE_WEBHOOK_SECRET',
    'GEMINI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  console.log('📋 [1/4] Verificando Variáveis .env:');
  let envOk = true;
  for (const v of envVars) {
    if (process.env[v]) {
      console.log(`   ✅ ${v}: OK`);
    } else {
      console.log(`   ❌ ${v}: AUSENTE`);
      envOk = false;
    }
  }

  // 2. Database (Supabase)
  console.log('\n🗄️ [2/4] Verificando Database (Supabase):');
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const jobs = await dual.getActiveJobs();
      console.log(`   ✅ Conexão DB: OK (${jobs.length} vagas encontradas)`);
    } catch (err: any) {
      console.log(`   ❌ Erro DB: ${err.message}`);
    }
  } else {
    console.log('   ⚠️ Pulei teste DB por falta de SUPABASE_SERVICE_ROLE_KEY.');
  }

  // 3. IA (Inference path)
  console.log('\n🤖 [3/4] Verificando IA (Inference path):');
  try {
    const response = await smartAI('diag', 'Você é um sistema de diagnóstico. Responda apenas "PONG".', 'PING', false);
    if (response.trim().toUpperCase() === 'PONG') {
      console.log('   ✅ Inference path: OK');
    } else {
      console.log(`   ⚠️ Inference path: Resposta inesperada: "${response}"`);
    }
  } catch (err: any) {
    console.log(`   ❌ Erro IA: ${err.message}`);
  }

  // 4. WhatsApp Cloud API (Meta)
  console.log('\n📱 [4/4] Verificando WhatsApp Cloud API (Meta):');
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneId) {
    try {
      const url = `https://graph.facebook.com/v21.0/${phoneId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json() as any;
      
      if (res.ok) {
        console.log(`   ✅ Meta API: OK (Nome: ${data.verified_name || 'Configurado'})`);
        console.log(`   📱 ID Telefone: ${data.id}`);
      } else {
        console.log(`   ❌ Erro Meta API (${res.status}): ${data.error?.message || 'Token inválido'}`);
      }
    } catch (err: any) {
      console.log(`   ❌ Erro Conexão Meta: ${err.message}`);
    }
  } else {
    console.log('   ❌ Pulei teste Meta por falta de credenciais.');
  }

  console.log('\n✨ Diagnóstico concluído.');
}

diag().catch(err => {
  console.error('\n💥 Erro Fatal no Diagnóstico:', err);
  process.exit(1);
});
