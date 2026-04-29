#!/bin/bash
# Recruta.AI — Inicia backend + frontend em um único comando
# Uso: ./start.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$PROJECT_DIR/server"

echo "🚀 Recruta.AI — Iniciando..."
echo ""

# Mata processos anteriores
lsof -ti:3456 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:4051 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Instala dependências se necessário
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "📦 Instalando dependências do backend..."
  cd "$SERVER_DIR" && npm install
  cd "$PROJECT_DIR"
fi
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "📦 Instalando dependências do frontend..."
  cd "$PROJECT_DIR" && npm install
fi

echo ""
echo "🔧 Backend  → http://localhost:3456"
echo "🖥️  Frontend → http://localhost:4051"
echo ""

# Inicia backend em background
cd "$SERVER_DIR"
PORT=3456 node --import tsx index.ts > /tmp/recruta-backend.log 2>&1 &
BACKEND_PID=$!

# Aguarda backend estar pronto
for i in 1 2 3 4 5; do
  if curl -s http://localhost:3456/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Inicia frontend em background
cd "$PROJECT_DIR"
npm run dev > /tmp/recruta-frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguarda frontend estar pronto
for i in 1 2 3 4 5 6 7 8; do
  if curl -s http://localhost:4051 > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo ""
echo "✅ TUDO RODANDO"
echo "   🔧 Backend:  http://localhost:3456"
echo "   🖥️  Frontend: http://localhost:4051"
echo "   📋 PIDs: backend=$BACKEND_PID frontend=$FRONTEND_PID"
echo ""
echo "Pressione Ctrl+C para parar tudo."
echo ""

# Cleanup on Ctrl+C
cleanup() {
  echo ""
  echo "⏹️  Parando servidores..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

# Mantém o script rodando
wait
