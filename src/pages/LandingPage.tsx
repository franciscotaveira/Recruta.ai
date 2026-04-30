import React, { useMemo } from 'react';
import {
  ArrowRight,
  AudioLines,
  BadgeCheck,
  Briefcase,
  Check,
  Clock3,
  FileSearch,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { buildAppUrl } from '../utils/runtimeHost';
import { usePageMeta } from '../hooks/usePageMeta';

type RuntimeInput = {
  hostname: string;
  protocol: string;
  origin: string;
};

type Segment = 'all' | 'recruiter' | 'candidate';

type SegmentConfig = {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  metaTitle: string;
  metaDescription: string;
  stats: Array<{ label: string; value: string }>;
  pillars: Array<{ icon: typeof Briefcase; title: string; description: string }>;
};

const processSteps = [
  {
    step: '01',
    title: 'Crie a vaga em minutos',
    description: 'Defina o perfil desejado, os requisitos não negociáveis e o que você espera do candidato.',
  },
  {
    step: '02',
    title: 'Convite instantâneo',
    description: 'O candidato recebe um link seguro direto no WhatsApp para iniciar a entrevista sem atrito.',
  },
  {
    step: '03',
    title: 'Entrevista inteligente guiada por IA',
    description: 'Nossa IA conduz a entrevista técnica e comportamental por áudio e texto simulando um humano.',
  },
  {
    step: '04',
    title: 'Ranking Auditável na sua mão',
    description: 'Receba a lista dos melhores candidatos com análises baseadas em evidências reais, prontas para sua decisão estratégica.',
  },
];



function getRuntime(): RuntimeInput {
  if (typeof window === 'undefined') {
    return {
      hostname: 'recrutaria.com.br',
      protocol: 'https:',
      origin: 'https://recrutaria.com.br',
    };
  }

  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    origin: window.location.origin,
  };
}

function getSegment(pathname: string): Segment {
  if (pathname === '/para-empresas') return 'recruiter';
  if (pathname === '/para-candidatos') return 'candidate';
  return 'all';
}

