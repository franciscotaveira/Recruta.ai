import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';

interface LegalProps {
  type: 'terms' | 'privacy';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  const content = {
    terms: {
      title: 'Termos de Uso',
      icon: <FileText size={48} className="text-blue-500 mb-6" />,
      text: (
        <>
          <p className="mb-4">
            Bem-vindo ao Recruta.AI. Ao utilizar nossa plataforma, você concorda com os seguintes
            termos:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>
              <strong>Serviço de Diagnóstico:</strong> O Recruta.AI fornece análises baseadas em IA.
              Embora nos esforcemos pela precisão, as sugestões não garantem contratação.
            </li>
            <li>
              <strong>Pagamentos:</strong> Os planos Starter e Pro são pagamentos únicos e não
              reembolsáveis após a entrega do diagnóstico.
            </li>
            <li>
              <strong>Uso Responsável:</strong> Você concorda em fornecer informações verdadeiras e
              áudios autênticos.
            </li>
          </ul>
        </>
      ),
    },
    privacy: {
      title: 'Política de Privacidade',
      icon: <Shield size={48} className="text-green-500 mb-6" />,
      text: (
        <>
          <p className="mb-4">Sua privacidade é nossa prioridade. Veja como tratamos seus dados:</p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>
              <strong>Coleta de Dados:</strong> Coletamos seu nome, telefone e gravações de áudio
              apenas para fins de processamento do serviço contratado.
            </li>
            <li>
              <strong>Armazenamento:</strong> Seus dados são criptografados. Áudios são processados
              e descartados ou anonimizados para treino de IA (mediante consentimento).
            </li>
            <li>
              <strong>Compartilhamento:</strong> Não vendemos seus dados para terceiros. O
              compartilhamento com recrutadores só ocorre quando você aplica para uma vaga
              específica.
            </li>
          </ul>
        </>
      ),
    },
  };

  const current = content[type];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl tracking-tight text-slate-900">
            Recruta.AI
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
