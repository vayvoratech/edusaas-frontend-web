import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getCommunityFeed, createCommunityPost, getMyConnections, searchUsers, sendConnectionRequest, getPendingConnections, acceptConnectionRequest, rejectConnectionRequest, removeConnection, toggleCommunityPostBookmark, getDomainRoles, getAnnouncements, markAnnouncementNotificationsRead } from '../services/api';

const fmtRel = (iso) => {
  if (!iso) return 'Recent';
  const diff = (new Date() - new Date(iso)) / 60000;
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
};

const DEFAULT_DOMAIN_ROLES = [
  'AI Engineer',
  'Backend Developer',
  'Blockchain Developer',
  'Business Intelligence Developer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Data Analyst',
  'Data Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Frontend Developer',
  'Full Stack Developer',
  'Generative AI Engineer',
  'IoT Engineer',
  'Machine Learning Engineer',
  'MLOps Engineer',
  'Mobile Application Developer',
  'Robotics and Computer Vision Engineer',
  'Software Development Engineer',
  'Software Development Engineer (SDE)',
  'Software Test Engineer',
  'UI/UX Designer',
];

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
  const [announcements, setAnnouncements] = useState([]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'All');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  const seenKey = `edu_seen_announcements_${user?.id || 'user'}`;
  const getSeenAnnouncementIds = () => {
    try {
      const raw = localStorage.getItem(seenKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useState(getSeenAnnouncementIds);

  useEffect(() => {
    const handleSeenUpdate = () => {
      setSeenAnnouncementIds(getSeenAnnouncementIds());
    };
    window.addEventListener('announcements_seen', handleSeenUpdate);
    return () => window.removeEventListener('announcements_seen', handleSeenUpdate);
  }, [user?.id]);

  const unseenAnnouncementsCount = announcements.filter(
    (a) => !seenAnnouncementIds.includes(a.id)
  ).length;

  useEffect(() => {
    getAnnouncements()
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]));
  }, []);

  // When user opens/views the Announcements tab, mark all current announcements as seen automatically
  useEffect(() => {
    if (activeTab === 'Announcements' && announcements.length > 0) {
      const currentSeen = getSeenAnnouncementIds();
      const allIds = announcements.map((a) => a.id);
      const hasUnseen = allIds.some((id) => !currentSeen.includes(id));

      if (hasUnseen) {
        const updated = Array.from(new Set([...currentSeen, ...allIds]));
        try {
          localStorage.setItem(seenKey, JSON.stringify(updated));
        } catch {}
        setSeenAnnouncementIds(updated);

        markAnnouncementNotificationsRead()
          .then(() => {
            window.dispatchEvent(new CustomEvent('notifications_updated'));
            window.dispatchEvent(new CustomEvent('announcements_seen'));
          })
          .catch(() => {});
      }
    }
  }, [activeTab, announcements]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [composerOpen, setComposerOpen] = useState(false);

  const [postType, setPostType] = useState('Discussion');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postTags, setPostTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [visibleRoles, setVisibleRoles] = useState(['Student', 'Educator', 'Employer']);
  const [availableDomainRoles, setAvailableDomainRoles] = useState(DEFAULT_DOMAIN_ROLES);
  const [notifyDomainRoles, setNotifyDomainRoles] = useState([]);
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
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [modalTab, setModalTab] = useState('connections'); // 'connections' or 'pending'
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
          bookmarked: p.bookmarked || false,
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
    getDomainRoles()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((d) => d.domain_name || d.name).filter(Boolean);
          if (names.length > 0) {
            setAvailableDomainRoles(names);
          }
        }
      })
      .catch((err) => console.error("Failed to load domain roles:", err));
  }, []);

  // Scroll to a specific post when navigated from a notification
  const scrollTargetPostId = location.state?.scrollToPost;
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (!scrollTargetPostId || isLoading || hasScrolled.current) return;
    // Give the DOM a tick to paint
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`post-${scrollTargetPostId}`);
      if (el) {
        hasScrolled.current = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the post briefly
        el.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'shadow-indigo-300/60', 'shadow-2xl');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'shadow-indigo-300/60', 'shadow-2xl');
        }, 2500);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollTargetPostId, isLoading]);

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
        (activeTab === 'Connections' && false) || // Hide posts when in Connections tab
        (activeTab === 'Announcements' && false) || // Hide posts when in Announcements tab
        (activeTab === 'Bookmarks' && p.bookmarked);

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

  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return announcements;
    return announcements.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.message?.toLowerCase().includes(q) ||
        a.educator?.name?.toLowerCase().includes(q)
    );
  }, [announcements, searchQuery]);

  // Intersection Observer Fallback for scroll animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supportsModernScroll = window.CSS && CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
      
      if (!supportsModernScroll) {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
              }
            }
          },
          { threshold: 0.1 }
        );

        const animatedCards = document.querySelectorAll('.post-card-animated');
        animatedCards.forEach((el) => {
          if (!el.dataset.observed) {
            el.dataset.observed = 'true';
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
          }
        });

        return () => observer.disconnect();
      }
    }
  }, [filteredPosts, activeTab, searchQuery]);

  const recentJobPosts = useMemo(() => {
    return posts.filter((p) => p.type === 'Job').slice(0, 3);
  }, [posts]);

  const recentCoursePosts = useMemo(() => {
    return posts.filter((p) => p.type === 'Course').slice(0, 3);
  }, [posts]);

  const bookmarkedCount = useMemo(() => {
    return posts.filter(p => p.bookmarked).length;
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

  const handleToggleBookmark = async (postId) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p))
    );

    try {
      await toggleCommunityPostBookmark(postId);
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
      // Revert optimistic update on failure
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p))
      );
      showToast("Failed to save bookmark", "error");
    }
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

    if (!isPublic && visibleRoles.length === 0) {
      showToast('Please select at least one audience role for restricted visibility.', 'error');
      return;
    }

    if ((postType === 'Job' || postType === 'Course') && notifyDomainRoles.length === 0) {
      showToast('Please select at least one related domain role for this post.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', postTitle.trim());
      formData.append('content', postBody.trim());
      formData.append('post_type', postType);
      formData.append('visibility', 'Public');

      let finalMetadata = {};
      if (!isPublic) {
        finalMetadata.allowedRoles = visibleRoles.map(r => r.toLowerCase());
      }
      if ((postType === 'Job' || postType === 'Course') && notifyDomainRoles.length > 0) {
        finalMetadata.notifyDomainRoles = notifyDomainRoles;
      }

      if (Object.keys(finalMetadata).length > 0) {
        formData.append('metadata', JSON.stringify(finalMetadata));
      }
      
      selectedImages.forEach((file) => {
        formData.append('images', file);
      });

      await createCommunityPost(formData);

      await fetchPosts();

      setPostTitle('');
      setPostBody('');
      setPostTags('');
      setNotifyDomainRoles([]);
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
      <style>{`
        @keyframes post-entry {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes float-mailbox {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }

        .animate-float {
          animation: float-mailbox 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: no-preference) {
          @supports ((animation-timeline: view()) and (animation-range: entry)) {
            .post-card-animated {
              animation: post-entry linear both;
              animation-timeline: view();
              animation-range: entry 5% cover 25%;
            }
          }
        }
        
        .member-card-enter {
          animation: post-entry 0.5s ease-out both;
        }
        
        .glassmorphism-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>
      
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

      {/* Connections Modal */}
      {showConnectionsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Network & Connections</h3>
              <button onClick={() => setShowConnectionsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setModalTab('connections')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  modalTab === 'connections'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                My Connections ({connectionsCount})
              </button>
              <button
                onClick={() => setModalTab('pending')}
                className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
                  modalTab === 'pending'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pending Requests
                {pendingRequests.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] bg-red-500 text-white rounded-full font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
            {/* Tab Content */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {modalTab === 'connections' ? (
                networkConnections.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">You have no connections yet.</div>
                ) : (
                  networkConnections.map((conn) => (
                    <div key={conn.connectionId} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-sm grid place-items-center shrink-0 shadow-sm">
                          {conn.user.name.split(' ').map((n) => n[0]).join('').substring(0,2)}
                        </div>
                        <div className="truncate pr-3">
                          <div className="font-bold text-sm text-slate-900 truncate">{conn.user.name}</div>
                          <div className="text-xs text-slate-500 truncate">@{conn.user.username || 'user'} • {conn.user.role?.name || conn.user.role || 'Student'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => { setShowConnectionsModal(false); showToast("Messaging feature coming soon!", "success"); }}
                          className="text-xs px-3 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg font-bold transition-all"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => { setShowConnectionsModal(false); handleRemoveConnection(conn.connectionId); }}
                          className="text-xs px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold transition-all border border-transparent hover:border-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                // Pending Requests Tab
                pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No pending connection requests.</div>
                ) : (
                  pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-sm grid place-items-center shrink-0 shadow-sm">
                          {(req.requester?.name || req.name || '?').split(' ').map((n) => n[0]).join('').substring(0,2)}
                        </div>
                        <div className="truncate pr-3">
                          <div className="font-bold text-sm text-slate-900 truncate">{req.requester?.name || req.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">wants to connect with you</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="text-xs px-3 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-all shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="text-xs px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold transition-all border border-transparent hover:border-red-200"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
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
                  <div onClick={() => setShowConnectionsModal(true)} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="font-extrabold text-slate-800 text-lg">{connectionsCount}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Connections</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 transition-colors">
                    <div className="font-extrabold text-slate-800 text-lg">{bookmarkedCount}</div>
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
                  { label: 'Announcements', id: 'Announcements', icon: '📣' },
                  { label: 'Network & Connections', id: 'Connections', icon: '🤝' },
                  { label: 'Saved Posts', id: 'Bookmarks', icon: '🔖' },
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
                      {tab.id === 'Announcements' && unseenAnnouncementsCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {unseenAnnouncementsCount}
                        </span>
                      )}
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
            
            {activeTab !== 'Connections' && activeTab !== 'Announcements' && (
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
                  <div className="text-center py-8 text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="text-3xl mb-2 opacity-50">🕵️‍♂️</div>
                    No members found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {userSearchResults.map((u, i) => (
                      <Card 
                        key={u.id} 
                        className="member-card-enter p-4 flex items-center justify-between border border-slate-200 glassmorphism-card hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 rounded-xl group w-full"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-base grid place-items-center shrink-0 shadow-md ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                            {u.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                          </div>
                          <div className="truncate pr-4">
                            <div className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors truncate">{u.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">@{u.username || 'user'} • <span className="font-semibold text-slate-700">{u.role?.name || 'Student'}</span></div>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {sentRequests[u.id] ? (
                            <button 
                              onClick={() => handleRemoveRequest(u.id, sentRequests[u.id])}
                              className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all shadow-sm font-bold active:scale-95 border border-slate-200 whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleConnect(u.id)}
                              className="text-xs px-5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-600 hover:to-purple-600 text-indigo-700 hover:text-white border border-indigo-100 rounded-lg transition-all shadow-sm font-bold active:scale-95 whitespace-nowrap"
                            >
                              Connect
                            </button>
                          )}
                        </div>
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
                <Card className="p-16 text-center border border-slate-200 rounded-[2rem] bg-gradient-to-b from-white to-slate-50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
                  
                  <div className="text-6xl mb-6 animate-float drop-shadow-md">📭</div>
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">No posts found</h3>
                  <p className="text-base text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">It's a bit quiet here. Try adjusting your filters or be the first to share an update with the community!</p>
                  <Button
                    onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
                    className="text-sm font-bold bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm hover:shadow-md rounded-full px-8 py-3 transition-all"
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                  filteredPosts.map((post) => (
                  <Card key={post.id} id={`post-${post.id}`} className="post-card-animated border border-slate-200 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
                    
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
                          className={`text-lg p-2 rounded-full transition-all ${
                            post.bookmarked 
                              ? 'bg-indigo-50 shadow-sm border border-indigo-100 scale-105' 
                              : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:bg-slate-50 hover:scale-110 border border-transparent'
                          }`}
                          title={post.bookmarked ? "Remove Bookmark" : "Save Post"}
                        >
                          🔖
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

                <div className="flex flex-col gap-3">
                  {pendingRequests.map((req, i) => (
                    <div 
                      key={req.id} 
                      className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 animate-in zoom-in-95 group w-full"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg grid place-items-center shrink-0 shadow-lg ring-4 ring-indigo-50">
                          {req.requester.name.split(' ').map((n) => n[0]).join('').substring(0,2)}
                        </div>
                        <div className="truncate pr-4">
                          <div className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{req.requester.name}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5 truncate flex items-center gap-2">
                            <span>@{req.requester.username || 'user'} • {req.requester.role?.name || req.requester.role || 'Student'}</span>
                            <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full text-indigo-600 hidden sm:inline-block shadow-sm">
                              Wants to connect
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleAcceptRequest(req.id)}
                          className="text-xs px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 whitespace-nowrap"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(req.id)}
                          className="text-xs px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white rounded-lg font-bold shadow-md shadow-red-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 whitespace-nowrap"
                        >
                          Decline
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
                <div className="flex flex-col gap-3">
                  {networkConnections.map(conn => {
                    const friend = conn.user;
                    return (
                      <div 
                        key={conn.connectionId} 
                        className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 group animate-in zoom-in-95 w-full"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-lg grid place-items-center shrink-0 shadow-lg ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all duration-300">
                            {friend.name.split(' ').map((n) => n[0]).join('').substring(0,2)}
                          </div>
                          <div className="truncate pr-4">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{friend.name}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5 truncate">@{friend.username || 'user'} • {friend.role?.name || friend.role || 'Student'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => showToast("Messaging feature coming soon!", "success")}
                            className="text-xs px-4 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                          >
                            Message
                          </button>
                          <button 
                            onClick={() => handleRemoveConnection(conn.connectionId)}
                            className="text-xs px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold transition-all border border-transparent hover:border-red-200 shadow-sm active:scale-95 whitespace-nowrap"
                          >
                            Remove
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

        {/* Announcements Tab View */}
        {activeTab === 'Announcements' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="p-6 border border-slate-200 shadow-lg rounded-2xl bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-bl-full -z-10"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 shrink-0">
                    📣
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">Announcements Feed</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        Official
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified broadcasts from course educators and platform leaders.
                    </p>
                  </div>
                </div>
                {(userRole === 'Educator' || userRole === 'Admin') && (
                  <Link
                    to="/app/announcements"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <span>+ Send Announcement</span>
                  </Link>
                )}
              </div>
            </Card>

            {/* Announcements List */}
            {filteredAnnouncements.length === 0 ? (
              <Card className="p-16 text-center border border-slate-200 rounded-[2rem] bg-gradient-to-b from-white to-slate-50 shadow-sm relative overflow-hidden">
                <div className="text-6xl mb-4 animate-float drop-shadow-md">📣</div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">No Announcements Yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {searchQuery
                    ? `No announcements match "${searchQuery}".`
                    : 'Newly broadcasted notices and course updates from your educators will be notified and displayed right here.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAnnouncements.map((a) => (
                  <Card
                    key={a.id}
                    className="p-6 border border-slate-200 shadow-md rounded-2xl bg-white hover:border-amber-300 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-sm grid place-items-center shadow-md shadow-amber-500/20 shrink-0">
                          {a.educator?.name
                            ? a.educator.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()
                            : 'ED'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {a.educator?.name || 'Course Instructor'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              Verified Educator
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{fmtRel(a.created_at)}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {a.audience === 'course'
                                ? 'Targeted to Course Learners'
                                : `${a.audience} Audience`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200/60 shrink-0 flex items-center gap-1">
                        <span>📣</span> Notice
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                        {a.message}
                      </p>
                    </div>

                    {a.attachment && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <a
                          href={a.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50/70 px-3 py-1.5 rounded-lg border border-indigo-100"
                        >
                          <span>📎</span> View Attached Resource
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
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
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl max-h-[88vh] shadow-2xl bg-white rounded-3xl flex flex-col border border-slate-200/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto">
              
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 bg-white shrink-0">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">Create a New Post</h3>
                <button
                  onClick={() => {
                    setComposerOpen(false);
                    setNotifyDomainRoles([]);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                      {displayName ? displayName.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{displayName || 'User'}</h4>
                      
                      <div className="mt-1 flex flex-col gap-2">
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
                               <div className="w-full flex items-center justify-between mb-1">
                                 <span className="text-xs text-slate-600 font-bold">Select Audiences:</span>
                                 <span className="text-[11px] text-slate-400 font-medium">Admins can always view</span>
                               </div>
                               {['Student', 'Educator', 'Employer'].map(role => (
                                 <label key={role} className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer px-3 py-1.5 rounded-lg border transition-all ${visibleRoles.includes(role) ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
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
                               {visibleRoles.length === 0 && (
                                 <span className="text-[11px] text-rose-500 font-semibold w-full mt-1">
                                   ⚠️ Please select at least one role to share with.
                                 </span>
                               )}
                             </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Enter an engaging title..."
                      required
                      className="w-full text-lg sm:text-xl font-bold text-slate-800 placeholder-slate-300 bg-transparent border-none focus:ring-0 px-0 focus:outline-none"
                    />
                    
                    <textarea
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                      placeholder="What do you want to share with the community?"
                      rows={3}
                      required
                      className="w-full text-sm sm:text-base leading-relaxed text-slate-700 placeholder-slate-400 bg-transparent border-none focus:ring-0 px-0 resize-none min-h-[90px] focus:outline-none custom-scrollbar"
                    />
                    
                    {/* Image Previews */}
                    {selectedImages.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto py-1">
                        {selectedImages.map((file, idx) => (
                          <div key={idx} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 bg-slate-900/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 bg-slate-100 w-8 h-8 rounded-full grid place-items-center shrink-0">#</span>
                    <input
                      type="text"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      placeholder="Add tags (comma separated, e.g., React, Hiring, Updates)"
                      className="flex-1 text-sm font-medium text-slate-700 placeholder-slate-400 bg-white border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  {(postType === 'Job' || postType === 'Course') && (
                    <div className="flex flex-col gap-2.5 p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          Select Related Domain Roles <span className="text-rose-500 font-black">*</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (notifyDomainRoles.length === availableDomainRoles.length) {
                                setNotifyDomainRoles([]);
                              } else {
                                setNotifyDomainRoles([...availableDomainRoles]);
                              }
                            }}
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all border ${
                              notifyDomainRoles.length === availableDomainRoles.length
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                            }`}
                          >
                            {notifyDomainRoles.length === availableDomainRoles.length ? '✓ All Selected' : 'Select All'}
                          </button>
                          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                            {notifyDomainRoles.length} / {availableDomainRoles.length}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Select the domain roles eligible for this {postType.toLowerCase()} post. Eligible students will be notified (Mandatory).
                      </p>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                        {/* "All" checkbox item */}
                        <label className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer px-2.5 py-1 rounded-lg border transition-all ${
                          notifyDomainRoles.length === availableDomainRoles.length && availableDomainRoles.length > 0
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-50/80'
                        }`}>
                          <input
                            type="checkbox"
                            checked={notifyDomainRoles.length === availableDomainRoles.length && availableDomainRoles.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNotifyDomainRoles([...availableDomainRoles]);
                              } else {
                                setNotifyDomainRoles([]);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          All Domain Roles
                        </label>

                        {availableDomainRoles.map(role => {
                          const isChecked = notifyDomainRoles.includes(role);
                          return (
                            <label
                              key={role}
                              className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer px-2.5 py-1 rounded-lg border transition-all ${
                                isChecked
                                  ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setNotifyDomainRoles([...notifyDomainRoles, role]);
                                  else setNotifyDomainRoles(notifyDomainRoles.filter(r => r !== role));
                                }}
                                className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                              />
                              {role}
                            </label>
                          );
                        })}
                      </div>
                      {notifyDomainRoles.length === 0 && (
                        <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                          ⚠️ Please select at least one domain role (or choose 'All Domain Roles') to post.
                        </span>
                      )}
                    </div>
                  )}
                    
                  <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      {/* Add Image Button */}
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-4 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                        <span className="text-base">+</span>
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
                    
                    <div className="flex flex-wrap gap-2.5">
                      {['Discussion', 'Job', 'Course', 'Project'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPostType(t)}
                          className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm ${
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
                </div>

                <div className="px-6 py-3.5 flex justify-end gap-3 items-center border-t border-slate-200/80 bg-slate-50 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setComposerOpen(false);
                      setNotifyDomainRoles([]);
                    }}
                    className="text-slate-600 hover:bg-slate-200 rounded-xl px-5 py-2.5 font-bold transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!postTitle.trim() || !postBody.trim() || (!isPublic && visibleRoles.length === 0) || ((postType === 'Job' || postType === 'Course') && notifyDomainRoles.length === 0)}
                    className={`rounded-xl px-8 py-2.5 text-sm font-bold shadow-lg transition-all ${(!postTitle.trim() || !postBody.trim() || (!isPublic && visibleRoles.length === 0) || ((postType === 'Job' || postType === 'Course') && notifyDomainRoles.length === 0)) ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5'}`}
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
