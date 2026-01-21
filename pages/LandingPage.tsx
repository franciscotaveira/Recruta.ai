import React, { useState, useEffect } from 'react';
import { MessageCircle, Mic, Brain, CheckCircle2, ArrowRight, ArrowDown, Sparkles, Building2, UserCircle, HeartHandshake, Zap, BarChart3, Fingerprint, ShieldCheck, X, CreditCard, Lock, Bell, Star, ChevronDown, ChevronUp, Send, Briefcase, Phone, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [activeSegment, setActiveSegment] = useState<'talent' | 'company' | null>(null);
  
  // -- INFINITE TICKER LOGIC --
  const [currentNotification, setCurrentNotification] = useState("🚀 Sistema operando com 100% de capacidade");
  const [fade, setFade] = useState(true);

  const generateRandomNotification = () => {
    // Banco de dados expandido para gerar combinações infinitas
    const names = [
      "Mariana S.", "João P.", "Carlos M.", "Fernanda L.", "Roberto A.", "Lucas G.", "Beatriz C.", "Rafael T.", "Ana V.", "Gabriel R.", 
      "Juliana M.", "Pedro H.", "Luiza S.", "Marcos O.", "Patricia N.", "Ricardo B.", "Sofia D.", "Thiago F.", "Vanessa K.", "Bruno E.", 
      "Amanda W.", "Felipe Z.", "Camila Y.", "Diogo J.", "Elisa Q.", "Vitor H.", "Larissa B.", "Eduardo C.", "Renata M.", "Gustavo L."
    ];
    const roles = [
      "Gerente de Vendas", "Dev Fullstack", "Analista de RH", "Designer UX", "Coord. Logística", "Assistente Adm", "Tech Lead", "SDR", 
      "Copywriter", "Engenheiro de Dados", "Product Manager", "Analista Financeiro", "Recrutador IT", "Customer Success", "Estagiário de Marketing", 
      "DevOps", "UX Writer", "Analista de Qualidade", "Representante Comercial", "Gerente de Projetos"
    ];
    const cities = [
      "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre", "Curitiba", "Florianópolis", "Salvador", "Brasília", "Recife", 
      "Goiânia", "Vitória", "Fortaleza", "Campinas", "Remoto", "Ribeirão Preto", "Santos", "Manaus"
    ];
    const companies = [
      "TechSol", "LogiFast", "Banco Digital", "Retail Group", "Startup One", "Indústria Top", "Fintech X", "Agência Bold", 
      "Construtora Ideal", "Saúde Mais", "EdTech Future", "Green Energy", "Consultoria Prime", "Logística Express", "Varejo Nacional"
    ];
    
    const templates = [
      () => `🎉 ${names[Math.floor(Math.random() * names.length)]} foi contratado(a) como ${roles[Math.floor(Math.random() * roles.length)]} em ${cities[Math.floor(Math.random() * cities.length)]}`,
      () => `⚡ Currículo de ${names[Math.floor(Math.random() * names.length)]} analisado: Score ${Math.floor(Math.random() * 15) + 85}/100`,
      () => `🤝 Match Confirmado: ${companies[Math.floor(Math.random() * companies.length)]} ↔ ${roles[Math.floor(Math.random() * roles.length)]}`,
      () => `🚀 ${Math.floor(Math.random() * 10) + 5} novos candidatos entraram na base agora`,
      () => `💎 ${companies[Math.floor(Math.random() * companies.length)]} iniciou triagem de ${Math.floor(Math.random() * 50) + 20} candidatos`,
      () => `📢 Nova Vaga Aberta: ${roles[Math.floor(Math.random() * roles.length)]} na ${companies[Math.floor(Math.random() * companies.length)]} (${cities[Math.floor(Math.random() * cities.length)]})`,
      () => `🧠 IA analisou ${Math.floor(Math.random() * 120) + 30} minutos de entrevista nos últimos 10 min`,
      () => `🎯 ${names[Math.floor(Math.random() * names.length)]} completou o teste de Fit Cultural (98% match)`,
      () => `🏢 ${companies[Math.floor(Math.random() * companies.length)]} agendou 3 entrevistas para amanhã`
    ];

    return templates[Math.floor(Math.random() * templates.length)]();
  };

  useEffect(() => {
    // Initial random notification
    setCurrentNotification(generateRandomNotification());

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentNotification(generateRandomNotification());
        setFade(true);
      }, 500); // Wait for fade out to finish before changing text
    }, 4000); // Show each notification for 4 seconds

    return () => clearInterval(interval);
  }, []);

  // -- FAQ STATE --
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  // -- B2B FORM STATE --
  const [demoForm, setDemoForm] = useState({ company: '', name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de envio
    setFormStatus('success');
    setTimeout(() => setFormStatus('idle'), 5000);
  };

  // Função para simular o início do pagamento via WhatsApp
  const initPayment = (plan: 'starter' | 'pro' | 'b2b') => {
    const phoneNumber = '554999999999'; // SUBSTITUIR PELO NÚMERO REAL
    let message = '';
  
    if (plan === 'starter') {
      message = 'Olá! Quero adquirir o plano Talento Starter (R$ 97)';
    } else if (plan === 'pro') {
      message = 'Olá! Quero adquirir o plano Talento Pro (R$ 247)';
    } else {
      message = 'Olá! Quero agendar uma demo do Recruta Pro para Empresas.';
    }
  
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Função específica para falar com SDR/Consultor
  const contactSDR = () => {
    const phoneNumber = '554999999999'; // SUBSTITUIR PELO NÚMERO REAL
    const message = 'Olá! Sou um profissional de RH/Empresa e gostaria de falar com um especialista SDR da Recruta.AI para contratar talentos.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Função para scroll suave
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const testimonials = [
    {
      name: "Fernanda Lima",
      role: "Candidata (Contratada)",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      quote: "Eu não passava da triagem dos robôs. Com o áudio do Recruta.AI, consegui mostrar minha comunicação e fui chamada na mesma semana."
    },
    {
      name: "Roberto Almeida",
      role: "Head de RH na TechSol",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      quote: "Reduzimos nosso tempo de triagem em 60%. O ranking de fit cultural é assustadoramente preciso. Ferramenta indispensável."
    },
    {
      name: "Juliana Costa",
      role: "Analista de Marketing",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      quote: "O diagnóstico me mostrou que meu currículo antigo escondia minhas melhores qualidades. O Score me deu confiança."
    }
  ];

  const faqs = [
    { q: "Como funciona a análise de áudio?", a: "Nossa IA transcreve sua fala e analisa padrões de comunicação, tom de voz, clareza e palavras-chave comportamentais (Soft Skills) que não aparecem no papel." },
    { q: "Meus dados estão seguros?", a: "Sim. Seguimos rigorosamente a LGPD. Seus dados só são compartilhados com empresas recrutadoras se você autorizar ou se candidatar a uma vaga." },
    { q: "O pagamento é mensal?", a: "Para candidatos, os planos Starter e Pro são pagamentos únicos (sem mensalidade). Para empresas, trabalhamos com planos mensais ou anuais." },
    { q: "A plataforma serve para qualquer área?", a: "Sim! Embora tenhamos muita força em Vendas, Tech e Atendimento, as soft skills analisadas são universais para qualquer profissão." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      
      {/* 1.1 LIVE ACTIVITY TICKER (Infinite Dynamic) */}
      <div className="bg-slate-900 text-white py-2.5 px-4 text-center text-xs md:text-sm font-medium sticky top-0 z-[60] shadow-md border-b border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <div className={`transition-opacity duration-500 flex items-center gap-2 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <span className="opacity-70 uppercase tracking-wider text-[10px] hidden sm:inline">Ao Vivo:</span>
            <span className="truncate max-w-[300px] sm:max-w-none">{currentNotification}</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 transition-all duration-300 top-[37px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                   <HeartHandshake size={24} className="text-purple-600" />
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Recruta.AI</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <button onClick={() => scrollToSection('manifesto')} className="hover:text-purple-600 transition-colors">Manifesto</button>
              <button onClick={() => scrollToSection('como-funciona')} className="hover:text-purple-600 transition-colors">Como Funciona</button>
              <Link to="/blog" className="hover:text-purple-600 transition-colors flex items-center gap-1"><BookOpen size={14} /> Blog</Link>
              <button onClick={() => scrollToSection('planos')} className="hover:text-purple-600 transition-colors">Planos</button>
              <button onClick={() => scrollToSection('depoimentos')} className="hover:text-purple-600 transition-colors">Depoimentos</button>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                to="/recruiter"
                className="hidden lg:flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-50 transition-all"
              >
                <Building2 size={16} />
                Painel do Recrutador
              </Link>
              
              <Link 
                to="/candidate"
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center gap-2"
              >
                Painel do Candidato
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 lg:pt-60 lg:pb-32 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-purple-100 shadow-sm text-purple-700 text-xs font-bold mb-8 uppercase tracking-wider backdrop-blur-sm">
            <Sparkles size={14} /> O Elo Perdido do RH
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Elimine o <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Currículo Frio</span><br className="hidden md:block"/>
            e encontre a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Contratação Perfeita.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Uma plataforma cíclica que usa <strong>Inteligência Artificial</strong> para revelar o potencial humano que palavras-chave ignoram, conectando candidatos reais a empresas ideais.
          </p>

          <div className="flex flex-col items-center gap-6 mb-12">
            
            {/* Double Button CTA with distinct styles */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
              <button 
                 onClick={() => initPayment('starter')}
                 className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                <MessageCircle size={24} />
                <span>Diagnóstico Grátis (Candidato)</span>
              </button>
              
              <button 
                 onClick={contactSDR}
                 className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-slate-500/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto border border-slate-700"
              >
                <Building2 size={24} className="text-purple-300" />
                <span>Sou Empresa: Contratar Talentos</span>
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Sem compromisso</span>
              <span className="flex items-center gap-1"><Lock size={14} className="text-green-500" /> Dados seguros</span>
              <span className="flex items-center gap-1"><Zap size={14} className="text-green-500" /> Resposta em 2 min</span>
            </div>
          </div>
        </div>

        {/* Visual Loop with ID for navigation */}
        <div id="como-funciona" className="mt-20 max-w-6xl mx-auto px-4 relative scroll-mt-32">
             {/* Visual Connector Line (Desktop) */}
             <div className="hidden md:block absolute top-[40%] left-[16%] right-[16%] h-[2px] bg-slate-100 -z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Step 1 */}
                <div className="flex flex-col items-center group relative">
                     <div className="w-24 h-24 bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-100 flex items-center justify-center mb-6 relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                        <Mic size={32} className="text-blue-500" />
                        {/* Badge/Number */}
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">1</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Expressão</h3>
                    <p className="text-slate-500 leading-relaxed text-center">O candidato grava um áudio contando sua trajetória de forma natural.</p>
                    
                    {/* Mobile Arrow */}
                    <div className="md:hidden mt-8 text-slate-300 animate-bounce"><ArrowDown size={32} /></div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center group relative">
                     <div className="w-24 h-24 bg-white rounded-2xl shadow-xl shadow-purple-100 border border-purple-100 flex items-center justify-center mb-6 relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                        <Brain size={32} className="text-purple-600" />
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">2</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Tradução IA</h3>
                    <p className="text-slate-500 leading-relaxed text-center">Nossa IA analisa soft skills, tom de voz e gera um score comportamental.</p>

                    {/* Mobile Arrow */}
                    <div className="md:hidden mt-8 text-slate-300 animate-bounce"><ArrowDown size={32} /></div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center group relative">
                     <div className="w-24 h-24 bg-white rounded-2xl shadow-xl shadow-pink-100 border border-pink-100 flex items-center justify-center mb-6 relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                        <HeartHandshake size={32} className="text-pink-500" />
                         <div className="absolute -top-3 -right-3 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">3</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Conexão</h3>
                    <p className="text-slate-500 leading-relaxed text-center">Recrutadores recebem perfis completos e o match acontece.</p>
                </div>
             </div>
        </div>
      </section>

      {/* Manifesto Section (Lazy Loading Image) */}
      <section id="manifesto" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                     <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-100 rounded-full blur-2xl opacity-60"></div>
                     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-100 rounded-full blur-2xl opacity-60"></div>
                     <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Mulher de negócios sorrindo em ambiente moderno" 
                        loading="lazy"
                        className="rounded-[2rem] shadow-2xl relative z-10 w-full object-cover h-[500px]"
                     />
                     <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 z-20">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-800 font-medium italic">"Nunca consegui expressar minha paixão por liderança em um PDF. Com o áudio, a empresa entendeu minha energia na hora."</p>
                                <p className="text-xs text-slate-500 mt-2 font-bold">— Mariana, contratada como Gerente de Vendas</p>
                            </div>
                        </div>
                     </div>
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                        O problema não é a falta de vagas.<br/>
                        <span className="text-purple-600">É a falha na tradução.</span>
                    </h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="mt-1"><div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Fingerprint size={18} /></div></div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Identidade além do papel</h3>
                                <p className="text-slate-600 leading-relaxed">Currículos tradicionais achatam carreiras. Usamos voz para capturar nuances.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="mt-1"><div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><BarChart3 size={18} /></div></div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Dados que geram diversidade</h3>
                                <p className="text-slate-600 leading-relaxed">IA reduz viés inconsciente focando em competências comportamentais.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* NEW B2B HIGHLIGHT SECTION */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-3xl p-8 md:p-12 border border-slate-700 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full mb-4 border border-white/20">
                        PARA EMPRESAS
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Sua empresa busca talentos qualificados?
                    </h2>
                    <p className="text-slate-300 text-lg mb-0">
                        Acesse nosso banco de talentos verificado com IA e reduza em até 60% o tempo de contratação. Fale com nossos consultores.
                    </p>
                </div>
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => document.getElementById('b2b-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg whitespace-nowrap flex items-center justify-center gap-2"
                    >
                        <Building2 size={18} /> Cadastrar Empresa
                    </button>
                    <button 
                        onClick={contactSDR}
                        className="bg-transparent border-2 border-slate-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 hover:border-slate-500 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                    >
                        <Users size={18} />
                        Falar com Consultor
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION (NEW) */}
      <section id="depoimentos" className="py-20 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Quem usa, aprova</h2>
                <p className="mt-4 text-slate-600 text-lg">Histórias reais de conexões feitas pela nossa IA.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((t, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1 mb-4 text-yellow-400">
                            {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                        </div>
                        <p className="text-slate-600 italic mb-6">"{t.quote}"</p>
                        <div className="flex items-center gap-4">
                            <img src={t.image} alt={t.name} loading="lazy" className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                                <p className="text-xs text-slate-500">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="planos" className="py-24 bg-white relative scroll-mt-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-900">Escolha como evoluir</h2>
                <p className="mt-4 text-slate-600 text-lg">Soluções transparentes para pessoas e empresas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Starter */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative flex flex-col h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex justify-center my-6"><div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><UserCircle size={32} /></div></div>
                    <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">Talento Starter</h3>
                    <div className="text-center border-y border-slate-100 py-6 mb-6">
                        <div className="flex items-center justify-center gap-1"><span className="text-xl text-slate-500 font-medium">R$</span><span className="text-5xl font-bold text-slate-900">97</span></div>
                        <p className="text-sm text-slate-500 mt-2">pagamento único</p>
                    </div>
                    <ul className="space-y-4 flex-grow mb-8">
                        <li className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-green-500" /><span>Diagnóstico via Áudio</span></li>
                        <li className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-green-500" /><span>Score de Empregabilidade</span></li>
                        <li className="flex items-start gap-3 text-sm text-slate-400"><X size={18} className="text-slate-300" /><span>Currículo Otimizado</span></li>
                    </ul>
                    <button onClick={() => initPayment('starter')} className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg">Começar Agora</button>
                </div>

                {/* Pro */}
                <div className="bg-white rounded-2xl p-8 border-2 border-purple-500 shadow-2xl relative flex flex-col h-full transform md:scale-105 z-10">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-md rounded-tr-xl">RECOMENDADO</div>
                    <div className="flex justify-center my-6"><div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><Sparkles size={32} /></div></div>
                    <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">Talento Pro</h3>
                    <div className="text-center border-y border-slate-100 py-6 mb-6">
                        <p className="text-sm text-slate-400 line-through mb-1">De R$ 397 por</p>
                        <div className="flex items-center justify-center gap-1"><span className="text-xl text-slate-500 font-medium">R$</span><span className="text-5xl font-bold text-slate-900">247</span></div>
                        <p className="text-sm text-slate-500 mt-2">pagamento único</p>
                    </div>
                    <ul className="space-y-4 flex-grow mb-8">
                        <li className="flex items-start gap-3 text-sm text-slate-900 bg-slate-50 p-2 rounded-lg -mx-2"><CheckCircle2 size={18} className="text-purple-600" /><span><strong>Tudo do Starter incluído</strong></span></li>
                        <li className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-green-500" /><span>Currículo Otimizado em PDF</span></li>
                        <li className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-green-500" /><span>Análise de LinkedIn</span></li>
                    </ul>
                    <button onClick={() => initPayment('pro')} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-xl hover:scale-105 transition-all duration-300">Quero Evoluir Agora</button>
                </div>

                {/* B2B */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative flex flex-col h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex justify-center my-6"><div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600"><Building2 size={32} /></div></div>
                    <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">Recruta Pro</h3>
                    <div className="text-center border-y border-slate-100 py-6 mb-6">
                        <span className="text-3xl font-bold text-slate-900">Sob Consulta</span>
                        <p className="text-sm text-slate-500 mt-2">a partir de R$ 1.500/mês</p>
                    </div>
                    <ul className="space-y-4 flex-grow mb-8">
                        <li className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-pink-500" /><span>Acesso ao Banco de Talentos</span></li>
                        <li className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-pink-500" /><span>Triagem Automatizada via IA</span></li>
                        <li className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 size={18} className="text-pink-500" /><span>API de Dados Estruturados</span></li>
                    </ul>
                    <a href="#b2b-form" className="block w-full text-center py-4 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        Falar com Vendas
                    </a>
                </div>
            </div>
         </div>
      </section>

      {/* B2B CONTACT FORM (NEW) */}
      <section id="b2b-form" className="py-20 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
                   <Building2 size={14} /> Área Corporativa
                </span>
                <h2 className="text-3xl font-bold mb-4">Leve o Recruta.AI para sua empresa</h2>
                <p className="text-slate-400">Solicite uma demonstração da plataforma e veja como reduzir 60% do tempo de triagem.</p>
            </div>

            {formStatus === 'success' ? (
                <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-8 text-center animate-fade-in-up">
                    <CheckCircle2 className="mx-auto text-green-500 w-16 h-16 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Solicitação Recebida!</h3>
                    <p className="text-green-200">Nossa equipe comercial entrará em contato em breve.</p>
                </div>
            ) : (
                <form onSubmit={handleDemoSubmit} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Nome da Empresa</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input required value={demoForm.company} onChange={e => setDemoForm({...demoForm, company: e.target.value})} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ex: Tech Solutions" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Seu Nome</label>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input required value={demoForm.name} onChange={e => setDemoForm({...demoForm, name: e.target.value})} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ex: João Silva" />
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email Corporativo</label>
                        <input required value={demoForm.email} onChange={e => setDemoForm({...demoForm, email: e.target.value})} type="email" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="joao@empresa.com" />
                    </div>
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Mensagem (Opcional)</label>
                        <textarea value={demoForm.message} onChange={e => setDemoForm({...demoForm, message: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-32" placeholder="Gostaria de saber mais sobre a integração ATS..."></textarea>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2">
                        <Send size={18} /> Solicitar Demonstração
                    </button>
                </form>
            )}
        </div>
      </section>

      {/* FAQ SECTION (NEW) */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Perguntas Frequentes</h2>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button 
                            onClick={() => toggleFaq(idx)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                            <span className="font-semibold text-slate-900">{faq.q}</span>
                            {openFaq === idx ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                        </button>
                        {openFaq === idx && (
                            <div className="p-4 bg-white text-slate-600 border-t border-slate-200 text-sm leading-relaxed">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <HeartHandshake size={16} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Recruta.AI</span>
              </div>
              <div className="flex gap-8 text-sm text-slate-600 font-medium">
                  <Link to="/sobre" className="hover:text-purple-600">Sobre nós</Link>
                  <Link to="/blog" className="hover:text-purple-600">Blog</Link>
                  <Link to="/termos" className="hover:text-purple-600">Termos de Uso</Link>
                  <Link to="/privacidade" className="hover:text-purple-600">Privacidade</Link>
              </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">© 2026 Recruta.AI - Conectando potências.</p>
            <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating SDR Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow">
        <button 
            onClick={contactSDR}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 transition-all hover:scale-105 group"
        >
            <MessageCircle size={24} className="fill-current" />
            <span className="font-bold">Falar com Consultor</span>
            
            {/* Tooltip */}
            <span className="absolute bottom-full right-0 mb-2 w-48 bg-white text-slate-800 text-xs p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Dúvidas? Fale com nosso SDR agora!
            </span>
        </button>
      </div>

    </div>
  );
};

export default LandingPage;