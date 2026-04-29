import React from 'react';
import { Target, ShieldCheck, HeartHandshake, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link
            to="/"
            className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <HeartHandshake size={16} />
            </div>
            Recruta.AI
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-purple-600">
            Voltar para Home
          </Link>
        </div>
      </nav>

      <section className="py-20 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          Nós acreditamos que <span className="text-purple-600">pessoas são mais</span> do que
          palavras-chave em um PDF.
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          A Recruta.AI nasceu da frustração de ver talentos incríveis sendo descartados por robôs
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
        <p>© 2026 Recruta.AI - Sobre Nós.</p>
      </footer>
    </div>
  );
};

export default About;
