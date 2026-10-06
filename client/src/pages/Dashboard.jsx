import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StickyNote, Link2, FileText, Plus, Bot } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import ContentCard from '../components/ContentCard';
import AIChatPanel from '../components/AIChatPanel';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ notes: 0, links: 0, documents: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you'd likely have a specific /dashboard endpoint
        // For now, we'll simulate it by fetching lists and getting counts
        const [notesRes, linksRes, docsRes] = await Promise.all([
          api.get('/notes?limit=2').catch(() => ({ data: { items: [], total: 0 } })),
          api.get('/links?limit=2').catch(() => ({ data: { items: [], total: 0 } })),
          api.get('/documents?limit=2').catch(() => ({ data: { items: [], total: 0 } }))
        ]);

        setStats({
          notes: notesRes.data.total || 0,
          links: linksRes.data.total || 0,
          documents: docsRes.data.total || 0
        });

        // Combine and sort recent items
        const combined = [
          ...(notesRes.data.items || []).map(item => ({ ...item, type: 'note' })),
          ...(linksRes.data.items || []).map(item => ({ ...item, type: 'link' })),
          ...(docsRes.data.items || []).map(item => ({ ...item, type: 'document' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

        setRecentItems(combined);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, count, icon: Icon, color, delay }) => (
    <div className={`glass-card p-6 rounded-2xl animate-slide-up flex items-center gap-4 border border-white/10`} style={{ animationDelay: delay }}>
      <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-white/60 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">
          {loading ? <span className="inline-block w-12 h-8 bg-white/10 animate-pulse rounded" /> : count}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden animate-slide-up border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.username}</span> 👋
          </h1>
          <p className="text-white/70 max-w-xl">
            Here's what's happening in your Second Brain today. You have captured {stats.notes + stats.links + stats.documents} items so far.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <Link to="/notes" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Note
            </Link>
            <Link to="/links" className="btn-secondary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Save Link
            </Link>
            <Link to="/documents" className="btn-secondary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Doc
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Notes" count={stats.notes} icon={StickyNote} color="bg-brand-500 text-brand-400" delay="100ms" />
        <StatCard title="Saved Links" count={stats.links} icon={Link2} color="bg-emerald-500 text-emerald-400" delay="200ms" />
        <StatCard title="Documents" count={stats.documents} icon={FileText} color="bg-amber-500 text-amber-400" delay="300ms" />
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recently Added</h2>
          <Link to="/notes" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View all</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="glass-card h-[250px] rounded-xl animate-pulse bg-white/5" />
             ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item, idx) => (
              <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <ContentCard 
                  item={item} 
                  type={item.type}
                  onEdit={() => {}} // Stubbed for dashboard
                  onDelete={() => {}} 
                  onShare={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel py-16 text-center rounded-2xl border border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl" role="img" aria-label="empty">📭</span>
            </div>
            <h3 className="text-lg font-medium mb-2">It's quiet here</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">You haven't saved anything yet. Start building your knowledge base.</p>
            <Link to="/notes" className="btn-primary inline-flex">Create your first note</Link>
          </div>
        )}
      </div>

      {/* Floating AI Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-brand text-white shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all z-40 group"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-surface-100 text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
          Ask AI
        </span>
      </button>

      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Dashboard;
