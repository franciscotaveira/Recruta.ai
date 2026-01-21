import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Interface for chat messages
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const AICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Olá! Sou seu Copiloto de Carreira. Como posso ajudar você a melhorar seu posicionamento hoje?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Determine context based on current path
  const getContextPrompt = () => {
    const path = location.pathname;
    let context = "O usuário está na plataforma Recruta.AI.";
    
    if (path.includes('/candidate/diagnosis')) {
      context += " Eles estão visualizando o 'Diagnóstico Profissional' e o Score SCPD (Clareza, Evidência, Foco). Ajude-os a entender como melhorar a pontuação.";
    } else if (path.includes('/candidate/cv')) {
      context += " Eles estão no 'Currículo Vivo'. Ajude-os a reescrever experiências e torná-las mais atrativas para recrutadores.";
    } else if (path.includes('/candidate/jobs')) {
      context += " Eles estão vendo 'Vagas Internas' (Bônus). Lembre-os que o foco é o preparo, mas ajude a analisar o match com as vagas.";
    } else {
      context += " Eles estão no Dashboard Principal. Explique o valor do Diagnóstico e da Otimização de Currículo.";
    }
    return context;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Initialize Gemini Client
      // Note: In a real app, ensure process.env.API_KEY is available. 
      // If running locally without env, this might fail gracefully or need a mock.
      const apiKey = process.env.API_KEY || ''; 
      
      if (!apiKey) {
        // Fallback simulation if no key is present (for demo purposes)
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "Estou em modo de demonstração (sem API Key configurada). Em produção, eu analisaria sua pergunta com o modelo Gemini 3 Flash." 
            }]);
            setIsLoading(false);
        }, 1000);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `Você é um especialista em carreira e UX Writer do Recruta.AI.
      Seu tom é encorajador, direto e profissional.
      CONTEXTO ATUAL: ${getContextPrompt()}
      Responda de forma concisa (máximo 3 frases) focado em ação.`;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: systemInstruction,
        }
      });

      // Send history + new message
      // Note: Simplification for this snippet, ideally we pass history to chat initialization
      const result = await chat.sendMessage({ message: userText });
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: result.text || "Desculpe, não consegui processar sua resposta." 
      }]);

    } catch (error) {
      console.error("Erro no Copiloto:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "Tive um problema de conexão momentâneo. Tente novamente?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden flex flex-col animate-fade-in-up origin-bottom-right transition-all">
          {/* Header */}
          <div className="bg-slate-900 dark:bg-purple-900 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
                <Sparkles size={18} className="text-purple-400" />
                <span className="font-bold text-sm">Copiloto Recruta.AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex items-center">
                <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Pergunte sobre esta tela..."
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isOpen 
            ? 'bg-slate-700 text-white rotate-90' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <Bot size={28} />}
        
        {/* Notification Badge (Fake) */}
        {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        )}
      </button>

      {/* Tooltip hint when closed */}
      {!isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold py-1 px-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap animate-bounce-slow origin-bottom-right">
            Dúvidas? Fale com a IA
            <div className="absolute top-full right-4 border-4 border-transparent border-t-white dark:border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

export default AICopilot;
