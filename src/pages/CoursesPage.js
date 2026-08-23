import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, getMyEnrollments, enrollCourse, getUserProfile, fetchGapReport } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Programming', 'Data Science', 'Web Dev', 'Soft Skills', 'AI & ML', 'Management'];
const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced'];

const iconFor = (c) => {
  const t = (c.title || '').toLowerCase();
  if (t.includes('python')) return '🐍';
  if (t.includes('data')) return '📊';
  if (t.includes('web')) return '🌐';
  if (t.includes('soft')) return '💬';
  if (t.includes('machine')) return '🤖';
  if (t.includes('project')) return '📋';
  return '📘';
};

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollmentsMap, setEnrollmentsMap] = useState(new Map());
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [userDomain, setUserDomain] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);
  const { user } = useAuth();

  const load = async () => {
    try {
      const filters = {};
      if (activeCategory !== 'All') filters.category = activeCategory;
      if (activeDifficulty !== 'All') filters.difficulty = activeDifficulty;

      const [cs, es, profile, gapReport] = await Promise.all([
        getCourses({ status: 'active', ...filters }),
        getMyEnrollments().catch(() => []),
        getUserProfile().catch(() => null),
        fetchGapReport(user.id).catch(() => null),
      ]);
      
      // Sort all courses by created_at descending (newest first)
      cs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
      setCourses(cs);
      setEnrollmentsMap(new Map(es.map((e) => [e.course_id, e])));
      
      if (gapReport && gapReport.missing_skills) {
        setMissingSkills(gapReport.missing_skills.map(s => s.toLowerCase()));
      }
      if (profile && profile.domain_role) {
        setUserDomain(profile.domain_role);
      } else if (user && user.domain_role) {
        setUserDomain(user.domain_role);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => { load(); }, [activeCategory, activeDifficulty]);

  const onEnroll = async (id) => {
    setBusyId(id);
    try {
      await enrollCourse(id);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusyId(null);
    }
  };

  const isRecommended = (c) => {
    // Admins and Employers shouldn't see targeted recommendations, just the raw catalog
    if (user && (user.role === 'Admin' || user.role === 'Employer')) {
      return false;
    }

    const providerStr = (c.provider || '').toLowerCase();
    const categoryStr = (c.category || '').toLowerCase();
    const titleStr = (c.title || '').toLowerCase();
    
    if (missingSkills.length > 0) {
      return missingSkills.some(skill => categoryStr.includes(skill) || titleStr.includes(skill));
    }
    if (userDomain) {
      const domainStr = userDomain.toLowerCase();
      return providerStr === domainStr || categoryStr.includes(domainStr);
    }
    return false;
  };

  const recommendedCourses = courses.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return isRecommended(c);
  });
  const otherCourses = courses.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return !isRecommended(c);
  });

  const renderCourseCard = (c, isRec = false) => {
    const enrollment = enrollmentsMap.get(c.id);
    const enrolled = !!enrollment;
    const completed = enrollment?.completion_percentage >= 100;
    const tags = c.category ? c.category.split(',').map(t => t.trim()) : [];

    return (
      <div key={c.id} className="relative group flex flex-col bg-white rounded-3xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-brand-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
        
        {/* Card Header Background */}
        <div className="h-40 w-full bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden">
          {c.thumbnail_url ? (
            <img src={`http://localhost:5000${c.thumbnail_url}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-blue-400 via-transparent to-transparent"></div>
          )}
          
          {/* Dark gradient overlay so text/icons are visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

          {isRec && (
            <div className="absolute top-4 right-4 bg-brand-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              RECOMMENDED
            </div>
          )}
          <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-3xl z-10 transform group-hover:scale-110 transition-transform duration-300">
            {iconFor(c)}
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-6 pt-10 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2 group-hover:text-brand-blue-600 transition-colors">
              {c.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4 uppercase tracking-wider">
            <span>{c.provider}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className={c.difficulty === 'beginner' ? 'text-emerald-600' : c.difficulty === 'advanced' ? 'text-rose-600' : 'text-amber-600'}>
              {c.difficulty}
            </span>
          </div>

          {c.description && (
            <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">
              {c.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
            {tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60">
                {tag}
              </span>
            ))}
          </div>

          <div className="w-full">
            {c.external_url ? (
              <a href={c.external_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                <button className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-md shadow-slate-900/10">
                  Go to Course ↗
                </button>
              </a>
            ) : enrolled ? (
              <Link to={`/app/learning/${c.id}`} className="block w-full">
                {completed ? (
                  <button className="w-full py-3 rounded-xl bg-brand-green-50 hover:bg-brand-green-100 text-brand-green-700 border border-brand-green-200 font-semibold text-sm transition-colors">
                    ✓ Course Completed
                  </button>
                ) : (
                  <button className="w-full py-3 rounded-xl bg-brand-blue-50 hover:bg-brand-blue-100 text-brand-blue-700 border border-brand-blue-200 font-semibold text-sm transition-colors">
                    Continue Learning →
                  </button>
                )}
              </Link>
            ) : (
              <button
                className="w-full py-3 rounded-xl bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={() => onEnroll(c.id)}
                disabled={busyId === c.id}
              >
                {busyId === c.id ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 -m-4 sm:-m-6 lg:-m-8">
      
      {/* Hero Section */}
      <div className="relative h-[340px] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="/courses_hero_bg.jpg" 
            alt="Courses Background" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-50/50"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto z-10 pt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-md">
            EduSaaS Academy
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Potential</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl text-balance">
            Discover world-class courses designed to close your skill gaps and accelerate your career.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* Search & Filters Panel */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/40 p-4 sm:p-6 mb-12">
          
          {/* Search Bar */}
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 text-lg">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search courses by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filter by Category</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeCategory === c 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-16 bg-slate-200 hidden lg:block"></div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Difficulty</h4>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setActiveDifficulty(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                      activeDifficulty === d 
                      ? 'bg-brand-blue-100 text-brand-blue-700 border border-brand-blue-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 mb-8 flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 && !error && (
          <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center shadow-sm">
            <div className="text-7xl mb-6">🏜️</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No courses found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {(activeCategory !== 'All' || activeDifficulty !== 'All')
                ? "We couldn't find any courses matching your filters. Try exploring other categories!"
                : "No courses have been published yet. Check back soon for exciting new content."}
            </p>
            {(activeCategory !== 'All' || activeDifficulty !== 'All') && (
              <button
                className="mt-6 px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                onClick={() => { setActiveCategory('All'); setActiveDifficulty('All'); }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Course Grids */}
        {recommendedCourses.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                ✨
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                <p className="text-sm text-slate-500 font-medium">Curated to close your skill gaps</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {recommendedCourses.map(c => renderCourseCard(c, true))}
            </div>
          </div>
        )}

        {otherCourses.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                📚
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Explore Catalog</h2>
                <p className="text-sm text-slate-500 font-medium">Browse all available courses</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {otherCourses.map(c => renderCourseCard(c, false))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
