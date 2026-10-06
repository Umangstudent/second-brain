import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import TagBadge from './TagBadge';

const SearchBar = ({ onSearch, onTagFilter, onSort, availableTags = [], activeFilters = [] }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const toggleTag = (tag) => {
    if (activeFilters.includes(tag)) {
      onTagFilter(activeFilters.filter(t => t !== tag));
    } else {
      onTagFilter([...activeFilters, tag]);
    }
  };

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-brand-400 transition-colors" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, content, or links..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-lg"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 rounded-xl flex items-center gap-2 border transition-all ${
            showFilters || activeFilters.length > 0 
              ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' 
              : 'glass-card text-white/70 hover:text-white'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="glass-panel p-4 rounded-xl animate-slide-up border border-white/10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="text-sm font-medium text-white/80">Filter by Tags</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50">Sort by:</span>
              <select 
                onChange={(e) => onSort(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableTags.length === 0 ? (
              <p className="text-sm text-white/40 italic">No tags available yet.</p>
            ) : (
              availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                    activeFilters.includes(tag)
                      ? 'bg-brand-500/30 border-brand-500/50 text-brand-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  #{tag}
                </button>
              ))
            )}
          </div>
          
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => onTagFilter([])}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
