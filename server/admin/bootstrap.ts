import { randomUUID } from 'crypto';
import { users } from '../storage/db';
import { hashPassword } from '../middleware/auth';

import { supabase } from '../storage/supabase.js';

export async function ensureBootstrapAdmin() {
  const adminEmail = String(process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();
  const adminName = String(process.env.ADMIN_NAME || 'Administrador Recrutaria').trim();

  if (!adminEmail || !adminPassword) {
    console.warn(
      '[admin] ADMIN_EMAIL/ADMIN_PASSWORD não configurados. Bootstrap de admin ignorado.'
    );
    return;
  }

  const existing = (await users.findByEmail(adminEmail)) as any;
  if (existing) {
    if (existing.role !== 'admin') {
      throw new Error(
        `[admin] Usuário ${adminEmail} existe com role ${existing.role}. Não é possível promover automaticamente.`
      );
    }
    console.log(`[admin] Conta admin já existente: ${adminEmail}`);
    return;
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(adminPassword);
  await users.create(id, adminEmail, passwordHash, 'admin', adminName || null);
  await users.verify(id);
  console.log(`[admin] Conta admin criada: ${adminEmail}`);
}

export async function ensureBootstrapSquad() {
  try {
    const { count } = await supabase
      .from('ai_specialists')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      console.log(`[boot] AI Squad já possui ${count} especialistas.`);
      return;
    }

    console.log('[boot] Inicializando AI Squad Squad (Aria, Theo, Iris, Cyrus, Xavier)...');

    const specialists = [
      {
        id: 'aria',
        name: 'Aria',
        area: 'triage',
        objective: 'Triagem técnica profunda',
        key_metric: 'Precisão de Match',
        enabled: true,
        model_policy: 'auto',
        owner: 'MCT Kernel',
      },
      {
        id: 'theo',
        name: 'Theo',
        area: 'attraction',
        objective: 'Engajamento de talentos',
        key_metric: 'Conversion Rate',
        enabled: true,
        model_policy: 'auto',
        owner: 'MCT Kernel',
      },
      {
        id: 'iris',
        name: 'Iris',
        area: 'interview',
        objective: 'Entrevistas comportamentais',
        key_metric: 'Profundidade de Insights',
        enabled: true,
        model_policy: 'auto',
        owner: 'MCT Kernel',
      },
      {
        id: 'cyrus',
        name: 'Cyrus',
        area: 'compliance',
        objective: 'Segurança e RLS',
        key_metric: 'Zero Data Leak',
        enabled: true,
        model_policy: 'auto',
        owner: 'MCT Kernel',
      },
      {
        id: 'xavier',
        name: 'Xavier',
        area: 'candidate_experience',
        objective: 'UX do candidato',
        key_metric: 'CSAT',
        enabled: true,
        model_policy: 'auto',
        owner: 'MCT Kernel',
      },
    ];

    await supabase.from('ai_specialists').insert(specialists);

    // Governance
    await supabase.from('system_settings').upsert({
      key: 'ai_governance',
      value: {
        consentRequired: true,
        blindScreeningEnabled: true,
        humanInTheLoopRequired: true,
        biasAuditCadenceDays: 30,
        maxParallelSessions: 200,
      },
    });

    console.log('[boot] AI Squad inicializado com sucesso.');
  } catch (err) {
    console.error('[boot] Erro ao inicializar AI Squad:', err);
  }
}
