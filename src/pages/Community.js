import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getCommunityFeed,
  createCommunityPost,
  toggleCommunityLike,
  getPostComments,
  addPostComment,
  getJobs,
  getCourses,
} from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  Student:  { label: 'Student',          bg: 'bg-blue-50 text-brand-blue-700 border-brand-blue-200' },
  Educator: { label: 'Educator',          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Employer: { label: 'Employer · Hiring', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  Admin:    { label: 'Platform Admin',    bg: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const TYPE_TAB_MAP = {
  All:         undefined,
  Jobs:        'Job',
  Courses:     'Course',
  Projects:    'Project',
  Discussions: 'Discussion',
};

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <Card className="border border-slate-200 rounded-xl p-3.5 space-y-3 animate-pulse bg-white">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-slate-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-2.5 w-32 bg-slate-200 rounded" />
          <div className="h-2 w-24 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="h-3 w-3/4 bg-slate-200 rounded" />
      <div className="h-2 bg-slate-100 rounded" />
      <div className="h-2 w-5/6 bg-slate-100 rounded" />
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Community() {
  const { user, role: authRole } = useAuth();
  const displayName = user?.name || 'Community Member';
  const userRole    = authRole  || 'Student';

  // Feed state
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // UI state
  const [activeTab,       setActiveTab]       = useState('All');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDrafts,   setCommentDrafts]   = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [likingPost,      setLikingPost]      = useState({});

  // Composer
  const [composerOpen, setComposerOpen] = useState(false);
  const [postType,     setPostType]     = useState('Discussion');
  const [postTitle,    setPostTitle]    = useState('');
  const [postBody,     setPostBody]     = useState('');
  const [postTags,     setPostTags]     = useState('');
  const [isPublic,     setIsPublic]     = useState(true);
  const [targetAudiences, setTargetAudiences] = useState(['Students']);
  const [submitting,   setSubmitting]   = useState(false);

  // Sidebar data
  const [sidebarJobs,    setSidebarJobs]    = useState([]);
  const [sidebarCourses, setSidebarCourses] = useState([]);

  // ── Fetch Feed ────────────────────────────────────────────────────────────
  const fetchFeed = useCallback(async (tab) => {
    setLoading(true);
    setError(null);
    try {
      const post_type = TYPE_TAB_MAP[tab];
      const data = await getCommunityFeed({ post_type, limit: 30 });
      // Normalise: add client-only fields
      const postsArray = Array.isArray(data) ? data : (data?.posts || []);
      setPosts(
        postsArray.map((p) => ({
          ...p,
          liked:      p.liked || false,
          bookmarked: p.bookmarked || false,
          comments:   [],
          commentsLoaded: false,
        }))
      );
    } catch (err) {
      console.error(err);
      setError('Could not load posts. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sidebar data once
  useEffect(() => {
    getCommunityFeed({ post_type: 'Job', limit: 3 }).catch(() => []).then((data) => {
      const jobs = Array.isArray(data) ? data : data?.posts || [];
      setSidebarJobs(jobs.slice(0, 3));
    });
    getCommunityFeed({ post_type: 'Course', limit: 3 }).catch(() => []).then((data) => {
      const courses = Array.isArray(data) ? data : data?.posts || [];
      setSidebarCourses(courses.slice(0, 3));
    });
  }, []);

  // Fetch feed whenever tab changes
  useEffect(() => {
    fetchFeed(activeTab);
  }, [activeTab, fetchFeed]);

  // ── Client-side search filter ─────────────────────────────────────────────
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter((p) =>
      p.title?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q) ||
      p.author?.name?.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.name?.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  // ── Like Toggle ───────────────────────────────────────────────────────────
  const handleToggleLike = async (postId) => {
    if (likingPost[postId]) return;
    setLikingPost((prev) => ({ ...prev, [postId]: true }));

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, reactions_count: p.liked ? p.reactions_count - 1 : p.reactions_count + 1, liked: !p.liked }
          : p
      )
    );

    try {
      await toggleCommunityLike(postId);
    } catch (err) {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, reactions_count: p.liked ? p.reactions_count - 1 : p.reactions_count + 1, liked: !p.liked }
            : p
        )
      );
    } finally {
      setLikingPost((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleToggleBookmark = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  };

  // ── Comments ──────────────────────────────────────────────────────────────
  const handleToggleComments = async (postId) => {
    const isExpanded = expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    // Load comments from API if not yet loaded
    const post = posts.find((p) => p.id === postId);
    if (!isExpanded && !post?.commentsLoaded) {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      try {
        const data = await getPostComments(postId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comments: data, commentsLoaded: true } : p
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;

    try {
      const newComment = await addPostComment(postId, text);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...p.comments, newComment], comments_count: (p.comments_count || 0) + 1 }
            : p
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Create Post ───────────────────────────────────────────────────────────
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;
    setSubmitting(true);
    try {
      const newPost = await createCommunityPost({
        title:     postTitle.trim(),
        content:   postBody.trim(),
        post_type: postType,
        visibility: isPublic ? ['Public'] : (targetAudiences.length > 0 ? targetAudiences : ['Students']),
        metadata: postTags
          ? { tags: postTags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean) }
          : null,
      });

      // Prepend and add client-only fields
      setPosts((prev) => [
        { ...newPost, liked: false, bookmarked: false, comments: [], commentsLoaded: false },
        ...prev,
      ]);

      setPostTitle('');
      setPostBody('');
      setPostTags('');
      setComposerOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col font-sans text-slate-800 overflow-hidden px-4 py-2">

      {/* Header */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 mb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            CampusConnect Social{' '}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue-100 text-brand-blue-700 font-semibold">Pro</span>
          </h1>
          <p className="text-xs text-slate-500">The collaborative network for Students, Instructors, and Industry Recruiters.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, jobs, or tags..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          </div>
          <Button
            onClick={() => setComposerOpen(true)}
            className="bg-brand-blue-700 hover:bg-brand-blue-800 text-white rounded-full px-4 py-1.5 text-xs font-semibold shrink-0 shadow-xs transition-all"
          >
            + Create Post
          </Button>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 h-full overflow-hidden space-y-4">
          {/* Profile card */}
          <Card className="overflow-hidden border border-slate-200 shadow-xs rounded-xl">
            <div className="h-14 bg-gradient-to-r from-brand-blue-600 to-brand-blue-800" />
            <div className="p-3 pt-0 relative">
              <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-900 text-white font-bold grid place-items-center text-xs -mt-6 shadow-xs">
                {initials(displayName)}
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-xs text-slate-900">{displayName}</h3>
                <span className={`inline-block mt-0.5 px-2 py-0.5 text-[9px] font-semibold rounded-full border ${ROLE_CONFIG[userRole]?.bg || ROLE_CONFIG.Student.bg}`}>
                  {ROLE_CONFIG[userRole]?.label || userRole}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-1 rounded-lg bg-slate-50">
                  <div className="font-bold text-slate-800 text-xs">{posts.length}</div>
                  <div className="text-[9px] text-slate-500">Community Posts</div>
                </div>
                <div className="p-1 rounded-lg bg-slate-50">
                  <div className="font-bold text-slate-800 text-xs">
                    {posts.filter((p) => p.bookmarked).length}
                  </div>
                  <div className="text-[9px] text-slate-500">Saved Posts</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Feed nav */}
          <Card className="p-2 border border-slate-200 shadow-xs rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1.5">Feeds</div>
            <nav className="space-y-0.5">
              {[
                { label: 'All Updates',      id: 'All',         icon: '🌐' },
                { label: 'Job Board',         id: 'Jobs',        icon: '💼' },
                { label: 'Course Stream',     id: 'Courses',     icon: '📚' },
                { label: 'Showcase & Demos',  id: 'Projects',    icon: '🚀' },
                { label: 'Discussions',       id: 'Discussions', icon: '💬' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-blue-50 text-brand-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span> {tab.label}
                  </span>
                  {activeTab === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-600" />}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="lg:col-span-6 h-full overflow-y-auto pr-2 space-y-4">

          {/* Quick post prompt */}
          <Card className="p-3 border border-slate-200 shadow-xs rounded-xl bg-white flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-blue-100 text-brand-blue-700 font-bold text-[10px] grid place-items-center shrink-0">
              {initials(displayName)}
            </div>
            <button
              onClick={() => setComposerOpen(true)}
              className="flex-1 text-left px-3 py-1.5 text-xs rounded-full bg-slate-100 hover:bg-slate-200/60 text-slate-500 transition-all border border-transparent"
            >
              Start a post, share a project, or announce an opportunity...
            </button>
          </Card>

          {/* Error state */}
          {error && (
            <Card className="p-4 border border-red-200 bg-red-50 rounded-xl text-center">
              <p className="text-xs text-red-600">{error}</p>
              <button
                onClick={() => fetchFeed(activeTab)}
                className="mt-2 text-xs font-semibold text-brand-blue-700 hover:underline"
              >
                Retry
              </button>
            </Card>
          )}

          {/* Posts list */}
          <div className="space-y-3 pb-8">
            {loading ? (
              [1, 2, 3].map((i) => <PostSkeleton key={i} />)
            ) : filteredPosts.length === 0 ? (
              <Card className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500 text-xs">
                  {searchQuery ? 'No posts match your search.' : 'No posts yet — be the first to post!'}
                </p>
                {(searchQuery || activeTab !== 'All') && (
                  <button
                    onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
                    className="mt-2 text-xs font-semibold text-brand-blue-700 hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="border border-slate-200 shadow-xs rounded-xl overflow-hidden bg-white">

                  {/* Post header */}
                  <div className="p-3.5 pb-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs grid place-items-center shrink-0">
                          {initials(post.author?.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900">{post.author?.name || 'Unknown'}</h4>
                            <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full border ${ROLE_CONFIG[post.author?.role]?.bg || ROLE_CONFIG.Student.bg}`}>
                              {post.author?.role || 'Member'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {post.post_type} · {relativeTime(post.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`text-xs p-1 rounded-md hover:bg-slate-100 transition ${post.bookmarked ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        🔖
                      </button>
                    </div>

                    {/* Title & body */}
                    <div className="mt-2.5">
                      <h3 className="font-bold text-xs text-slate-900 mb-1">{post.title}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
                    </div>

                    {/* Job details (from metadata) */}
                    {post.post_type === 'Job' && post.metadata?.location && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-amber-900 space-y-0.5">
                          <div className="font-semibold">📍 {post.metadata.location}</div>
                          {post.metadata.salary && <div>💰 {post.metadata.salary}</div>}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {post.tags.map((tag) => (
                          <span key={tag.id || tag.name} className="text-[9px] font-semibold text-brand-blue-700 bg-brand-blue-50 px-1.5 py-0.5 rounded">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Tags from metadata (for newly created posts before tags are processed) */}
                    {(!post.tags || post.tags.length === 0) && post.metadata?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {post.metadata.tags.map((tag) => (
                          <span key={tag} className="text-[9px] font-semibold text-brand-blue-700 bg-brand-blue-50 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions bar */}
                  <div className="px-3.5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      disabled={likingPost[post.id]}
                      className={`flex items-center gap-1 hover:text-brand-blue-700 font-medium transition ${post.liked ? 'text-brand-blue-600 font-bold' : ''}`}
                    >
                      <span>{post.liked ? '💙' : '🤍'}</span>
                      <span>{post.reactions_count ?? 0} Likes</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-1 hover:text-slate-800 font-medium transition"
                    >
                      <span>💬</span>
                      <span>{post.comments_count ?? 0} Comments</span>
                    </button>

                    <button className="flex items-center gap-1 hover:text-slate-800 font-medium transition">
                      <span>🔄</span>
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments section */}
                  {expandedComments[post.id] && (
                    <div className="p-3 bg-slate-50 border-t border-slate-200/80 space-y-2">
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {loadingComments[post.id] ? (
                          <p className="text-[10px] text-slate-400 animate-pulse">Loading comments…</p>
                        ) : post.comments?.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">No comments yet.</p>
                        ) : (
                          post.comments.map((c) => (
                            <div key={c.id} className="p-2 rounded bg-white border border-slate-200 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{c.author?.name || c.author}</span>
                                <span className="text-[9px] text-slate-400">{c.author?.role || ''}</span>
                              </div>
                              <p className="text-slate-600">{c.content || c.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentDrafts[post.id] || ''}
                          onChange={(e) => setCommentDrafts({ ...commentDrafts, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="Write a comment…"
                          className="flex-1 px-2.5 py-1 text-[11px] rounded-md border border-slate-200 bg-white focus:outline-none focus:border-brand-blue-500"
                        />
                        <Button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-brand-blue-700 text-white text-[10px] px-2.5 py-1 rounded-md font-semibold"
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-3 h-full overflow-hidden space-y-4">

          {/* Hiring Spotlight */}
          <Card className="p-3 border border-slate-200 shadow-xs rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Hiring Spotlight</h3>
              <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full">Employers</span>
            </div>
            {sidebarJobs.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic px-1">No open roles right now.</p>
            ) : (
              <ul className="space-y-2">
                {sidebarJobs.map((job) => (
                  <li key={job.id} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                    <div className="text-xs font-bold text-slate-800">{job.title}</div>
                    <div className="text-[10px] text-slate-500">{job.author?.name || 'Company'} · {job.metadata?.employment_type || job.metadata?.location || 'Full-time'}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Course Feed */}
          <Card className="p-3 border border-slate-200 shadow-xs rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Course Feed</h3>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">Educators</span>
            </div>
            {sidebarCourses.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic px-1">No courses available.</p>
            ) : (
              <ul className="space-y-2">
                {sidebarCourses.map((course) => (
                  <li key={course.id} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                    <div className="text-xs font-bold text-slate-800">{course.title}</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      📚 {course.author?.name || 'Educator'} · {course.metadata?.level || course.metadata?.category || 'Course'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="text-[9px] text-slate-400 px-1 space-y-1">
            <p>© 2026 CampusConnect Inc.</p>
            <div className="flex gap-2">
              <a href="/privacy" className="hover:underline">Privacy</a> ·{' '}
              <a href="/terms" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>

      </div>

      {/* Composer Modal */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm grid place-items-center p-4">
          <Card className="w-full max-w-lg p-5 space-y-3 shadow-xl bg-white rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Create New Post</h3>
              <button
                onClick={() => setComposerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              {/* Post type */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Post Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Discussion', 'Job', 'Course', 'Project'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPostType(t)}
                      className={`py-1 text-xs font-semibold rounded-lg border transition ${
                        postType === t
                          ? 'bg-brand-blue-700 text-white border-brand-blue-700'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience Toggle */}
              <div>
                <label className="flex items-center cursor-pointer mb-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isPublic}
                      onChange={() => setIsPublic(!isPublic)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-brand-blue-500' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-xs font-semibold text-slate-700">Visible to all users</span>
                </label>

                {!isPublic && (
                  <div className="mt-3 p-3 bg-brand-blue-50/50 rounded-lg border border-brand-blue-100">
                    <label className="block text-[10px] font-bold uppercase text-brand-blue-700 mb-2">Select Target Audiences</label>
                    <div className="flex gap-2">
                      {['Students', 'Educators', 'Employers', 'Admins'].map((aud) => (
                        <button
                          key={aud}
                          type="button"
                          onClick={() => setTargetAudiences(prev => 
                            prev.includes(aud) 
                              ? prev.filter(a => a !== aud) 
                              : [...prev, aud]
                          )}
                          className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition ${
                            targetAudiences.includes(aud)
                              ? 'bg-brand-blue-600 text-white border-brand-blue-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {aud}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Give your post a concise title…"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-blue-500"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Body Content</label>
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Share details…"
                  rows={3}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-blue-500 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="React, Hiring, OpenSource"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setComposerOpen(false)}
                  className="text-xs px-3"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-blue-700 hover:bg-brand-blue-800 text-white text-xs px-4 font-semibold"
                >
                  {submitting ? 'Publishing…' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}