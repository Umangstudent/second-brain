import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, StickyNote, Link2, FileText, Bot, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/notes', label: 'Notes', icon: StickyNote },
  { path: '/links', label: 'Links', icon: Link2 },
  { path: '/documents', label: 'Documents', icon: FileText },
];

const Sidebar = ({ isOpen, onToggle, mobileIsOpen, onMobileClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileIsOpen && (
        <div 
          className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-50 glass-panel border-r border-white/10 border-t-0 border-b-0 border-l-0 flex flex-col transition-all duration-300 ${
          mobileIsOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        } md:translate-x-0 ${isOpen ? 'md:w-64' : 'md:w-20'}`}
      >
        <div className="p-4 flex items-center justify-between md:hidden">
          <span className="font-bold text-gradient">Menu</span>
          <button onClick={onMobileClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'bg-brand-500/20 text-brand-400' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                title={!isOpen ? item.label : undefined}
                onClick={() => mobileIsOpen && onMobileClose()}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-white/50 group-hover:text-white/90 transition-colors'}`} />
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${!isOpen && 'md:opacity-0 md:hidden'} ${!mobileIsOpen && 'opacity-0 md:opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div className="my-6 border-t border-white/10" />

          <button
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-purple-500/20 hover:text-purple-400 transition-all group relative`}
            title={!isOpen ? "AI Assistant" : undefined}
          >
            <Bot className="w-5 h-5 flex-shrink-0 text-purple-400" />
            <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${!isOpen && 'md:opacity-0 md:hidden'} ${!mobileIsOpen && 'opacity-0 md:opacity-100'}`}>
              AI Assistant
            </span>
          </button>
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!isOpen && 'md:opacity-0 md:w-0'}`}>
             <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-medium flex-shrink-0">
               {user?.username?.charAt(0).toUpperCase() || 'U'}
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{user?.username || 'User'}</span>
                <span className="text-xs text-brand-400 truncate">Pro Plan</span>
             </div>
          </div>
          <button 
            onClick={onToggle}
            className="hidden md:flex p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
