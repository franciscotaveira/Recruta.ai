import React, { useState, useEffect } from 'react';
import { FileText, Save, Loader2, Download, Sparkles } from 'lucide-react';
import { getCandidateProfile } from '../../services/api';

const CVEditorPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getCandidateProfile();
      setProfile(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Editor de Currículo <FileText className="text-purple-500" size={24} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Seu Currículo Vivo. Edite o texto base e nós o otimizaremos para cada candidatura.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <Download size={16} /> Exportar
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg hover:bg-purple-700 transition">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
        <Sparkles className="text-blue-600 shrink-0 mt-0.5" size={18} />
        <p className="text-xs font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
          Toda vez que você atualiza seu CV Base aqui, a IA utilizará estas informações para criar
          as versões otimizadas nas suas próximas candidaturas.
        </p>
      </div>

      {/* Editor Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="border-b border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/50 flex gap-2">
          {/* Mock formatting toolbar */}
          {['B', 'I', 'U'].map((t) => (
            <button
              key={t}
              className="w-8 h-8 rounded flex items-center justify-center font-serif font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 my-auto mx-2" />
          <button className="px-3 h-8 rounded text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">
            H1
          </button>
          <button className="px-3 h-8 rounded text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">
            H2
          </button>
        </div>
        <textarea
          className="flex-1 w-full p-6 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 resize-none outline-none focus:ring-inset focus:ring-2 focus:ring-purple-500/20"
          placeholder="Comece a digitar seu currículo aqui, cole do LinkedIn ou faça o upload prévio no Dashboard..."
          defaultValue={
            profile?.diagnosis
              ? 'Este é seu perfil base derivado do diagnóstico anterior. A edição em tempo real virá numa release futura do Recrutaria V2.'
              : ''
          }
        />
      </div>
    </div>
  );
};

export default CVEditorPage;
