import React, { useEffect, useState } from 'react';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import {
  getMyAchievements,
  getMyCertificates,
  getMyEnrollments,
  getCourses,
} from '../services/api';
import { downloadCertificatePdf } from '../utils/certificate';

const badgeIcons = [
  '\u{1F3C6}',
  '\u{1F947}',
  '\u{2B50}',
  '\u{1F3AF}',
  '\u{1F525}',
  '\u{1F680}',
  '\u{1F3C5}',
  '\u{1F4B0}',
  '\u{1F396}',
  '\u{1F451}',
  '\u{26A1}',
];

const badgeThemes = [
  {
    bg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    border: '#fed7aa',
    glow: 'rgba(249,115,22,.22)',
  },
  {
    bg: 'linear-gradient(135deg, #fefce8, #fef3c7)',
    border: '#fde68a',
    glow: 'rgba(234,179,8,.22)',
  },
  {
    bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    border: '#bfdbfe',
    glow: 'rgba(59,130,246,.22)',
  },
  {
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    border: '#ddd6fe',
    glow: 'rgba(139,92,246,.22)',
  },
  {
    bg: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    border: '#fecdd3',
    glow: 'rgba(244,63,94,.22)',
  },
  {
    bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    border: '#bbf7d0',
    glow: 'rgba(34,197,94,.22)',
  },
];

