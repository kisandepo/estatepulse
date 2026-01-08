
import React, { useState, useMemo } from 'react';
import { Search, MapPin, User, Phone, Building2, ChevronRight, IndianRupee, UserCheck, Calendar, Quote, Hash, Activity } from 'lucide-react';
import { Project, EnquiryStatus } from '../types';
import { Link } from 'react-router-dom';

interface GlobalSearchProps {
  projects: Project[];
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ projects }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchStr = query.toLowerCase();
    const matches: any[] = [];

    projects.forEach(project => {
      if (project.name.toLowerCase().includes(searchStr) || project.location.toLowerCase().includes(searchStr)) {
        matches.push({ type: 'PROJECT', data: project });
      }

      project.instruments.forEach(inst => {
        if (inst.number.toLowerCase().includes(searchStr)) {
          matches.push({ type: 'UNIT', data: inst, project });
        }

        inst.interactions.forEach(inter => {
          if (
            inter.customerName.toLowerCase().includes(searchStr) ||
            inter.customerPhone.includes(searchStr) ||
            inter.agentName.toLowerCase().includes(searchStr) ||
            inter.agentPhone.includes(searchStr)
          ) {
            matches.push({ type: 'INTERACTION', data: inter, unit: inst, project });
          }
        });
      });
    });

    return matches;
  }, [query, projects]);

  const getStatusBadgeClass = (status: EnquiryStatus) => {
    switch (status) {
      case EnquiryStatus.ACTIVE: return 'bg-blue-50 text-blue-600 border-blue-100';
      case EnquiryStatus.BOOKED: return 'bg-amber-50 text-amber-600 border-amber-100';
      case EnquiryStatus.SOLD: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 px-1 lg:px-0">
      <div className="mb-6 lg:mb-10 text-center">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2 tracking-tight">Master Database Search</h2>
        <p className="text-xs lg:text-sm text-slate-500 font-medium italic">Query customers, agents, or property units instantly.</p>
      </div>

      <div className="relative mb-8 lg:mb-12">
        <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 lg:w-6 lg:h-6" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Client name, agent, phone or unit #..."
          className="w-full pl-14 lg:pl-16 pr-6 py-4 lg:py-6 bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 outline-none focus:border-blue-400 transition-all text-base lg:text-lg font-bold"
        />
      </div>

      <div className="space-y-4 lg:space-y-6">
        {query && results.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <Search className="text-slate-100 mx-auto mb-4" size={56} />
            <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">No matching records found.</p>
          </div>
        )}

        {results.map((result, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-2xl lg:rounded-[2rem] border border-slate-200 p-6 lg:p-8 hover:border-blue-300 transition-all shadow-sm hover:shadow-xl animate-in slide-in-from-bottom-2 duration-300"
          >
            {result.type === 'PROJECT' && (
              <Link to={`/project/${result.data.id}`} className="flex items-center justify-between">
                <div className="flex items-center gap-4 lg:gap-5">
                  <div className="p-3 lg:p-4 bg-blue-50 text-blue-600 rounded-xl lg:rounded-2xl">
                    <Building2 className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Project Found</span>
                    <h4 className="text-lg lg:text-2xl font-black text-slate-900 truncate">{result.data.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 font-bold mt-1"><MapPin size={12} /> {result.data.location}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" size={24} />
              </Link>
            )}

            {result.type === 'UNIT' && (
              <Link to={`/project/${result.project.id}`} className="flex items-center justify-between">
                <div className="flex items-center gap-4 lg:gap-5">
                  <div className="p-3 lg:p-4 bg-indigo-50 text-indigo-600 rounded-xl lg:rounded-2xl">
                    <Hash className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-1 block">Property Unit</span>
                    <h4 className="text-lg lg:text-2xl font-black text-slate-900 tracking-tight"># {result.data.number}</h4>
                    <p className="text-xs text-slate-500 font-bold mt-1 italic">Master Project: <span className="text-slate-900">{result.project.name}</span></p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" size={24} />
              </Link>
            )}

            {result.type === 'INTERACTION' && (
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4 lg:gap-5">
                    <div className="p-3 lg:p-4 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl relative">
                      <User className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block leading-none">Showing Log</span>
                        <span className={`text-[8px] font-black border px-1.5 py-0.5 rounded-full uppercase leading-none tracking-wider ${getStatusBadgeClass(result.data.status)}`}>
                          {result.data.status}
                        </span>
                      </div>
                      <h4 className="text-lg lg:text-2xl font-black text-slate-900 leading-tight tracking-tight">{result.data.customerName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-bold">
                        <Phone size={12} /> {result.data.customerPhone}
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/project/${result.project.id}`} 
                    className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-[10px] font-black uppercase lg:hidden">View Project</span>
                    <ChevronRight size={20} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Market Quote</p>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <IndianRupee size={18} className="font-bold" />
                      <span className="text-2xl font-black">{result.data.offeredRate.toLocaleString()}</span>
                      <span className="text-[9px] font-black text-slate-400 mt-1 uppercase ml-1">/ sqft</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/30">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Handling Personnel</p>
                    <div className="flex items-center gap-3">
                      <UserCheck size={20} className="text-blue-500" />
                      <div>
                        <p className="font-black text-slate-900 text-sm leading-none">{result.data.agentName}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 truncate">{result.data.agentPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Unit Context</p>
                    <div className="flex items-center gap-3">
                      <Building2 size={18} className="text-slate-400" />
                      <p className="text-xs font-bold text-slate-700">#{result.unit.number} in <span className="text-slate-900 font-black">{result.project.name}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalSearch;
