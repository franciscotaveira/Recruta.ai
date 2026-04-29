import React, { useMemo } from 'react';
import {
  ArrowRight,
  AudioLines,
  BadgeCheck,
  BarChart3,
  Bot,
  Briefcase,
  Check,
  Clock3,
  FileSearch,
  MessageCircle,
  ShieldCheck,
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
    title: 'Vaga com critérios claros',
    description: 'A empresa define requisitos, sinais de evidência e regras de decisão.',
  },
  {
    step: '02',
    title: 'Convite no WhatsApp',
    description: 'O candidato recebe o convite no canal que já usa, com baixa fricção.',
  },
  {
    step: '03',
    title: 'Triagem por áudio estruturada',
    description: 'A IA conduz perguntas abertas e registra respostas com trilha auditável.',
  },
  {
    step: '04',
    title: 'Shortlist Estratégico',
    description: 'O recrutador recebe o Neural Match Score, riscos e aderência cultural pronta para decisão.',
  },
];

const faq = [
  {
    q: 'A Recrutaria substitui o recrutador?',
    a: 'Não. A camada de IA reduz trabalho operacional e melhora consistência. A decisão continua humana.',
  },
  {
    q: 'Posso vender com pré-pago antes de contratar assinatura?',
    a: 'Sim. O modelo base é pré-pago. A recorrência entra quando a operação precisa previsibilidade e volume.',
  },
  {
    q: 'Site e app ficam separados?',
    a: 'Sim. O site institucional fica no domínio principal e o produto no subdomínio do app.',
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
      eyebrow: 'Para empresas que buscam o 1% do topo sem o ruído da triagem manual',
      title: 'Inteligência Neural para Contratações de Elite.',
      body:
        'A Recrutaria ajuda pequenas e médias empresas a sair do currículo solto e chegar em um shortlist com evidência, contexto e rastreabilidade.',
      primaryLabel: 'Abrir conta empresa',
      primaryHref: appLinks.recruiter,
      secondaryLabel: 'Entrar no app',
      secondaryHref: appLinks.login,
      metaTitle: 'Recrutaria para Empresas | Triagem por WhatsApp com IA',
      metaDescription:
        'Crie vagas, convide candidatos por WhatsApp, receba respostas em áudio e tome decisão com diagnóstico estruturado.',
      stats: [
        { label: 'Canal operacional', value: 'WhatsApp' },
        { label: 'Formato principal', value: 'Triagem por áudio' },
        { label: 'Modelo comercial', value: 'Pré-pago + recorrência' },
        { label: 'Saída para o RH', value: 'Diagnóstico acionável' },
      ],
      pillars: [
        {
          icon: Briefcase,
          title: 'Vaga estruturada antes da execução',
          description: 'A triagem começa com critérios claros, não com improviso do recrutador.',
        },
        {
          icon: MessageCircle,
          title: 'Convite e condução no canal certo',
          description: 'O candidato responde no WhatsApp, com menos fricção do que portais tradicionais.',
        },
        {
          icon: FileSearch,
          title: 'Decisão com evidência',
          description: 'Resumo de aderência, riscos, pontos fortes e próximos passos para o RH.',
        },
      ],
    };
  }

  if (segment === 'candidate') {
    return {
      eyebrow: 'Para talentos que buscam clareza absoluta e posicionamento de mercado',
      title: 'Receba um Diagnóstico de Elite sobre seu perfil.',
      body:
        'A Recrutaria ajuda o candidato a entender como está sendo lido, evoluir o perfil e participar de triagens de forma mais clara e objetiva.',
      primaryLabel: 'Criar conta candidato',
      primaryHref: appLinks.candidate,
      secondaryLabel: 'Entrar no app',
      secondaryHref: appLinks.login,
      metaTitle: 'Recrutaria para Candidatos | Diagnóstico de currículo e evolução',
      metaDescription:
        'Receba diagnóstico do currículo, melhore aderência a vagas e participe de triagens com feedback mais claro.',
      stats: [
        { label: 'Diagnóstico inicial', value: 'Currículo + ATS' },
        { label: 'Canal de triagem', value: 'WhatsApp' },
        { label: 'Formato', value: 'Áudio guiado' },
        { label: 'Objetivo', value: 'Mais clareza e evolução' },
      ],
      pillars: [
        {
          icon: FileSearch,
          title: 'Diagnóstico do currículo',
          description: 'Veja onde seu currículo perde força e o que precisa ser ajustado.',
        },
        {
          icon: AudioLines,
          title: 'Triagem mais humana e objetiva',
          description: 'Você responde por áudio, com menos burocracia e mais contexto real.',
        },
        {
          icon: BadgeCheck,
          title: 'Feedback útil para evolução',
          description: 'A plataforma ajuda a transformar cada interação em melhoria prática.',
        },
      ],
    };
  }

  return {
    eyebrow: 'Site institucional e app operacional separados para vender melhor e operar com clareza',
    title: 'A Recrutaria conecta vaga, WhatsApp e IA em um funil de triagem que PME consegue usar.',
    body:
      'O foco do produto é simples: ajudar empresas a sair do convite até o diagnóstico com menos ruído, e ajudar candidatos a entender e melhorar seu posicionamento.',
    primaryLabel: 'Ver solução para empresas',
    primaryHref: '/para-empresas',
    secondaryLabel: 'Ver solução para candidatos',
    secondaryHref: '/para-candidatos',
    metaTitle: 'Recrutaria | Triagem por WhatsApp com IA para empresas e candidatos',
    metaDescription:
      'Site institucional da Recrutaria. Conheça a solução para empresas e candidatos e acesse o app separado do site.',
    stats: [
      { label: 'Wedge inicial', value: 'PME + triagem WhatsApp' },
      { label: 'Fluxo principal', value: 'Convite -> áudio -> diagnóstico' },
      { label: 'Cobrança', value: 'Pré-pago com recorrência opcional' },
      { label: 'Governança', value: 'Webhook assinado + logs' },
    ],
    pillars: [
      {
        icon: Briefcase,
        title: 'Para empresas',
        description: 'Triagem inicial com mais consistência e menos trabalho manual.',
      },
      {
        icon: Users,
        title: 'Para candidatos',
        description: 'Mais clareza sobre currículo, aderência e progresso nas próximas etapas.',
      },
      {
        icon: ShieldCheck,
        title: 'Para operação',
        description: 'Fluxo auditável, observabilidade e separação entre site institucional e app.',
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
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all duration-300">
              <Bot size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-black tracking-tight font-heading">
              Recrutaria<span className="text-indigo-400">.AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 md:flex">
            <Link to="/para-empresas" className="hover:text-white transition-colors">Empresas</Link>
            <Link to="/para-candidatos" className="hover:text-white transition-colors">Candidatos</Link>
            <a href="#processo" className="hover:text-white transition-colors">Processo</a>
            <a href="#precos" className="hover:text-white transition-colors">Pricing</a>
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
            {config.title.split(' ').map((word, i) => (
              <span key={i} className={i > 4 ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="mt-10 max-w-2xl text-lg md:text-xl leading-relaxed text-slate-400 font-medium animate-fade-in-up delay-100">
            {config.body}
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-200">
            <a
              href={config.primaryHref}
              className="px-10 py-5 s-btn-primary shadow-2xl shadow-indigo-500/30 text-base"
            >
              {config.primaryLabel}
              <ArrowRight size={20} />
            </a>
            <Link
              to={config.secondaryHref}
              className="px-10 py-5 s-glass border-white/10 text-base font-black uppercase tracking-widest hover:border-white/20 transition-all"
            >
              {config.secondaryLabel}
            </Link>
          </div>

          {/* Social Proof / Stats Glass Card */}
          <div className="mt-24 w-full grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-300">
            {config.stats.map((stat, i) => (
              <div key={i} className="s-glass p-8 border-white/5 s-glass-hover">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            ))}
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
                  <p className="mt-4 text-slate-400 leading-relaxed font-medium">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROCESS FLOW - TACTICAL VIEW */}
        <section id="processo" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-indigo-500/0 to-indigo-500/50" />
          
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">The Sovereign Method</p>
            <h2 className="text-4xl md:text-5xl font-black text-white font-heading">Fluxo de Triagem v2.0</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <div key={i} className="relative s-glass p-8 border-white/5 hover:bg-white/[0.03] transition-all">
                <span className="absolute top-4 right-6 text-4xl font-black text-white/5 font-heading italic">{step.step}</span>
                <h4 className="text-lg font-black text-white mb-4 pr-10">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.description}</p>
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
              <h3 className="text-3xl font-black text-white font-heading mb-2">Diagnóstico de Elite</h3>
              <p className="text-slate-500 font-bold mb-8 italic">"Decifre o seu potencial neural."</p>
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white">R$ 49</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">/ Diagnóstico</span>
              </div>

              <ul className="space-y-4 mb-12">
                {['Análise Neural de Currículo', 'Identificação de Gaps ATS', 'Roadmap de Evolução IA'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-bold">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Check size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link to="/para-candidatos" className="w-full py-5 s-glass border-white/10 text-[11px] font-black uppercase tracking-widest text-center hover:bg-white/5 block">
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
                 <span className="text-5xl font-black text-white">Custom</span>
                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">/ Pay per Usage</span>
               </div>

               <ul className="space-y-4 mb-12">
                {['Convite WhatsApp Automatizado', 'Entrevistas por Áudio IA', 'Diagnóstico de Shortlist', 'Sovereign Governance Hub'].map((item, i) => (
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
      </main>

      {/* TACTICAL FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950/80 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <Bot size={24} className="text-indigo-400" />
                <span className="text-2xl font-black tracking-tight font-heading">Recrutaria<span className="text-indigo-400">.AI</span></span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">MCT Sovereign Kernel v2.0</p>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link to="/termos" className="hover:text-white transition-colors">Termos</Link>
              <Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link>
              <Link to="/blog" className="hover:text-white transition-colors">Neural Blog</Link>
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
