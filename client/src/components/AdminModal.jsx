import { useState, useEffect } from 'react';
import { X, ShieldCheck, Users, FileText, Link2, File, Share2, Trash2, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const AdminModal = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setMsg('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleRoleToggle = async (userId, currentRole) => {
    setActionLoading(true);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setMsg(`Role updated to ${newRole}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}" and all their data?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setMsg(`User "${username}" deleted`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-lg border border-brand-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Admin Control Panel
                <span className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full font-mono">
                  Role: admin
                </span>
              </h2>
              <p className="text-xs text-white/50">Manage platform users, contents, and system statistics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Actions */}
        <div className="flex items-center justify-between px-6 py-3 bg-white/[0.02] border-b border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'stats'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              System Statistics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Manage Users ({users.length})
            </button>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {msg && (
          <div className="mx-6 mt-3 px-3 py-2 text-xs rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {msg}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
              <p className="text-sm text-white/50">Fetching role-authenticated data...</p>
            </div>
          ) : activeTab === 'stats' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-brand-400 text-xs font-medium mb-1">
                    <Users className="w-4 h-4" /> Users
                  </div>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                  <p className="text-[10px] text-white/40 mt-1">{stats?.roles?.admin || 0} Admin / {stats?.roles?.user || 0} Regular</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-medium mb-1">
                    <FileText className="w-4 h-4" /> Notes
                  </div>
                  <p className="text-2xl font-bold text-white">{stats?.totalNotes || 0}</p>
                  <p className="text-[10px] text-white/40 mt-1">Saved personal notes</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1">
                    <Link2 className="w-4 h-4" /> Links
                  </div>
                  <p className="text-2xl font-bold text-white">{stats?.totalLinks || 0}</p>
                  <p className="text-[10px] text-white/40 mt-1">Bookmarked links</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-1">
                    <File className="w-4 h-4" /> Documents
                  </div>
                  <p className="text-2xl font-bold text-white">{stats?.totalDocs || 0}</p>
                  <p className="text-[10px] text-white/40 mt-1">Uploaded files</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-brand-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Publicly Shared Items</h4>
                    <p className="text-xs text-white/60">Accessible via unique hash URL without authentication</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-brand-300">{stats?.totalShared || 0}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div 
                  key={u._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center font-bold text-xs">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{u.username}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
                          u.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{u.email} • {u.counts?.total || 0} items ({u.counts?.notes} notes, {u.counts?.links} links, {u.counts?.documents} docs)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRoleToggle(u._id, u.role)}
                      disabled={actionLoading}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                      title="Toggle between admin and user"
                    >
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.username)}
                      disabled={actionLoading}
                      className="p-1.5 text-rose-400 hover:bg-rose-400/20 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminModal;
