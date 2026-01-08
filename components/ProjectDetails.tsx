
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, UserRole, User, Instrument, InstrumentType, Interaction, EnquiryStatus } from '../types';
import { GoogleGenAI } from '@google/genai';
import { 
  Plus as PlusIcon, 
  ChevronLeft as ChevronLeftIcon, 
  LayoutGrid as LayoutGridIcon, 
  List as ListIcon, 
  History as HistoryIcon, 
  UserPlus as UserPlusIcon, 
  Tag as TagIcon, 
  X as XIcon,
  Sparkles as SparklesIcon,
  Info as InfoIcon,
  Calendar as CalendarIcon,
  UserCheck as UserCheckIcon,
  Phone as PhoneIcon,
  IndianRupee,
  Building2,
  Activity,
  Trash2
} from 'lucide-react';

interface ProjectDetailsProps {
  projects: Project[];
  role: UserRole;
  currentUser: User;
  onUpdateProject: (p: Project) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projects, role, currentUser, onUpdateProject }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(window.innerWidth < 768 ? 'grid' : 'list');
  const [isAddInstrumentOpen, setIsAddInstrumentOpen] = useState(false);
  const [isLogInteractionOpen, setIsLogInteractionOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [newInstrument, setNewInstrument] = useState({
    number: '',
    type: InstrumentType.PLOT,
    baseRate: 0
  });

  const [newInteraction, setNewInteraction] = useState({
    customerName: '',
    customerPhone: '',
    agentName: '',
    agentPhone: '',
    offeredRate: 0,
    status: EnquiryStatus.ACTIVE,
    notes: ''
  });

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold">
      <InfoIcon size={48} className="mb-4 opacity-20" />
      <p>Project profile not found.</p>
    </div>
  );

  const handleAddInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== UserRole.ADMIN) return;

    const instrument: Instrument = {
      id: crypto.randomUUID(),
      projectId: project.id,
      number: newInstrument.number,
      type: newInstrument.type,
      baseRate: newInstrument.baseRate,
      interactions: []
    };

    onUpdateProject({
      ...project,
      instruments: [...project.instruments, instrument]
    });
    setIsAddInstrumentOpen(false);
    setNewInstrument({ number: '', type: InstrumentType.PLOT, baseRate: 0 });
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstrument) return;

    const interaction: Interaction = {
      id: crypto.randomUUID(),
      agentName: newInteraction.agentName,
      agentPhone: newInteraction.agentPhone,
      customerName: newInteraction.customerName,
      customerPhone: newInteraction.customerPhone,
      offeredRate: newInteraction.offeredRate,
      status: newInteraction.status,
      date: new Date().toISOString(),
      notes: newInteraction.notes
    };

    const updatedInstruments = project.instruments.map(inst => 
      inst.id === selectedInstrument.id 
        ? { ...inst, interactions: [interaction, ...inst.interactions] }
        : inst
    );

    onUpdateProject({ ...project, instruments: updatedInstruments });
    setIsLogInteractionOpen(false);
    
    setNewInteraction({ 
      customerName: '', 
      customerPhone: '', 
      agentName: '',
      agentPhone: '',
      offeredRate: 0, 
      status: EnquiryStatus.ACTIVE, 
      notes: '' 
    });
  };

  const updateInteractionStatus = (interactionId: string, newStatus: EnquiryStatus) => {
    if (!selectedInstrument || role !== UserRole.ADMIN) return;
    
    const updatedInstruments = project.instruments.map(inst => {
      if (inst.id === selectedInstrument.id) {
        return {
          ...inst,
          interactions: inst.interactions.map(inter => 
            inter.id === interactionId ? { ...inter, status: newStatus } : inter
          )
        };
      }
      return inst;
    });

    onUpdateProject({ ...project, instruments: updatedInstruments });
    const updatedSelected = updatedInstruments.find(i => i.id === selectedInstrument.id);
    if (updatedSelected) setSelectedInstrument(updatedSelected);
  };

  const deleteInteraction = (interactionId: string) => {
    if (!selectedInstrument || role !== UserRole.ADMIN) return;
    if (!confirm('Are you sure you want to delete this customer entry?')) return;

    const updatedInstruments = project.instruments.map(inst => {
      if (inst.id === selectedInstrument.id) {
        return {
          ...inst,
          interactions: inst.interactions.filter(inter => inter.id !== interactionId)
        };
      }
      return inst;
    });

    onUpdateProject({ ...project, instruments: updatedInstruments });
    const updatedSelected = updatedInstruments.find(i => i.id === selectedInstrument.id);
    if (updatedSelected) setSelectedInstrument(updatedSelected);
  };

  const stats = useMemo(() => {
    const totalUnits = project.instruments.length;
    const interactions = project.instruments.flatMap(i => i.interactions);
    const avgRate = interactions.length > 0 
      ? interactions.reduce((acc, curr) => acc + curr.offeredRate, 0) / interactions.length 
      : 0;
    
    return { totalUnits, totalInteractions: interactions.length, avgRate };
  }, [project]);

  const generateAiInsight = async () => {
    setIsGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a high-level real estate market analysis for project: ${project.name} in ${project.location}. Stats: ${stats.totalUnits} total units, ${stats.totalInteractions} client interactions. Recommend a sales strategy. Concise, under 120 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiInsight(response.text);
    } catch (err) {
      setAiInsight("AI insight service currently unavailable.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const getStatusBadgeClass = (status: EnquiryStatus) => {
    switch (status) {
      case EnquiryStatus.ACTIVE: return 'bg-blue-50 text-blue-600 border-blue-100';
      case EnquiryStatus.BOOKED: return 'bg-amber-50 text-amber-600 border-amber-100';
      case EnquiryStatus.SOLD: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 px-1 lg:px-0">
      <div className="mb-6 lg:mb-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 transition-colors font-bold text-sm">
          <ChevronLeftIcon size={18} />
          Back to Dashboard
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2 truncate">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1.5 font-bold text-xs"><TagIcon size={14} /> ID: {project.id.slice(0, 8)}</span>
              <span className="flex items-center gap-1.5 font-bold text-xs"><CalendarIcon size={14} /> Launched: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <button onClick={generateAiInsight} disabled={isGeneratingAi} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm active:scale-95 disabled:opacity-50">
              <SparklesIcon size={16} />
              {isGeneratingAi ? 'Analyzing...' : 'AI Insights'}
            </button>
            {role === UserRole.ADMIN && (
              <button onClick={() => setIsAddInstrumentOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm active:scale-95">
                <PlusIcon size={18} />
                Add Units
              </button>
            )}
          </div>
        </div>
      </div>

      {aiInsight && (
        <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 lg:p-8 relative">
          <button onClick={() => setAiInsight(null)} className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-600"><XIcon size={20} /></button>
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="text-indigo-600" size={20} />
            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[10px]">Gemini Portfolio Strategy</h4>
          </div>
          <p className="text-indigo-800 text-sm leading-relaxed whitespace-pre-line italic font-medium">{aiInsight}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inventory Reach</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">{stats.totalUnits}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Units</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Engagement Rate</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">{stats.totalInteractions}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Entries</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Master Valuation</p>
          <div className="flex items-baseline gap-1">
            <IndianRupee size={20} className="text-emerald-600 font-black mb-1" />
            <span className="text-3xl font-black text-slate-900 tracking-tighter">{stats.avgRate.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400 uppercase ml-1">Avg / sqft</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg lg:text-xl font-black text-slate-900">Unit Master Inventory</h3>
        <div className="bg-white border border-slate-200 p-1 rounded-xl flex gap-1 shadow-sm">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}><LayoutGridIcon size={18} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}><ListIcon size={18} /></button>
        </div>
      </div>

      {project.instruments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200">
          <Building2 className="mx-auto text-slate-100 mb-4" size={56} />
          <h4 className="text-slate-800 font-black">Portfolio Uninitialized</h4>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">Add property units manually to begin tracking inventory flow.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
          {project.instruments.map(inst => {
            const latestStatus = inst.interactions[0]?.status || 'AVAILABLE';
            return (
              <div key={inst.id} onClick={() => { setSelectedInstrument(inst); setIsLogInteractionOpen(true); }} className="bg-white border border-slate-200 p-4 lg:p-5 rounded-2xl cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all text-center group relative active:scale-95">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">{inst.type.charAt(0)}</span>
                </div>
                <p className="text-sm font-black text-slate-900 mb-1 truncate"># {inst.number}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">{inst.type}</p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Activity size={10} className="text-emerald-500" /> {inst.interactions.length} Logs
                </div>
                {inst.interactions.length > 0 && (
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ring-4 ring-white ${latestStatus === EnquiryStatus.SOLD ? 'bg-emerald-500' : latestStatus === EnquiryStatus.BOOKED ? 'bg-amber-500' : 'bg-blue-500'}`} />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[1.5rem] lg:rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unit Entry</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Asking Rate</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.instruments.map(inst => {
                const latestInter = inst.interactions[0];
                return (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900"># {inst.number}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black uppercase tracking-wider">{inst.type}</span></td>
                    <td className="px-6 py-4 font-bold text-slate-600">₹{inst.baseRate.toLocaleString()}</td>
                    <td className="px-6 py-4">{latestInter ? <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border tracking-wider uppercase ${getStatusBadgeClass(latestInter.status)}`}>{latestInter.status}</span> : <span className="text-[9px] font-black text-slate-300 tracking-wider uppercase">AVAILABLE</span>}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setSelectedInstrument(inst); setIsLogInteractionOpen(true); }} className="text-blue-600 hover:text-blue-700 font-black text-xs uppercase tracking-widest hover:underline">Details</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Initialize Unit Modal */}
      {isAddInstrumentOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
            <div className="p-8 lg:p-10">
              <h3 className="text-xl font-black text-slate-900 mb-6">Initialize Inventory Unit</h3>
              <form onSubmit={handleAddInstrument} className="space-y-4">
                <input type="text" required value={newInstrument.number} onChange={e => setNewInstrument({...newInstrument, number: e.target.value})} placeholder="Unit #" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-sm shadow-sm" />
                <select value={newInstrument.type} onChange={e => setNewInstrument({...newInstrument, type: e.target.value as InstrumentType})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-sm bg-white shadow-sm">
                  <option value={InstrumentType.PLOT}>Plot</option>
                  <option value={InstrumentType.FLAT}>Flat</option>
                  <option value={InstrumentType.HOUSE}>House</option>
                </select>
                <input type="number" required value={newInstrument.baseRate || ''} onChange={e => setNewInstrument({...newInstrument, baseRate: Number(e.target.value)})} placeholder="Base Rate" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-sm shadow-sm" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddInstrumentOpen(false)} className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-xl uppercase text-[10px] tracking-widest">Initialize</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Log Interaction Modal */}
      {isLogInteractionOpen && selectedInstrument && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 lg:p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[1.5rem] lg:rounded-[3.5rem] w-full max-w-6xl shadow-2xl overflow-hidden h-[95vh] lg:h-auto lg:max-h-[90vh] flex flex-col">
            <div className="p-5 lg:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-slate-900 leading-tight">Unit Flow: # {selectedInstrument.number}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">{selectedInstrument.type} | Activity Journal</p>
              </div>
              <button onClick={() => setIsLogInteractionOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors bg-white rounded-full shadow-sm"><XIcon size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-12">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-16">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 text-blue-600"><UserPlusIcon size={24} /><h4 className="font-black uppercase tracking-widest text-xs">Manual Activity Log</h4></div>
                  <form onSubmit={handleAddInteraction} className="space-y-6">
                    <div className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" required placeholder="Agent Name" value={newInteraction.agentName} onChange={e => setNewInteraction({...newInteraction, agentName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400 text-sm font-bold bg-white" />
                        <input type="tel" required placeholder="Agent Contact" value={newInteraction.agentPhone} onChange={e => setNewInteraction({...newInteraction, agentPhone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-400 text-sm font-bold bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="text" required placeholder="Client Name" value={newInteraction.customerName} onChange={e => setNewInteraction({...newInteraction, customerName: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-400 text-sm font-bold shadow-sm" />
                      <input type="tel" required placeholder="Client Phone" value={newInteraction.customerPhone} onChange={e => setNewInteraction({...newInteraction, customerPhone: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-400 text-sm font-bold shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="number" required placeholder="Quote Rate" value={newInteraction.offeredRate || ''} onChange={e => setNewInteraction({...newInteraction, offeredRate: Number(e.target.value)})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-400 text-sm font-black shadow-sm" />
                      <select value={newInteraction.status} onChange={e => setNewInteraction({...newInteraction, status: e.target.value as EnquiryStatus})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-400 text-sm font-bold bg-white shadow-sm">
                        <option value={EnquiryStatus.ACTIVE}>Active Inquiry</option>
                        <option value={EnquiryStatus.BOOKED}>Booking Locked</option>
                        <option value={EnquiryStatus.SOLD}>Asset Sold</option>
                      </select>
                    </div>
                    <textarea rows={2} value={newInteraction.notes} onChange={e => setNewInteraction({...newInteraction, notes: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-400 text-sm font-medium resize-none shadow-sm" placeholder="Key observations..." />
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 shadow-xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"><PlusIcon size={20} /><span className="uppercase tracking-[0.2em] text-[10px]">Commit Journal Entry</span></button>
                  </form>
                </div>

                <div className="bg-slate-50/50 rounded-[2.5rem] p-6 lg:p-10 border border-slate-100 flex flex-col h-full">
                  <div className="flex items-center gap-3 text-slate-700 mb-8"><HistoryIcon size={24} className="text-indigo-600" /><h4 className="font-black uppercase tracking-widest text-xs">Lifecycle Journal</h4></div>
                  <div className="space-y-5 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {selectedInstrument.interactions.length === 0 ? (
                      <div className="text-center py-20"><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No history recorded yet.</p></div>
                    ) : (
                      selectedInstrument.interactions.map(log => (
                        <div key={log.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative group">
                          {role === UserRole.ADMIN && (
                            <button onClick={() => deleteInteraction(log.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                          )}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <h5 className="font-black text-slate-900 text-sm lg:text-base leading-none">{log.customerName}</h5>
                                <span className={`text-[8px] font-black border px-2 py-0.5 rounded-full uppercase leading-none tracking-wider ${getStatusBadgeClass(log.status)}`}>{log.status}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5"><PhoneIcon size={12} /> {log.customerPhone}</p>
                            </div>
                            <div className="text-right"><p className="text-sm font-black text-emerald-600 leading-none mb-1">₹{log.offeredRate.toLocaleString()}</p></div>
                          </div>
                          
                          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center justify-between mb-4">
                            <div><p className="text-[8px] text-indigo-400 font-black uppercase mb-1">Handled By</p><p className="text-xs font-black text-slate-800">{log.agentName}</p></div>
                            <p className="text-[10px] text-slate-400 font-bold">{log.agentPhone}</p>
                          </div>

                          {role === UserRole.ADMIN ? (
                            <div className="flex gap-2 mb-4">
                              {Object.values(EnquiryStatus).map(s => (
                                <button key={s} onClick={() => updateInteractionStatus(log.id, s)} className={`flex-1 text-[8px] py-1.5 rounded-lg border transition-all font-black uppercase tracking-tighter ${log.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{s}</button>
                              ))}
                            </div>
                          ) : (
                            <div className="mb-4 text-[9px] font-black text-slate-400 uppercase italic">Entry Locked for Non-Admins</div>
                          )}
                          
                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300">
                            <span>Logged Timeline</span><span>{new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
