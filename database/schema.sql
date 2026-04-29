-- ═══════════════════════════════════════════════════════
-- RECRUTA.AI / MCT V2.1 - Supabase Postgres Schema
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'candidate',
  name            TEXT,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- PUBLIC_JOBS
CREATE TABLE IF NOT EXISTS public_jobs (
  id              TEXT PRIMARY KEY,
  recruiter_id    TEXT NOT NULL,
  title           TEXT NOT NULL,
  company         TEXT NOT NULL,
  location        TEXT NOT NULL,
  description     TEXT NOT NULL,
  requirements    JSONB NOT NULL DEFAULT '[]'::jsonb,
  salary_range    TEXT,
  job_type        TEXT DEFAULT 'CLT',
  modality        TEXT DEFAULT 'Hybrid',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  application_count INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public_jobs(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public_jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON public_jobs(recruiter_id);

-- CANDIDATE_PROFILES
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  location        TEXT,
  target_role     TEXT,
  seniority       TEXT,
  cv_master       TEXT,
  scp_score       INTEGER DEFAULT 0,
  scp_breakdown   JSONB,
  diagnosis       TEXT,
  attention_points JSONB DEFAULT '[]'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  plan            TEXT DEFAULT 'free',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_location ON candidate_profiles(location);

-- WHATSAPP_SESSIONS
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id              TEXT PRIMARY KEY,
  candidate_phone TEXT NOT NULL,
  candidate_name  TEXT,
  job_id          TEXT NOT NULL REFERENCES public_jobs(id),
  recruiter_id    TEXT NOT NULL,
  state           TEXT NOT NULL DEFAULT 'invited',
  current_question_idx INTEGER NOT NULL DEFAULT 0,
  questions       JSONB NOT NULL DEFAULT '[]'::jsonb,
  responses       JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary         TEXT,
  match_score     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  declined_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sessions_phone ON whatsapp_sessions(candidate_phone);
CREATE INDEX IF NOT EXISTS idx_sessions_job ON whatsapp_sessions(job_id);
CREATE INDEX IF NOT EXISTS idx_sessions_state ON whatsapp_sessions(state);

-- AUDIO_FILES
CREATE TABLE IF NOT EXISTS audio_files (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  wa_media_id     TEXT NOT NULL,
  local_path      TEXT,
  transcription   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WA_MESSAGES
CREATE TABLE IF NOT EXISTS wa_messages (
  id              TEXT PRIMARY KEY,
  session_id      TEXT REFERENCES whatsapp_sessions(id) ON DELETE SET NULL,
  direction       TEXT NOT NULL,
  type            TEXT NOT NULL,
  content         TEXT NOT NULL,
  wa_message_id   TEXT,
  status          TEXT NOT NULL DEFAULT 'sent',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON wa_messages(session_id);

-- CV_VERSIONS
CREATE TABLE IF NOT EXISTS cv_versions (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  version_num     INTEGER NOT NULL,
  target_job_id   TEXT REFERENCES public_jobs(id) ON DELETE SET NULL,
  target_role     TEXT,
  cv_text         TEXT NOT NULL,
  changes_applied JSONB DEFAULT '[]'::jsonb,
  match_score     INTEGER,
  ai_suggestions  JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cv_versions_profile ON cv_versions(profile_id);

-- JOB_APPLICATIONS
CREATE TABLE IF NOT EXISTS job_applications (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  job_id          TEXT NOT NULL REFERENCES public_jobs(id) ON DELETE CASCADE,
  cv_version_id   TEXT REFERENCES cv_versions(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'applied',
  match_score     INTEGER,
  recruiter_notes TEXT,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_profile ON job_applications(profile_id);

-- CV_INSIGHTS
CREATE TABLE IF NOT EXISTS cv_insights (
  id              TEXT PRIMARY KEY,
  job_id          TEXT NOT NULL REFERENCES public_jobs(id) ON DELETE CASCADE,
  requirement_text TEXT NOT NULL,
  category        TEXT,
  frequency       INTEGER NOT NULL DEFAULT 1,
  impact_on_score INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, requirement_text)
);
CREATE INDEX IF NOT EXISTS idx_insights_job ON cv_insights(job_id);
CREATE INDEX IF NOT EXISTS idx_insights_category ON cv_insights(category);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,
  abacate_billing_id TEXT UNIQUE,
  user_id         TEXT NOT NULL,
  user_type       TEXT NOT NULL,
  product_type    TEXT NOT NULL,
  credits_amount  INTEGER DEFAULT 0,
  amount_cents    INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  payment_method  TEXT,
  return_url      TEXT,
  checkout_url    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at         TIMESTAMPTZ,
  metadata        JSONB
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_abacate ON payments(abacate_billing_id);

-- RECRUITER_WALLET
CREATE TABLE IF NOT EXISTS recruiter_wallet (
  recruiter_id    TEXT PRIMARY KEY,
  balance         INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent     INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CREDIT_TRANSACTIONS
CREATE TABLE IF NOT EXISTS credit_transactions (
  id              TEXT PRIMARY KEY,
  recruiter_id    TEXT NOT NULL REFERENCES recruiter_wallet(recruiter_id) ON DELETE CASCADE,
  payment_id      TEXT REFERENCES payments(id) ON DELETE SET NULL,
  type            TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  balance_after   INTEGER NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_tx_recruiter ON credit_transactions(recruiter_id);

-- ESTRATÉGIA DE ROW LEVEL SECURITY (RLS) BASICA
-- Ativando RLS seguro (padrão)
ALTER TABLE public_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Jobs abertos para todos, leitura anônima/logada
CREATE POLICY "Public Jobs are viewable by everyone" ON public_jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Recruiters can modify their own jobs" ON public_jobs FOR ALL USING (auth.uid()::text = recruiter_id);

-- (Mais policies sob demanda dependendo do backend ou bypass se usando backend service_role)
