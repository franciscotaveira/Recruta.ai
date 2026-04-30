-- 20260430_candidate_wallet.sql
-- Adiciona a tabela de carteira para monetização B2C dos candidatos

CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TABLE IF NOT EXISTS candidate_wallet (
  candidate_id TEXT PRIMARY KEY REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 3, -- 3 créditos gratuitos iniciais
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE candidate_wallet ENABLE ROW LEVEL SECURITY;

-- Política de RLS: Apenas o dono do perfil (e os serviços internos) podem ver/atualizar
CREATE POLICY "Candidate can read own wallet" ON candidate_wallet
  FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM candidate_profiles WHERE user_id = auth.uid()::text
    )
  );

-- Trigger para atualização do updated_at
CREATE TRIGGER handle_updated_at_candidate_wallet
  BEFORE UPDATE ON candidate_wallet
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
