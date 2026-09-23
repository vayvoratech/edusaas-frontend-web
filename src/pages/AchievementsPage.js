import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import {
  getMyAchievements,
  getMyCertificates,
  getMyEnrollments,
  getCourses,
} from '../services/api';
import { downloadCertificatePdf } from '../utils/certificate';

const badgeIcons = ['🏆', '🥇', '🌟', '🛡️', '🔥', '⭐', '💎', '🚀', '🎖️', '🏅', '👑', '⚡'];

export default function AchievementsPage() {
  const [items, setItems] = useState([]);
  const [certs, setCerts] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Map of courseId -> title, used to label certificates with the completed course name.
  const [courseTitles, setCourseTitles] = useState({});

  useEffect(() => {
    getMyAchievements().then(setItems).catch(() => setItems([]));
    getMyCertificates().then(setCerts).catch(() => setCerts([]));

    // Completed courses give certificates their course names.
    Promise.all([getMyEnrollments(), getCourses()])
      .then(([enrollments, courses]) => {
        const list = Array.isArray(courses) ? courses : courses?.courses || [];
        const titles = {};
        for (const e of enrollments || []) {
          if (e.completion_percentage >= 100) {
            const course = list.find((c) => c.id === e.course_id);
            if (course?.title) titles[e.course_id] = course.title;
          }
        }
        setCourseTitles(titles);
      })
      .catch(() => setCourseTitles({}));
  }, []);

  // Best-effort course name for a certificate: explicit field, then completed enrollments.
  const courseNameFor = (cert) =>
    cert.course_name ||
    cert.course_title ||
    courseTitles[cert.course_id] ||
    Object.values(courseTitles)[0] ||
    'Course Completion';

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    setError('');
    try {
      await downloadCertificatePdf(
        cert,
        user?.displayName || user?.name || 'Student',
        courseNameFor(cert)
      );
    } catch (e) {
      console.error('Certificate download failed:', e);
      setError('Could not generate the certificate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const grouped = items.reduce((acc, a) => {
    const k = a.milestone || 'Other';
    (acc[k] = acc[k] || []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Achievements</h2>
        <p className="text-sm text-slate-500">Badges, milestones, and certificates you've earned.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Badges Collected</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{items.length}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Certificates</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">{certs.length}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Milestones Hit</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">
            {Object.keys(grouped).length}
          </div>
        </Card>
      </div>

      {Object.entries(grouped).map(([level, badges]) => (
        <Card key={level} title={level}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {badges.map((b, i) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200 flex items-center gap-3 hover:shadow-sm transition"
              >
                <div className="text-3xl">{badgeIcons[i % badgeIcons.length]}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-800 truncate">{b.badge_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(b.earned_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {certs.length > 0 && (
        <Card title="Certificates">
          <ul className="divide-y divide-slate-100">
            {certs.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📜</span>
                  <div>
                    <div className="font-semibold text-slate-800">{c.certificate_code}</div>
                    <div className="text-xs text-slate-500">
                      {courseNameFor(c)} · Issued {new Date(c.issued_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(c)}
                  disabled={downloadingId === c.id}
                  className="text-xs px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === c.id ? 'Preparing…' : 'Download'}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
