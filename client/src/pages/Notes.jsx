import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, X } from 'lucide-react';
import api from '../api/axios';
import ContentCard from '../components/ContentCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ShareModal from '../components/ShareModal';
import TagBadge from '../components/TagBadge';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [availableTags, setAvailableTags] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ title: '', content: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string
      const query = new URLSearchParams({
        page: currentPage,
        limit: 9,
        sort: sortBy
      });
      if (searchQuery) query.append('q', searchQuery);
      if (activeTags.length) query.append('tags', activeTags.join(','));

      // In a real app, you might have these endpoints
      // Fallback to empty array if endpoints don't exist yet
      try {
        const res = await api.get(`/notes?${query.toString()}`);
        setNotes(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        
        // Extract unique tags for the filter
        const allTags = new Set([...availableTags]);
        (res.data.items || []).forEach(item => {
          (item.tags || []).forEach(t => allTags.add(t));
        });
        setAvailableTags(Array.from(allTags));
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("Notes endpoint not found, using empty state");
          setNotes([]);
        } else throw err;
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeTags, sortBy]); // Removed availableTags to prevent infinite loop

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTags, sortBy]);

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({ title: note.title, content: note.content, tags: note.tags || [] });
    } else {
      setEditingNote(null);
      setFormData({ title: '', content: '', tags: [] });
    }
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
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

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, formData);
      } else {
        await api.post('/notes', formData);
      }
      handleCloseModal();
      fetchNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${id}`);
        fetchNotes();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleToggleShare = async (id, isShared) => {
    try {
      await api.patch(`/notes/${id}/share`, { isShared });
      // Update local state
      setNotes(notes.map(n => n._id === id ? { ...n, isShared } : n));
      if (shareItem && shareItem._id === id) {
        setShareItem({ ...shareItem, isShared });
      }
    } catch (error) {
      console.error('Failed to toggle share status:', error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-white/60 text-sm mt-1">Capture your thoughts and ideas</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-5 h-5" /> New Note
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
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card h-[280px] rounded-xl animate-pulse bg-white/5 border-white/5" />
          ))}
        </div>
      ) : notes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, idx) => (
              <div key={note._id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <ContentCard 
                  item={note} 
                  type="note"
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                  onShare={setShareItem}
                />
              </div>
            ))}
          </div>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </>
      ) : (
        <div className="glass-panel py-20 text-center rounded-2xl border border-white/10 animate-fade-in">
          <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
            <span className="text-3xl" role="img" aria-label="memo">📝</span>
          </div>
          <h3 className="text-xl font-medium mb-2">No notes found</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">
            {searchQuery || activeTags.length > 0 
              ? "We couldn't find any notes matching your current filters."
              : "You haven't created any notes yet. Jot down your first brilliant idea!"}
          </p>
          {(searchQuery || activeTags.length > 0) ? (
            <button onClick={() => { setSearchQuery(''); setActiveTags([]); }} className="text-brand-400 hover:text-brand-300">
              Clear filters
            </button>
          ) : (
             <button onClick={() => handleOpenModal()} className="btn-primary">Create a Note</button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm animate-fade-in" onClick={handleCloseModal} />
          <div className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">{editingNote ? 'Edit Note' : 'Create Note'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="note-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Note Title"
                    className="w-full bg-transparent text-2xl font-semibold text-white placeholder-white/30 focus:outline-none border-none p-0"
                    autoFocus
                  />
                </div>
                
                <div className="h-[1px] w-full bg-white/10 my-2" />

                <div>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note here... (Markdown supported)"
                    className="w-full h-64 bg-transparent text-white/90 placeholder-white/30 focus:outline-none border-none p-0 resize-none font-mono text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <TagBadge key={tag} tag={tag} variant="interactive" onRemove={handleRemoveTag} />
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
                form="note-form"
                disabled={isSubmitting || !formData.title.trim()}
                className="btn-primary py-2 px-6 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal 
        isOpen={!!shareItem} 
        onClose={() => setShareItem(null)} 
        item={shareItem}
        onToggleShare={handleToggleShare}
      />
    </div>
  );
};

export default Notes;
