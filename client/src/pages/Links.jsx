import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, X, Link as LinkIcon, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import ContentCard from '../components/ContentCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ShareModal from '../components/ShareModal';
import TagBadge from '../components/TagBadge';

const Links = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [availableTags, setAvailableTags] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', url: '', description: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState('');

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 9,
        sort: sortBy
      });
      if (searchQuery) query.append('q', searchQuery);
      if (activeTags.length) query.append('tags', activeTags.join(','));

      try {
        const res = await api.get(`/links?${query.toString()}`);
        setLinks(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        
        const allTags = new Set([...availableTags]);
        (res.data.items || []).forEach(item => {
          (item.tags || []).forEach(t => allTags.add(t));
        });
        setAvailableTags(Array.from(allTags));
      } catch (err) {
        if (err.response?.status === 404) {
          setLinks([]);
        } else throw err;
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeTags, sortBy]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTags, sortBy]);

  const handleOpenModal = (link = null) => {
    if (link) {
      setEditingLink(link);
      setFormData({ title: link.title, url: link.url, description: link.description || '', tags: link.tags || [] });
    } else {
      setEditingLink(null);
      setFormData({ title: '', url: '', description: '', tags: [] });
    }
    setTagInput('');
    setUrlError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUrlError('');
    
    if (!formData.title.trim()) return;
    
    let submitUrl = formData.url.trim();
    if (!submitUrl) {
        setUrlError('URL is required');
        return;
    }
    
    if (!submitUrl.startsWith('http://') && !submitUrl.startsWith('https://')) {
        submitUrl = `https://${submitUrl}`;
    }

    if (!validateUrl(submitUrl)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, url: submitUrl };
      if (editingLink) {
        await api.put(`/links/${editingLink._id}`, payload);
      } else {
        await api.post('/links', payload);
      }
      handleCloseModal();
      fetchLinks();
    } catch (error) {
      console.error('Failed to save link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await api.delete(`/links/${id}`);
        fetchLinks();
      } catch (error) {
        console.error('Failed to delete link:', error);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Links</h1>
          <p className="text-white/60 text-sm mt-1">Bookmarks, articles, and resources</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Save Link
        </button>
      </div>

      <SearchBar 
        onSearch={setSearchQuery} 
        onTagFilter={setActiveTags} 
        onSort={setSortBy}
        availableTags={availableTags}
        activeFilters={activeTags}
      />

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="glass-card h-[280px] rounded-xl animate-pulse bg-white/5 border-white/5" />
           ))}
         </div>
      ) : links.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link, idx) => (
              <div key={link._id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <ContentCard 
                  item={link} 
                  type="link"
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                  onShare={setShareItem}
                />
              </div>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="glass-panel py-20 text-center rounded-2xl border border-white/10 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <LinkIcon className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No links found</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">Save articles, videos, and websites to read later.</p>
          <button onClick={() => handleOpenModal()} className="btn-primary bg-emerald-500 shadow-emerald-500/25 hover:shadow-emerald-500/40 from-emerald-500 to-emerald-600">
            Save a Link
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm animate-fade-in" onClick={handleCloseModal} />
          <div className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl animate-scale-in flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">{editingLink ? 'Edit Link' : 'Save Link'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="link-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">URL</label>
                  <div className="relative group">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                      type="text" 
                      value={formData.url}
                      onChange={(e) => {
                          setFormData(prev => ({ ...prev, url: e.target.value }));
                          setUrlError('');
                      }}
                      placeholder="https://example.com"
                      className={`input-field pl-9 bg-white/5 ${urlError ? 'border-rose-500/50 focus:ring-rose-500/50' : ''}`}
                      autoFocus
                    />
                  </div>
                  {urlError && <p className="text-rose-400 text-xs mt-1">{urlError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Link title"
                    className="input-field bg-white/5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What is this about?"
                    className="input-field bg-white/5 resize-none h-24 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <TagBadge key={tag} tag={tag} variant="interactive" onRemove={(t) => setFormData(p => ({...p, tags: p.tags.filter(x => x !== t)}))} />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags... (Press Enter)"
                    className="input-field py-2 text-sm bg-white/5"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-surface-50/50 rounded-b-2xl">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                form="link-form"
                disabled={isSubmitting || !formData.title.trim() || !formData.url.trim()}
                className="btn-primary py-2 px-6 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal isOpen={!!shareItem} onClose={() => setShareItem(null)} item={shareItem} onToggleShare={async (id, isShared) => {
           await api.patch(`/links/${id}/share`, { isShared });
           setLinks(links.map(n => n._id === id ? { ...n, isShared } : n));
           setShareItem({ ...shareItem, isShared });
      }} />
    </div>
  );
};

export default Links;
