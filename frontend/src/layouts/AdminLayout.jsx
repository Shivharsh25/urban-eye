import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import { 
  Eye, 
  LogOut, 
  LayoutDashboard, 
  Settings,
  Users,
  Activity,
  Menu,
  X,
  Bell
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const s = getSocket();
    setSocketConnected(s.connected);
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: Activity },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#090d16] overflow-hidden text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full z-50 glass-panel border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-lg text-white tracking-tight">Urban EYE Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:w-64 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Area */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800/60 mt-12 lg:mt-0 px-6">
          <Link to="/admin" className="flex items-center space-x-3 group w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Eye className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <span className="block text-lg font-bold tracking-tight text-white leading-tight">Urban EYE</span>
              <span className="block text-[10px] text-cyan-400 font-mono tracking-widest">COMMAND CENTER</span>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.disabled ? '#' : item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-2 border-cyan-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
                }
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-slate-200 truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-2">
            <span className="relative flex h-2 w-2">
              {socketConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={`text-[10px] font-mono font-bold ${socketConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {socketConnected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#090d16] mt-16 lg:mt-0 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        {children}
      </main>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
