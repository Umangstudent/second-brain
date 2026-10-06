import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, StickyNote, Link2, FileText, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import TagBadge from '../components/TagBadge';

const SharedView = () => {
  const { hash } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedItem = async () => {
      try {
        // Normally this would be a public endpoint that doesn't require auth
        const res = await api.get(`/share/${hash}`);
        setItem(res.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'This link is invalid or has expired.' : 'Failed to load content.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItem();
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-white">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-white/60">Loading shared content...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border border-white/10 animate-fade-in">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Content Not Found</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Link to="/" className="btn-primary inline-flex">Go to Second Brain</Link>
        </div>
      </div>
    );
  }

  const getTypeConfig = (type) => {
    switch(type) {
      case 'note': return { icon: StickyNote, color: 'text-brand-400', bg: 'bg-brand-500/10', label: 'Note' };
      case 'link': return { icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Link' };
      case 'document': return { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Document' };
      default: return { icon: StickyNote, color: 'text-brand-400', bg: 'bg-brand-500/10', label: 'Content' };
    }
  };

  const config = getTypeConfig(item.type);
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-brand-500/30">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none" />
      
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 pt-12 sm:pt-20 z-10">
        <div className="mb-6 flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium ${config.bg} ${config.color}`}>
            <Icon className="w-4 h-4" /> {config.label}
          </div>
          <span className="text-white/40 text-sm">
            {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
          {item.title}
        </h1>

        {item.type === 'link' && item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-brand-400 hover:text-brand-300 transition-colors mb-8 border border-white/10">
            <Link2 className="w-4 h-4" /> Visit Link
          </a>
        )}

        <div className="glass-card rounded-2xl p-6 sm:p-10 min-h-[300px] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-a:text-brand-400 prose-headings:text-white/90 relative z-10 font-sans">
            {item.type === 'note' ? (
              <ReactMarkdown>{item.content || '*No content*'}</ReactMarkdown>
            ) : (
              <p className="text-white/80 whitespace-pre-wrap">{item.description || item.content || 'No description available.'}</p>
            )}
          </div>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </main>

      <footer className="py-8 text-center z-10 border-t border-white/10 mt-12 bg-surface-50/50 backdrop-blur-md">
        <Link to="/" className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors group">
          <span className="text-xl" role="img" aria-label="brain">🧠</span>
          <span className="font-medium">Powered by Second Brain</span>
        </Link>
      </footer>
    </div>
  );
};

export default SharedView;
