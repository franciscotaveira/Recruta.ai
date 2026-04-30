import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';

interface LegalProps {
  type: 'terms' | 'privacy';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  const content = {
    terms: {
      title: 'Termos de Serviço Sovereign',
      icon: <FileText size={48} className="text-blue-500 mb-6" />,
      text: (
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-slate-900 text-lg mb-2">1. Natureza do Serviço</h3>
            <p className="text-slate-600">
              O Recrutaria opera como uma camada de inteligência Neural. O processamento de áudio e
              texto visa a redução de viés cognitivo e a automação de triagens. O usuário compreende
              que a IA auxilia, mas a decisão final de contratação é exclusiva do Recrutador.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 text-lg mb-2">2. Pagamentos e Créditos</h3>
            <p className="text-slate-600">
              Créditos adquiridos por Recrutadores não possuem data de expiração enquanto a conta
              estiver ativa. O "Diagnóstico de Elite" para Candidatos é um produto digital de
              entrega imediata, não sendo elegível para reembolso após o processamento da análise
              pela IA.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 text-lg mb-2">3. Uso de IA e Algoritmos</h3>
            <p className="text-slate-600">
              A plataforma utiliza modelos de linguagem de larga escala (LLM). O Recrutaria garante
              a auditabilidade dos critérios de triagem (Neural Moat), permitindo que recrutadores
              entendam os fundamentos de cada score gerado.
            </p>
          </section>
        </div>
      ),
    },
    privacy: {
      title: 'Política de Privacidade (LGPD)',
      icon: <Shield size={48} className="text-green-500 mb-6" />,
      text: (
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-slate-900 text-lg mb-2">1. Coleta de Dados e Áudio</h3>
            <p className="text-slate-600">
              Coletamos seu nome, telefone e gravações de áudio via WhatsApp exclusivamente para o
              propósito de triagem de talentos. Os áudios são transcritos e analisados por IA para
              extrair competências profissionais.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 text-lg mb-2">2. Ciclo de Vida do Dado</h3>
            <p className="text-slate-600">
              Os dados de triagem permanecem ativos durante o processo seletivo. Após a conclusão da
              vaga, os dados são anonimizados ou arquivados por até 2 anos para fins de histórico
              profissional do candidato, podendo ser excluídos a qualquer momento via solicitação.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 text-lg mb-2">3. Segurança Sovereign</h3>
            <p className="text-slate-600">
              Utilizamos infraestrutura Supabase com Row Level Security (RLS), garantindo que apenas
              o recrutador da vaga específica tenha acesso aos seus dados de diagnóstico.
            </p>
          </section>
        </div>
      ),
    },
  };

  const current = content[type];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl tracking-tight text-slate-900">
            Recrutaria
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-purple-600">
            Voltar
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
          {current.icon}
          <h1 className="text-3xl font-bold text-slate-900 mb-6">{current.title}</h1>
          <div className="text-slate-600 leading-relaxed">
            {current.text}
            <p className="mt-8 text-sm text-slate-400">Última atualização: Janeiro de 2026.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
