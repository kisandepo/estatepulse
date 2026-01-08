
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Building2, 
  Trash2, 
  Calendar, 
  ChevronRight, 
  UserPlus, 
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
  Tag
} from 'lucide-react';
import { Project, UserRole, User, EnquiryStatus, Interaction, Instrument } from '../types';

interface ProjectListProps {
  projects: Project[];
  role: UserRole;
  currentUser: User;
  onAddProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (p: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  role, 
  currentUser, 
  onAddProject, 
  onDeleteProject,
  onUpdateProject 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    description: ''
  });

  const [enrollment, setEnrollment] = useState({
    projectId: '',
    unitId: '',
    agentName: '',
    agentPhone: '',
    customerName: '',
    customerPhone: '',
    offeredRate: 0,
    status: EnquiryStatus.ACTIVE,
    notes: ''
  });

  const availableUnits = useMemo(() => {
    if (!enrollment.projectId) return [];
    const proj = projects.find(p => p.id === enrollment.projectId);
    return proj ? proj.instruments : [];
  }, [enrollment.projectId, projects]);

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === enrollment.projectId);
    if (!project || !enrollment.unitId) return;

    const interaction: Interaction = {
      id: crypto.randomUUID(),
      agentName: enrollment.agentName,
      agentPhone: enrollment.agentPhone,
      customerName: enrollment.customerName,
      customerPhone: enrollment.customerPhone,
      offeredRate: enrollment.offeredRate,
      status: enrollment.status,
      date: new Date().toISOString(),
      notes: enrollment.notes
    };

    const updatedInstruments = project.instruments.map(inst => 
      inst.id === enrollment.unitId 
        ? { ...inst, interactions: [interaction, ...inst.interactions] }
        : inst
    );

    onUpdateProject({ ...project, instruments: updatedInstruments });
    setEnrollmentSuccess(true);
    
    setEnrollment({
      projectId: '',
      unitId: '',
      agentName: '',
      agentPhone: '',
      customerName: '',
      customerPhone: '',
      offeredRate: 0,
      status: EnquiryStatus.ACTIVE,
      notes: ''
    });
    
    setTimeout(() => setEnrollmentSuccess(false), 4000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== UserRole.ADMIN) return;
    if (!newProject.name || !newProject.location) return;

    const project: Project = {
      id: crypto.randomUUID(),
      name: newProject.name,
      location: newProject.location,
      description: newProject.description,
      instruments: [],
      createdAt: new Date().toISOString()
    };

    onAddProject(project);
    setIsModalOpen(false);
    setNewProject({ name: '', location: '', description: '' });
  };

  return (
    <div className="max-w-[1500px] mx-auto h-full pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        
        {/* LEFT Section: Customer Enrollment */}
        <div className="flex flex-col lg:sticky lg:top-0">
          <div className="mb-4 lg:mb-6 px-1">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="text-blue-600" size={24} />
              Enroll Customer
            </h2>
            <p className="text-xs lg:text-sm text-slate-500 font-medium italic">Log interactions to the master inventory.</p>
          </div>

          <div className="bg-white rounded-[1.5rem] lg:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-5 lg:p-10 flex flex-col">
            {enrollmentSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-emerald-800 leading-tight">Interaction Recorded!</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Master data updated.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleEnrollmentSubmit} className="space-y-5 lg:space-y-6">
              <div className="bg-slate-50 p-4 lg:p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="text-blue-600" size={16} />
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Agent Identification</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Agent Name"
                    value={enrollment.agentName}
                    onChange={e => setEnrollment({...enrollment, agentName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-bold bg-white shadow-sm"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Agent Phone"
                    value={enrollment.agentPhone}
                    onChange={e => setEnrollment({...enrollment, agentPhone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-bold bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      required
                      value={enrollment.projectId}
                      onChange={e => setEnrollment({...enrollment, projectId: e.target.value, unitId: ''})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-bold bg-white appearance-none shadow-sm"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      required
                      disabled={!enrollment.projectId}
                      value={enrollment.unitId}
                      onChange={e => setEnrollment({...enrollment, unitId: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-bold bg-white appearance-none disabled:opacity-50 shadow-sm"
                    >
                      <option value="">Select Unit</option>
                      {availableUnits.map(u => (
                        <option key={u.id} value={u.id}># {u.number} ({u.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={enrollment.customerName}
                    onChange={e => setEnrollment({...enrollment, customerName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-medium shadow-sm"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Customer Phone"
                    value={enrollment.customerPhone}
                    onChange={e => setEnrollment({...enrollment, customerPhone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-medium shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</div>
                    <input
                      type="number"
                      required
                      placeholder="Offered Rate"
                      value={enrollment.offeredRate || ''}
                      onChange={e => setEnrollment({...enrollment, offeredRate: Number(e.target.value)})}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-bold shadow-sm"
                    />
                  </div>
                  <select 
                    required
                    value={enrollment.status}
                    onChange={e => setEnrollment({...enrollment, status: e.target.value as EnquiryStatus})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-bold bg-white shadow-sm"
                  >
                    <option value={EnquiryStatus.ACTIVE}>Active Enquiry</option>
                    <option value={EnquiryStatus.BOOKED}>Booked</option>
                    <option value={EnquiryStatus.SOLD}>Sold</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder="Additional notes..."
                  value={enrollment.notes}
                  onChange={e => setEnrollment({...enrollment, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none transition-all text-sm font-medium resize-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group active:scale-[0.98]"
              >
                <span className="text-sm uppercase tracking-widest">Commit Entry</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT Section: Project Portfolio */}
        <div className="flex flex-col h-full lg:pt-0 pt-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6 px-1">
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Building2 className="text-indigo-600" size={24} />
                Real Estate Portfolio
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 font-medium italic">Active project master records.</p>
            </div>
            
            {role === UserRole.ADMIN && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center active:scale-95"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-10 lg:p-20 flex flex-col items-center justify-center text-center">
                <Building2 className="text-slate-200 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-400 mb-1">Portfolio Empty</h3>
                <p className="text-xs text-slate-400 mb-6">Start by adding a project to the master list.</p>
                {role === UserRole.ADMIN && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 font-black hover:underline px-6 py-2 bg-blue-50 rounded-full text-xs uppercase"
                  >
                    Add Project
                  </button>
                )}
              </div>
            ) : (
              projects.map((project) => (
                <Link 
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="group bg-white rounded-2xl lg:rounded-3xl border border-slate-200 p-5 lg:p-6 hover:border-blue-400 transition-all shadow-sm hover:shadow-xl block relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded">Master Inventory</span>
                      </div>
                      <h3 className="text-lg lg:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-bold">
                        <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end justify-between min-h-[60px] lg:min-h-[80px]">
                      {role === UserRole.ADMIN && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm('Delete project? All unit data will be lost.')) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="p-1.5 text-slate-200 hover:text-red-500 transition-colors bg-slate-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-3 lg:gap-4 group-hover:bg-blue-50 transition-all">
                        <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Units</p>
                          <p className="text-base font-black text-slate-800 leading-none">{project.instruments.length}</p>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400 pt-4 border-t border-slate-50">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5 ml-auto text-emerald-500"><Clock size={12} /> Live</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-8 lg:p-10">
              <h3 className="text-xl font-black text-slate-900 mb-6">New Portfolio Entry</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    placeholder="e.g. Sapphire Gardens"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Location</label>
                  <input
                    type="text"
                    required
                    value={newProject.location}
                    onChange={e => setNewProject({...newProject, location: e.target.value})}
                    placeholder="e.g. Mumbai, IN"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Brief Description</label>
                  <textarea
                    rows={2}
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none font-medium text-sm"
                    placeholder="Core highlights..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-300 uppercase text-[10px] tracking-widest"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