function getSegmentConfig(segment: Segment, runtime: RuntimeInput): SegmentConfig {
  const appLinks = {
    login: buildAppUrl('/login', runtime),
    recruiter: buildAppUrl('/registro?role=recruiter', runtime),
    candidate: buildAppUrl('/registro?role=candidate', runtime),
  };

  if (segment === 'recruiter') {
    return {
      eyebrow: 'A ERA DA TRIAGEM MANUAL ACABOU',
      title: 'Troque 100 horas de triagem por 5 minutos de decisão estratégica.',
      body: 'Nossa Inteligência Neural conduz entrevistas profundas no WhatsApp, avalia competências com base em evidências (BARS/STAR) e entrega um ranking 100% auditável. Contratação justa, sem viés e com foco em alta performance.',
      primaryLabel: 'Começar a Contratar',
      primaryHref: appLinks.recruiter,
      secondaryLabel: 'Falar com Consultor',
      secondaryHref: '#contato',
      metaTitle: 'Recrutaria | Triagem Neural Auditável por WhatsApp',
      metaDescription:
        'Automatize entrevistas profundas por WhatsApp com IA Ética. Economize 80% do tempo de triagem com rankings baseados em evidências.',
      stats: [
        { label: 'Economia de Tempo', value: '100h → 5min' },
        { label: 'Viés de Contratação', value: 'Detectado e Neutralizado' },
        { label: 'Avaliação Neural', value: 'BARS/STAR Standards' },
        { label: 'Canal de Conversão', value: 'WhatsApp Elite' },
      ],
      pillars: [
        {
          icon: ShieldCheck,
          title: 'IA Ética e Auditável',
          description: 'Saiba exatamente por que um candidato foi ranqueado. Nossa IA justifica cada nota com evidências reais da conversa.',
        },
        {
          icon: Clock3,
          title: 'Economia Real de Escala',
          description: 'Entreviste 1.000 candidatos simultaneamente com o mesmo nível de profundidade de uma entrevista presencial.',
        },
        {
          icon: BadgeCheck,
          title: 'Decisões sem "Caixa Preta"',
          description: 'Elimine o "acho que ele é bom". Use dados comportamentais e técnicos comprovados para fechar suas vagas.',
        },
      ],
    };
  }

  if (segment === 'candidate') {
    return {
      eyebrow: 'SAIA DA CAIXA PRETA DOS PROCESSOS SELETIVOS',
      title: 'Acesso Direto: Entre no radar das empresas com transparência.',
      body: 'Receba um feedback profundo sobre seu perfil e entenda exatamente onde você se destaca. Na Recrutaria, sua avaliação é baseada em competências reais e evidências, não apenas em palavras-chave.',
      primaryLabel: 'Fazer Meu Diagnóstico de Elite',
      primaryHref: appLinks.candidate,
      secondaryLabel: 'Entrar na Conta',
      secondaryHref: appLinks.login,
      metaTitle: 'Recrutaria | Diagnóstico e Visibilidade de Elite',
      metaDescription: 'Entre no radar das melhores empresas com uma avaliação baseada em evidências, não em palavras-chave.',
      stats: [
        { label: 'Feedback', value: 'Profundo e Real' },
        { label: 'Metodologia', value: 'Evidências (STAR)' },
        { label: 'Transparência', value: 'Total' },
        { label: 'Processo', value: 'IA-Driven' },
      ],
      pillars: [
        {
          icon: Sparkles,
          title: 'Feedback que Constrói',
          description: 'Chega de "ficamos com seu currículo no banco". Saiba exatamente o que melhorar para o próximo nível.',
        },
        {
          icon: Users,
          title: 'Visibilidade para quem tem Talento',
          description: 'Nossa IA foca na sua capacidade de entrega, garantindo que você não seja ignorado por filtros burros.',
        },
        {
          icon: Star,
          title: 'Posicionamento de Elite',
          description: 'Transforme seu currículo em uma ferramenta de conversão poderosa com a nossa ajuda.',
        },
      ],
    };
  }

  return {
    eyebrow: 'A PLATAFORMA DE RECRUTAMENTO QUE FUNCIONA NO MUNDO REAL',
    title: 'Triagem por WhatsApp guiada por Inteligência Artificial.',
    body: 'Ajudamos empresas a reduzirem o tempo de contratação em 80% entrevistando candidatos no WhatsApp. E ajudamos candidatos a se prepararem melhor com diagnósticos precisos.',
    primaryLabel: 'Sou Empresa (Contratar)',
    primaryHref: '/para-empresas',
    secondaryLabel: 'Sou Candidato',
    secondaryHref: '/para-candidatos',
    metaTitle: 'Recrutaria | Recrutamento Inteligente pelo WhatsApp',
    metaDescription:
      'Triagem de candidatos via WhatsApp com Inteligência Artificial para PMEs e diagnóstico de carreira para talentos.',
    stats: [
      { label: 'Para Empresas', value: 'Triagem Automática' },
      { label: 'Para Candidatos', value: 'Diagnóstico de Perfil' },
      { label: 'Tecnologia Core', value: 'Inteligência Neural' },
      { label: 'Fricção no processo', value: 'Zero' },
    ],
    pillars: [
      {
        icon: Briefcase,
        title: 'Contrate em 2 dias ou menos',
        description: 'Feche vagas críticas rapidamente delegando a triagem de volume para a Inteligência Neural.',
      },
      {
        icon: Users,
        title: 'Posicionamento à prova de ATS',
        description: 'Candidatos recebem métricas diretas sobre como o mercado está lendo seu perfil, evitando rejeições ocultas.',
      },
      {
        icon: ShieldCheck,
        title: 'Elimine o viés inconsciente',
        description: 'Avalie habilidades reais e fit cultural de forma totalmente cega e orientada a dados auditáveis.',
      },
    ],
  };
}

