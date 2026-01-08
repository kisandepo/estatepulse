
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  FileSpreadsheet, 
  ShieldCheck, 
  ShieldAlert,
  Building2,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  onExport: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onExport, isOpen, onClose }) => {
  const links = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/search", icon: Search, label: "Advanced Search" },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0
      transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between text-white mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50">
              <Building2 size={20} />
            </div>
            <span className="text-xl font-black tracking-tight">EstatePulse</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <link.icon size={20} />
              <span className="font-bold">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-6">
        <button
          onClick={() => {
            onExport();
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl transition-all active:scale-95 border border-slate-700/50"
        >
          <FileSpreadsheet size={20} className="text-emerald-500" />
          <span className="font-bold text-sm">Download Report</span>
        </button>

        <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            {role === UserRole.ADMIN ? (
              <ShieldCheck size={16} className="text-blue-400" />
            ) : (
              <ShieldAlert size={16} className="text-amber-400" />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
              Access Tier
            </span>
          </div>
          <p className="text-sm font-bold text-white mb-1">{role}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {role === UserRole.ADMIN 
              ? "Full administrative control enabled."
              : "Showing log and inventory viewing access."}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
