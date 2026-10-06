import { useState } from 'react';
import { X, Copy, Check, Globe, Lock } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, item, onToggleShare }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const shareUrl = `${window.location.origin}/share/${item.shareHash || 'temp-hash'}`;
  const isShared = item.isShared || false;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-surface/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md glass-card rounded-2xl shadow-2xl p-6 animate-scale-in border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Share Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              {isShared ? (
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <Globe className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-white/10 rounded-lg text-white/60">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-medium text-white">{isShared ? 'Public Access' : 'Private'}</p>
                <p className="text-sm text-white/50">{isShared ? 'Anyone with the link can view' : 'Only you can access this'}</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isShared}
                onChange={() => onToggleShare(item._id, !isShared)}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {isShared && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium text-white/70">Share Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="input-field flex-1 font-mono text-sm bg-white/5"
                />
                <button 
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center transition-all ${
                    copied ? 'bg-emerald-500 text-white' : 'glass-card text-white/90 hover:bg-white/10'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
