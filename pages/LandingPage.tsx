import React, { useState, useEffect } from 'react';
import { Mic, CheckCircle2, Sparkles, Building2, UserCircle, Zap, ChevronDown, ChevronUp, Coins, HelpCircle, XCircle, TrendingUp, Target, Shield, Star, Award, ArrowRight, BarChart3, Lock, Wand2, Briefcase, Filter, Database, Brain, Clock, Search, Upload, FileDown, ScanSearch, ListOrdered } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  // -- STATE MANAGEMENT --
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter'>('candidate');
  const [currentNotification, setCurrentNotification] = useState("");
  const [fade, setFade] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // -- THEME COLORS BASED ON TAB --
  const theme = activeTab === 'candidate' 
    ? {
        primary: 'purple',
        gradient: 'from-purple-600 to-indigo-600',
        bg: 'bg-purple-50',
        bgSoft: 'bg-purple-50/50',
        button: 'bg-purple-600 hover:bg-purple-700',
        text: 'text-purple-600',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100'
      }
    : {
        primary: 'emerald',
        gradient: 'from-emerald-600 to-teal-600',
        bg: 'bg-emerald-50',
        bgSoft: 'bg-emerald-50/50',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100'
      };

  // -- DATA: TICKER NOTIFICATIONS --
  const generateRandomNotification = () => {
    const candidateMsgs = [
      () => `⚡ IA reescreveu o currículo de Ana S. para vaga no LinkedIn`,
      () => `🚀 Score de João P. subiu para 92/100 após ajuste`,
      () => `📄 Carlos M. exportou 3 versões adaptadas hoje`,
      () => `💼 TechCorp está analisando perfis com Score > 85`,
    ];
    const recruiterMsgs = [
      () => `🏢 Startup XYZ triou 500 currículos em 2 minutos`,
      () => `💰 RH da LogiFast economizou 40 horas de triagem hoje`,
      () => `🎯 Vaga de Dev Senior fechada com 98% de match`,
      () => `🤖 IA filtrou 300 candidatos sem perfil automaticamente`,
    ];
    
    const templates = activeTab === 'candidate' ? candidateMsgs : recruiterMsgs;
    return templates[Math.floor(Math.random() * templates.length)]();
  };

  useEffect(() => {
    // Reset notification immediately when tab changes
    setCurrentNotification(generateRandomNotification());
    
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentNotification(generateRandomNotification());
        setFade(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  }

  // -- DATA: FAQs --
  const faqs = activeTab === 'candidate' ? [
    {
      question: "O Recruta.AI me garante um emprego?",
      answer: "NÃO. Somos uma ferramenta de preparação técnica. Garantimos que seu currículo passará pelos robôs (ATS), mas a contratação depende de você."
    },
    {
      question: "Por que pagar R$ 49 se existem modelos grátis?",
      answer: "Modelos grátis são apenas design. Nós somos engenharia de conteúdo. A IA reescreve suas experiências com as palavras-chave exatas que os recrutadores buscam."
    },
    {
      question: "As vagas internas são reais?",
      answer: "Sim, são um BÔNUS. Empresas parceiras usam nossa IA para triagem. Se der match, você aparece para elas. Mas o foco é te preparar para vagas de fora."
    }
  ] : [
    {
      question: "Como funciona a cobrança por crédito?",
      answer: "Você não paga para anunciar vaga nem para ver a lista de aplicantes. Você gasta 1 crédito apenas quando decide 'Destravar' um candidato para ver o contato ou convidá-lo."
    },
    {
      question: "A IA substitui o recrutador?",
      answer: "Não. A IA elimina o trabalho braçal de ler 500 PDFs ruins. Ela entrega o shortlist dos 10 melhores para você entrevistar."
    },
    {
      question: "Posso importar currículos que recebi por e-mail?",
      answer: "Sim! Use nossa função 'Reaquecimento de Base'. Suba os PDFs antigos, a IA analisa, classifica e você decide quem ativar."
    }
  ];

  // -- ACTION: PAYMENT --
  const initPayment = (type: 'cycle' | 'recruiter_pack') => {
    const phoneNumber = '554999999999';
    const message = type === 'cycle' 
        ? 'Olá! Sou CANDIDATO e quero iniciar meu Diagnóstico Profissional (R$ 49).' 
        : 'Olá! Sou EMPRESA e quero adquirir um pacote de Créditos de Triagem.';
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className={`min-h-screen bg-white font-sans text-slate-900 scroll-smooth transition-colors duration-500`}>
      
      {/* 1. ANNOUNCEMENT BAR */}
      <div className="bg-slate-900 text-white py-2 px-4 text-xs md:text-sm font-medium text-center overflow-hidden whitespace-nowrap relative z-50">
         <div className={`transition-opacity duration-500 flex items-center justify-center gap-2 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'candidate' ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
            {currentNotification}
         </div>
      </div>

      {/* 2. NAVBAR WITH TOGGLE */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl transition-colors duration-500 ${activeTab === 'candidate' ? 'bg-slate-900' : 'bg-slate-800'}`}>
                  {activeTab === 'candidate' ? <Mic size={20} /> : <Zap size={20} className="text-emerald-400" />}
               </div>
               <span className="font-extrabold text-2xl tracking-tighter text-slate-900">
                 Recruta<span className={`transition-colors duration-500 ${theme.text}`}>.AI</span>
               </span>
            </div>
            
            {/* CENTRAL TOGGLE SWITCH */}
            <div className="hidden md:flex bg-slate-100 p-1 rounded-full border border-slate-200">
                <button 
                    onClick={() => setActiveTab('candidate')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'candidate' ? 'bg-white text-purple-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Para Candidatos
                </button>
                <button 
                    onClick={() => setActiveTab('recruiter')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'recruiter' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Para Empresas
                </button>
            </div>

            {/* Login Action */}
            <div className="flex items-center gap-3">
              <Link 
                to={activeTab === 'candidate' ? "/candidate" : "/recruiter"}
                className={`hidden md:inline-flex items-center justify-center px-5 py-2.5 border text-sm font-bold rounded-full transition-all duration-300 ${
                    activeTab === 'candidate' 
                    ? 'border-purple-100 text-purple-700 bg-purple-50 hover:bg-purple-100' 
                    : 'border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                {activeTab === 'candidate' ? 'Entrar (Candidato)' : 'Painel RH'}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile Toggle */}
        <div className="md:hidden flex border-t border-slate-100">
            <button 
                onClick={() => setActiveTab('candidate')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'candidate' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-slate-400'}`}
            >
                Sou Candidato
            </button>
            <button 
                onClick={() => setActiveTab('recruiter')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'recruiter' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-400'}`}
            >
                Sou Empresa
            </button>
        </div>
      </nav>

      {/* 3. HERO SECTION (DYNAMIC) */}
      <div className={`relative pt-20 pb-32 overflow-hidden ${theme.bg} transition-colors duration-500`}>
        {/* Background Decorative Blobs */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow transition-colors duration-500 ${activeTab === 'candidate' ? 'bg-purple-300' : 'bg-emerald-300'}`}></div>
        <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow animation-delay-2000 transition-colors duration-500 ${activeTab === 'candidate' ? 'bg-blue-300' : 'bg-teal-300'}`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold mb-8 shadow-sm hover:shadow-md transition-all cursor-default animate-fade-in-up">
                <span className={`w-2 h-2 rounded-full ${activeTab === 'candidate' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                <span>
                    {activeTab === 'candidate' ? 'Engenharia de Carreira' : 'Inteligência de Decisão para RH'}
                </span>
            </div>

            {/* Dynamic Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1] max-w-5xl mx-auto animate-fade-in-up transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                {activeTab === 'candidate' ? (
                    <>
                        O robô do RH está <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">rejeitando seu currículo.</span>
                    </>
                ) : (
                    <>
                        Pare de ler <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">currículos ruins.</span>
                    </>
                )}
            </h1>
            
            {/* Dynamic Subhead */}
            <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {activeTab === 'candidate' ? (
                    "75% dos currículos são descartados por sistemas automáticos (ATS). Nossa IA reescreve seu perfil para passar pelo filtro e chegar na entrevista."
                ) : (
                    "Sua caixa de entrada tem 500 currículos, mas apenas 5 prestam. Nossa IA tria e ranqueia automaticamente. Você escolhe a quantidade de disparos e paga apenas por ativação realizada."
                )}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link 
                    to={activeTab === 'candidate' ? "/candidate" : "/recruiter"}
                    className={`flex items-center justify-center gap-3 px-8 py-5 text-white rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group ${theme.button}`}
                >
                    {activeTab === 'candidate' ? <UserCircle size={24} /> : <Briefcase size={24} />}
                    {activeTab === 'candidate' ? 'Fazer Diagnóstico Agora' : 'Criar Vaga com IA'}
                </Link>
                <a 
                    href="#como-funciona"
                    className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                >
                    {activeTab === 'candidate' ? <HelpCircle size={24} /> : <Database size={24} />}
                    {activeTab === 'candidate' ? 'Entender o Problema' : 'Ver Demonstração'}
                </a>
            </div>

            {/* Social Proof Text */}
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-400 font-medium grayscale opacity-70 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <span>{activeTab === 'candidate' ? 'Candidatos aprovados em:' : 'Empresas que usam:'}</span>
                <span className="font-bold text-slate-600">Google</span>
                <span className="font-bold text-slate-600">Nubank</span>
                <span className="font-bold text-slate-600">Itaú</span>
                <span className="font-bold text-slate-600">Mercado Livre</span>
            </div>
        </div>
      </div>

      {/* 3.5 HOW IT WORKS (NEW SECTION) */}
      <div id="como-funciona" className="py-24 bg-white border-b border-slate-100 transition-colors duration-500 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className={`font-bold uppercase tracking-widest text-sm mb-4 ${theme.text}`}>
                      Passo a Passo
                  </h2>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                      Como funciona na prática
                  </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                  {/* Connecting Line (Desktop) */}
                  <div className={`hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r ${theme.gradient} opacity-20 -z-10 rounded-full`}></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center group">
                      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 ${theme.iconBg} ${theme.text}`}>
                          {activeTab === 'candidate' ? <Upload size={40} /> : <Briefcase size={40} />}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-md ${theme.button}`}>1</div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                          {activeTab === 'candidate' ? 'Upload do Currículo' : 'Defina a Vaga'}
                      </h4>
                      <p className="text-slate-500 leading-relaxed max-w-xs">
                          {activeTab === 'candidate' 
                              ? 'Envie seu PDF atual ou cole o texto do seu perfil. Leva menos de 1 minuto.' 
                              : 'Descreva os requisitos da vaga ou cole o link do LinkedIn/Gupy.'}
                      </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center group">
                      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 ${theme.iconBg} ${theme.text}`}>
                          {activeTab === 'candidate' ? <ScanSearch size={40} /> : <Brain size={40} />}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-md ${theme.button}`}>2</div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                          {activeTab === 'candidate' ? 'Análise Profunda' : 'Triagem Automática'}
                      </h4>
                      <p className="text-slate-500 leading-relaxed max-w-xs">
                          {activeTab === 'candidate' 
                              ? 'A IA identifica falhas, buracos na experiência e problemas de formatação ATS.' 
                              : 'A IA lê centenas de currículos em segundos e verifica os pré-requisitos.'}
                      </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center group">
                      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 ${theme.iconBg} ${theme.text}`}>
                          {activeTab === 'candidate' ? <FileDown size={40} /> : <ListOrdered size={40} />}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-md ${theme.button}`}>3</div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                          {activeTab === 'candidate' ? 'Versão Otimizada' : 'Ranking de Match'}
                      </h4>
                      <p className="text-slate-500 leading-relaxed max-w-xs">
                          {activeTab === 'candidate' 
                              ? 'Baixe seu novo currículo reescrito com palavras-chave que os robôs amam.' 
                              : 'Receba a lista dos Top 10 candidatos ideais para entrevistar.'}
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* 4. DUAL PROBLEM SECTION */}
      <div id="problema" className="py-24 bg-slate-900 text-white relative overflow-hidden transition-colors duration-500">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="grid md:grid-cols-2 gap-16 items-center">
                 {/* LEFT CONTENT */}
                 <div>
                     <h2 className={`font-bold uppercase tracking-widest text-sm mb-4 ${activeTab === 'candidate' ? 'text-purple-400' : 'text-emerald-400'}`}>
                        {activeTab === 'candidate' ? 'O Filtro Invisível' : 'O Caos da Triagem'}
                     </h2>
                     
                     <h3 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                        {activeTab === 'candidate' ? (
                            <>Você envia, envia, envia... <br/> e ninguém responde?</>
                        ) : (
                            <>Você publica a vaga e recebe <br/> um tsunami de lixo?</>
                        )}
                     </h3>
                     
                     <p className="text-slate-300 text-lg leading-relaxed mb-6">
                        {activeTab === 'candidate' ? (
                            "Não é azar. É tecnologia. Grandes empresas usam softwares (ATS) que buscam palavras-chave específicas. Se o seu PDF não tiver exatamente o que o robô procura, você é descartado em milissegundos."
                        ) : (
                            "Ler 300 currículos para achar 1 bom não é trabalho estratégico, é desperdício de vida. O botão 'Candidatura Simplificada' destruiu a qualidade do seu funil."
                        )}
                     </p>

                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <div className="flex items-center gap-4 mb-4">
                             <XCircle className="text-red-500" size={32} />
                             <span className="font-bold text-lg">
                                {activeTab === 'candidate' ? 'Seu Currículo Atual' : 'Seu Processo Atual'}
                             </span>
                         </div>
                         <ul className="space-y-3 text-slate-400">
                             {activeTab === 'candidate' ? (
                                <>
                                    <li className="flex gap-2">❌ Formatação que confunde o robô</li>
                                    <li className="flex gap-2">❌ Falta de palavras-chave da vaga</li>
                                    <li className="flex gap-2">❌ Descrições genéricas sem impacto</li>
                                </>
                             ) : (
                                <>
                                    <li className="flex gap-2">❌ 20 horas gastas lendo PDFs inúteis</li>
                                    <li className="flex gap-2">❌ Bons candidatos perdidos na pilha</li>
                                    <li className="flex gap-2">❌ Vieses inconscientes na leitura</li>
                                </>
                             )}
                         </ul>
                     </div>
                 </div>

                 {/* RIGHT CONTENT - VISUAL METAPHOR */}
                 <div className="relative">
                     {activeTab === 'candidate' ? (
                        /* CANDIDATE VISUAL: ATS REJECTION */
                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <span className="text-xs font-mono text-slate-500">SYSTEM: ATS_FILTER_V2.0</span>
                                <span className="text-red-500 font-bold text-xs animate-pulse">REJECTING...</span>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center opacity-50">
                                    <div className="w-32 h-2 bg-slate-600 rounded"></div>
                                    <span className="text-red-400 text-xs font-bold">SCORE 12%</span>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-lg flex justify-between items-center transform scale-105 shadow-lg">
                                    <div>
                                        <div className="w-32 h-2 bg-white rounded mb-2"></div>
                                        <span className="text-[10px] text-green-300">Otimizado por Recruta.AI</span>
                                    </div>
                                    <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> PASS (98%)</span>
                                </div>
                            </div>
                        </div>
                     ) : (
                        /* RECRUITER VISUAL: FUNNEL */
                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <span className="text-xs font-mono text-slate-500">PIPELINE: VAGA_ANALISTA</span>
                                <span className="text-emerald-400 font-bold text-xs">AUTO-RANKING ON</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-slate-700 h-8 rounded relative overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full bg-slate-600 w-full flex items-center px-3 text-xs text-slate-300">300 Inscritos</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <ArrowRight className="rotate-90 text-slate-500" size={16} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-slate-700 h-10 rounded relative overflow-hidden border border-emerald-500/30">
                                        <div className="absolute top-0 left-0 h-full bg-emerald-900/40 w-[10%] flex items-center px-3 text-xs font-bold text-emerald-400">
                                            12 Qualificados (Top 4%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg text-center">
                                <p className="text-emerald-400 font-bold text-lg">Economia de 15h de leitura</p>
                            </div>
                        </div>
                     )}
                 </div>
             </div>
         </div>
      </div>

      {/* 5. DUAL SOLUTION (FEATURES) */}
      <div id="solucao" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
                <h2 className={`font-bold uppercase tracking-widest text-sm mb-4 ${theme.text}`}>A Solução</h2>
                <h3 className="text-4xl font-extrabold text-slate-900">
                    {activeTab === 'candidate' ? 'Engenharia Reversa de Vagas' : 'Inteligência de Decisão'}
                </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${activeTab === 'candidate' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {activeTab === 'candidate' ? <Target size={28} /> : <Filter size={28} />}
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">
                        {activeTab === 'candidate' ? '1. Diagnóstico de Falhas' : '1. Triagem Automática'}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                        {activeTab === 'candidate' 
                            ? "Nossa IA aponta onde você está errando: falta de métricas, clareza ou foco. Corrija antes de enviar." 
                            : "Defina os critérios e a IA lê todos os currículos instantaneamente, separando o joio do trigo."}
                    </p>
                </div>

                {/* Feature 2 */}
                <div className={`rounded-3xl p-8 border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${activeTab === 'candidate' ? 'bg-purple-50 border-purple-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl ${activeTab === 'candidate' ? 'bg-purple-600' : 'bg-emerald-600'}`}>CORE</div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${activeTab === 'candidate' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {activeTab === 'candidate' ? <Wand2 size={28} /> : <Brain size={28} />}
                    </div>
                    <h4 className={`text-xl font-bold mb-3 ${activeTab === 'candidate' ? 'text-purple-900' : 'text-emerald-900'}`}>
                        {activeTab === 'candidate' ? '2. Otimizador de Vaga' : '2. Ranking por Match'}
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                        {activeTab === 'candidate' 
                            ? "Cole a descrição da vaga. A IA reescreve seu currículo para dar 'match' semântico com aquela oportunidade." 
                            : "Receba uma lista ordenada dos candidatos mais aderentes à cultura e aos requisitos técnicos da vaga."}
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${activeTab === 'candidate' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {activeTab === 'candidate' ? <Shield size={28} /> : <Coins size={28} />}
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">
                        {activeTab === 'candidate' ? '3. Currículo Vivo' : '3. Pague por Resultado'}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                        {activeTab === 'candidate' 
                            ? "Gere versões ilimitadas do seu PDF, mantendo um histórico centralizado da sua evolução profissional." 
                            : "Não pague para anunciar. Gaste créditos apenas para desbloquear o contato dos candidatos que você quer entrevistar."}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* 6. DUAL PRICING (ANCHORING) */}
      <div id="planos" className="py-24 bg-slate-900 text-white relative overflow-hidden transition-colors duration-500">
        <div className={`absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${activeTab === 'candidate' ? 'from-purple-900/40' : 'from-emerald-900/40'} via-slate-900 to-slate-900 transition-colors duration-500`}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Investimento Inteligente</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                   {activeTab === 'candidate' 
                    ? "Uma consultoria de carreira cobra R$ 500/hora. Nós entregamos mais por menos." 
                    : "Pare de rasgar dinheiro com 'slots de vaga'. Pague por inteligência."}
                </p>
            </div>

            <div className="max-w-lg mx-auto bg-white text-slate-900 rounded-3xl p-2 shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                <div className={`text-white text-center py-2 text-xs font-bold uppercase tracking-widest rounded-t-2xl ${activeTab === 'candidate' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                    {activeTab === 'candidate' ? 'Oferta de Lançamento' : 'Modelo Pay-per-Success'}
                </div>
                <div className="p-8 md:p-12 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {activeTab === 'candidate' ? 'Ciclo de Posicionamento' : 'Pack de Créditos'}
                    </h3>
                    
                    <div className="flex justify-center items-baseline gap-2 mb-6">
                        {activeTab === 'candidate' ? (
                            <>
                                <span className="text-slate-400 line-through text-xl">R$ 197</span>
                                <span className="text-6xl font-black text-purple-600">R$ 49</span>
                                <span className="text-slate-500 font-medium">/ciclo</span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm text-slate-500">A partir de</span>
                                <span className="text-6xl font-black text-emerald-600">R$ 199</span>
                            </>
                        )}
                    </div>
                    
                    <ul className="space-y-4 text-left mb-8 max-w-xs mx-auto">
                        {activeTab === 'candidate' ? (
                            /* CANDIDATE BENEFITS */
                            <>
                                <li className="flex gap-3 text-slate-700">
                                    <CheckCircle2 className="text-purple-500 shrink-0" />
                                    <span><strong>Diagnóstico IA</strong> ilimitado</span>
                                </li>
                                <li className="flex gap-3 text-slate-700">
                                    <CheckCircle2 className="text-purple-500 shrink-0" />
                                    <span>Otimizador de <strong>Vagas Externas</strong></span>
                                </li>
                                <li className="flex gap-3 text-slate-400">
                                    <Sparkles className="text-yellow-500 shrink-0" />
                                    <span>Bônus: Acesso a vagas internas</span>
                                </li>
                            </>
                        ) : (
                            /* RECRUITER BENEFITS */
                            <>
                                <li className="flex gap-3 text-slate-700">
                                    <CheckCircle2 className="text-emerald-500 shrink-0" />
                                    <span>Triagem de <strong>Base Ilimitada</strong></span>
                                </li>
                                <li className="flex gap-3 text-slate-700">
                                    <CheckCircle2 className="text-emerald-500 shrink-0" />
                                    <span>Ranking Automático de Match</span>
                                </li>
                                <li className="flex gap-3 text-slate-700">
                                    <Coins className="text-yellow-500 shrink-0" />
                                    <span>50 Créditos de Ativação</span>
                                </li>
                            </>
                        )}
                    </ul>

                    <button 
                        onClick={() => initPayment(activeTab === 'candidate' ? 'cycle' : 'recruiter_pack')}
                        className={`w-full py-4 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 animate-bounce-slow ${activeTab === 'candidate' ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/30' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30'}`}
                    >
                        {activeTab === 'candidate' ? 'Quero ser Aprovado' : 'Comprar Créditos'}
                        <ArrowRight size={20} />
                    </button>
                    
                    <p className="text-xs text-slate-400 mt-4">
                        {activeTab === 'candidate' ? 'Garantia de 7 dias.' : 'Créditos nunca expiram.'}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* 9. FAQ SECTION (DYNAMIC) */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                Dúvidas de {activeTab === 'candidate' ? 'Candidatos' : 'Gestores'}
            </h2>
            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <button 
                            onClick={() => toggleFaq(index)}
                            className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 focus:outline-none hover:bg-slate-50 transition-colors"
                        >
                            <span className="pr-8">{faq.question}</span>
                            {openFaqIndex === index ? <ChevronUp className={theme.text} /> : <ChevronDown className="text-slate-400" />}
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
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <span className="text-white font-bold text-2xl tracking-tight block mb-4">Recruta.AI</span>
                    <p className="text-sm leading-relaxed mb-4">
                        Não somos agência de emprego. Somos uma empresa de tecnologia que usa Inteligência Artificial para aumentar a empregabilidade de profissionais e a eficiência de empresas.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Produto</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#solucao" className="hover:text-purple-400 transition-colors">Diagnóstico IA</a></li>
                        <li><a href="#solucao" className="hover:text-purple-400 transition-colors">Otimizador ATS</a></li>
                        <li><Link to="/candidate" className="hover:text-purple-400 transition-colors">Login Candidato</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Empresa</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/sobre" className="hover:text-purple-400 transition-colors">Sobre Nós</Link></li>
                        <li><Link to="/blog" className="hover:text-purple-400 transition-colors">Blog de Carreira</Link></li>
                        <li><Link to="/recruiter" className="hover:text-purple-400 transition-colors">Área do Recrutador</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Legal & Suporte</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/termos" className="hover:text-purple-400 transition-colors">Termos de Uso</Link></li>
                        <li><Link to="/privacidade" className="hover:text-purple-400 transition-colors">Privacidade</Link></li>
                        <li className="text-slate-500">suporte@recruta.ai</li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
                © 2026 Recruta.AI Tecnologia Ltda. Todos os direitos reservados. CNPJ: 00.000.000/0001-00.
            </div>
        </div>
      </footer>
      
      {/* Hidden Icons for Preload */}
      <div className="hidden">
        <Target /> <Wand2 /> <Shield /> <Briefcase /> <Database /> <Filter /> <Brain /> <Coins />
      </div>
    </div>
  );
};

export default LandingPage;