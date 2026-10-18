import { StickyNote, Link2, FileText, Share2, Edit2, Trash2, Globe, Download, ExternalLink } from 'lucide-react';
import TagBadge from './TagBadge';

const ContentCard = ({ item, type, onEdit, onDelete, onShare }) => {
  const config = {
    note: { icon: StickyNote, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    link: { icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    document: { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  }[type] || { icon: StickyNote, color: 'text-brand-400', bg: 'bg-brand-500/10' };

  const Icon = config.icon;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="glass-card rounded-xl p-5 group hover:scale-[1.02] transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${config.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="flex items-start justify-between mb-3 z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <h3 className="font-semibold text-white/90 truncate text-lg">{item.title}</h3>
        </div>
        {item.isShared && (
          <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" title="Shared publicly" />
        )}
      </div>

      <div className="flex-1 z-10 mb-4">
        {type === 'link' && item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-400 hover:underline mb-2 block truncate">
            {item.url}
          </a>
        )}

        {type === 'document' && (
          <div className="mb-3 flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="truncate text-xs">
                <span className="text-white/80 font-medium truncate block">{item.originalName || item.title}</span>
                {item.fileSize && (
                  <span className="text-white/40">{formatFileSize(item.fileSize)}</span>
                )}
              </div>
            </div>
            {item.fileUrl && (
              <a 
                href={item.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                download
                className="px-2.5 py-1 text-xs rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1 transition-colors flex-shrink-0"
                title="View / Download file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open</span>
              </a>
            )}
          </div>
        )}

        <p className="text-white/60 text-sm line-clamp-3 leading-relaxed">
          {item.content || item.description || 'No preview available.'}
        </p>
      </div>

      <div className="mt-auto z-10 flex flex-col gap-4">
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded-full border border-white/5">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-xs text-white/40">
            {new Date(item.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); onShare(item); }}
              className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              className="p-1.5 hover:bg-brand-500/20 rounded-md text-white/60 hover:text-brand-400 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
              className="p-1.5 hover:bg-rose-500/20 rounded-md text-white/60 hover:text-rose-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