const LandingPage: React.FC = () => {
  const location = useLocation();
  const runtime = useMemo(() => getRuntime(), []);
  const segment = getSegment(location.pathname);
  const config = useMemo(() => getSegmentConfig(segment, runtime), [runtime, segment]);

  usePageMeta({
    title: config.metaTitle,
    description: config.metaDescription,
    canonicalUrl: runtime.origin + location.pathname,
    keywords:
      'recrutamento com IA, triagem de currículos, diagnóstico de carreira, entrevista por whatsapp, inteligência artificial rh, recrutaria',
    jsonLdSchema: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Recrutaria',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: config.metaDescription,
      offers: {
        '@type': 'Offer',
        price: '397.00',
        priceCurrency: 'BRL',
      },
      provider: {
        '@type': 'Organization',
        name: 'MCT LTDA',
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30">
      {/* Dynamic Background Decor - Sovereign Standard */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Premium Header */}
      <header className="sticky top-0 z-50 s-glass border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden">
              <img 
                src="/logo-sovereign.png" 
                alt="Recrutaria Logo" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <span className="text-2xl font-black tracking-tighter font-heading text-white">
              Recrutaria<span className="text-indigo-400">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 md:flex">
            <Link to="/para-empresas" className="hover:text-white transition-colors">
              Empresas
            </Link>
            <Link to="/para-candidatos" className="hover:text-white transition-colors">
              Candidatos
            </Link>
            <a href="#processo" className="hover:text-white transition-colors">
              Processo
            </a>
            <a href="#precos" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={buildAppUrl('/login', runtime)}
              className="px-6 py-2.5 s-glass border-white/10 text-xs font-black uppercase tracking-widest text-indigo-300 hover:text-white hover:border-indigo-500/50 transition-all"
            >
              Log In
            </a>
            <Link
              to="/registro"
              className="hidden md:inline-flex px-6 py-2.5 s-btn-primary shadow-lg shadow-indigo-500/20"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION - World Class Design */}
        <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 s-glass border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8 animate-fade-in">
            <Sparkles size={12} /> {config.eyebrow}
          </div>

          <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] text-white font-heading tracking-tighter animate-fade-in-up">
            {config.title.split(' ').map((word, i) => {
              const isHighlight = word.includes('Elite') || word.includes('Neural') || word.includes('estratégica');
              return (
                <span
                  key={i}
                  className={isHighlight ? 'text-indigo-400' : ''}
                >
                  {word}{' '}
                </span>
              );
            })}
          </h1>

          <p className="mt-10 max-w-2xl text-lg md:text-xl leading-relaxed text-slate-400 font-medium animate-fade-in-up delay-100">
            {config.body}
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-200">
            <Link
              to={config.primaryHref}
              className="px-10 py-5 s-btn-primary shadow-2xl shadow-indigo-500/30 text-base"
            >
              {config.primaryLabel}
              <ArrowRight size={20} className="ml-2" />
            </Link>
            <Link
              to={config.secondaryHref}
              className="px-10 py-5 s-glass border-white/10 text-base font-black uppercase tracking-widest hover:border-white/20 transition-all text-white"
            >
              {config.secondaryLabel}
            </Link>
          </div>

          {/* UI MOCKUP - Visual Proof */}
          <div className="mt-16 max-w-4xl mx-auto w-full animate-fade-in-up delay-300">
            <div className="s-glass p-6 md:p-8 rounded-3xl border-white/10 text-left relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-all duration-700 group-hover:bg-indigo-500/20" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-inner">
                    <span className="text-xl font-black text-slate-300">MC</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white font-heading tracking-tight">Marcos Castro</h4>
                    <p className="text-sm text-slate-400 font-bold mt-1">Desenvolvedor Full Stack • Sênior</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end w-full md:w-auto bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 font-black text-lg">98% Neural Match</span>
                  </div>
                  <div className="w-full md:w-56 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 font-black uppercase tracking-widest">Altamente Recomendado</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Aderência Técnica</p>
                  <p className="text-white font-bold">Excepcional</p>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Cultura / Soft Skills</p>
                  <p className="text-white font-bold">Alta Compatibilidade</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20 text-center flex items-center justify-center cursor-pointer hover:bg-emerald-500/20 transition-colors">
                  <p className="text-emerald-400 font-black text-sm uppercase tracking-widest">Ver Diagnóstico</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof / Stats Glass Card */}
          <div className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-500">
            {config.stats.map((stat, i) => (
              <div key={i} className="s-glass p-8 border-white/5 s-glass-hover">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8 border border-white/5 mt-12 mb-12 bg-slate-900/50 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-[500px] h-[300px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white font-heading mb-8">
              O modelo antigo de recrutamento quebrou.
            </h2>
            <div className="space-y-6 text-lg text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
              <p>
                O RH gasta <strong>dias lendo PDFs</strong> e currículos maquiados,
                apenas para descobrir na entrevista que o candidato não tem aderência técnica real ou fit cultural. O custo oculto da triagem manual é devastador.
              </p>
              <p>
                Do outro lado, candidatos brilhantes são <strong>ignorados por sistemas engessados (ATS)</strong> simplesmente porque 
                não usaram a palavra-chave exata no papel. É um jogo injusto.
              </p>
              <p className="text-rose-400 font-bold italic mt-8 text-xl">
                Contratações lentas, turnover alto e frustração extrema.
              </p>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF & DATA VISUALIZATION */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 border-t border-white/5 mt-12 bg-slate-950/30">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">
              A Diferença na Prática
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white font-heading">
              Resultados Comprovados
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Efficiency Chart */}
            <div className="s-glass p-10 border-white/5 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mb-32 pointer-events-none" />
              
              <h3 className="text-2xl font-black text-white font-heading mb-10">Tempo médio até o Shortlist</h3>
              
              <div className="space-y-8 relative z-10">
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-400 mb-3">
                    <span>Recrutamento Tradicional (Manual)</span>
                    <span className="text-rose-400">14 dias</span>
                  </div>
                  <div className="w-full h-10 bg-slate-950/80 rounded-xl overflow-hidden flex border border-white/5">
                    <div className="h-full bg-rose-500/80 w-[100%] flex items-center px-4">
                      <span className="text-[10px] text-white font-black uppercase tracking-widest shadow-sm">Lento e Enviesado</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold text-indigo-300 mb-3">
                    <span>Com Inteligência Neural (Recrutaria)</span>
                    <span className="text-emerald-400">2 dias</span>
                  </div>
                  <div className="w-full h-10 bg-slate-950/80 rounded-xl overflow-hidden flex border border-white/5">
                    <div className="h-full bg-indigo-500 w-[15%] shadow-[0_0_15px_rgba(99,102,241,0.6)] flex items-center px-4">
                      <span className="text-[10px] text-white font-black uppercase tracking-widest">Ágil</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex items-start gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Clock3 className="text-indigo-400" size={24} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">80% de redução no ciclo de contratação.</p>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed font-medium">A IA faz o trabalho duro de entrevistar dezenas de pessoas simultaneamente. Você só fala com os 3 melhores.</p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-6">
              <div className="s-glass p-8 border-white/5 relative hover:bg-white/[0.03] transition-all duration-300">
                <div className="flex gap-1 text-emerald-400 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="fill-current" />)}
                </div>
                <p className="text-lg text-slate-300 font-medium italic mb-8 leading-relaxed">
                  "Antes da Recrutaria, passávamos o dia todo lendo PDFs irrelevantes. Na primeira vaga que testamos, recebemos um shortlist com 3 candidatos perfeitos em 48 horas. É como ter um recrutador sênior trabalhando 24/7."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-black border border-indigo-500/30">DR</div>
                  <div>
                    <p className="text-white font-bold text-sm">Diretora de RH</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Tech Startup</p>
                  </div>
                </div>
              </div>

              <div className="s-glass p-8 border-white/5 relative hover:bg-white/[0.03] transition-all duration-300">
                <div className="flex gap-1 text-emerald-400 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="fill-current" />)}
                </div>
                <p className="text-lg text-slate-300 font-medium italic mb-8 leading-relaxed">
                  "Sempre fui ignorado nas vagas e não entendia o motivo. O diagnóstico da IA me mostrou que eu não estava sabendo vender os projetos certos. Ajustei meu LinkedIn e recebi 2 propostas na mesma semana."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black border border-emerald-500/30">LA</div>
                  <div>
                    <p className="text-white font-bold text-sm">Lucas A.</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Candidato Premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE PILLARS */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {config.pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="s-glass p-10 border-white/5 s-glass-hover group">
                  <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white font-heading">{pillar.title}</h3>
                  <p className="mt-4 text-slate-400 leading-relaxed font-medium">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROCESS FLOW - TACTICAL VIEW */}
        <section id="processo" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-indigo-500/0 to-indigo-500/50" />

          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">
              The Sovereign Method
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white font-heading">
              Fluxo de Triagem v2.0
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <div
                key={i}
                className="relative s-glass p-8 border-white/5 hover:bg-white/[0.03] transition-all"
              >
                <span className="absolute top-4 right-6 text-4xl font-black text-white/5 font-heading italic">
                  {step.step}
                </span>
                <h4 className="text-lg font-black text-white mb-4 pr-10">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING - BUSINESS WEDGE */}
        <section id="precos" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Candidate Card */}
            <div className="s-glass p-12 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="text-3xl font-black text-white font-heading mb-2">
                Diagnóstico de Elite
              </h3>
              <p className="text-slate-500 font-bold mb-8 italic">
                "Decifre o seu potencial neural."
              </p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white">R$ 29,90</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  / Diagnóstico
                </span>
              </div>

              <ul className="space-y-4 mb-12">
                {[
                  'Análise Neural de Currículo',
                  'Identificação de Gaps ATS',
                  'Roadmap de Evolução IA',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Check size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/para-candidatos"
                className="w-full py-5 s-glass border-white/10 text-[11px] font-black uppercase tracking-widest text-center hover:bg-white/5 block"
              >
                Saiba Mais
              </Link>
            </div>

            {/* Recruiter Card - Featured */}
            <div className="s-glass p-12 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden">
              <div className="absolute top-6 right-8 px-3 py-1 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/20">
                Market Leader
              </div>

              <h3 className="text-3xl font-black text-white font-heading mb-2">Para Empresas</h3>
              <p className="text-indigo-300 font-bold mb-8">"Triagem em escala, sem ruído."</p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white">R$ 397</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  / mensal base
                </span>
              </div>

              <ul className="space-y-4 mb-12">
                {[
                  'Convite WhatsApp Automatizado',
                  'Entrevistas por Áudio IA',
                  'Diagnóstico de Shortlist',
                  'Sovereign Governance Hub',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-200 font-bold">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={buildAppUrl('/registro?role=recruiter', runtime)}
                className="w-full py-5 s-btn-primary justify-center text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20"
              >
                Abrir Conta Empresa <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="mx-auto max-w-4xl px-6 py-24 lg:px-8 border-t border-white/5 mt-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white font-heading">
              Perguntas Frequentes
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "A IA substitui o recrutador humano?",
                a: "Não. A Inteligência Neural atua apenas na triagem inicial em grande volume. Ela entrega um shortlist (ranking) com os melhores candidatos para que você, o humano, tome a decisão final."
              },
              {
                q: "Os candidatos não se assustam em falar com robôs?",
                a: "Pelo contrário. A taxa de resposta via WhatsApp chega a ser 4x maior do que formulários. Os candidatos adoram a agilidade e a transparência do processo."
              },
              {
                q: "E se a IA tiver viés na avaliação?",
                a: "Nosso modelo é focado em competências comportamentais e ignora dados demográficos, foto ou gênero. As decisões são baseadas exclusivamente na estruturação lógica das respostas."
              },
              {
                q: "Como funciona o pagamento da plataforma?",
                a: "O plano Empresa possui uma base mensal fixa para usar a IA e gerenciar times. Já o consumo de disparos de WhatsApp é feito via recarga de créditos, pagando só pelo que usar."
              },
              {
                q: "Posso cancelar a assinatura Premium?",
                a: "Sim. Sem contratos engessados de 12 meses ou multas. Cancele direto pelo painel de controle quando quiser."
              }
            ].map((faq, i) => (
              <div key={i} className="s-glass p-6 border-white/5 rounded-2xl">
                <h4 className="text-lg font-black text-white mb-2">{faq.q}</h4>
                <p className="text-slate-400 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="mx-auto max-w-5xl px-6 py-24 lg:px-8 mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-slate-900 p-12 md:p-16 rounded-3xl text-center border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white font-heading mb-6 tracking-tight">
                Pronto para contratar em 2 dias ou menos?
              </h2>
              <p className="text-xl text-indigo-200 mb-10 font-medium max-w-2xl mx-auto">
                Deixe o robô fazer a triagem em massa. Você foca em entrevistar apenas os melhores.
              </p>
              <a
                href={config.primaryHref}
                className="px-12 py-6 bg-white text-indigo-950 rounded-full font-black text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform inline-flex items-center gap-3"
              >
                {config.primaryLabel} <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* TACTICAL FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950/80 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <img src="/logo-sovereign.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-2xl font-black tracking-tighter font-heading text-white">
                  Recrutaria<span className="text-indigo-400">.</span>
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                MCT Sovereign Kernel v2.0
              </p>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link to="/privacidade" className="hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link to="/termos" className="hover:text-white transition-colors">
                Termos
              </Link>
              <Link to="/sobre" className="hover:text-white transition-colors">
                Sobre
              </Link>
              <Link to="/blog" className="hover:text-white transition-colors">
                Neural Blog
              </Link>
            </nav>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl s-glass border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
                <ShieldCheck size={20} />
              </div>
              <div className="w-10 h-10 rounded-xl s-glass border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
              Sovereign Tactical Agent Infrastructure • 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
