
import './env';
import { supabase } from './storage/supabase';
import { dual } from './storage/db';
import { smartAI } from './ai/provider';

async function verify() {
  console.log('🚀 Iniciando Verificação de Produção - Recruta.AI');
  console.log('--------------------------------------------------');

  // 1. Database
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase: Conectado com sucesso.');
  } catch (err: any) {
    console.error('❌ Supabase: Erro na conexão:', err.message);
  }

  // 2. Environment Variables
  const required = [
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
    'WHATSAPP_APP_SECRET',
    'OPENROUTER_API_KEY',
    'JWT_SECRET'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      console.warn(`⚠️  Ambiente: Variável ${key} não encontrada.`);
    } else {
      console.log(`✅ Ambiente: ${key} configurado.`);
    }
  }

  // 3. AI Health
  try {
    const response = await smartAI('diag', 'Responda apenas OK', 'Teste de diagnóstico de IA');
    console.log('✅ IA: Provedor funcionando. Resposta:', response);
  } catch (err: any) {
    console.error('❌ IA: Erro no provedor:', err.message);
  }

  console.log('--------------------------------------------------');
  console.log('🏁 Verificação concluída.');
  process.exit(0);
}

verify();
