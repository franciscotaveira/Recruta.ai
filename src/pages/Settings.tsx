import React from 'react';
import { Save, Bell, Smartphone, Shield, Users } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm">
          Gerencie as preferências da plataforma e integrações.
        </p>
      </div>

      {/* Integration Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Smartphone size={20} className="text-whatsapp" />
            Integração WhatsApp
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure a conexão com a API do WhatsApp Business.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número do Bot</label>
              <input
                type="text"
                defaultValue="+55 11 99999-9999"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                API Key (Meta)
              </label>
              <input
                type="password"
                value="************************"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensagem de Saudação
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm h-24"
              defaultValue="Olá! Sou a LIA, assistente virtual da Recruta.AI. Estou aqui para ajudar você a turbinar sua carreira. Vamos começar seu diagnóstico?"
            ></textarea>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
            <span className="text-sm font-medium text-slate-700">Bot Ativo</span>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button className="px-4 py-2 bg-navy text-white rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors flex items-center gap-2">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell size={20} className="text-blue-500" />
            Notificações
          </h2>
          <p className="text-sm text-slate-500 mt-1">Escolha quando você quer ser alertado.</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            'Novo diagnóstico concluído (Score > 80)',
            'Falha no processamento de áudio',
            'Novo pagamento confirmado',
            'Relatório semanal de performance',
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-700">{item}</span>
              <div
                className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${idx === 1 ? 'bg-slate-300' : 'bg-blue-600'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${idx === 1 ? 'left-1' : 'right-1'}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Users size={20} className="text-purple-500" />
            Equipe
          </h2>
          <p className="text-sm text-slate-500 mb-4">3 usuários ativos na conta Admin.</p>
          <button className="w-full py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Gerenciar Acessos
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Shield size={20} className="text-slate-700" />
            Segurança
          </h2>
          <p className="text-sm text-slate-500 mb-4">Último backup: Hoje às 03:00.</p>
          <button className="w-full py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Logs de Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
