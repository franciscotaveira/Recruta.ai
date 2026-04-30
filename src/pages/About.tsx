import React from 'react';
import { Target, ShieldCheck, HeartHandshake, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M12 2L12 12L22 12" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tighter font-heading text-slate-900">
                Recrutaria<span className="text-indigo-500">.</span>
              </span>
            </div>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-purple-600">
            Voltar para Home
          </Link>
        </div>
      </nav>

      <section className="py-20 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter font-heading leading-[0.9]">
          Nós acreditamos que <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">pessoas são mais</span> do que
          palavras-chave em um PDF.
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          A Recrutaria nasceu da frustração de ver talentos incríveis sendo descartados por robôs
          que só sabem ler texto, mas não sabem ouvir paixão.
        </p>
      </section>

      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Nossa Missão</h3>
            <p className="text-slate-600">
              Democratizar o acesso a grandes oportunidades, permitindo que a comunicação e as soft
              skills tenham o mesmo peso do diploma.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mic size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Tecnologia</h3>
            <p className="text-slate-600">
              Usamos IA Generativa e processamento de áudio para capturar nuances humanas que
              formulários frios ignoram.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Transparência</h3>
            <p className="text-slate-600">
              Você sempre saberá seu Score. O feedback não é mais um "buraco negro". Entregamos
              diagnósticos reais.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Faça parte da revolução</h2>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors"
          >
            Buscar Oportunidades
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm">
        <p>© 2026 Recrutaria - Sobre Nós.</p>
      </footer>
    </div>
  );
};

export default About;
