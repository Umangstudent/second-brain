import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, User, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AdminModal from './AdminModal';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  return (
    <>
      <nav className="sticky top-0 z-50 glass-panel px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-6 h-6 text-white/90" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="brain">🧠</span>
            <span className="text-xl font-bold text-gradient hidden sm:block">Second Brain</span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search across your brain..."
              className="input-field pl-10 bg-white/5 border-white/5 group-focus-within:bg-white/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {isAdmin && (
            <button
              onClick={() => setShowAdminModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 transition-colors text-xs font-semibold shadow-sm"
              title="Open Admin Control Panel"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}

          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium hidden sm:block">{user?.username || 'User'}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl py-2 shadow-2xl animate-scale-in origin-top-right z-50">
              <div className="px-4 py-2 border-b border-white/10 mb-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{user?.username}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase ${
                    isAdmin ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-white/10 text-white/50'
                  }`}>
                    {user?.role || 'user'}
                  </span>
                </div>
                <p className="text-xs text-white/60 truncate">{user?.email || 'user@example.com'}</p>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => { setShowDropdown(false); setShowAdminModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-400 hover:bg-brand-500/10 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin Panel
                </button>
              )}

              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <User className="w-4 h-4" /> Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button 
                onClick={() => { setShowDropdown(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-400/10 transition-colors mt-2 border-t border-white/10 pt-3"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </>
  );
};

export default Navbar;
