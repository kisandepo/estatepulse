
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { Project, User, UserRole } from './types';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import GlobalSearch from './components/GlobalSearch';
import Sidebar from './components/Sidebar';
import { exportToExcel } from './services/excelService';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Default to EDITOR. No toggle button is provided in the UI.
  const [currentUser, setCurrentUser] = useState<User>({
    name: "Guest Editor",
    role: UserRole.EDITOR
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('estate_projects');
    return saved ? JSON.parse(saved) : [];
  });

  // Role Logic: Check for a secret URL parameter to enable Admin mode for the owner
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') {
      setCurrentUser({
        name: "Owner / Admin",
        role: UserRole.ADMIN,
        phone: "Master Access"
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('estate_projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Project) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setProjects(prev => [project, ...prev]);
  };

  const deleteProject = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleExport = () => {
    exportToExcel(projects);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar 
          role={currentUser.role} 
          onExport={handleExport} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30">
            <div className="flex items-center gap-3 lg:gap-4">
              <button 
                onClick={toggleSidebar}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-900 lg:hidden"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-lg lg:text-xl font-bold text-slate-800 truncate">EstatePulse</h1>
              <div className="hidden sm:block h-4 w-[1px] bg-slate-200 mx-1 lg:mx-2" />
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              {currentUser.role === UserRole.ADMIN && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 animate-pulse">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Admin Mode</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">
                    {currentUser.role === UserRole.ADMIN ? 'Primary Owner' : 'Verified Editor'}
                  </p>
                </div>
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border transition-colors ${
                  currentUser.role === UserRole.ADMIN ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <UserCircle size={currentUser.role === UserRole.ADMIN ? 24 : 20} />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
            <Routes>
              <Route path="/" element={
                <ProjectList 
                  projects={projects} 
                  role={currentUser.role} 
                  currentUser={currentUser}
                  onAddProject={addProject}
                  onDeleteProject={deleteProject}
                  onUpdateProject={updateProject}
                />
              } />
              <Route path="/project/:id" element={
                <ProjectDetails 
                  projects={projects} 
                  role={currentUser.role} 
                  currentUser={currentUser}
                  onUpdateProject={updateProject}
                />
              } />
              <Route path="/search" element={
                <GlobalSearch projects={projects} />
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
