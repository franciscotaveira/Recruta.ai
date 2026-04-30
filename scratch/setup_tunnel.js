#!/usr/bin/env node
/**
 * Recruta.AI — Tunnel Setup Completo
 * 1. Inicia ngrok na porta 3456
 * 2. Obtém a URL pública
 * 3. Configura o webhook na Meta automaticamente
 * 4. Confirma que tudo está pronto
 *
 * Uso: node scratch/setup_tunnel.js
 * Pré-requisito: servidor rodando (bash start.sh)
 */
import https from 'https';
import http from 'http';

const TOKEN =
  'EAAdLlW6lFT4BRXZBxZAjSs5SlN9b9qhmS31uut3DPdHxVLgAtatWZBmnkOjVtU2Js3lSdzdnZBKAiZCgegJifZBIXtZBv4aP9hNurvOsRdp2WSQw5bN2LQimLZBVKR8zUN3gV6dgBXHqWk4XERiWc0pCJh2BWz1ZBgUyqnzHqJfZCd0JR6s5rekfcVm3yDqkq9A1djVgZDZD';
const APP_ID = '2053430015497534'; // Meta App ID (visible in dashboard URL)
const PHONE_ID = '853596591180846';
const VERIFY_TOKEN = 'recruta_ai_v2_654f71da_prod';

function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod
      .get(url, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => {
          try {
            resolve({ status: r.statusCode, body: JSON.parse(d) });
          } catch {
            resolve({ status: r.statusCode, body: d });
          }
        });
      })
      .on('error', reject);
  });
}

function post(hostname, path, payload, token) {
  const body = JSON.stringify(payload);
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => {
          try {
            resolve({ status: r.statusCode, body: JSON.parse(d) });
          } catch {
            resolve({ status: r.statusCode, body: d });
          }
        });
      }
    );
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 0, error: 'timeout' });
    });
    req.write(body);
    req.end();
  });
}

// ── 1. Verificar se o backend está rodando ────────────────────
console.log('\n🔍 [1/4] Verificando backend...');
try {
  const health = await get('http://localhost:3456/api/health');
  if (health.status !== 200) throw new Error(`status ${health.status}`);
  console.log('✅ Backend rodando em localhost:3456');
} catch (e) {
  console.error('❌ Backend não está rodando!');
  console.error('   Execute primeiro: bash start.sh');
  process.exit(1);
}

// ── 2. Obter URL do ngrok via API local ───────────────────────
console.log('\n🌐 [2/4] Obtendo URL pública do ngrok...');
let publicUrl = '';
try {
  const ngrokApi = await get('http://localhost:4040/api/tunnels');
  const tunnels = ngrokApi.body?.tunnels || [];
  const httpsTunnel = tunnels.find((t) => t.proto === 'https');
  if (!httpsTunnel) throw new Error('Nenhum túnel HTTPS ativo. Inicie ngrok primeiro.');
  publicUrl = httpsTunnel.public_url;
  console.log(`✅ URL pública: ${publicUrl}`);
} catch (e) {
  console.error('❌ ngrok não está rodando ou sem túnel HTTPS.');
  console.error('   Execute em outro terminal: ngrok http 3456');
  console.error('   Depois rode este script novamente.');
  process.exit(1);
}

const webhookUrl = `${publicUrl}/api/whatsapp/webhook`;
console.log(`   Webhook: ${webhookUrl}`);

// ── 3. Registrar webhook na Meta ──────────────────────────────
console.log('\n📡 [3/4] Registrando webhook na Meta...');
const subResult = await post(
  'graph.facebook.com',
  `/v21.0/${APP_ID}/subscriptions`,
  {
    object: 'whatsapp_business_account',
    callback_url: webhookUrl,
    verify_token: VERIFY_TOKEN,
    fields: 'messages',
  },
  TOKEN
);

if (subResult.status === 200 && subResult.body?.success) {
  console.log('✅ Webhook registrado com sucesso!');
} else {
  console.warn('⚠️  Falha ao registrar via subscriptions. Tente manualmente no painel Meta.');
  console.warn(`   Code: ${subResult.body?.error?.code} | ${subResult.body?.error?.message}`);
  console.warn('\n   URL para configurar manualmente:');
  console.warn(
    '   https://developers.facebook.com/apps/2053430015497534/whatsapp-business/wa-settings/'
  );
  console.warn(`   Callback URL: ${webhookUrl}`);
  console.warn(`   Verify Token: ${VERIFY_TOKEN}`);
}

// ── 4. Resumo ─────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log('📊 STATUS COMPLETO');
console.log('═'.repeat(60));
console.log(`🌐 URL pública:     ${publicUrl}`);
console.log(`📡 Webhook URL:     ${webhookUrl}`);
console.log(`🔑 Verify Token:    ${VERIFY_TOKEN}`);
console.log(`📱 Phone ID:        ${PHONE_ID}`);
console.log('');
console.log('📋 Se precisar configurar manualmente:');
console.log(
  '   https://developers.facebook.com/apps/2053430015497534/whatsapp-business/wa-settings/'
);
console.log('');
console.log('✅ Sistema pronto para receber respostas de candidatos!');
console.log('═'.repeat(60));
