import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Tag, Clock, Calendar, MessageCircle } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/blog-data.json')
      .then(res => res.json())
      .then(data => {
        const foundPost = data.find((p: any) => p.slug === slug);
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar post:', err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Recrutaria Blog`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }

      // Add structured data
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "image": post.image,
        "author": {
          "@type": "Organization",
          "name": post.author
        },
        "datePublished": post.date,
        "description": post.excerpt
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'blog-json-ld';
      script.text = JSON.stringify(jsonLd);
      
      const existingScript = document.getElementById('blog-json-ld');
      if (existingScript) {
        existingScript.remove();
      }
      
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('blog-json-ld');
        if (scriptToRemove) scriptToRemove.remove();
      };
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return <Navigate to="/blog" replace />;
  }

  const initPayment = () => {
    const phoneNumber = '554999999999';
    const message = `Olá! Li o artigo "${post.title}" e quero ativar meu Ciclo de Posicionamento (R$ 29,90)`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Simplificada */}
      <nav className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/blog" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} />
              Voltar para o Blog
            </Link>
          </div>
          <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
            Acessar Recrutaria
          </Link>
        </div>
      </nav>

      {/* Hero Header Artigo */}
      <header className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 text-xs font-bold text-indigo-300 mb-6 uppercase tracking-widest">
            <span className="flex items-center gap-1 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
              <Tag size={12} /> {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {post.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {new Date(post.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 font-heading tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </header>

      {/* Capa */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-[400px] object-cover rounded-2xl shadow-2xl border-4 border-white"
        />
      </div>

      {/* Article Content */}
      <main className="max-w-3xl mx-auto px-4 py-16">
        <article 
          className="prose prose-lg prose-slate prose-headings:font-heading prose-a:text-indigo-600 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Bottom CTA Box */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-8 md:p-12 text-center shadow-xl border border-indigo-900/50">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Pronto para parar de perder vagas?</h3>
          <p className="text-indigo-200 text-lg mb-8">
            Coloque a teoria em prática. A Inteligência Neural da Recrutaria analisa seu perfil e diz exatamente onde você está falhando.
          </p>
          <button
            onClick={initPayment}
            className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-slate-100 transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            <MessageCircle size={24} className="text-emerald-500" />
            Quero meu Diagnóstico de Elite
          </button>
        </div>
      </main>

      {/* Footer Simple */}
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
        <p>© 2026 Recrutaria - Seu atalho para o "Sim".</p>
      </footer>
    </div>
  );
};

export default BlogPost;
