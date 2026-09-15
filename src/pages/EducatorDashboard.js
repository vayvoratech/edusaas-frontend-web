import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getEducatorDashboard, getCourses, getStudentCandidates, getAnnouncements, resolveAssetUrl,
  markAnnouncementNotificationsRead,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

function ReviewerAvatar({ name, avatarUrl, size = "w-8 h-8", textClass = "text-xs" }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';

  const resolved = !imgError && avatarUrl ? resolveAssetUrl(avatarUrl) : null;

  if (resolved) {
    return (
      <img
        src={resolved}
        alt=""
        onError={() => setImgError(true)}
        className={`${size} rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs`}
      />
    );
  }

  const bgColors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];
  const charSum = (name || 'S').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colorClass = bgColors[charSum % bgColors.length];

  return (
    <div
      className={`${size} rounded-full ${colorClass} border flex items-center justify-center font-bold tracking-wider shrink-0 select-none shadow-2xs ${textClass}`}
      title={name}
    >
      {initials}
    </div>
  );
}

export default function EducatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [learners, setLearners] = useState([]);
  const [recent, setRecent] = useState([]);

  const dismissedKey = `edu_dismissed_announcements_${user?.id || 'educator'}`;
  const getDismissedIds = () => {
    try {
      const raw = localStorage.getItem(dismissedKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const markSeenLocally = (id) => {
    try {
      const seenKey = `edu_seen_announcements_${user?.id || 'educator'}`;
      const raw = localStorage.getItem(seenKey);
      const seen = raw ? JSON.parse(raw) : [];
      if (!seen.includes(id)) {
        localStorage.setItem(seenKey, JSON.stringify([...seen, id]));
      }
    } catch {}
  };

  const handleAnnouncementClick = (id) => {
    try {
      const dismissed = getDismissedIds();
      if (!dismissed.includes(id)) {
        localStorage.setItem(dismissedKey, JSON.stringify([...dismissed, id]));
      }
    } catch {}
    markSeenLocally(id);
    markAnnouncementNotificationsRead(id).finally(() => {
      window.dispatchEvent(new CustomEvent('notifications_updated'));
      window.dispatchEvent(new CustomEvent('announcements_seen'));
    });
    setRecent((prev) => prev.filter((a) => a.id !== id));
    navigate('/app/community', { state: { activeTab: 'Announcements' } });
  };

  const handleDismissOnly = (e, id) => {
    e.stopPropagation();
    try {
      const dismissed = getDismissedIds();
      if (!dismissed.includes(id)) {
        localStorage.setItem(dismissedKey, JSON.stringify([...dismissed, id]));
      }
    } catch {}
    markSeenLocally(id);
    markAnnouncementNotificationsRead(id).finally(() => {
      window.dispatchEvent(new CustomEvent('notifications_updated'));
      window.dispatchEvent(new CustomEvent('announcements_seen'));
    });
    setRecent((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    getEducatorDashboard().then(setData).catch(() => {});
    if (user?.id) {
      getCourses({ educator_id: user.id, status: 'active' }).then(setCourses).catch(() => {});
    }
    getStudentCandidates().then(setLearners).catch(() => {});
    getAnnouncements()
      .then((list) => {
        const dismissed = getDismissedIds();
        setRecent((Array.isArray(list) ? list : []).filter((a) => !dismissed.includes(a.id)));
      })
      .catch(() => {});
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-sm text-slate-500">Manage your courses and track learner progress.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Enrolled Learners</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{data?.enrolledLearners ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Avg score {data?.avgCompletion ?? 0}%</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Active Courses</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">{data?.activeCourses ?? 0}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Course Ratings</div>
          <div className="text-3xl font-bold text-amber-500 mt-1">{data?.courseRatings ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Avg rating:</span>
            <span className="font-semibold text-slate-700">
              {data?.avgRating ? `${data.avgRating} ★` : 'No reviews yet'}
            </span>
          </div>
        </Card>
        <Link to="/app/tasks" className="block group">
          <Card className="!p-4 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Upcoming Tasks</div>
              <span className="text-[10px] text-slate-400 group-hover:text-brand-blue-600 transition-colors">View →</span>
            </div>
            <div className="text-3xl font-bold text-rose-600 mt-1">
              {data?.upcomingTasks ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {data?.upcomingTasks === 1 ? '1 Task Pending' : `${data?.upcomingTasks ?? 0} Tasks Pending`}
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Learner Performance">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.learnerPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="technical" stroke="#2563eb" strokeWidth={2} name="Technical Skills" />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Skill Gap Analysis">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillGapAnalysis || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Active Learners" className="lg:col-span-2">
          <ul className="space-y-3">
            {learners.slice(0, 4).map((l, i) => {
              const score = 60 + ((i * 17) % 35);
              return (
                <li key={l.id} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                    {(l.name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">{l.name}</div>
                  </div>
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${score > 80 ? 'bg-brand-green-500' : 'bg-brand-orange-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-10 text-right">{score}%</span>
                </li>
              );
            })}
            {learners.length === 0 && (
              <li className="text-sm text-slate-400 text-center py-4">No active learners yet.</li>
            )}
          </ul>
        </Card>

        <Card
          title="Announcements"
          action={
            <button
              onClick={() => navigate('/app/community', { state: { activeTab: 'Announcements' } })}
              className="text-xs text-brand-blue-600 hover:underline font-semibold"
            >
              View Feed →
            </button>
          }
        >
          <ul className="space-y-2 text-sm">
            {recent.slice(0, 4).map((a) => (
              <li
                key={a.id}
                onClick={() => handleAnnouncementClick(a.id)}
                className="group flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
                title="Click to view in Community Announcements"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-brand-orange-500 shrink-0">📣</span>
                  <span className="text-slate-700 font-medium group-hover:text-brand-blue-700 truncate transition-colors">
                    {a.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-brand-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                  </span>
                  <button
                    onClick={(e) => handleDismissOnly(e, a.id)}
                    title="Dismiss from dashboard"
                    className="w-5 h-5 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-200/60 grid place-items-center text-xs transition"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="text-slate-400 py-2 text-center text-xs">
                No active announcements on dashboard.
              </li>
            )}
          </ul>
          <Link to="/app/announcements">
            <Button className="mt-4 w-full" variant="outline">Send Announcement</Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/app/manage-courses"><Card className="!p-4"><div className="text-3xl">📚</div><div className="font-semibold mt-2">Manage Courses</div></Card></Link>
        <Link to="/app/learners"><Card className="!p-4"><div className="text-3xl">👥</div><div className="font-semibold mt-2">View Learners</div></Card></Link>
        <Link to="/app/insights"><Card className="!p-4"><div className="text-3xl">📈</div><div className="font-semibold mt-2">Insights Report</div></Card></Link>
        <Link to="/app/announcements"><Card className="!p-4"><div className="text-3xl">📣</div><div className="font-semibold mt-2">Send Announcement</div></Card></Link>
      </div>

      {/* Recent Student Feedback Section */}
      <Card
        title="Recent Course Feedback & Reviews"
        action={
          <Link to="/app/manage-courses" className="text-xs text-brand-blue-600 font-semibold hover:underline flex items-center gap-1">
            <span>View All in Courses</span>
            <span>→</span>
          </Link>
        }
      >
        {data?.recentFeedbacks && data.recentFeedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentFeedbacks.slice(0, 4).map((f) => (
              <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <ReviewerAvatar name={f.user_name} avatarUrl={f.avatar_url} />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">{f.user_name}</div>
                      <div className="text-[11px] text-brand-blue-600 font-medium truncate">{f.course_title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>{star <= f.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                {f.review ? (
                  <p className="text-xs text-slate-600 line-clamp-2 italic pl-10.5">"{f.review}"</p>
                ) : (
                  <p className="text-xs text-slate-400 italic pl-10.5">Rated {f.rating} stars with no written comments.</p>
                )}
                <div className="text-[10px] text-slate-400 text-right mt-2">
                  {f.created_at ? new Date(f.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            <span className="text-2xl block mb-1">💬</span>
            No student course feedback received yet. When learners rate your courses, reviews will appear here.
          </div>
        )}
      </Card>

      <Card title="My Courses" action={<Link to="/app/manage-courses" className="text-xs text-brand-blue-600 hover:underline">Manage →</Link>}>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-500">No active courses yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {courses.slice(0, 4).map((c) => (
              <li key={c.id} className="py-2.5 flex justify-between text-sm">
                <span className="font-medium text-slate-800">{c.title}</span>
                <span className="text-xs text-slate-500">{c.category} · {c.difficulty}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
