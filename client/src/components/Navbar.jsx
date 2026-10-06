import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
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

      <div className="flex items-center gap-4 relative">
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
          <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl py-2 shadow-2xl animate-scale-in origin-top-right">
            <div className="px-4 py-2 border-b border-white/10 mb-2">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-white/60 truncate">{user?.email || 'user@example.com'}</p>
            </div>
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
  );
};

export default Navbar;
