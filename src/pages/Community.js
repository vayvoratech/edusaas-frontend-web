import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getCommunityFeed, createCommunityPost, getMyConnections, searchUsers, sendConnectionRequest, getPendingConnections, acceptConnectionRequest, rejectConnectionRequest, removeConnection } from '../services/api';

const ROLE_CONFIG = {
  Student: { label: 'Student', bg: 'bg-blue-100 text-blue-800 border-blue-200 shadow-blue-500/20' },
  Educator: { label: 'Educator', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-500/20' },
  Employer: { label: 'Employer', bg: 'bg-amber-100 text-amber-800 border-amber-200 shadow-amber-500/20' },
  Admin: { label: 'Platform Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200 shadow-purple-500/20' },
};

export default function Community() {
  const { user, role: authRole } = useAuth();
  const displayName = user?.name || 'EduSaaS Member';
  const userRole = authRole || 'Student';

  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [composerOpen, setComposerOpen] = useState(false);

  const [postType, setPostType] = useState('Discussion');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postTags, setPostTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [visibleRoles, setVisibleRoles] = useState(['Student', 'Educator', 'Employer']);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [networkConnections, setNetworkConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [sentRequests, setSentRequests] = useState({}); // { targetUserId: connectionId }

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedImages.length + files.length > 3) {
        alert("You can only upload up to 3 images.");
        return;
      }
      setSelectedImages((prev) => [...prev, ...files].slice(0, 3));
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getCommunityFeed();
      const mappedPosts = data.map(p => {
        const postDate = new Date(p.created_at);
        const diffMs = Date.now() - postDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        let when = 'Just now';
        if (diffMins > 0 && diffMins < 60) when = `${diffMins} min ago`;
        else if (diffMins >= 60 && diffMins < 1440) when = `${Math.floor(diffMins / 60)} hours ago`;
        else if (diffMins >= 1440) when = `${Math.floor(diffMins / 1440)} days ago`;

        return {
          id: p.id,
          author: p.author.name,
          role: p.author.role,
          avatar: p.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
          type: p.post_type,
          when,
          title: p.title,
          body: p.content,
          tags: p.tags.map(t => t.name),
          likes: p.reactions_count || 0,
          liked: false,
          bookmarked: false,
          comments: [],
          jobDetails: p.metadata?.jobDetails || null,
          images: p.metadata?.images || [],
        }
      });
      setPosts(mappedPosts);
    } catch (err) {
      console.error('Failed to fetch feed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNetworkData = () => {
    getMyConnections().then(res => {
      if (res.success) {
        setConnectionsCount(res.network.length);
        setNetworkConnections(res.network);
      }
    }).catch(err => console.error("Failed to load connections:", err));

    getPendingConnections().then(res => {
      if (res.success) setPendingRequests(res.requests);
    }).catch(err => console.error("Failed to load pending requests:", err));
  };

  useEffect(() => {
    fetchPosts();
    loadNetworkData();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length > 2) {
      setIsSearchingUsers(true);
      const delayFn = setTimeout(() => {
        searchUsers(q).then(res => {
          if (res.success) {
            const members = res.data.filter(u => u.id !== user.id);
            const existingRequests = {};
            members.forEach(m => {
              if (m.connection_status === 'pending_sent' && m.connection_id) {
                existingRequests[m.id] = m.connection_id;
              }
            });
            setSentRequests(prev => ({ ...prev, ...existingRequests }));
            setUserSearchResults(members);
          }
        }).finally(() => setIsSearchingUsers(false));
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setUserSearchResults([]);
      setIsSearchingUsers(false);
    }
  }, [searchQuery, user.id]);

  const handleConnect = async (targetUserId) => {
    try {
      const res = await sendConnectionRequest(targetUserId);
      if (res.success && res.connection) {
        setSentRequests(prev => ({ ...prev, [targetUserId]: res.connection.id }));
      }
      showToast("Connection request sent!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send request", "error");
    }
  };

  const handleRemoveRequest = async (targetUserId, connectionId) => {
    try {
      const res = await removeConnection(connectionId);
      if (res.success) {
        setSentRequests(prev => {
          const next = { ...prev };
          delete next[targetUserId];
          return next;
        });
        showToast("Request cancelled", "success");
      }
    } catch (err) {
      showToast("Failed to cancel request", "error");
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      await acceptConnectionRequest(connectionId);
      loadNetworkData(); // Refresh counts and lists
      showToast("Request accepted!", "success");
    } catch (err) {
      showToast("Failed to accept request", "error");
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      await rejectConnectionRequest(connectionId);
      loadNetworkData(); // Refresh counts and lists
      showToast("Request declined", "success");
    } catch (err) {
      showToast("Failed to reject request", "error");
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    setConfirmModal({
      title: 'Remove Connection',
      message: 'Are you sure you want to remove this connection?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await removeConnection(connectionId);
          if (res.success) {
            setNetworkConnections(prev => prev.filter(c => c.connectionId !== connectionId));
            setConnectionsCount(prev => prev - 1);
            showToast("Connection removed", "success");
          }
        } catch (err) {
          console.error(err);
          showToast("Failed to remove connection", "error");
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Jobs' && p.type === 'Job') ||
        (activeTab === 'Courses' && p.type === 'Course') ||
        (activeTab === 'Projects' && p.type === 'Project') ||
        (activeTab === 'Discussions' && p.type === 'Discussion') ||
        (activeTab === 'Connections' && false); // Hide posts when in Connections tab

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [posts, activeTab, searchQuery]);

  const recentJobPosts = useMemo(() => {
    return posts.filter((p) => p.type === 'Job').slice(0, 3);
  }, [posts]);

  const recentCoursePosts = useMemo(() => {
    return posts.filter((p) => p.type === 'Course').slice(0, 3);
  }, [posts]);

  const handleToggleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
          : p
      )
    );
  };

  const handleToggleBookmark = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  };

  const handleApplyJob = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, applied: true } : p))
    );
  };

  const handleToggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: displayName,
      role: userRole,
      text,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );

    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    try {
      const metadata = isPublic ? null : { allowedRoles: visibleRoles };
      
      const formData = new FormData();
      formData.append('title', postTitle.trim());
      formData.append('content', postBody.trim());
      formData.append('post_type', postType);
      formData.append('visibility', isPublic ? 'Public':'Restricted');
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      selectedImages.forEach((file) => {
        formData.append('images', file);
      });

      await createCommunityPost(formData);

      await fetchPosts();

      setPostTitle('');
      setPostBody('');
      setPostTags('');
      setIsPublic(true);
      setVisibleRoles(['Student', 'Educator', 'Employer']);
      setSelectedImages([]);
      setComposerOpen(false);
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 ${
            toastMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'
          }`}>
            <span>{toastMessage.type === 'error' ? '❌' : '✅'}</span>
            {toastMessage.message}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-slate-500">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={confirmModal.onCancel}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow hover:shadow-lg transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar (Desktop) */}
      <div className="relative w-full h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-brand-blue-600 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-2 flex items-center justify-center gap-3">
            EduSaaS Community <span className="text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold border border-white/30 shadow-xl">PRO</span>
          </h1>
          <p className="text-indigo-100 text-sm md:text-base font-medium max-w-2xl mx-auto drop-shadow-sm">
            The collaborative network for Students, Instructors, and Industry Recruiters. Learn, share, and grow together.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* Search & Actions Panel */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/40 p-4 sm:p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search posts, tags, or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <Button
            onClick={() => setComposerOpen(true)}
            className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg shadow-indigo-500/30 transform transition-all hover:-translate-y-0.5"
          >
            + Create New Post
          </Button>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (Profile & Navigation) */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Profile Card */}
            <Card className="overflow-hidden border border-slate-200 shadow-md rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
              <div className="h-20 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              </div>
              <div className="p-5 pt-0 relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-white bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xl grid place-items-center -mt-8 shadow-lg">
                  {displayName.split(' ').map((n) => n[0]).join('').substring(0,2)}
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-3">{displayName}</h3>
                <span className={`inline-block mt-1.5 px-3 py-0.5 text-xs font-bold rounded-full border shadow-sm ${ROLE_CONFIG[userRole]?.bg || ROLE_CONFIG.Student.bg}`}>
                  {ROLE_CONFIG[userRole]?.label || userRole}
                </span>

                <div className="w-full mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="font-extrabold text-slate-800 text-lg">{connectionsCount}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Connections</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="font-extrabold text-slate-800 text-lg">12</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Bookmarks</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation Menu */}
            <Card className="p-4 border border-slate-200 shadow-md rounded-2xl bg-white">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Feed Views</div>
              <nav className="space-y-1">
                {[
                  { label: 'All Updates', id: 'All', icon: '🌐' },
                  { label: 'Network & Connections', id: 'Connections', icon: '🤝' },
                  { label: 'Job Board', id: 'Jobs', icon: '💼' },
                  { label: 'Course Stream', id: 'Courses', icon: '📚' },
                  { label: 'Showcase & Demos', id: 'Projects', icon: '🚀' },
                  { label: 'Discussions', id: 'Discussions', icon: '💬' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg opacity-80">{tab.icon}</span> {tab.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {tab.id === 'Connections' && pendingRequests.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          {pendingRequests.length}
                        </span>
                      )}
                      {activeTab === tab.id && <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-sm shadow-indigo-500/50"></span>}
                    </div>
                  </button>
                ))}
              </nav>
            </Card>

            {/* Pending requests moved to Network Tab */}
          </div>

          {/* Middle Column (Main Feed or Network Tab) */}
          <div className="lg:col-span-6 space-y-6">
            
            {activeTab !== 'Connections' && (
              <>
                {/* Quick Post Prompt */}
            <Card onClick={() => setComposerOpen(true)} className="p-4 border border-slate-200 shadow-sm rounded-2xl bg-white flex items-center gap-4 cursor-text hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-sm grid place-items-center shrink-0 border border-slate-200 group-hover:border-indigo-300 transition-colors">
                {displayName.split(' ').map((n) => n[0]).join('').substring(0,2)}
              </div>
              <div className="flex-1 text-left px-4 py-2.5 text-sm rounded-full bg-slate-50 border border-slate-200 text-slate-500 group-hover:bg-white group-hover:border-indigo-200 transition-all">
                Share an update, ask a question, or post a job...
              </div>
              <div className="flex gap-2 opacity-60">
                <span className="text-xl hover:scale-110 transition-transform cursor-pointer">🖼️</span>
                <span className="text-xl hover:scale-110 transition-transform cursor-pointer">📊</span>
              </div>
            </Card>

            {/* Member Search Results */}
            {searchQuery.length > 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">Member Results</h3>
                {isSearchingUsers ? (
                  <div className="text-center py-4 text-sm text-slate-500">Searching members...</div>
                ) : userSearchResults.length === 0 ? (
                  <div className="text-center py-4 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl">No members found matching "{searchQuery}"</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userSearchResults.map((u, i) => (
                      <Card 
                        key={u.id} 
                        className="p-4 flex items-center justify-between border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 rounded-xl animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-sm grid place-items-center shrink-0 shadow-md">
                            {u.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{u.name}</div>
                            <div className="text-xs text-slate-500">@{u.username || 'user'} • <span className="font-medium">{u.role?.name || 'Student'}</span></div>
                          </div>
                        </div>
                        {sentRequests[u.id] ? (
                          <button 
                            onClick={() => handleRemoveRequest(u.id, sentRequests[u.id])}
                            className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all shadow-sm font-bold active:scale-95"
                          >
                            Remove Request
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleConnect(u.id)}
                            className="text-xs px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg transition-all shadow-sm font-bold active:scale-95"
                          >
                            Connect
                          </button>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
                
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2 mt-8 border-t border-slate-200 pt-6">Post Results</h3>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="text-4xl mb-4 opacity-50">📭</div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No posts found</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">It's a bit quiet here. Try adjusting your filters or be the first to post something exciting!</p>
                  <Button
                    onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
                    className="text-sm font-bold bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm rounded-full px-6 py-2"
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="border border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden bg-white group">
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-sm grid place-items-center shrink-0 shadow-md">
                            {post.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors">{post.author}</h4>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${ROLE_CONFIG[post.role]?.bg}`}>
                                {post.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {post.company || post.course || post.type} <span className="mx-1 opacity-50">•</span> {post.when}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleBookmark(post.id)}
                          className={`text-lg p-2 rounded-full hover:bg-slate-50 transition-colors ${post.bookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          {post.bookmarked ? '🔖' : '📌'}
                        </button>
                      </div>

                      <div className="mt-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">{post.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{post.body}</p>
                      </div>

                      {post.images && post.images.length > 0 && (
                        <div className={`mt-4 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                          {post.images.map((imgUrl, idx) => (
                            <div key={idx} className={`relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 ${post.images.length === 3 && idx === 0 ? 'col-span-2 aspect-video' : 'aspect-square'} ${post.images.length === 1 ? 'aspect-video' : ''}`}>
                              <img src={`http://localhost:5000${imgUrl}`} alt="Post attachment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                            </div>
                          ))}
                        </div>
                      )}

                      {post.type === 'Job' && post.jobDetails && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 flex items-center justify-between gap-4 shadow-sm">
                          <div className="text-sm text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-2">
                              <span className="bg-amber-100 p-1.5 rounded-lg">📍</span> {post.jobDetails.location}
                            </div>
                            <div className="font-medium flex items-center gap-2">
                              <span className="bg-amber-100 p-1.5 rounded-lg">💰</span> {post.jobDetails.salary} 
                              <span className="text-amber-700/60 ml-2 text-xs">Apply by {post.jobDetails.deadline}</span>
                            </div>
                          </div>
                          <Button
                            disabled={post.applied}
                            onClick={() => handleApplyJob(post.id)}
                            className={`text-sm px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all ${
                              post.applied
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30 hover:-translate-y-0.5'
                            }`}
                          >
                            {post.applied ? '✓ Application Sent' : 'Apply Now 🚀'}
                          </Button>
                        </div>
                      )}

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-600">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white transition-all ${post.liked ? 'text-pink-600 bg-pink-50 shadow-sm border border-pink-100' : 'hover:shadow-sm hover:border hover:border-slate-200 border border-transparent'}`}
                        >
                          <span className={`text-lg transition-transform ${post.liked ? 'scale-110' : ''}`}>{post.liked ? '💖' : '🤍'}</span>
                          <span>{post.likes}</span>
                        </button>

                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm hover:border hover:border-slate-200 border border-transparent transition-all"
                        >
                          <span className="text-lg">💬</span>
                          <span>{post.comments.length}</span>
                        </button>
                      </div>

                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm hover:border hover:border-slate-200 border border-transparent transition-all">
                        <span className="text-lg opacity-70">📤</span>
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>

                    {expandedComments[post.id] && (
                      <div className="p-5 bg-white border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {post.comments.length === 0 ? (
                            <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              <p className="text-sm text-slate-500 font-medium">Be the first to share your thoughts!</p>
                            </div>
                          ) : (
                            post.comments.map((c) => (
                              <div key={c.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs grid place-items-center shrink-0">
                                  {c.author.split(' ').map((n) => n[0]).join('').substring(0,2)}
                                </div>
                                <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm text-slate-800 hover:underline cursor-pointer">{c.author}</span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">{c.role}</span>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs grid place-items-center shrink-0 shadow-sm mt-1">
                            {displayName.split(' ').map((n) => n[0]).join('').substring(0,2)}
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={commentDrafts[post.id] || ''}
                              onChange={(e) => setCommentDrafts({ ...commentDrafts, [post.id]: e.target.value })}
                              placeholder="Write a comment..."
                              className="w-full pl-4 pr-20 py-2.5 text-sm rounded-full border border-slate-300 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-inner"
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                            />
                            <Button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!commentDrafts[post.id]?.trim()}
                              className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 rounded-full font-bold shadow-sm disabled:opacity-50 transition-colors"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Network & Connections Tab View */}
        {activeTab === 'Connections' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
              <Card className="p-6 border border-slate-200 shadow-lg rounded-2xl bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10"></div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl animate-pulse shadow-inner">
                    📬
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Pending Invitations</h2>
                    <p className="text-sm text-slate-500">People who want to connect with you</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequests.map((req, i) => (
                    <div 
                      key={req.id} 
                      className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 animate-in zoom-in-95"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg grid place-items-center shrink-0 shadow-lg ring-4 ring-indigo-50">
                          {req.requester.name.split(' ').map((n) => n[0]).join('').substring(0,2)}
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{req.requester.name}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5 mb-2">@{req.requester.username || 'user'} • {req.requester.role?.name || req.requester.role || 'Student'}</div>
                          <div className="text-[11px] font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full text-indigo-600 inline-block shadow-sm">
                            Wants to connect with you
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-auto">
                        <button 
                          onClick={() => handleAcceptRequest(req.id)}
                          className="flex-1 text-sm py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Accept</span>
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(req.id)}
                          className="flex-1 text-sm py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white rounded-xl font-bold shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* My Network Section */}
            <Card className="p-6 border border-slate-200 shadow-md rounded-2xl bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                  🤝
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">My Network</h2>
                  <p className="text-sm text-slate-500">You have {networkConnections.length} connections</p>
                </div>
              </div>

              {networkConnections.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="text-5xl mb-4 opacity-50">👥</div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Your network is empty</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">Use the search bar above to find classmates, instructors, or employers and start building your network!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {networkConnections.map(conn => {
                    const friend = conn.user;
                    return (
                      <div 
                        key={conn.connectionId} 
                        className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 group animate-in zoom-in-95"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-lg grid place-items-center shrink-0 shadow-lg ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all duration-300">
                            {friend.name.split(' ').map((n) => n[0]).join('').substring(0,2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{friend.name}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">@{friend.username || 'user'} • {friend.role?.name || friend.role || 'Student'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button className="w-9 h-9 rounded-full bg-slate-50 hover:bg-indigo-100 hover:text-indigo-700 flex items-center justify-center text-slate-400 hover:scale-110 active:scale-95 transition-all duration-200" title="Message">
                            💬
                          </button>
                          <button 
                            onClick={() => handleRemoveConnection(conn.connectionId)}
                            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-red-100 hover:text-red-700 flex items-center justify-center text-slate-400 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
                            title="Remove Connection"
                          >
                            ✖
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

          {/* Right Column (Trending / Spotlights) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-5 border border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-xl">🎯</span> Hiring Spotlight
                </h3>
              </div>
              <ul className="space-y-3">
                {recentJobPosts.map((job) => (
                  <li key={job.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group/item">
                    <div className="text-sm font-bold text-slate-800 group-hover/item:text-amber-700 transition-colors">{job.title}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-slate-200 rounded text-[8px] grid place-items-center">🏢</span>
                      {job.author}
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold mt-2 bg-amber-50 w-fit px-2 py-0.5 rounded-full">
                      {job.jobDetails?.location || 'Remote'}
                    </div>
                  </li>
                ))}
                {recentJobPosts.length === 0 && (
                  <li className="p-4 text-xs text-slate-500 text-center italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No active job postings.
                  </li>
                )}
              </ul>
            </Card>

            <Card className="p-5 border border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-xl">🔥</span> Trending Courses
                </h3>
              </div>
              <ul className="space-y-3">
                {recentCoursePosts.map((coursePost) => (
                  <li key={coursePost.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group/item">
                    <div className="text-sm font-bold text-slate-800 line-clamp-2 group-hover/item:text-emerald-700 transition-colors">{coursePost.title}</div>
                    <div className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 grid place-items-center text-[8px]">👨‍🏫</div>
                      {coursePost.author}
                    </div>
                  </li>
                ))}
                {recentCoursePosts.length === 0 && (
                  <li className="p-4 text-xs text-slate-500 text-center italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No recent courses.
                  </li>
                )}
              </ul>
            </Card>

            <div className="text-[11px] font-medium text-slate-400 px-2 space-y-1.5 text-center mt-8">
              <p>© 2026 EduSaaS Inc.</p>
              <div className="flex justify-center gap-3">
                <a href="/privacy" className="hover:text-slate-600 hover:underline transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-slate-600 hover:underline transition-colors">Terms</a>
                <a href="/guidelines" className="hover:text-slate-600 hover:underline transition-colors">Guidelines</a>
              </div>
            </div>
          </div>
        </div>

        {/* Glassmorphism Composer Modal */}
        {composerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl shadow-2xl bg-white/95 backdrop-blur-2xl rounded-3xl flex flex-col border border-white/60 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200/60 bg-white/50">
                <h3 className="text-xl font-extrabold text-slate-800">Create a New Post</h3>
                <button
                  onClick={() => setComposerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="flex flex-col">
                <div className="px-6 pt-5 pb-3 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {displayName ? displayName.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'U'}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{displayName || 'User'}</h4>
                      
                      <div className="mt-1.5 flex flex-col gap-2">
                         <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer px-3 py-1 rounded-full border border-slate-200 transition-colors w-fit shadow-sm">
                           <input
                             type="checkbox"
                             checked={isPublic}
                             onChange={(e) => setIsPublic(e.target.checked)}
                             className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                           />
                           {isPublic ? '🌍 Visible to Everyone' : '🔒 Restricted Visibility'}
                         </label>

                         {!isPublic && (
                            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-inner mt-1">
                              <span className="text-xs text-slate-500 w-full font-bold mb-1">Select Audiences:</span>
                              {['Student', 'Educator', 'Employer'].map(role => (
                                <label key={role} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={visibleRoles.includes(role)}
                                    onChange={(e) => {
                                      if (e.target.checked) setVisibleRoles([...visibleRoles, role]);
                                      else setVisibleRoles(visibleRoles.filter(r => r !== role));
                                    }}
                                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                  />
                                  {role}
                                </label>
                              ))}
                            </div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 flex flex-col gap-3">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Enter an engaging title..."
                    required
                    className="w-full text-xl font-bold text-slate-800 placeholder-slate-300 bg-transparent border-none focus:ring-0 px-0 focus:outline-none"
                  />
                  
                  <textarea
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder="What do you want to share with the community?"
                    rows={5}
                    required
                    className="w-full text-base leading-relaxed text-slate-700 placeholder-slate-400 bg-transparent border-none focus:ring-0 px-0 resize-none min-h-[150px] focus:outline-none custom-scrollbar"
                  />
                  
                  {/* Image Previews */}
                  {selectedImages.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto py-2">
                      {selectedImages.map((file, idx) => (
                        <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                          <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 bg-slate-900/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 space-y-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 bg-slate-100 w-8 h-8 rounded-full grid place-items-center">#</span>
                    <input
                      type="text"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      placeholder="Add tags (comma separated, e.g., React, Hiring, Updates)"
                      className="flex-1 text-sm font-medium text-slate-700 placeholder-slate-400 bg-white border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    />
                    
                    {/* Add Image Button */}
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                      <span className="text-lg">+</span>
                      <span>Upload Image</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={selectedImages.length >= 3}
                      />
                    </label>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {['Discussion', 'Job', 'Course', 'Project'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPostType(t)}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
                          postType === t
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 border-2 scale-105'
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {t === 'Discussion' ? '💬 ' : t === 'Job' ? '💼 ' : t === 'Course' ? '📚 ' : '🚀 '}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-5 flex justify-end gap-3 items-center border-t border-slate-200/60 bg-slate-100/80">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setComposerOpen(false)}
                    className="text-slate-600 hover:bg-slate-200 rounded-xl px-5 py-2.5 font-bold transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!postTitle.trim() || !postBody.trim()}
                    className={`rounded-xl px-8 py-2.5 text-sm font-bold shadow-lg transition-all ${(!postTitle.trim() || !postBody.trim()) ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5'}`}
                  >
                    Post to Community 🚀
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
