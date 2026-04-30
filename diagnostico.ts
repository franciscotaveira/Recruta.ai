import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: './server/.env' });

async function runDiagnostics() {
  console.log('🚀 Iniciando Diagnóstico Soberano — Recruta.AI');
  console.log('-------------------------------------------');

  // 1. Supabase Check
  console.log('\n[1/3] Verificando Supabase...');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const { data, error } = await supabase
      .from('jobs')
      .select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Supabase: Conectado com sucesso.');
  } catch (err) {
    console.error('❌ Supabase: Erro de conexão ->', err.message);
  }

  // 2. Evolution API Check
  console.log('\n[2/3] Verificando Evolution API...');
  try {
    const response = await fetch(`${process.env.EVOLUTION_URL}/instance/fetchInstances`, {
      headers: { apikey: process.env.EVOLUTION_API_KEY || '' },
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    console.log('✅ Evolution API: Conectada com sucesso.');
  } catch (err) {
    console.error('❌ Evolution API: Erro de conexão ->', err.message);
    console.log('   Dica: Verifique se o túnel Cloudflare/Ngrok está ativo.');
  }

  // 3. Frontend Build Check
  console.log('\n[3/3] Verificando Build do Frontend...');
  try {
    const fs = await import('fs');
    if (fs.existsSync('./dist/index.html')) {
      console.log('✅ Frontend: Build atualizado detectado em /dist.');
    } else {
      console.log('⚠️ Frontend: Build não encontrado. Execute "npm run build".');
    }
  } catch (err) {
    console.error('❌ Frontend: Erro ao verificar build.');
  }

  console.log('\n-------------------------------------------');
  console.log('🎯 Diagnóstico concluído.');
}

runDiagnostics();
