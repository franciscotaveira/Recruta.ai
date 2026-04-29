import { users } from './server/storage/db.js';
import { hashPassword } from './server/middleware/auth.js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function run() {
  const email = 'recrutador@demo.com';
  const password = 'demo123';
  const name = 'Recrutador Demo';
  const role = 'recruiter';
  const id = 'demo_recruiter_1';

  try {
    const existing = await users.findByEmail(email);
    if (existing) {
      console.log('Usuário já existe. Atualizando senha...');
      const hp = await hashPassword(password);
      await users.updatePassword(hp, existing.id);
      console.log('Senha atualizada!');
    } else {
      const hp = await hashPassword(password);
      await users.create(id, email, hp, role, name);
      await users.verify(id);
      console.log('Usuário demo criado com sucesso!');
    }
    
    console.log('\nCREDENCIAIS DE ACESSO:');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
    
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
  }
}

run();
