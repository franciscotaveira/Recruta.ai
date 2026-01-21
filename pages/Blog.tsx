import React from 'react';
import { ArrowRight, BookOpen, Clock, Tag, MessageCircle, Mic, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const posts = [
    {
      id: 1,
      category: "Dicas de Carreira",
      title: "Por que seu currículo nunca passa da triagem automática?",
      excerpt: "Descubra como os sistemas ATS (Applicant Tracking Systems) filtram 75% dos candidatos antes mesmo de um humano ler seu nome.",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      cta: "Não seja filtrado por robôs. Faça seu diagnóstico de áudio agora."
    },
    {
      id: 2,
      category: "Tecnologia & RH",
      title: "Soft Skills: O que a Inteligência Artificial consegue 'ouvir' na sua voz?",
      excerpt: "Entonação, pausas e clareza. Veja como nossa IA identifica liderança e resiliência apenas ouvindo você contar sua história.",
      readTime: "7 min",
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      cta: "Descubra suas Soft Skills ocultas com nosso teste gratuito."
    },
    {
      id: 3,
      category: "Histórias de Sucesso",
      title: "De ignorada a contratada: Como a Mariana conseguiu vaga de Gerente em 3 dias",
      excerpt: "Estudo de caso real de uma candidata que usou o Recruta.AI para pular a etapa do currículo de papel.",
      readTime: "4 min",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      cta: "Quer resultados iguais aos da Mariana? Comece aqui."
    }
  ];

  const initPayment = () => {
    const phoneNumber = '554999999999';
    const message = 'Olá! Li o blog e quero fazer meu diagnóstico Starter (R$ 97)';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Simplificada */}
      <nav className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <Link to="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <Mic size={16} />
                </div>
                Recruta.AI <span className="text-slate-400 font-normal">| Blog</span>
            </Link>
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-purple-600">Voltar para Home</Link>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-slate-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-purple-300">
                Central de Conhecimento
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Domine sua Carreira na Era da IA</h1>
            <p className="text-lg text-slate-300">Artigos, dicas e insights para você parar de enviar currículos para o vácuo e começar a ser notado.</p>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
            {posts.map(post => (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                    <img src={post.image} alt={post.title} className="h-48 w-full object-cover" />
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><Tag size={12} /> {post.category}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{post.title}</h3>
                        <p className="text-slate-600 text-sm mb-6 flex-1">{post.excerpt}</p>
                        
                        {/* Inline Funnel CTA */}
                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <p className="text-xs font-bold text-purple-600 mb-2 uppercase">Recruta.AI recomenda:</p>
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
            <p className="text-purple-100 text-lg mb-8">Nossa ferramenta prática resolve os problemas citados acima em menos de 5 minutos.</p>
            <button 
                onClick={initPayment}
                className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-slate-100 transition-transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
            >
                <MessageCircle size={24} />
                Quero meu Diagnóstico Agora
            </button>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
        <p>© 2026 Recruta.AI - Conteúdo Educativo.</p>
      </footer>
    </div>
  );
};

export default Blog;