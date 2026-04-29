import { randomUUID } from 'crypto';
import { users } from './storage/db.js';
import { hashPassword } from './middleware/auth.js';

function getArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return String(process.argv[idx + 1]);
  return null;
}

function randomPassword(len = 18): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*()-_=+';
  return Array.from(
    { length: len },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');
}

async function main() {
  const email = (getArg('--email') || process.env.ADMIN_EMAIL || 'admin@recrutaria.com.br')
    .trim()
    .toLowerCase();
  const password = (getArg('--password') || process.env.ADMIN_PASSWORD || randomPassword()).trim();
  const name = (getArg('--name') || process.env.ADMIN_NAME || 'Administrador Recrutaria').trim();

  if (!email.includes('@')) throw new Error('Email inválido para conta admin.');
  if (password.length < 8) throw new Error('Senha admin deve ter no mínimo 8 caracteres.');

  const existing = (await users.findByEmail(email)) as any;
  if (existing && existing.role !== 'admin') {
    throw new Error(
      `Usuário ${email} já existe com role ${existing.role}. Não foi promovido automaticamente.`
    );
  }

  const passwordHash = await hashPassword(password);

  if (existing) {
    await users.updatePassword(passwordHash, existing.id);
    await users.verify(existing.id);
    console.log(`✅ Admin atualizado: ${email}`);
  } else {
    const id = randomUUID();
    await users.create(id, email, passwordHash, 'admin', name || null);
    await users.verify(id);
    console.log(`✅ Admin criado: ${email}`);
  }

  console.log(`🔐 Senha admin: ${password}`);
}

main().catch((err) => {
  console.error('❌ seed-admin falhou:', err.message || err);
  process.exit(1);
});
