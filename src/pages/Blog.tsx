import React from 'react';
import { ArrowRight, Clock, Tag, MessageCircle, Mic, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const posts = [
    {
      id: 1,
      category: 'Dicas de Carreira',
      title: 'Por que seu currículo nunca passa da triagem automática?',
      excerpt:
        'Descubra como os sistemas ATS (Applicant Tracking Systems) filtram 75% dos candidatos antes mesmo de um humano ler seu nome.',
      readTime: '5 min',
      image:
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      cta: 'Não seja filtrado por robôs. Ative seu ciclo de posicionamento agora.',
    },
    {
      id: 2,
      category: 'Tecnologia & RH',
      title: "Soft Skills: O que a Inteligência Artificial consegue 'ouvir' na sua voz?",
      excerpt:
        'Entonação, pausas e clareza. Veja como nossa IA identifica liderança e resiliência apenas ouvindo você contar sua história.',
      readTime: '7 min',
      image:
        'https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      cta: 'Descubra suas Soft Skills ocultas com nosso diagnóstico.',
    },
    {
      id: 3,
      category: 'Histórias de Sucesso',
      title: 'De ignorada a contratada: Como a Mariana conseguiu vaga de Gerente em 3 dias',
      excerpt:
        'Estudo de caso real de uma candidata que usou o Recrutaria para pular a etapa do currículo de papel.',
      readTime: '4 min',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      cta: 'Quer resultados iguais aos da Mariana? Comece aqui.',
    },
  ];

  const initPayment = () => {
    const phoneNumber = '554999999999';
    const message = 'Olá! Li o blog e quero ativar meu Ciclo de Posicionamento (R$ 29,90)';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Simplificada */}
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
                Recrutaria<span className="text-indigo-500">.</span> <span className="text-slate-400 font-normal ml-2">Blog</span>
              </span>
            </div>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-purple-600">
            Voltar para Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-slate-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-indigo-300 border border-white/5">
            Knowledge Engine
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-8 font-heading tracking-tighter">Domine sua Carreira na Era da IA</h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">
            Artigos, dicas e insights para você parar de enviar currículos para o vácuo e começar a
            ser notado.
          </p>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
            >
              <img src={post.image} alt={post.title} className="h-48 w-full object-cover" />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{post.title}</h3>
                <p className="text-slate-600 text-sm mb-6 flex-1">{post.excerpt}</p>

                {/* Inline Funnel CTA */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-purple-600 mb-2 uppercase">
                    Recrutaria recomenda:
                  </p>
                  <button
                    onClick={initPayment}
                    className="w-full py-3 bg-slate-50 hover:bg-purple-50 text-slate-900 hover:text-purple-700 font-bold text-sm rounded-lg border border-slate-200 hover:border-purple-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Star size={16} className="text-yellow-500 fill-current" />
                    {post.cta}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Bottom Funnel CTA */}
      <section className="bg-purple-600 py-16 px-4 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Cansado de ler teorias e não ter resultados?</h2>
          <p className="text-purple-100 text-lg mb-8">
            Nossa ferramenta prática resolve os problemas citados acima em menos de 5 minutos.
          </p>
          <button
            onClick={initPayment}
            className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-slate-100 transition-transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            <MessageCircle size={24} />
            Ativar Ciclo Profissional
          </button>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
        <p>© 2026 Recrutaria - Conteúdo Educativo.</p>
      </footer>
    </div>
  );
};

export default Blog;
