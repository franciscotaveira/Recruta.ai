-- MCT PRO — Security Hardening v1.0
-- Este script habilita RLS em todas as tabelas e define políticas de privacidade estritas.

-- 1. Habilitar RLS em tudo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para Users
CREATE POLICY "Users can see their own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- 3. Políticas para Perfis de Candidatos
CREATE POLICY "Candidates can manage their own profile" ON candidate_profiles
  FOR ALL USING (auth.uid()::text = id);
CREATE POLICY "Recruiters can see candidate profiles" ON candidate_profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'recruiter'
  ));

-- 4. Políticas para Carteiras de Recrutadores
CREATE POLICY "Recruiters can see their own wallet" ON recruiter_wallets
  FOR SELECT USING (auth.uid()::text = recruiter_id);

-- 5. Políticas para Vagas (Jobs)
CREATE POLICY "Public can see active jobs" ON jobs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Recruiters can manage their own jobs" ON jobs
  FOR ALL USING (auth.uid()::text = recruiter_id);

-- 6. Políticas para Aplicações (Job Applications)
CREATE POLICY "Candidates can see their applications" ON job_applications
  FOR SELECT USING (auth.uid()::text = profile_id);
CREATE POLICY "Recruiters can see applications for their jobs" ON job_applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM jobs WHERE id = job_id AND recruiter_id = auth.uid()::text
  ));

-- 7. Políticas para Pagamentos e Transações
CREATE POLICY "Users can see their own payments" ON payments
  FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Recruiters can see their transactions" ON credit_transactions
  FOR SELECT USING (auth.uid()::text = recruiter_id);

-- 8. Permissões de Admin (Override total)
-- Como o Supabase usa service_role para o backend, o app continuará funcionando 
-- independentemente dessas políticas. Isso protege apenas o acesso via Client-side / Anon key.
