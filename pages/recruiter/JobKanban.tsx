import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, User, Plus } from 'lucide-react';
import { MOCK_JOBS } from '../../constants';

const JobKanban = () => {
  const { id } = useParams();
  const job = MOCK_JOBS.find(j => j.id === id) || MOCK_JOBS[0]; // Fallback for mock

  const stages = [
    { id: 'new', label: 'Novos', count: 12, color: 'border-blue-500' },
    { id: 'screening', label: 'Triagem IA', count: 5, color: 'border-purple-500' },
    { id: 'interview', label: 'Entrevista', count: 3, color: 'border-yellow-500' },
    { id: 'shortlist', label: 'Shortlist', count: 2, color: 'border-emerald-500' },
    { id: 'rejected', label: 'Reprovados', count: 8, color: 'border-slate-300' },
  ];

  // Mock candidates cards for visualization
  const mockCards = [
    { id: 1, name: 'Francisco Taveira', score: 92, stage: 'new' },
    { id: 2, name: 'Ana Silva', score: 88, stage: 'screening' },
    { id: 3, name: 'Carlos P.', score: 75, stage: 'new' },
    { id: 4, name: 'Beatriz M.', score: 95, stage: 'interview' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <Link to="/recruiter/jobs" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft size={20} className="text-slate-500" />
            </Link>
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {job.title}
                    <span className="text-xs font-normal text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">Remote</span>
                </h1>
                <p className="text-sm text-slate-500">Pipeline de contratação</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-900 dark:bg-purple-600 text-white rounded-lg font-bold text-sm hover:opacity-90">
                + Adicionar Candidato
            </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-4 min-w-max pb-4">
            {stages.map(stage => (
                <div key={stage.id} className="w-72 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    {/* Column Header */}
                    <div className={`p-3 border-b-2 bg-white dark:bg-slate-800 rounded-t-xl flex justify-between items-center ${stage.color} dark:border-slate-700`}>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                            {stage.label}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                            {mockCards.filter(c => c.stage === stage.id).length}
                        </span>
                    </div>

                    {/* Column Content */}
                    <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                        {mockCards.filter(c => c.stage === stage.id).map(card => (
                            <div key={card.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-move hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center">
                                            {card.name.substring(0,1)}
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{card.name}</span>
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-500">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        Match: {card.score}%
                                    </span>
                                    <span className="text-[10px] text-slate-400">2h atrás</span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty State / Add Placeholder */}
                        <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1">
                            <Plus size={14} /> Adicionar
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default JobKanban;