import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const NotFound: React.FC = () => {
  usePageMeta({
    title: '404 - Página Não Encontrada | Recrutaria',
    description: 'A página que você procura não existe ou foi movida.',
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative">
        <div className="text-[12rem] md:text-[18rem] font-black leading-none text-white/5 select-none font-heading tracking-tighter">
          404
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-8 border border-indigo-500/30">
            <Sparkles className="text-indigo-400" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-heading mb-4 tracking-tight">
            Perdido na triagem?
          </h1>
          <p className="text-slate-400 max-w-md text-lg font-medium leading-relaxed mb-12">
            A página que você procura foi ranqueada para outro lugar ou nunca existiu. 
            Que tal voltar para o início e começar sua jornada?
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="px-8 py-4 bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
            >
              <Home size={18} /> Voltar ao Início
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={18} /> Página Anterior
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-24">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
          Recrutaria Infrastructure • Official Launch 2026
        </p>
      </div>
    </div>
  );
};

export default NotFound;
