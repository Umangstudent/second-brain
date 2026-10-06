import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Loader2, X, UploadCloud, FileText as FileIcon } from 'lucide-react';
import api from '../api/axios';
import ContentCard from '../components/ContentCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ShareModal from '../components/ShareModal';
import TagBadge from '../components/TagBadge';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [availableTags, setAvailableTags] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: currentPage, limit: 9, sort: sortBy });
      if (searchQuery) query.append('q', searchQuery);
      if (activeTags.length) query.append('tags', activeTags.join(','));

      try {
        const res = await api.get(`/documents?${query.toString()}`);
        setDocuments(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        
        const allTags = new Set([...availableTags]);
        (res.data.items || []).forEach(item => {
          (item.tags || []).forEach(t => allTags.add(t));
        });
        setAvailableTags(Array.from(allTags));
      } catch (err) {
        if (err.response?.status === 404) setDocuments([]);
        else throw err;
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeTags, sortBy]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleOpenModal = () => {
    setTitle('');
    setTags([]);
    setTagInput('');
    setFile(null);
    setIsModalOpen(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!title) setTitle(e.dataTransfer.files[0].name.split('.')[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name.split('.')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (tags.length > 0) {
       formData.append('tags', JSON.stringify(tags));
    }

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      fetchDocs();
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-white/60 text-sm mt-1">Files, PDFs, and images</p>
        </div>
        <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40">
          <UploadCloud className="w-5 h-5" /> Upload File
        </button>
      </div>

      <SearchBar onSearch={setSearchQuery} onTagFilter={setActiveTags} onSort={setSortBy} availableTags={availableTags} activeFilters={activeTags} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-[280px] rounded-xl animate-pulse bg-white/5 border-white/5" />)}
        </div>
      ) : documents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, idx) => (
              <div key={doc._id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <ContentCard item={doc} type="document" onEdit={() => {}} onDelete={async (id) => {
                  if (window.confirm('Delete this document?')) {
                    await api.delete(`/documents/${id}`);
                    fetchDocs();
                  }
                }} onShare={setShareItem} />
              </div>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="glass-panel py-20 text-center rounded-2xl border border-white/10">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <FileIcon className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No documents found</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">Upload PDFs, text files, or images to keep them organized.</p>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl animate-scale-in flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">Upload Document</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="doc-form" onSubmit={handleSubmit} className="space-y-5">
                
                {/* Drag Drop Zone */}
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    isDragging ? 'border-amber-500 bg-amber-500/10' : 
                    file ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileIcon className="w-10 h-10 text-amber-400" />
                      <p className="text-white font-medium break-all">{file.name}</p>
                      <p className="text-white/50 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-rose-400 hover:underline mt-2">
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-white/10 rounded-full">
                        <UploadCloud className="w-6 h-6 text-white/70" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Click to upload or drag and drop</p>
                        <p className="text-white/50 text-xs mt-1">PDF, TXT, MD, Images (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title"
                    className="input-field bg-white/5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <TagBadge key={tag} tag={tag} variant="interactive" onRemove={(t) => setTags(tags.filter(x => x !== t))} />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        if (!tags.includes(tagInput.trim().toLowerCase())) setTags([...tags, tagInput.trim().toLowerCase()]);
                        setTagInput('');
                      }
                    }}
                    placeholder="Add tags... (Press Enter)"
                    className="input-field py-2 text-sm bg-white/5"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-surface-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                form="doc-form"
                disabled={isSubmitting || !title.trim() || !file}
                className="btn-primary py-2 px-6 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ShareModal isOpen={!!shareItem} onClose={() => setShareItem(null)} item={shareItem} onToggleShare={async (id, isShared) => {
           await api.patch(`/documents/${id}/share`, { isShared });
           setDocuments(documents.map(n => n._id === id ? { ...n, isShared } : n));
           setShareItem({ ...shareItem, isShared });
      }} />
    </div>
  );
};

export default Documents;
