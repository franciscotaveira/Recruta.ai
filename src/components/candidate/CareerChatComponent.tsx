import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, History, Sparkles, Loader2 } from 'lucide-react';
import { useCandidateDashboard } from '../../hooks/useCandidateDashboard';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

export const CareerChatComponent = () => {
  const { profile } = useCandidateDashboard();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'ai', 
      text: `Olá ${profile?.name || 'Candidato'}! Sou seu Recrutaria Career Advisor. Como posso acelerar sua jornada profissional hoje? Posso ajudar com seu currículo, preparação para entrevistas ou análise de mercado.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch('/api/candidate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages.map(m => ({ role: m.role, content: m.text }))
        }),
      });

      if (!response.ok) throw new Error('Falha na resposta da IA');

      const data = await response.json();
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: data.response 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: 'Desculpe, tive um problema técnico. Poderia tentar novamente?' 
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col relative h-full">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth pt-10"
        >
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex gap-5 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xl border ${
                msg.role === 'ai' 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-xl whitespace-pre-wrap ${
                  msg.role === 'ai' 
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none' 
                    : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-5 max-w-3xl mx-auto animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Loader2 size={20} className="text-slate-500 animate-spin" />
              </div>
              <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl rounded-tl-none h-12 w-24" />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 md:p-8 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000" />
            <div className="relative flex items-center">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte qualquer coisa sobre sua carreira..."
                className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 text-slate-100 pl-6 pr-16 py-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm shadow-2xl placeholder:text-slate-600"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="absolute right-2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
             <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.4em]">
              Recrutaria Career Engine v4
            </p>
            <div className="h-px w-12 bg-slate-900" />
            <Sparkles size={10} className="text-indigo-500/30" />
          </div>
        </div>
      </div>
    </div>
  );
};
