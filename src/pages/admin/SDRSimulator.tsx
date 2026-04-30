import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Send,
  RefreshCw,
  Star,
  User,
  Bot,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type SimulatorRole = 'candidate' | 'recruiter';
type SimulatorMood = 'skeptical' | 'interested' | 'angry' | 'busy' | 'confused';

interface SimulationScenario {
  id: string;
  role: SimulatorRole;
  mood: SimulatorMood;
  objectionFocus?: string;
  context: string;
}

interface ChatMessage {
  role: 'user' | 'model'; // 'user' = SDR, 'model' = Lead
  content: string;
}

interface SimulationEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export default function SDRSimulator() {
  const { token } = useAuth();

  const [step, setStep] = useState<'setup' | 'chat' | 'evaluation'>('setup');
  const [scenario, setScenario] = useState<SimulationScenario>({
    id: 'sc-' + Math.random().toString(36).substring(2, 9),
    role: 'recruiter',
    mood: 'skeptical',
    context:
      'Você é um Recrutador de uma agência buscando uma ferramenta para analisar CVs mais rápido.',
    objectionFocus: 'O preço (créditos) parece caro comparado a ignorar os CVs que não leio.',
  });

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<SimulationEvaluation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isLoading]);

  const startSimulation = () => {
    // Add a system welcome message just for UI locally, we won't feed it back as user
    setHistory([
      {
        role: 'model',
        content: `[Simulação Iniciada] Perfil do Lead: ${scenario.role === 'recruiter' ? 'RH/Empresa' : 'Candidato'} - Humor: ${scenario.mood}.`,
      },
    ]);
    setStep('chat');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: inputValue };
    const currentHistory = [...history, newMessage];

    setHistory(currentHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/simulator/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scenario,
          // filter out the initial system message if we added one
          history: currentHistory.filter((m) => !m.content.startsWith('[Simulação Iniciada]')),
        }),
      });

      if (!res.ok) throw new Error('Falha ao gerar resposta');
      const data = await res.json();

      setHistory([...currentHistory, { role: 'model', content: data.text }]);
    } catch (error) {
      console.error(error);
      setHistory([
        ...currentHistory,
        { role: 'model', content: '[Erro de Conexão: o lead caiu da sessão]' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setIsLoading(true);
    setStep('evaluation');
    try {
      const res = await fetch('/api/simulator/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scenario,
          history: history.filter((m) => !m.content.startsWith('[Simulação Iniciada]')),
        }),
      });

      if (!res.ok) throw new Error('Falha ao avaliar');
      const data = await res.json();
      setEvaluation(data);
    } catch (error) {
      console.error(error);
      setEvaluation({
        score: 0,
        strengths: ['Falha de API'],
        weaknesses: ['Não foi possível avaliar sua simulação.'],
        recommendation: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Simulador de Atendimento (SDR)
        </h1>
        <p className="text-zinc-400">
          Treine suas abordagens de venda com leads gerados por Inteligência Artificial.
        </p>
      </div>

      {step === 'setup' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Configurar Novo Lead</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Perfil do Lead</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2.5 outline-none focus:border-[#7c3aed]"
                value={scenario.role}
                onChange={(e) =>
                  setScenario({ ...scenario, role: e.target.value as SimulatorRole })
                }
              >
                <option value="recruiter">Recrutador (Venda B2B - Pacote de Créditos)</option>
                <option value="candidate">Candidato (Venda B2C - Diagnóstico de CV)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Humor / Temperamento
              </label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2.5 outline-none focus:border-[#7c3aed]"
                value={scenario.mood}
                onChange={(e) =>
                  setScenario({ ...scenario, mood: e.target.value as SimulatorMood })
                }
              >
                <option value="skeptical">Cético (Desconfiado das promessas)</option>
                <option value="interested">
                  Interessado (Dúvidas sobre como funciona na prática)
                </option>
                <option value="angry">Frustrado/Irado (Impaciente com processos lentos)</option>
                <option value="busy">Ocupado (Respostas curtas, sem tempo)</option>
                <option value="confused">Confuso (Não entende de tecnologia)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Contexto Específico (Opcional)
              </label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2.5 outline-none focus:border-[#7c3aed] min-h-[80px]"
                value={scenario.context}
                onChange={(e) => setScenario({ ...scenario, context: e.target.value })}
                placeholder="Ex: É um dono de uma padaria que não sabe recrutar..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Foco da Objeção (Opcional)
              </label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2.5 outline-none focus:border-[#7c3aed]"
                value={scenario.objectionFocus || ''}
                onChange={(e) => setScenario({ ...scenario, objectionFocus: e.target.value })}
                placeholder="Ex: Acha o pacote de créditos muito caro."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={startSimulation}
              className="px-6 py-2.5 bg-[#7c3aed] text-white font-medium rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Iniciar Simulação
            </button>
          </div>
        </div>
      )}

      {step === 'chat' && (
        <div className="flex flex-col h-[70vh] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  Lead {scenario.role === 'recruiter' ? 'B2B' : 'B2C'}
                </h3>
                <p className="text-xs text-zinc-400 uppercase tracking-widest">{scenario.mood}</p>
              </div>
            </div>
            <button
              onClick={handleEvaluate}
              className="text-sm px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-700"
            >
              Encerrar & Avaliar
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#09090b]">
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#7c3aed] text-white rounded-br-sm'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl px-5 py-3 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-bl-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Lead digitando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800">
            <div className="flex items-end gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escreva sua abordagem..."
                className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 outline-none focus:border-[#7c3aed] resize-none max-h-32"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="w-12 h-12 flex items-center justify-center bg-[#7c3aed] text-white rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'evaluation' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 text-[#7c3aed] animate-spin mb-4" />
              <p className="text-zinc-400 text-lg">O AI Coach está analisando sua performance...</p>
            </div>
          ) : evaluation ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Star className="text-yellow-500" />
                    Feedback do Coach
                  </h2>
                  <p className="text-zinc-400 mt-1">Sessão simulada com Lead {scenario.mood}</p>
                </div>
                <div className="text-center">
                  <div
                    className={`text-5xl font-black ${evaluation.score >= 80 ? 'text-green-500' : evaluation.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}
                  >
                    {evaluation.score}
                  </div>
                  <span className="text-zinc-500 text-sm uppercase font-bold tracking-widest">
                    Score
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Strengths */}
                <div className="bg-zinc-950/50 p-6 rounded-xl border border-green-900/30">
                  <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />O que você fez BEM
                  </h3>
                  <ul className="space-y-3">
                    {evaluation.strengths.map((str, idx) => (
                      <li key={idx} className="text-zinc-300 text-sm flex gap-3">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-zinc-950/50 p-6 rounded-xl border border-red-900/30">
                  <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Onde você PODE MELHORAR
                  </h3>
                  <ul className="space-y-3">
                    {evaluation.weaknesses.map((weak, idx) => (
                      <li key={idx} className="text-zinc-300 text-sm flex gap-3">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 p-6 rounded-xl mb-8">
                <h3 className="text-[#7c3aed] font-semibold mb-2">Recomendação Prática</h3>
                <p className="text-zinc-300">{evaluation.recommendation}</p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setHistory([]);
                    setEvaluation(null);
                    setStep('setup');
                  }}
                  className="px-6 py-3 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Fazer Nova Simulação
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
