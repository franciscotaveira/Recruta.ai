import React from 'react';

// ============= 1. HERO SECTION =============
export const HeroSection = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="relative bg-gradient-to-b from-purple-900 via-purple-800 to-slate-900 min-h-screen flex items-center justify-center overflow-hidden">
    {/* Animated background */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
    </div>

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="mb-6 inline-block">
          <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium border border-purple-400/30">
            🤖 Powered by AI
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Seus Currículos Rejeitados por{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            ATS?
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
          IA reescreve seu currículo para passar nos filtros automáticos de{' '}
          <strong className="text-white">75% das empresas</strong>. Resultados em 2 minutos.
        </p>

        {/* Problem statement */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-10 text-red-200">
          <p>❌ 75% dos currículos são rejeitados automaticamente antes de um humano ver</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105 shadow-lg"
          >
            ✨ Fazer Diagnóstico Grátis
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-lg text-lg border border-white/20 transition">
            📹 Ver Como Funciona
          </button>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">1000+</p>
            <p className="text-sm text-gray-400">CVs Analisados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">78%</p>
            <p className="text-sm text-gray-400">Taxa de Sucesso</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">4.9/5</p>
            <p className="text-sm text-gray-400">Avaliação</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ============= 2. HOW IT WORKS SECTION =============
export const HowItWorksSection = () => (
  <section className="py-20 bg-slate-950 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Como Funciona</h2>
        <p className="text-xl text-gray-400">3 passos simples para transformar seu currículo</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center hover:border-purple-500 transition">
          <div className="text-5xl mb-4">📤</div>
          <div className="text-4xl font-bold text-purple-400 mb-2">1</div>
          <h3 className="text-2xl font-bold mb-3">Upload Seu Currículo</h3>
          <p className="text-gray-400">
            Cole o texto ou faça upload em PDF/DOCX. Leva menos de 1 minuto.
          </p>
          <div className="mt-4 text-sm text-gray-500">Sem cartão de crédito necessário</div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <div className="text-4xl text-purple-500">→</div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center hover:border-purple-500 transition">
          <div className="text-5xl mb-4">🤖</div>
          <div className="text-4xl font-bold text-purple-400 mb-2">2</div>
          <h3 className="text-2xl font-bold mb-3">IA Analisa Seu Perfil</h3>
          <p className="text-gray-400">
            Detecta problemas no ATS, palavras-chave faltantes e score de competitividade.
          </p>
          <div className="mt-4 text-sm text-gray-500">Análise em 2 minutos</div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <div className="text-4xl text-purple-500">→</div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center hover:border-purple-500 transition">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-4xl font-bold text-purple-400 mb-2">3</div>
          <h3 className="text-2xl font-bold mb-3">Receba Versão Otimizada</h3>
          <p className="text-gray-400">
            Baixe seu currículo reescrito, pronto para enviar aos recrutadores.
          </p>
          <div className="mt-4 text-sm text-gray-500">100% mantendo seu estilo</div>
        </div>
      </div>
    </div>
  </section>
);

// ============= 3. FEATURES SECTION =============
export const FeaturesSection = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Otimização para ATS',
      description: 'Passa por 75% dos filtros automáticos. Mantém seu estilo pessoal.',
    },
    {
      icon: '📊',
      title: 'Score de Competitividade',
      description: 'Veja seu percentual vs outros candidatos. Identifique gaps de habilidades.',
    },
    {
      icon: '📄',
      title: 'Múltiplas Versões',
      description: 'Crie versões para diferentes áreas. A/B teste mensagens por tipo de posição.',
    },
    {
      icon: '🔗',
      title: 'Integrações ATS',
      description: 'Conecte com Gupy, LinkedIn, LinkedIn Recruiter. Rastreie envios automáticos.',
    },
    {
      icon: '🎓',
      title: 'Feedback Contínuo',
      description: 'IA aprende com suas entrevistas. Melhora sugestões ao longo do tempo.',
    },
    {
      icon: '🔒',
      title: 'Segurança LGPD',
      description: 'Currículo nunca compartilhado. Criptografado. Você controla seus dados.',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Recursos Poderosos</h2>
          <p className="text-xl text-gray-400">Tudo que você precisa para ser competitivo</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-700 rounded-lg p-8 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============= 4. SOCIAL PROOF SECTION =============
export const SocialProofSection = () => {
  const testimonials = [
    {
      name: 'João Silva',
      role: 'Engenheiro de Software',
      content:
        'Meu currículo passava em 20% dos filtros. Depois de usar Recruta.AI, passei em 85%. Consegui 3 entrevistas em 1 semana!',
      avatar: '👨‍💻',
    },
    {
      name: 'Maria Santos',
      role: 'Product Manager',
      content:
        'Sempre achei que meu currículo era bom. Depois vi que estava perdendo 60% das oportunidades. Agora meu score é 92%',
      avatar: '👩‍💼',
    },
    {
      name: 'Pedro Costa',
      role: 'Data Scientist',
      content:
        'A análise de competitividade foi surpreendente. Agora entendo exatamente onde melhorar para ser contratado.',
      avatar: '👨‍🔬',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Resultados Reais</h2>
          <p className="text-xl text-gray-400">Veja o que usuários reais estão conseguindo</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">1000+</p>
            <p className="text-gray-400">CVs Analisados</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">78%</p>
            <p className="text-gray-400">Taxa Sucesso</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">4.9/5</p>
            <p className="text-gray-400">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">50+</p>
            <p className="text-gray-400">Empresas</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-8">
              <div className="flex items-center mb-4">
                <div className="text-5xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============= 5. PRICING SECTION =============
export const PricingSection = ({ onSelect }: { onSelect: (plan: string) => void }) => (
  <section className="py-20 bg-slate-950 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Planos Simples</h2>
        <p className="text-xl text-gray-400">Escolha o que funciona para você</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Básico */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 hover:border-purple-500 transition">
          <h3 className="text-2xl font-bold mb-2">Básico</h3>
          <p className="text-gray-400 mb-6">Para quem quer começar</p>
          <p className="text-4xl font-bold mb-6">
            R$ 49<span className="text-lg text-gray-400">/mês</span>
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <span className="text-green-400 mr-3">✓</span> 5 análises por mês
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-3">✓</span> 1 versão do currículo
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-3">✓</span> Feedback básico
            </li>
            <li className="flex items-center">
              <span className="text-gray-600 mr-3">✗</span> Integração ATS
            </li>
            <li className="flex items-center">
              <span className="text-gray-600 mr-3">✗</span> Suporte 24/7
            </li>
          </ul>

          <button
            onClick={() => onSelect('basico')}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition border border-white/20"
          >
            Começar Grátis
          </button>
        </div>

        {/* Pro - Destaque */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-8 transform hover:scale-105 transition">
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full inline-block text-sm font-bold mb-4">
            ⭐ MAIS POPULAR
          </div>

          <h3 className="text-2xl font-bold mb-2">Pro</h3>
          <p className="text-white/80 mb-6">Tudo que você precisa</p>
          <p className="text-4xl font-bold mb-6">
            R$ 199<span className="text-lg text-white/80">/mês</span>
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <span className="text-white mr-3">✓</span> Análises ilimitadas
            </li>
            <li className="flex items-center">
              <span className="text-white mr-3">✓</span> 10+ versões
            </li>
            <li className="flex items-center">
              <span className="text-white mr-3">✓</span> Feedback avançado
            </li>
            <li className="flex items-center">
              <span className="text-white mr-3">✓</span> Integração ATS (Gupy)
            </li>
            <li className="flex items-center">
              <span className="text-white mr-3">✓</span> Suporte 24/7
            </li>
          </ul>

          <button
            onClick={() => onSelect('pro')}
            className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 px-6 rounded-lg transition"
          >
            Começar Agora
          </button>
        </div>
      </div>

      <p className="text-center text-gray-400 mt-8">
        Todos os planos têm 30 dias de garantia 100% dinheiro de volta.
      </p>
    </div>
  </section>
);

// ============= 6. FAQ SECTION =============
export const FAQSection = () => {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: '❓ Como vocês não compartilham meu currículo?',
      answer:
        'Seus dados são criptografados em repouso. Você controla 100% quem acessa. Estamos em conformidade LGPD total.',
    },
    {
      id: '2',
      question: '❓ A IA modifica meu estilo?',
      answer:
        'Não. Apenas otimizamos formatação, palavras-chave e estrutura, mantendo sua voz e personalidade.',
    },
    {
      id: '3',
      question: '❓ Quanto tempo leva para ver resultado?',
      answer: 'Análise em 2 minutos. Resultado visível em suas próximas 2 semanas de candidaturas.',
    },
    {
      id: '4',
      question: '❓ Funciona para qualquer profissão?',
      answer: 'Sim, testamos em 40+ áreas: Tech, RH, Vendas, Marketing, Finance e mais.',
    },
    {
      id: '5',
      question: '❓ Posso cancelar a qualquer momento?',
      answer: 'Claro! Sem compromisso. Cancele quando quiser sem perguntas.',
    },
    {
      id: '6',
      question: '❓ Qual a garantia?',
      answer: 'Se não ver melhoria em 30 dias, devolvemos 100% do dinheiro. Sem questões.',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full p-6 flex justify-between items-center hover:bg-slate-800 transition"
              >
                <h3 className="font-bold text-left">{faq.question}</h3>
                <span className="text-2xl">{openId === faq.id ? '−' : '+'}</span>
              </button>

              {openId === faq.id && (
                <div className="px-6 pb-6 text-gray-400 border-t border-slate-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============= 7. FINAL CTA SECTION =============
export const FinalCTASection = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        🚀 Pare de Perder Oportunidades por Currículo Fraco
      </h2>

      <p className="text-xl mb-4 text-white/90">
        Sua concorrência está usando IA. Você pode ficar para trás ou começar agora.
      </p>

      <button
        onClick={onGetStarted}
        className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-10 rounded-lg text-lg transition transform hover:scale-105 shadow-lg mb-6"
      >
        ✨ Fazer Diagnóstico Gratuito
      </button>

      <p className="text-white/80">
        Leva 2 minutos. Sem cartão de crédito.
        <br />
        Veja seu score de competitividade agora.
      </p>
    </div>
  </section>
);

// ============= 8. MAIN LANDING PAGE COMPONENT =============
export default function LandingPage() {
  const handleGetStarted = () => {
    // Navegar para o dashboard ou página de diagnóstico
    window.location.href = '#/candidate';
  };

  return (
    <div className="bg-slate-950">
      <HeroSection onGetStarted={handleGetStarted} />
      <HowItWorksSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection onSelect={(plan) => console.log('Selected:', plan)} />
      <FAQSection />
      <FinalCTASection onGetStarted={handleGetStarted} />
    </div>
  );
}
