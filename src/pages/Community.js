import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  Student: { label: 'Student', bg: 'bg-blue-50 text-brand-blue-700 border-brand-blue-200' },
  Educator: { label: 'Educator', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Employer: { label: 'Employer · Hiring', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  Admin: { label: 'Platform Admin', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const INITIAL_POSTS = [
  {
    id: 'p1',
    author: 'Sarah Jenkins',
    role: 'Employer',
    company: 'TechCorp Solutions',
    avatar: 'SJ',
    type: 'Job',
    when: '2 hours ago',
    title: 'Junior Full-Stack Developer (Remote)',
    body: 'We are expanding our frontend team! Looking for graduating students proficient in React, Node.js, and Tailwind CSS. Portfolio links encouraged.',
    tags: ['React', 'FullStack', 'Hiring'],
    likes: 34,
    liked: false,
    bookmarked: false,
    applied: false,
    jobDetails: { location: 'Remote (US/CA)', salary: '$75k - $90k/yr', deadline: 'Aug 30' },
    comments: [
      { id: 'c1', author: 'Alex Chen', role: 'Student', text: 'Just submitted my application! Check out my showcase post below.' },
    ],
  },
  {
    id: 'p2',
    author: 'Prof. David Miller',
    role: 'Educator',
    course: 'CS-402: Distributed Systems',
    avatar: 'DM',
    type: 'Course',
    when: '4 hours ago',
    title: 'Module 3: Raft Consensus Algorithm Notes Released',
    body: 'Lecture slides and the starter code for Lab 2 are now live. Please review Section 4 before our Q&A session on Thursday.',
    tags: ['DistributedSystems', 'Assignments'],
    likes: 58,
    liked: true,
    bookmarked: true,
    comments: [
      { id: 'c2', author: 'Maya Lin', role: 'Student', text: 'Will the session be recorded for asynchronous students?' },
    ],
  },
  {
    id: 'p3',
    author: 'Amir Khan',
    role: 'Student',
    avatar: 'AK',
    type: 'Project',
    when: '1 day ago',
    title: 'Built an AI-Powered Resume Parser in Rust & React',
    body: 'Spent the weekend building an open-source tool that analyzes tech resumes against job descriptions. Feedback from recruiters and educators would be incredible!',
    tags: ['OpenSource', 'Rust', 'AI'],
    likes: 120,
    liked: false,
    bookmarked: false,
    comments: [],
  },
];

const SIDEBAR_JOBS = [
  { title: 'Frontend Intern', company: 'DesignWorks', type: 'Internship' },
  { title: 'Data Analyst Trainee', company: 'QuantMetrics', type: 'Full-time' },
];

const UPCOMING_COURSES = [
  { title: 'Advanced Cloud Architecture', code: 'CS-501', due: 'Assignment Due Tomorrow' },
  { title: 'UI/UX Systems Design', code: 'DES-210', due: 'Live Workshop @ 3 PM' },
];

export default function Community() {
  const { user, role: authRole } = useAuth();
  const displayName = user?.name || 'Vayvora student';
  const userRole = authRole || 'Student';

  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [composerOpen, setComposerOpen] = useState(false);

  const [postType, setPostType] = useState('Discussion');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postTags, setPostTags] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Jobs' && p.type === 'Job') ||
        (activeTab === 'Courses' && p.type === 'Course') ||
        (activeTab === 'Projects' && p.type === 'Project') ||
        (activeTab === 'Discussions' && p.type === 'Discussion');

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

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    const newPost = {
      id: `p_${Date.now()}`,
      author: displayName,
      role: userRole,
      avatar: displayName.split(' ').map((n) => n[0]).join('').toUpperCase(),
      type: postType,
      when: 'Just now',
      title: postTitle.trim(),
      body: postBody.trim(),
      tags: postTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      likes: 0,
      liked: false,
      bookmarked: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setPostTitle('');
    setPostBody('');
    setPostTags('');
    setComposerOpen(false);
  };

  return (
    // Fixed viewport height prevents full-page scrolling
    <div className="w-full h-[calc(100vh-100px)] flex flex-col font-sans text-slate-800 overflow-hidden px-4 py-2">
      
      {/* Community Header */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 mb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            CampusConnect Social <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue-100 text-brand-blue-700 font-semibold">Pro</span>
          </h1>
          <p className="text-xs text-slate-500">
            The collaborative network for Students, Instructors, and Industry Recruiters.
          </p>
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

      {/* 3-Column Grid (Only middle column scrolls) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

        {/* LEFT COLUMN (Fixed) */}
        <div className="lg:col-span-3 h-full overflow-hidden space-y-4">
          <Card className="overflow-hidden border border-slate-200 shadow-xs rounded-xl">
            <div className="h-14 bg-gradient-to-r from-brand-blue-600 to-brand-blue-800"></div>
            <div className="p-3 pt-0 relative">
              <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-900 text-white font-bold grid place-items-center text-xs -mt-6 shadow-xs">
                {displayName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-xs text-slate-900">{displayName}</h3>
                <span className={`inline-block mt-0.5 px-2 py-0.2 text-[9px] font-semibold rounded-full border ${ROLE_CONFIG[userRole]?.bg || ROLE_CONFIG.Student.bg}`}>
                  {ROLE_CONFIG[userRole]?.label || userRole}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-1 rounded-lg bg-slate-50">
                  <div className="font-bold text-slate-800 text-xs">148</div>
                  <div className="text-[9px] text-slate-500">Connections</div>
                </div>
                <div className="p-1 rounded-lg bg-slate-50">
                  <div className="font-bold text-slate-800 text-xs">12</div>
                  <div className="text-[9px] text-slate-500">Saved Posts</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-2 border border-slate-200 shadow-xs rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1.5">Feeds</div>
            <nav className="space-y-0.5">
              {[
                { label: 'All Updates', id: 'All', icon: '🌐' },
                { label: 'Job Board', id: 'Jobs', icon: '💼' },
                { label: 'Course Stream', id: 'Courses', icon: '📚' },
                { label: 'Showcase & Demos', id: 'Projects', icon: '🚀' },
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
                  {activeTab === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-600"></span>}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* MIDDLE COLUMN (Scrolls independently) */}
        <div className="lg:col-span-6 h-full overflow-y-auto pr-2 space-y-4">
          
          {/* Quick Post Prompt */}
          <Card className="p-3 border border-slate-200 shadow-xs rounded-xl bg-white flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-blue-100 text-brand-blue-700 font-bold text-[10px] grid place-items-center shrink-0">
              {displayName.split(' ').map((n) => n[0]).join('')}
            </div>
            <button
              onClick={() => setComposerOpen(true)}
              className="flex-1 text-left px-3 py-1.5 text-xs rounded-full bg-slate-100 hover:bg-slate-200/60 text-slate-500 transition-all border border-transparent"
            >
              Start a post, share a project, or announce an opportunity...
            </button>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-3 pb-8">
            {filteredPosts.length === 0 ? (
              <Card className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500 text-xs">No posts found for this view.</p>
                <button
                  onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
                  className="mt-2 text-xs font-semibold text-brand-blue-700 hover:underline"
                >
                  Reset filters
                </button>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="border border-slate-200 shadow-xs rounded-xl overflow-hidden bg-white">
                  
                  <div className="p-3.5 pb-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs grid place-items-center shrink-0">
                          {post.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900 hover:underline cursor-pointer">{post.author}</h4>
                            <span className={`px-1.5 py-0.2 text-[9px] font-semibold rounded-full border ${ROLE_CONFIG[post.role]?.bg}`}>
                              {post.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {post.company || post.course || 'Community Member'} · {post.when}
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

                    <div className="mt-2.5">
                      <h3 className="font-bold text-xs text-slate-900 mb-1">{post.title}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.body}</p>
                    </div>

                    {post.type === 'Job' && post.jobDetails && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-amber-900 space-y-0.5">
                          <div className="font-semibold">📍 {post.jobDetails.location}</div>
                          <div>💰 {post.jobDetails.salary} · Apply by {post.jobDetails.deadline}</div>
                        </div>
                        <Button
                          size="sm"
                          disabled={post.applied}
                          onClick={() => handleApplyJob(post.id)}
                          className={`text-[10px] px-3 py-1 rounded-md font-semibold transition ${
                            post.applied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          {post.applied ? '✓ Applied' : 'Apply Now'}
                        </Button>
                      </div>
                    )}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[9px] font-semibold text-brand-blue-700 bg-brand-blue-50 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-3.5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1 hover:text-brand-blue-700 font-medium transition ${post.liked ? 'text-brand-blue-600 font-bold' : ''}`}
                    >
                      <span>{post.liked ? '💙' : '🤍'}</span>
                      <span>{post.likes} Likes</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-1 hover:text-slate-800 font-medium transition"
                    >
                      <span>💬</span>
                      <span>{post.comments.length} Comments</span>
                    </button>

                    <button className="flex items-center gap-1 hover:text-slate-800 font-medium transition">
                      <span>🔄</span>
                      <span>Share</span>
                    </button>
                  </div>

                  {expandedComments[post.id] && (
                    <div className="p-3 bg-slate-50 border-t border-slate-200/80 space-y-2">
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {post.comments.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">No comments yet.</p>
                        ) : (
                          post.comments.map((c) => (
                            <div key={c.id} className="p-2 rounded bg-white border border-slate-200 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{c.author}</span>
                                <span className="text-[9px] text-slate-400">{c.role}</span>
                              </div>
                              <p className="text-slate-600">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentDrafts[post.id] || ''}
                          onChange={(e) => setCommentDrafts({ ...commentDrafts, [post.id]: e.target.value })}
                          placeholder="Write a comment..."
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

        {/* RIGHT COLUMN (Fixed) */}
        <div className="lg:col-span-3 h-full overflow-hidden space-y-4">
          <Card className="p-3 border border-slate-200 shadow-xs rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Hiring Spotlight</h3>
              <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full">Employers</span>
            </div>
            <ul className="space-y-2">
              {SIDEBAR_JOBS.map((job) => (
                <li key={job.title} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                  <div className="text-xs font-bold text-slate-800">{job.title}</div>
                  <div className="text-[10px] text-slate-500">{job.company} · {job.type}</div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-3 border border-slate-200 shadow-xs rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Course Feed</h3>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">Educators</span>
            </div>
            <ul className="space-y-2">
              {UPCOMING_COURSES.map((course) => (
                <li key={course.code} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                  <div className="text-xs font-bold text-slate-800">{course.title} ({course.code})</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">⏱ {course.due}</div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="text-[9px] text-slate-400 px-1 space-y-1">
            <p>© 2026 CampusConnect Inc.</p>
            <div className="flex gap-2">
              <a href="/privacy" className="hover:underline">Privacy</a> · 
              <a href="/terms" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>

      </div>

      {/* Composer Modal */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs grid place-items-center p-4">
          <Card className="w-full max-w-lg p-5 space-y-3 shadow-xl bg-white rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Create New Social Post</h3>
              <button
                onClick={() => setComposerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
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

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Give your post a concise title..."
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Body Content</label>
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Share details..."
                  rows={3}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tags</label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="React, Hiring, Assignment2"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setComposerOpen(false)}
                  className="text-xs px-3"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-blue-700 hover:bg-brand-blue-800 text-white text-xs px-4 font-semibold">
                  Publish Post
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}