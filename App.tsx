
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle,
  Menu,
  X
} from 'lucide-react';
import { Project, User, UserRole } from './types';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import GlobalSearch from './components/GlobalSearch';
import Sidebar from './components/Sidebar';
import { exportToExcel } from './services/excelService';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>({
    name: "Admin User",
    role: UserRole.ADMIN,
    phone: "1234567890"
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('estate_projects');
    return saved ? JSON.parse(saved) : [];
  });

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

  const handleRoleToggle = () => {
    setCurrentUser(prev => ({
      ...prev,
      role: prev.role === UserRole.ADMIN ? UserRole.EDITOR : UserRole.ADMIN,
      name: prev.role === UserRole.ADMIN ? "Agent Alex" : "Admin User",
      phone: prev.role === UserRole.ADMIN ? "9876543210" : "1234567890"
    }));
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
              <button 
                onClick={handleRoleToggle}
                className={`text-[10px] lg:text-xs font-bold px-2 lg:px-3 py-1 lg:py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  currentUser.role === UserRole.ADMIN 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <span className="hidden xs:inline">Switch to </span>
                {currentUser.role === UserRole.ADMIN ? 'Editor' : 'Admin'}
              </button>
              
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[100px]">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{currentUser.role}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                  <UserCircle className="text-slate-400" size={20} />
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
