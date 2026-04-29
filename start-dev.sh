#!/bin/bash
# Start both frontend (Vite) and backend (Express) in development
# Usage: ./start-dev.sh

echo "🚀 Starting Recruta.AI (dev mode)..."
echo ""

# Install server deps if needed
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm install && cd ..
  echo ""
fi

# Start backend
echo "📱 Backend: http://localhost:4000"
echo "   WhatsApp webhook: POST /api/whatsapp/webhook"
echo "   Health check:     GET  /api/health"
cd server && npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
echo ""
echo "🖥️  Frontend: http://localhost:3000"
echo "   API proxy: /api → localhost:4000"
echo ""
npm run dev &
FRONTEND_PID=$!

# Cleanup on exit
cleanup() {
  echo ""
  echo "⏹️  Stopping servers..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

echo ""
echo "✅ Both servers running. Press Ctrl+C to stop."
echo "   Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo ""

wait
