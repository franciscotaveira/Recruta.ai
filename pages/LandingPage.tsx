import React, { useState, useEffect } from 'react';
import { MessageCircle, Mic, CheckCircle2, ArrowRight, Sparkles, Building2, UserCircle, Zap, BarChart3, Fingerprint, ChevronDown, ChevronUp, Coins, RefreshCw, FileText, AlertTriangle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  // -- INFINITE TICKER LOGIC --
  const [currentNotification, setCurrentNotification] = useState("🚀 IA analisando 340 currículos neste momento...");
  const [fade, setFade] = useState(true);

  // -- FAQ LOGIC --
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  }

  const faqs = [
    {
      question: "O Recruta.AI é uma agência de empregos?",
      answer: "Não. Somos uma plataforma de inteligência de carreira. Nosso produto é o Diagnóstico Profissional e a Otimização de Currículo. Vagas internas podem aparecer como bônus se houver match, mas não vendemos promessa de emprego."
    },
    {
      question: "O que eu recebo exatamente ao pagar R$ 49?",
      answer: "Você recebe: 1) Análise profunda do seu perfil por IA; 2) Score de Clareza Profissional (SCPD); 3) Seu 'Currículo Vivo' digital; 4) Ferramenta para gerar versões ilimitadas do seu currículo adaptadas para vagas externas (LinkedIn, Gupy, etc)."
    },
    {
      question: "Se não houver vagas na plataforma, joguei dinheiro fora?",
      answer: "Absolutamente não. O principal valor é a ferramenta de otimização. Você usará nossa IA para reescrever seu currículo para vagas que você encontrar fora daqui. Isso aumenta suas chances em qualquer processo seletivo do mercado."
    },
    {
      question: "Como funciona a 'Otimização para Vagas Externas'?",
      answer: "Você cola a descrição de uma vaga que viu no LinkedIn. Nossa IA reescreve seus pontos de experiência para dar 'match' com aquela descrição específica, gerando um PDF otimizado para passar nos robôs de triagem."
    },
    {
      question: "O candidato paga mensalidade?",
      answer: "Não. O Ciclo de Posicionamento é um pagamento único por ciclo (R$ 49). Você só paga novamente se quiser refazer seu diagnóstico do zero em outro momento de carreira."
    },
    {
      question: "Empresas podem ver meu perfil?",
      answer: "Sim, mas apenas se o seu Diagnóstico tiver alta compatibilidade (Match) com o que elas buscam. Seus dados não ficam expostos em um 'mural' público."
    },
    {
      question: "Para Recrutadores: Os créditos expiram?",
      answer: "Não. Seus créditos de triagem duram enquanto sua conta estiver ativa. Você paga apenas pelo sucesso da triagem (candidatos qualificados)."
    },
    {
      question: "A IA substitui o recrutador?",
      answer: "Não. A IA elimina o trabalho braçal de ler 500 PDFs ruins. Ela entrega a lista final de candidatos qualificados para que o recrutador faça a entrevista humana."
    },
    {
      question: "Tenho garantia de reembolso?",
      answer: "Para candidatos: garantia de 7 dias caso a IA não consiga gerar um diagnóstico válido sobre seu perfil. Não há reembolso por 'falta de vagas', pois as vagas são bônus."
    },
    {
      question: "Posso usar o currículo gerado no LinkedIn?",
      answer: "Sim! O objetivo é justamente esse. Você sai daqui com um material muito superior ao seu original para usar onde quiser."
    },
    {
      question: "Preciso instalar algum software?",
      answer: "Não. Tudo roda no navegador. A interação de triagem (se houver convite de empresa) acontece via WhatsApp."
    },
    {
      question: "Por que vocês cobram do candidato?",
      answer: "Porque nosso cliente é você. Diferente de sites de vaga gratuitos que vendem seus dados, nós vendemos inteligência para potenciar SUA carreira. Você é o protagonista, não o produto."
    }
  ];

  const generateRandomNotification = () => {
    const templates = [
      () => `⚡ IA reescreveu o currículo de Ana S. para uma vaga externa`,
      () => `🚀 Score SCPD de João P. subiu para 92/100 após ajuste`,
      () => `📄 Carlos M. exportou 3 versões adaptadas do currículo hoje`,
      () => `🤖 Diagnóstico comportamental finalizado para Beatriz C.`,
      () => `💼 TechCorp está analisando perfis com Score > 85`,
      () => `🎯 Fernanda L. ajustou seu perfil para 'Liderança Ágil'`,
      () => `📈 120 novos diagnósticos de carreira realizados na última hora`,
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentNotification(generateRandomNotification());
        setFade(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // -- PAYMENT LOGIC --
  const initPayment = (planType: 'cycle' | 'recruiter') => {
    const phoneNumber = '554999999999';
    let message = '';
    
    if (planType === 'cycle') {
        message = 'Olá! Quero iniciar meu Diagnóstico Profissional e Otimização de Currículo (R$ 49). Entendo que vagas são bônus.';
    } else if (planType === 'recruiter') {
        message = 'Olá! Sou recrutador e quero adquirir Créditos de Inteligência.';
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
      {/* 1. ANNOUNCEMENT BAR (TICKER) */}
      <div className="bg-slate-900 text-white py-2 px-4 text-xs md:text-sm font-medium text-center overflow-hidden whitespace-nowrap relative z-50">
         <div className={`transition-opacity duration-500 flex items-center justify-center gap-2 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {currentNotification}
         </div>
      </div>

      {/* 2. NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <Mic size={18} />
               </div>
               <span className="font-bold text-xl tracking-tight text-slate-900">Recruta.AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">A Ferramenta</a>
              <a href="#planos" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Planos</a>
              <Link to="/recruiter" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Para Empresas</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                to="/candidate" 
                className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all"
              >
                Área do Candidato
              </Link>
              <Link 
                to="/recruiter" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all"
              >
                Sou Empresa
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION (B2C Focus - Diagnosis, NOT Jobs) */}
      <div className="relative pt-16 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8 animate-fade-in-up">
                <Sparkles size={16} />
                <span className="tracking-wide uppercase text-xs">Não é banco de vagas. É engenharia de carreira.</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Sua Carreira,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Traduzida por IA.</span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Transforme seu currículo estático em uma ferramenta de venda. Obtenha seu score profissional e gere versões adaptadas para qualquer vaga do mercado.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link 
                    to="/candidate"
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                    <UserCircle size={24} />
                    Fazer Diagnóstico Profissional
                </Link>
                <a 
                    href="#como-funciona"
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-full font-bold text-lg hover:border-purple-200 hover:bg-purple-50 transition-all"
                >
                    <HelpCircle size={24} />
                    Entenda a Proposta
                </a>
            </div>

            <p className="mt-6 text-xs text-slate-400 font-medium animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                *Vagas internas são um bônus da plataforma, não uma garantia.
            </p>
        </div>
      </div>

      {/* 4. TRANSPARENCY SECTION (The "What you get" vs "Bonus") */}
      <div id="como-funciona" className="py-24 bg-white relative border-y border-slate-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">O que você está contratando?</h2>
                <p className="text-lg text-slate-600">
                    Prezamos pela transparência radical. Entenda onde está o valor do seu investimento.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* O PRODUTO PRINCIPAL */}
                <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-600 text-white rounded-xl"><Zap size={24} /></div>
                        <h3 className="text-2xl font-bold text-purple-900">O Produto Principal</h3>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-slate-700">
                            <CheckCircle2 className="text-purple-600 shrink-0 mt-1" />
                            <span><strong>Diagnóstico IA:</strong> Entenda como robôs leem seu perfil.</span>
                        </li>
                        <li className="flex gap-3 text-slate-700">
                            <CheckCircle2 className="text-purple-600 shrink-0 mt-1" />
                            <span><strong>Currículo Vivo:</strong> Um perfil digital que evolui.</span>
                        </li>
                        <li className="flex gap-3 text-slate-700">
                            <CheckCircle2 className="text-purple-600 shrink-0 mt-1" />
                            <span><strong>Otimizador Externo:</strong> A ferramenta mais poderosa. Cole uma vaga do LinkedIn e a IA reescreve seu currículo para dar match lá fora.</span>
                        </li>
                    </ul>
                    <div className="mt-8 pt-6 border-t border-purple-200 text-sm text-purple-800 font-bold">
                        Valor Garantido: Otimização e Preparo Profissional.
                    </div>
                </div>

                {/* O BÔNUS */}
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 opacity-90">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-slate-200 text-slate-600 rounded-xl"><Sparkles size={24} /></div>
                        <h3 className="text-2xl font-bold text-slate-700">O Bônus (Não Garantido)</h3>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-slate-500">
                            <CheckCircle2 className="text-slate-400 shrink-0 mt-1" />
                            <span><strong>Vagas Internas:</strong> Empresas usam nossa IA para triagem.</span>
                        </li>
                        <li className="flex gap-3 text-slate-500">
                            <CheckCircle2 className="text-slate-400 shrink-0 mt-1" />
                            <span><strong>Convites de Entrevista:</strong> Se der match, chamam você.</span>
                        </li>
                        <li className="flex gap-3 text-slate-500">
                            <CheckCircle2 className="text-slate-400 shrink-0 mt-1" />
                            <span><strong>Visibilidade Passiva:</strong> Seu perfil fica disponível para buscas.</span>
                        </li>
                    </ul>
                    <div className="mt-8 pt-6 border-t border-slate-200 text-sm text-slate-500 font-medium italic">
                        "Entrei pelo diagnóstico, a vaga veio como consequência."
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* 5. PRICING SECTION - DUAL MODEL (Cycle vs Credits) */}
      <div id="planos" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Investimento Único</h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                   Sem mensalidades escondidas. Você paga pelo ciclo de evolução.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
                
                {/* PLANO B2C - CANDIDATO */}
                <div className="bg-white rounded-3xl p-8 border-2 border-purple-600 shadow-xl relative overflow-hidden flex flex-col z-10 h-full transform transition-all hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">PARA VOCÊ</div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Ciclo de Posicionamento</h3>
                        <p className="text-slate-500 text-sm mt-2">Diagnóstico + Ferramentas de Otimização.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-extrabold text-slate-900">R$ 49</span>
                        <span className="text-slate-500 font-medium ml-2">/ ciclo</span>
                    </div>
                    
                    <div className="space-y-4 mb-8 flex-1">
                        <div className="flex items-start gap-3 text-sm text-slate-700">
                            <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                            <span>Diagnóstico SCPD (Score de Clareza)</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-700">
                            <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                            <span><strong>Currículo Vivo:</strong> Gere PDFs ilimitados</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-700">
                            <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                            <span>Otimizador para Vagas Externas (LinkedIn)</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => initPayment('cycle')}
                        className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        <Zap size={20} /> Iniciar Meu Diagnóstico
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4">Acesso vitalício aos dados do ciclo.</p>
                </div>

                {/* PLANO B2B - EMPRESA (CREDITS) */}
                <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700 shadow-lg flex flex-col relative text-white h-full transform transition-all hover:scale-[1.01]">
                     <div className="absolute top-0 right-0 bg-slate-700 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">PARA EMPRESAS</div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Building2 size={20} className="text-purple-400" /> 
                            Créditos de Decisão
                        </h3>
                        <p className="text-slate-400 text-sm mt-2">Pague por inteligência, não por anúncio.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-sm text-slate-300">A partir de</span>
                        <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-bold text-white">R$ 199</span>
                             <span className="text-slate-400 font-medium text-sm">/ pacote</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-8 flex-1">
                        <div className="flex items-start gap-3 text-sm text-slate-300">
                            <Coins className="text-yellow-400 shrink-0" size={18} />
                            <span>1 Crédito = 1 Candidato Qualificado</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="text-green-400 shrink-0" size={18} />
                            <span>Triagem automática da sua base legada</span>
                        </div>
                         <div className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="text-green-400 shrink-0" size={18} />
                            <span>Ranking por match cultural e técnico</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => initPayment('recruiter')}
                        className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        Comprar Créditos
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-4">Créditos nunca expiram.</p>
                </div>

            </div>
        </div>
      </div>

      {/* 6. FAQ SECTION (EXPANDED TO 12 ITEMS) */}
      <div className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase mb-4">
                    Tira-Dúvidas
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Perguntas Frequentes</h2>
                <p className="text-slate-600">
                   Transparência total sobre o que entregamos.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                        <button 
                            onClick={() => toggleFaq(index)}
                            className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 focus:outline-none"
                        >
                            <span className="text-lg pr-8">{faq.question}</span>
                            {openFaqIndex === index ? <ChevronUp className="text-purple-600 shrink-0" /> : <ChevronDown className="text-slate-400 shrink-0" />}
                        </button>
                        <div className={`px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 ${openFaqIndex === index ? 'block' : 'hidden'}`}>
                            {faq.answer}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <span className="text-white font-bold text-xl tracking-tight block mb-4">Recruta.AI</span>
                    <p className="text-sm">Engenharia de carreira e inteligência de decisão.</p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Produto</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#como-funciona" className="hover:text-white">A Ferramenta</a></li>
                        <li><a href="#planos" className="hover:text-white">Planos</a></li>
                        <li><Link to="/recruiter" className="hover:text-white">Para Empresas</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/termos" className="hover:text-white">Termos de Uso</Link></li>
                        <li><Link to="/privacidade" className="hover:text-white">Privacidade</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Suporte</h4>
                    <ul className="space-y-2 text-sm">
                        <li>suporte@recruta.ai</li>
                        <li>WhatsApp: (49) 99999-9999</li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-slate-800 text-center text-xs">
                © 2026 Recruta.AI. Todos os direitos reservados. Não somos agência de empregos.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;