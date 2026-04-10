import React from 'react';
import { Users, FileCheck, TrendingUp, AlertCircle, Search, Eye } from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total de Candidatos',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: <Users size={20} className="text-blue-600" />,
    },
    {
      title: 'Diagnósticos Hoje',
      value: '45',
      change: '+5%',
      trend: 'up',
      icon: <FileCheck size={20} className="text-green-600" />,
    },
    {
      title: 'Taxa de Conversão',
      value: '18%',
      change: '-2%',
      trend: 'down',
      icon: <TrendingUp size={20} className="text-purple-600" />,
    },
    {
      title: 'Erros de Leitura',
      value: '3',
      change: '0%',
      trend: 'neutral',
      icon: <AlertCircle size={20} className="text-red-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
              {stat.change && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend === 'up'
                      ? 'bg-green-100 text-green-700'
                      : stat.trend === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900">Candidatos Recentes</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_CANDIDATES.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{candidate.name}</div>
                    <div className="text-xs text-slate-500">{candidate.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        candidate.plan === 'pro'
                          ? 'bg-purple-100 text-purple-700'
                          : candidate.plan === 'starter'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {candidate.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{candidate.date}</td>
                  <td className="px-6 py-4">
                    {candidate.score > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              candidate.score > 80
                                ? 'bg-green-500'
                                : candidate.score > 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${candidate.score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{candidate.score}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        candidate.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : candidate.status === 'processing'
                            ? 'bg-blue-100 text-blue-700'
                            : candidate.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          candidate.status === 'completed'
                            ? 'bg-green-500'
                            : candidate.status === 'processing'
                              ? 'bg-blue-500'
                              : candidate.status === 'error'
                                ? 'bg-red-500'
                                : 'bg-slate-500'
                        }`}
                      ></span>
                      {candidate.status === 'completed'
                        ? 'Concluído'
                        : candidate.status === 'processing'
                          ? 'Processando'
                          : candidate.status === 'error'
                            ? 'Erro'
                            : 'Novo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Ver todos os candidatos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
