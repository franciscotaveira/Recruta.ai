import React, { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, Eye, MessageCircle } from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCandidates = MOCK_CANDIDATES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.extractedData?.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Base de Talentos</h1>
          <p className="text-slate-500 text-sm">Gerencie todos os candidatos registrados na plataforma.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
             <Download size={16} /> Exportar CSV
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
             <Filter size={16} /> Filtros
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, cargo ou skills..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Status: Todos</option>
              <option>Concluído</option>
              <option>Processando</option>
              <option>Erro</option>
            </select>
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Plano: Todos</option>
              <option>Free</option>
              <option>Starter</option>
              <option>Pro</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="px-6 py-4">Candidato</th>
                <th className="px-6 py-4">Cargo Identificado</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Top Skills</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{candidate.name}</div>
                        <div className="text-xs text-slate-500">{candidate.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {candidate.extractedData ? (
                      <div>
                        <div className="text-slate-900">{candidate.extractedData.role}</div>
                        <div className="text-xs text-slate-500">{candidate.extractedData.seniority}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {candidate.score > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          candidate.score >= 80 ? 'text-green-600' : candidate.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{candidate.score}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              candidate.score >= 80 ? 'bg-green-500' : candidate.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${candidate.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.extractedData?.topSkills.slice(0, 2).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                          {skill}
                        </span>
                      ))}
                      {candidate.extractedData?.topSkills && candidate.extractedData.topSkills.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs border border-slate-200">
                          +{candidate.extractedData.topSkills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      candidate.status === 'completed' ? 'bg-green-100 text-green-700' :
                      candidate.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      candidate.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        candidate.status === 'completed' ? 'bg-green-500' :
                        candidate.status === 'processing' ? 'bg-blue-500' :
                        candidate.status === 'error' ? 'bg-red-500' :
                        'bg-slate-500'
                      }`}></span>
                      {candidate.status === 'completed' ? 'Concluído' :
                       candidate.status === 'processing' ? 'Processando' :
                       candidate.status === 'error' ? 'Erro' : 'Novo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-whatsapp hover:text-whatsappDark p-1" title="Contatar no WhatsApp">
                        <MessageCircle size={18} />
                      </button>
                      <button className="text-slate-400 hover:text-blue-600 p-1" title="Ver Detalhes">
                        <Eye size={18} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nenhum candidato encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <span>Mostrando {filteredCandidates.length} de {MOCK_CANDIDATES.length} resultados</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Candidates;