export default function AchievementsPage() {
  const [items, setItems] = useState([]);
  const [certs, setCerts] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const [courseTitles, setCourseTitles] = useState({});

  useEffect(() => {
    getMyAchievements().then(setItems).catch(() => setItems([]));
    getMyCertificates().then(setCerts).catch(() => setCerts([]));

    Promise.all([getMyEnrollments(), getCourses()])
      .then(([enrollments, courses]) => {
        const list = Array.isArray(courses)
          ? courses
          : courses?.courses || [];

        const titles = {};

        for (const e of enrollments || []) {
          if (e.completion_percentage >= 100) {
            const course = list.find((c) => c.id === e.course_id);

            if (course?.title) {
              titles[e.course_id] = course.title;
            }
          }
        }

        setCourseTitles(titles);
      })
      .catch(() => setCourseTitles({}));
  }, []);

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
      setError(
        'Could not generate the certificate PDF. Please try again.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const grouped = items.reduce((acc, a) => {
    const k = a.milestone || 'Other';

    (acc[k] = acc[k] || []).push(a);

    return acc;
  }, {});

  const totalAchievements = items.length;
  const totalCertificates = certs.length;
  const totalMilestones = Object.keys(grouped).length;

  return (
    <div className="achievements-page space-y-7">

      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="achievement-hero">
        <div className="achievement-hero-glow achievement-glow-one" />
        <div className="achievement-hero-glow achievement-glow-two" />

        <div className="achievement-hero-content">

          <div className="achievement-kicker">
            <span className="achievement-kicker-icon">✨</span>
            <span>YOUR LEARNING JOURNEY</span>
          </div>

          <h2 className="achievement-title">
            Achievements
            <span className="achievement-title-highlight">
              {' '}Unlocked
            </span>
          </h2>

          <p className="achievement-subtitle">
            Celebrate your progress, recognize your milestones,
            and showcase every accomplishment you have earned.
          </p>

          <div className="hero-text-divider">
            <span />
            <span />
            <span />
          </div>

        </div>

        <div className="achievement-hero-trophy" aria-hidden="true">

          <div className="trophy-orbit orbit-one" />
          <div className="trophy-orbit orbit-two" />

          <div className="trophy-core">
            🏆
          </div>

          <span className="floating-star star-one">✦</span>
          <span className="floating-star star-two">✧</span>
          <span className="floating-star star-three">✦</span>

        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="achievement-stats-grid">

        <div className="achievement-stat-card blue-stat">

          <div className="stat-card-top">

            <div className="stat-icon-wrapper blue-icon">
              🏆
            </div>

            <span className="stat-status">
              Earned
            </span>

          </div>

          <div className="stat-number">
            {totalAchievements}
          </div>

          <div className="stat-label">
            Badges Collected
          </div>

          <div className="stat-description">
            Your collection of learning achievements.
          </div>

          <div className="stat-progress">
            <span />
          </div>

        </div>

        <div className="achievement-stat-card green-stat">

          <div className="stat-card-top">

            <div className="stat-icon-wrapper green-icon">
              &#x2713;
            </div>

            <span className="stat-status">
              Certified
            </span>

          </div>

          <div className="stat-number">
            {totalCertificates}
          </div>

          <div className="stat-label">
            Certificates
          </div>

          <div className="stat-description">
            Courses successfully completed and certified.
          </div>

          <div className="stat-progress">
            <span />
          </div>

        </div>

        <div className="achievement-stat-card orange-stat">

          <div className="stat-card-top">

            <div className="stat-icon-wrapper orange-icon">
              &#x1F4B0;
            </div>

            <span className="stat-status">
              Progress
            </span>

          </div>

          <div className="stat-number">
            {totalMilestones}
          </div>

          <div className="stat-label">
            Milestones Reached
          </div>

          <div className="stat-description">
            Important steps completed on your learning journey.
          </div>

          <div className="stat-progress">
            <span />
          </div>

        </div>

      </div>

      {/* =====================================================
          ACHIEVEMENTS
      ===================================================== */}

      {Object.entries(grouped).map(([level, badges], groupIndex) => (

        <section
          key={level}
          className="achievement-section"
        >

          <div className="section-heading-row">

            <div>

              <div className="section-eyebrow">
                MILESTONE {String(groupIndex + 1).padStart(2, '0')}
              </div>

              <h3 className="section-title">
                {level}
              </h3>

              <p className="section-description">
                {badges.length}{' '}
                {badges.length === 1
                  ? 'achievement'
                  : 'achievements'}{' '}
                earned in this milestone.
              </p>

            </div>

            <div className="section-count">
              <span>{badges.length}</span>
              <small>Badges</small>
            </div>

          </div>

          <Card className="achievement-badge-container !p-0">

            <div className="achievement-badge-grid">

              {badges.map((b, i) => {

                const icon =
                  badgeIcons[i % badgeIcons.length];

                const theme =
                  badgeThemes[i % badgeThemes.length];

                return (
                  <div
                    key={b.id}
                    className="achievement-badge-card"
                    style={{
                      '--badge-bg': theme.bg,
                      '--badge-border': theme.border,
                      '--badge-glow': theme.glow,
                    }}
                  >

                    <div className="badge-shine" />

                    <div className="badge-icon-area">

                      <div className="badge-icon-ring ring-a" />
                      <div className="badge-icon-ring ring-b" />

                      <div className="badge-icon">
                        {icon}
                      </div>

                    </div>

                    <div className="badge-content">

                      <div className="badge-earned-label">
                        <span className="badge-check">
                          &#x2713;
                        </span>

                        Achievement Earned
                      </div>

                      <div
                        className="badge-name"
                        title={b.badge_name}
                      >
                        {b.badge_name}
                      </div>

                      <div className="badge-date">
                        Earned on{' '}
                        {new Date(
                          b.earned_at
                        ).toLocaleDateString()}
                      </div>

                    </div>

                    <div className="badge-arrow">
                      →
                    </div>

                  </div>
                );
              })}

            </div>

          </Card>

        </section>

      ))}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {items.length === 0 && (

        <div className="empty-achievement-card">

          <div className="empty-achievement-icon">
            🏆
          </div>

          <div>

            <div className="empty-eyebrow">
              YOUR JOURNEY STARTS HERE
            </div>

            <h3>
              Your first achievement is waiting
            </h3>

            <p>
              Complete courses, reach milestones, and
              keep learning to unlock your first badge.
            </p>

          </div>

        </div>

      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          className="achievement-error"
          role="alert"
        >

          <span className="error-icon">
            <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
          </span>

          <div>

            <strong>
              Certificate download issue
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>

      )}

      {/* =====================================================
          CERTIFICATES
      ===================================================== */}

      {certs.length > 0 && (

        <section className="certificate-section">

          <div className="certificate-heading">

            <div>

              <div className="section-eyebrow">
                YOUR CREDENTIALS
              </div>

              <h3 className="section-title">
                Certificates
              </h3>

              <p className="section-description">
                Your verified proof of completed learning.
              </p>

            </div>

            <div className="certificate-count">
              &#x2713; {certs.length}
            </div>

          </div>

          <Card className="certificate-card !p-0">

            <div className="certificate-list">

              {certs.map((c, index) => {

                const isDownloading =
                  downloadingId === c.id;

                return (

                  <div
                    key={c.id}
                    className="certificate-item"
                  >

                    <div className="certificate-left">

                      <div className="certificate-icon-wrapper">

                        <div className="certificate-icon-glow" />

                        <span>&#x2713;</span>

                      </div>

                      <div className="certificate-info">

                        <div className="certificate-top-line">

                          <span className="certificate-number">
                            CERTIFICATE #{String(index + 1).padStart(2, '0')}
                          </span>

                          <span className="certificate-issued">
                            &#x2713; VERIFIED
                          </span>

                        </div>

                        <div className="certificate-code">
                          {c.certificate_code}
                        </div>

                        <div className="certificate-course">

                          <span className="course-small-icon">
                            <BookOpen className="h-4 w-4" strokeWidth={2} />
                          </span>

                          <span className="certificate-course-name">
                            {courseNameFor(c)}
                          </span>

                          <span className="certificate-divider">
                            •
                          </span>

                          <span>
                            Issued{' '}
                            {new Date(
                              c.issued_date
                            ).toLocaleDateString()}
                          </span>

                        </div>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(c)}
                      disabled={isDownloading}
                      className={`certificate-download-button ${
                        isDownloading
                          ? 'is-loading'
                          : ''
                      }`}
                    >

                      {isDownloading ? (
                        <>
                          <span className="download-spinner" />
                          <span>Preparing…</span>
                        </>
                      ) : (
                        <>
                          <span className="download-icon">
                            ↓
                          </span>

                          <span>
                            Download Certificate
                          </span>
                        </>
                      )}

                    </button>

                  </div>

                );
              })}

            </div>

          </Card>

        </section>

      )}

      {/* =====================================================
          TYPOGRAPHY + DESIGN
      ===================================================== */}

      <style>{`

        /* =====================================================
           GLOBAL TYPOGRAPHY
        ===================================================== */

        .achievements-page {
          position: relative;
          isolation: isolate;
          color: #0f172a;
          font-family: inherit;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .achievements-page h1,
        .achievements-page h2,
        .achievements-page h3,
        .achievements-page p,
        .achievements-page span,
        .achievements-page div,
        .achievements-page button {
          letter-spacing: -0.01em;
        }

        /* =====================================================
           HERO TEXT
        ===================================================== */

        .achievement-hero {
          position: relative;
          overflow: hidden;
          min-height: 245px;
          padding: 36px 40px;
          border: 1px solid rgba(191,219,254,.65);
          border-radius: 28px;
          background:
            radial-gradient(
              circle at 82% 20%,
              rgba(96,165,250,.18),
              transparent 28%
            ),
            radial-gradient(
              circle at 15% 80%,
              rgba(129,140,248,.13),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #f8fbff 0%,
              #ffffff 52%,
              #f5f7ff 100%
            );
          box-shadow:
            0 20px 55px rgba(15,23,42,.07),
            inset 0 1px 0 rgba(255,255,255,.95);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .achievement-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(
              rgba(59,130,246,.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(59,130,246,.035) 1px,
              transparent 1px
            );
          background-size: 28px 28px;
          mask-image:
            linear-gradient(
              to right,
              black,
              transparent 80%
            );
          pointer-events: none;
        }

        .achievement-hero-content {
          position: relative;
          z-index: 2;
          max-width: 720px;
        }

        .achievement-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          margin-bottom: 13px;
          border: 1px solid rgba(59,130,246,.16);
          border-radius: 999px;
          background: rgba(255,255,255,.78);
          color: #2563eb;
          font-size: 10px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: .14em !important;
          text-transform: uppercase;
          box-shadow: 0 5px 16px rgba(37,99,235,.06);
          backdrop-filter: blur(8px);
        }

        .achievement-kicker-icon {
          font-size: 15px;
          letter-spacing: 0 !important;
          animation: achievementSpark 2.4s ease-in-out infinite;
        }

        .achievement-title {
          margin: 0;
          color: #0f172a;
          font-size: clamp(32px,4vw,47px);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: -.055em !important;
          word-spacing: -0.04em;
        }

        .achievement-title-highlight {
          background:
            linear-gradient(
              135deg,
              #2563eb 0%,
              #4f46e5 48%,
              #7c3aed 100%
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 950;
        }

        .achievement-subtitle {
          max-width: 650px;
          margin: 15px 0 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.75;
          font-weight: 550;
          letter-spacing: -.005em !important;
        }

        .hero-text-divider {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 17px;
        }

        .hero-text-divider span {
          display: block;
          height: 3px;
          border-radius: 999px;
        }

        .hero-text-divider span:nth-child(1) {
          width: 32px;
          background: #2563eb;
        }

        .hero-text-divider span:nth-child(2) {
          width: 9px;
          background: #6366f1;
        }

        .hero-text-divider span:nth-child(3) {
          width: 5px;
          background: #a78bfa;
        }

        /* =====================================================
           HERO GRAPHIC
        ===================================================== */

        .achievement-hero-trophy {
          position: relative;
          width: 155px;
          height: 155px;
          flex: 0 0 155px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trophy-core {
          position: relative;
          z-index: 4;
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 28px;
          background: linear-gradient(
            145deg,
            #ffffff,
            #eff6ff
          );
          border: 1px solid rgba(147,197,253,.7);
          font-size: 44px;
          box-shadow:
            0 20px 40px rgba(37,99,235,.13),
            0 0 0 8px rgba(255,255,255,.65),
            inset 0 1px 0 rgba(255,255,255,1);
          animation: trophyFloat 4s ease-in-out infinite;
        }

        .trophy-orbit {
          position: absolute;
          border: 1px dashed rgba(59,130,246,.25);
          border-radius: 50%;
        }

        .orbit-one {
          width: 125px;
          height: 125px;
          animation: orbitSpin 12s linear infinite;
        }

        .orbit-two {
          width: 150px;
          height: 150px;
          border-color: rgba(124,58,237,.18);
          animation: orbitSpinReverse 17s linear infinite;
        }

        .floating-star {
          position: absolute;
          z-index: 5;
          color: #2563eb;
          font-size: 18px;
          animation: starFloat 3s ease-in-out infinite;
        }

        .star-one {
          top: 12px;
          right: 20px;
        }

        .star-two {
          left: 5px;
          bottom: 30px;
          color: #7c3aed;
          animation-delay: .8s;
        }

        .star-three {
          right: 0;
          bottom: 16px;
          color: #f59e0b;
          animation-delay: 1.4s;
        }

        .achievement-hero-glow {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          filter: blur(45px);
          pointer-events: none;
          opacity: .42;
        }

        .achievement-glow-one {
          top: -100px;
          right: 80px;
          background: rgba(59,130,246,.18);
        }

        .achievement-glow-two {
          bottom: -130px;
          left: 15%;
          background: rgba(124,58,237,.12);
        }

        /* =====================================================
           STATISTICS TEXT
        ===================================================== */

        .achievement-stats-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 16px;
        }

        .achievement-stat-card {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          padding: 22px;
          border-radius: 22px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow:
            0 10px 30px rgba(15,23,42,.045),
            inset 0 1px 0 rgba(255,255,255,.9);
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .achievement-stat-card:hover {
          transform: translateY(-6px);
          box-shadow:
            0 20px 42px rgba(15,23,42,.09),
            inset 0 1px 0 rgba(255,255,255,1);
        }

        .achievement-stat-card::after {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          right: -60px;
          top: -65px;
          border-radius: 50%;
          opacity: .45;
          pointer-events: none;
        }

        .blue-stat::after {
          background: rgba(59,130,246,.12);
        }

        .green-stat::after {
          background: rgba(34,197,94,.12);
        }

        .orange-stat::after {
          background: rgba(249,115,22,.12);
        }

        .stat-card-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          font-size: 23px;
          border: 1px solid;
          transition: transform .3s ease;
        }

        .achievement-stat-card:hover .stat-icon-wrapper {
          transform: rotate(-5deg) scale(1.08);
        }

        .blue-icon {
          background: linear-gradient(
            145deg,
            #eff6ff,
            #dbeafe
          );
          border-color: #bfdbfe;
        }

        .green-icon {
          background: linear-gradient(
            145deg,
            #f0fdf4,
            #dcfce7
          );
          border-color: #bbf7d0;
        }

        .orange-icon {
          background: linear-gradient(
            145deg,
            #fff7ed,
            #ffedd5
          );
          border-color: #fed7aa;
        }

        .stat-status {
          padding: 6px 10px;
          border-radius: 999px;
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
          font-size: 9px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: .1em !important;
          text-transform: uppercase;
        }

        .stat-number {
          position: relative;
          z-index: 2;
          margin-top: 15px;
          color: #0f172a;
          font-size: 38px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -.06em !important;
        }

        .stat-label {
          position: relative;
          z-index: 2;
          margin-top: 8px;
          color: #1e293b;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 850;
          letter-spacing: -.025em !important;
        }

        .stat-description {
          position: relative;
          z-index: 2;
          max-width: 270px;
          margin-top: 6px;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 550;
          letter-spacing: .005em !important;
        }

        .stat-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .stat-progress span {
          display: block;
          width: 65%;
          height: 100%;
          border-radius: inherit;
          transform-origin: left;
          animation: statProgress 2s ease-out both;
        }

        .blue-stat .stat-progress span {
          background: linear-gradient(
            90deg,
            #2563eb,
            #60a5fa
          );
        }

        .green-stat .stat-progress span {
          background: linear-gradient(
            90deg,
            #16a34a,
            #4ade80
          );
        }

        .orange-stat .stat-progress span {
          background: linear-gradient(
            90deg,
            #ea580c,
            #fb923c
          );
        }

        /* =====================================================
           SECTION TEXT
        ===================================================== */

        .achievement-section,
        .certificate-section {
          animation: sectionAppear .5s ease both;
        }

        .section-heading-row,
        .certificate-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
        }

        .section-eyebrow {
          color: #2563eb;
          font-size: 9px;
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: .17em !important;
          text-transform: uppercase;
        }

        .section-title {
          margin: 4px 0 0;
          color: #0f172a;
          font-size: 23px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.04em !important;
        }

        .section-description {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.55;
          font-weight: 550;
          letter-spacing: .002em !important;
        }

        .section-count,
        .certificate-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
        }

        .section-count span {
          color: #2563eb;
          font-size: 15px;
          font-weight: 950;
        }

        .section-count small {
          color: #64748b;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .06em !important;
          text-transform: uppercase;
        }

        .certificate-count {
          color: #166534;
          background: #f0fdf4;
          border-color: #bbf7d0;
          font-size: 11px;
          font-weight: 900;
        }

        /* =====================================================
           BADGE TEXT
        ===================================================== */

        .achievement-badge-container {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15,23,42,.04);
        }

        .achievement-badge-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 0;
        }

        .achievement-badge-card {
          position: relative;
          min-height: 116px;
          padding: 19px;
          display: flex;
          align-items: center;
          gap: 15px;
          overflow: hidden;
          border-bottom: 1px solid #eef2f7;
          transition:
            background .3s ease,
            transform .3s ease,
            box-shadow .3s ease;
        }

        .achievement-badge-card:nth-child(odd) {
          border-right: 1px solid #eef2f7;
        }

        .achievement-badge-card:hover {
          z-index: 2;
          background: #fcfdff;
          box-shadow:
            inset 0 0 0 1px rgba(59,130,246,.08),
            0 12px 30px rgba(15,23,42,.06);
          transform: translateY(-2px);
        }

        .badge-shine {
          position: absolute;
          width: 90px;
          height: 180px;
          top: -80px;
          left: -100px;
          transform: rotate(25deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.8),
            transparent
          );
          transition: left .65s ease;
          pointer-events: none;
        }

        .achievement-badge-card:hover .badge-shine {
          left: 120%;
        }

        .badge-icon-area {
          position: relative;
          width: 66px;
          height: 66px;
          flex: 0 0 66px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-icon {
          position: relative;
          z-index: 3;
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: var(--badge-bg);
          border: 1px solid var(--badge-border);
          font-size: 29px;
          box-shadow:
            0 8px 20px var(--badge-glow),
            inset 0 1px 0 rgba(255,255,255,.85);
          transition:
            transform .35s ease,
            box-shadow .35s ease;
        }

        .achievement-badge-card:hover .badge-icon {
          transform:
            translateY(-4px)
            rotate(-6deg)
            scale(1.08);
          box-shadow:
            0 14px 28px var(--badge-glow),
            inset 0 1px 0 rgba(255,255,255,.95);
        }

        .badge-icon-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px dashed var(--badge-border);
          opacity: .75;
        }

        .ring-a {
          width: 64px;
          height: 64px;
          animation: badgeOrbit 10s linear infinite;
        }

        .ring-b {
          width: 58px;
          height: 58px;
          border-style: dotted;
          opacity: .42;
          animation: badgeOrbitReverse 8s linear infinite;
        }

        .badge-content {
          min-width: 0;
          flex: 1;
        }

        .badge-earned-label {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 5px;
          color: #16a34a;
          font-size: 8px;
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: .11em !important;
          text-transform: uppercase;
        }

        .badge-check {
          width: 14px;
          height: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dcfce7;
          font-size: 9px;
          letter-spacing: 0 !important;
        }

        .badge-name {
          color: #172033;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 850;
          letter-spacing: -.025em !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .badge-date {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 550;
          letter-spacing: .005em !important;
        }

        .badge-arrow {
          color: #cbd5e1;
          font-size: 21px;
          font-weight: 500;
          transition:
            color .25s ease,
            transform .25s ease;
        }

        .achievement-badge-card:hover .badge-arrow {
          color: #2563eb;
          transform: translateX(4px);
        }

        /* =====================================================
           CERTIFICATE TEXT
        ===================================================== */

        .certificate-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 12px 35px rgba(15,23,42,.045);
        }

        .certificate-list {
          display: flex;
          flex-direction: column;
        }

        .certificate-item {
          position: relative;
          min-height: 105px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #eef2f7;
          transition:
            background .25s ease,
            padding .25s ease;
        }

        .certificate-item:last-child {
          border-bottom: 0;
        }

        .certificate-item:hover {
          background:
            linear-gradient(
              90deg,
              #ffffff,
              #f8fbff
            );
          padding-left: 26px;
          padding-right: 26px;
        }

        .certificate-left {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .certificate-icon-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
          flex: 0 0 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background:
            linear-gradient(
              145deg,
              #f0fdf4,
              #dcfce7
            );
          border: 1px solid #bbf7d0;
          font-size: 27px;
          box-shadow:
            0 9px 22px rgba(34,197,94,.12),
            inset 0 1px 0 rgba(255,255,255,.9);
          transition: transform .3s ease;
        }

        .certificate-item:hover
        .certificate-icon-wrapper {
          transform:
            translateY(-3px)
            rotate(-4deg);
        }

        .certificate-icon-glow {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: rgba(34,197,94,.12);
          filter: blur(8px);
        }

        .certificate-icon-wrapper span {
          position: relative;
          z-index: 2;
          letter-spacing: 0 !important;
        }

        .certificate-info {
          min-width: 0;
        }

        .certificate-top-line {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .certificate-number {
          color: #64748b;
          font-size: 8px;
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: .15em !important;
          text-transform: uppercase;
        }

        .certificate-issued {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 7px;
          border-radius: 999px;
          color: #15803d;
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          font-size: 8px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: .08em !important;
          text-transform: uppercase;
        }

        .certificate-code {
          margin-top: 5px;
          color: #0f172a;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 900;
          letter-spacing: -.025em !important;
          word-break: break-word;
        }

        .certificate-course {
          margin-top: 6px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.5;
          font-weight: 550;
        }

        .certificate-course-name {
          color: #64748b;
          font-weight: 700;
        }

        .course-small-icon {
          font-size: 12px;
          letter-spacing: 0 !important;
        }

        .certificate-divider {
          color: #cbd5e1;
        }

        .certificate-download-button {
          position: relative;
          flex: 0 0 auto;
          min-width: 155px;
          height: 44px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
          color: #1d4ed8;
          font-family: inherit;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: -.005em !important;
          cursor: pointer;
          box-shadow:
            0 6px 15px rgba(37,99,235,.08),
            inset 0 1px 0 rgba(255,255,255,.8);
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .certificate-download-button:hover:not(:disabled) {
          transform: translateY(-3px);
          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #bfdbfe
            );
          box-shadow:
            0 11px 23px rgba(37,99,235,.15),
            inset 0 1px 0 rgba(255,255,255,.9);
        }

        .certificate-download-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .certificate-download-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .download-icon {
          width: 23px;
          height: 23px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(255,255,255,.65);
          font-size: 17px;
          line-height: 1;
          letter-spacing: 0 !important;
          transition: transform .25s ease;
        }

        .certificate-download-button:hover
        .download-icon {
          transform: translateY(2px);
        }

        .download-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(37,99,235,.2);
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spinnerRotate .75s linear infinite;
        }

        /* =====================================================
           EMPTY STATE TEXT
        ===================================================== */

        .empty-achievement-card {
          min-height: 150px;
          padding: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          text-align: left;
          border: 1px dashed #cbd5e1;
          border-radius: 22px;
          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(59,130,246,.07),
              transparent 30%
            ),
            #f8fafc;
        }

        .empty-achievement-icon {
          width: 64px;
          height: 64px;
          flex: 0 0 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 19px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          font-size: 29px;
          box-shadow: 0 10px 25px rgba(15,23,42,.06);
          animation: trophyFloat 4s ease-in-out infinite;
        }

        .empty-eyebrow {
          margin-bottom: 4px;
          color: #2563eb;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: .16em !important;
          text-transform: uppercase;
        }

        .empty-achievement-card h3 {
          margin: 0;
          color: #172033;
          font-size: 17px;
          line-height: 1.3;
          font-weight: 900;
          letter-spacing: -.025em !important;
        }

        .empty-achievement-card p {
          max-width: 500px;
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.65;
          font-weight: 550;
        }

        /* =====================================================
           ERROR TEXT
        ===================================================== */

        .achievement-error {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border: 1px solid #fecaca;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #fff7f7,
              #fef2f2
            );
          color: #b91c1c;
          box-shadow: 0 8px 22px rgba(239,68,68,.05);
        }

        .error-icon {
          font-size: 18px;
          letter-spacing: 0 !important;
        }

        .achievement-error strong {
          display: block;
          font-size: 12px;
          line-height: 1.4;
          font-weight: 900;
          letter-spacing: -.01em !important;
        }

        .achievement-error p {
          margin: 3px 0 0;
          color: #dc2626;
          font-size: 11px;
          line-height: 1.55;
          font-weight: 550;
        }

        /* =====================================================
           ANIMATIONS
        ===================================================== */

        @keyframes trophyFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes orbitSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitSpinReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes badgeOrbit {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes badgeOrbitReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes starFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: .7;
          }

          50% {
            transform: translateY(-6px) scale(1.12);
            opacity: 1;
          }
        }

        @keyframes achievementSpark {
          0%,
          100% {
            transform: scale(1) rotate(0);
          }

          50% {
            transform: scale(1.2) rotate(8deg);
          }
        }

        @keyframes statProgress {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        @keyframes sectionAppear {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spinnerRotate {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

          .achievement-hero {
            padding: 30px;
          }

          .achievement-hero-trophy {
            width: 125px;
            height: 125px;
            flex-basis: 125px;
          }

          .trophy-core {
            width: 74px;
            height: 74px;
            border-radius: 22px;
            font-size: 36px;
          }

          .orbit-one {
            width: 105px;
            height: 105px;
          }

          .orbit-two {
            width: 120px;
            height: 120px;
          }

          .achievement-stats-grid {
            grid-template-columns: 1fr;
          }

          .achievement-stat-card {
            min-height: 160px;
          }
        }

        @media (max-width: 700px) {

          .achievement-hero {
            min-height: auto;
            padding: 25px;
            align-items: flex-start;
          }

          .achievement-hero-trophy {
            display: none;
          }

          .achievement-title {
            font-size: 32px;
          }

          .achievement-subtitle {
            font-size: 13px;
          }

          .achievement-badge-grid {
            grid-template-columns: 1fr;
          }

          .achievement-badge-card:nth-child(odd) {
            border-right: 0;
          }

          .section-heading-row,
          .certificate-heading {
            align-items: flex-start;
          }

          .certificate-item {
            align-items: flex-start;
            flex-direction: column;
          }

          .certificate-download-button {
            width: 100%;
          }

          .certificate-left {
            width: 100%;
          }

          .empty-achievement-card {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {

          .achievement-hero {
            border-radius: 21px;
            padding: 22px;
          }

          .achievement-title {
            font-size: 28px;
          }

          .achievement-kicker {
            font-size: 8px;
          }

          .achievement-stat-card {
            padding: 18px;
            border-radius: 18px;
          }

          .achievement-badge-card {
            padding: 16px;
            min-height: 105px;
          }

          .badge-icon-area {
            width: 56px;
            height: 56px;
            flex-basis: 56px;
          }

          .badge-icon {
            width: 47px;
            height: 47px;
            border-radius: 15px;
            font-size: 25px;
          }

          .ring-a {
            width: 55px;
            height: 55px;
          }

          .ring-b {
            width: 50px;
            height: 50px;
          }

          .badge-name {
            font-size: 13px;
          }

          .certificate-item {
            padding: 17px;
          }

          .certificate-item:hover {
            padding-left: 17px;
            padding-right: 17px;
          }

          .certificate-left {
            align-items: flex-start;
          }

          .certificate-icon-wrapper {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
            font-size: 23px;
          }

          .certificate-course {
            display: block;
          }

          .certificate-divider {
            margin: 0 4px;
          }

          .certificate-download-button {
            min-width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          .achievements-page *,
          .achievements-page *::before,
          .achievements-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }

      `}</style>
    </div>
  );
}