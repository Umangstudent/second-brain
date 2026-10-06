import { X } from 'lucide-react';

const TagBadge = ({ tag, onRemove, variant = 'default' }) => {
  if (variant === 'interactive') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30">
        #{tag}
        {onRemove && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
            className="p-0.5 hover:bg-brand-500/30 rounded-sm transition-colors ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  }

  return (
    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80 transition-colors cursor-default">
      #{tag}
    </span>
  );
};

export default TagBadge;
