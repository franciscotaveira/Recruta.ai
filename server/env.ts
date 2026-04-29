import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.join(__dirname, '..', '.env');
const serverEnvPath = path.join(__dirname, '.env');

const CRITICAL_KEYS = [
  'WHATSAPP_PROVIDER',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
  'WHATSAPP_APP_SECRET',
  'ABACATE_PAY_TOKEN',
  'ABACATE_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
];

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};

  const parsed: Record<string, string> = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    parsed[key] = rest.join('=').trim();
  }

  return parsed;
}

function warnConflictingEnvFiles() {
  if (process.env.NODE_ENV === 'test') return;
  if (!fs.existsSync(rootEnvPath) || !fs.existsSync(serverEnvPath)) return;

  const rootEnv = parseEnvFile(rootEnvPath);
  const serverEnv = parseEnvFile(serverEnvPath);
  const conflicts = CRITICAL_KEYS.filter((key) => {
    const rootValue = rootEnv[key];
    const serverValue = serverEnv[key];
    if (!rootValue || !serverValue) return false;
    return rootValue !== serverValue;
  });

  if (conflicts.length === 0) return;

  console.warn(
    `[ENV] Conflicting values found in .env and server/.env for: ${conflicts.join(
      ', '
    )}. Root .env takes precedence.`
  );
}

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: serverEnvPath });
warnConflictingEnvFiles();
