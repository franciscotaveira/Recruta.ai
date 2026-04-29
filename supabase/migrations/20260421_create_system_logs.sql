-- MCT OS — Migration: System Logs v1.0
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  level TEXT DEFAULT 'info', -- info, warn, error
  details JSONB DEFAULT '{}',
  correlation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance em auditoria
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_event ON system_logs(event);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON system_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policy idempotente para evitar erro em reaplicação de migração
DROP POLICY IF EXISTS "Users can only see their own logs" ON system_logs;
CREATE POLICY "Users can only see their own logs" ON system_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);
