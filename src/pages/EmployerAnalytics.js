import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { getEmployerDashboard } from '../services/api';
import { downloadCsv, todayStamp, printStyleHtml } from '../utils/exports';

/*
  ============================================================
  AURORA GLASS DESIGN SYSTEM
  ============================================================

  Deep background : #111327
  Violet          : #8B5CF6
  Electric Blue   : #5B8CFF
  Rose            : #F472B6
  Peach           : #FB923C
  Emerald         : #34D399
  White           : #FFFFFF
*/

const COLORS = [
  '#8B5CF6',
  '#5B8CFF',
  '#F472B6',
];

const tooltipStyle = {
  backgroundColor: '#15172E',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '14px',
  color: '#ffffff',
  fontSize: '12px',
  padding: '9px 13px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
};

export default function EmployerAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getEmployerDashboard()
      .then(setData)
      .catch(() => {});
  }, []);

  const matchData = data?.candidateMatches
    ? [
        {
          name: 'Strong Match',
          value: data.candidateMatches.strong,
        },
        {
          name: 'Good Match',
          value: data.candidateMatches.good,
        },
        {
          name: 'Possible Match',
          value: data.candidateMatches.possible,
        },
      ]
    : [];

  const onExportCsv = () => {
    const rows = [
      ['EduSaaS — Employer Analytics Export'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Headline', 'Value'],
      ['Job Openings', data?.jobOpenings ?? 0],
      ['New Applicants', data?.newApplicants ?? 0],
      ['Top Matches', data?.topMatches ?? 0],
      [],
      ['Section: Candidate Matches'],
      ['Bucket', 'Count'],
      ...matchData.map((r) => [r.name, r.value]),
      [],
      ['Section: Skills Insights'],
      ['Skill', 'Score'],
      ...(data?.skillsInsights || []).map((r) => [
        r.skill,
        r.value,
      ]),
    ];

    downloadCsv(
      `employer_analytics_${todayStamp()}.csv`,
      rows
    );
  };

  const onExportPdf = () => window.print();

  return (
    <div
      id="print-area"
      className="min-h-screen -m-4 sm:-m-6 p-4 sm:p-6 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #F8F7FF 0%, #F4F1FF 35%, #FFF4F8 68%, #EFFAF6 100%)',
      }}
    >
      <style>{`
        ${printStyleHtml}

        /* =====================================================
           GLOBAL HOVER SYSTEM
        ===================================================== */

        .analytics-hover {
          transition:
            transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 320ms ease,
            border-color 320ms ease,
            background 320ms ease;
          will-change: transform;
        }

        .analytics-hover:hover {
          transform: translateY(-7px);
        }

        /* =====================================================
           HERO HOVER
        ===================================================== */

        .aurora-hero {
          transition:
            transform 450ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 450ms ease;
        }

        .aurora-hero:hover {
          transform: translateY(-3px);
          box-shadow:
            0 35px 85px rgba(91, 92, 190, 0.28) !important;
        }

        .hero-aurora {
          transition:
            transform 900ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 700ms ease;
        }

        .aurora-hero:hover .hero-aurora-left {
          transform: scale(1.22) translate(20px, 15px);
          opacity: 0.9;
        }

        .aurora-hero:hover .hero-aurora-pink {
          transform: scale(1.18) translate(-20px, 12px);
          opacity: 0.65;
        }

        .aurora-hero:hover .hero-aurora-blue {
          transform: scale(1.2) translate(-15px, -15px);
          opacity: 0.65;
        }

        .aurora-hero:hover .hero-aurora-green {
          transform: scale(1.18) translate(15px, -15px);
          opacity: 0.4;
        }

        /* =====================================================
           HERO TITLE
        ===================================================== */

        .hero-title {
          transition:
            letter-spacing 350ms ease,
            transform 350ms ease;
        }

        .aurora-hero:hover .hero-title {
          letter-spacing: -0.055em;
          transform: translateX(2px);
        }

        /* =====================================================
           KPI CARDS
        ===================================================== */

        .metric-card {
          transition:
            transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 350ms ease;
        }

        .metric-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow:
            0 22px 45px rgba(42, 36, 74, 0.13);
        }

        .metric-inner {
          transition:
            background 350ms ease,
            box-shadow 350ms ease;
        }

        .metric-card:hover .metric-inner {
          background: rgba(255,255,255,0.96);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9);
        }

        /* =====================================================
           KPI ICONS
        ===================================================== */

        .metric-icon {
          transition:
            transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 350ms ease;
        }

        .metric-card:hover .metric-icon {
          transform:
            rotate(-7deg)
            scale(1.12);
          box-shadow:
            0 10px 24px rgba(139,92,246,0.14);
        }

        /* =====================================================
           KPI NUMBER
        ===================================================== */

        .metric-number {
          transition:
            transform 350ms ease,
            letter-spacing 350ms ease;
        }

        .metric-card:hover .metric-number {
          transform: translateX(3px);
          letter-spacing: -0.025em;
        }

        /* =====================================================
           PROGRESS / MINI BARS
        ===================================================== */

        .metric-progress {
          transition:
            transform 350ms ease,
            box-shadow 350ms ease;
        }

        .metric-card:hover .metric-progress {
          transform: scaleY(1.35);
          box-shadow:
            0 3px 12px rgba(91,140,255,0.22);
        }

        /* =====================================================
           ANALYTICS PANELS
        ===================================================== */

        .analytics-panel {
          transition:
            transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 380ms ease;
        }

        .analytics-panel:hover {
          transform: translateY(-7px);
          box-shadow:
            0 28px 60px rgba(40,35,80,0.13);
        }

        .analytics-panel-dark:hover {
          box-shadow:
            0 30px 65px rgba(35,27,76,0.28);
        }

        /* =====================================================
           PANEL NUMBER
        ===================================================== */

        .panel-number {
          transition:
            transform 350ms ease,
            background 350ms ease;
        }

        .analytics-panel:hover .panel-number {
          transform: scale(1.08) rotate(4deg);
        }

        /* =====================================================
           ANALYTICS DECORATIVE SQUARE
        ===================================================== */

        .panel-decoration {
          transition:
            transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
            border-radius 500ms ease,
            box-shadow 500ms ease;
        }

        .analytics-panel:hover .panel-decoration {
          transform:
            rotate(12deg)
            scale(1.08);
          border-radius: 30%;
          box-shadow:
            0 10px 30px rgba(139,92,246,0.18);
        }

        /* =====================================================
           BOTTOM INSIGHT CARDS
        ===================================================== */

        .insight-card {
          position: relative;
          transition:
            transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 350ms ease;
          overflow: hidden;
        }

        .insight-card::after {
          content: '';
          position: absolute;
          left: -30%;
          top: -80%;
          width: 60%;
          height: 220%;
          transform: rotate(25deg);
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.38),
              transparent
            );
          opacity: 0;
          transition:
            left 650ms ease,
            opacity 350ms ease;
          pointer-events: none;
        }

        .insight-card:hover {
          transform: translateY(-7px);
          box-shadow:
            0 20px 40px rgba(50,45,80,0.11);
        }

        .insight-card:hover::after {
          left: 120%;
          opacity: 1;
        }

        /* =====================================================
           INSIGHT TEXT
        ===================================================== */

        .insight-title {
          transition:
            transform 300ms ease,
            color 300ms ease;
        }

        .insight-card:hover .insight-title {
          transform: translateX(3px);
        }

        /* =====================================================
           BUTTONS
        ===================================================== */

        .analytics-button {
          transition:
            transform 250ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 250ms ease,
            background 250ms ease;
        }

        .analytics-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 10px 22px rgba(0,0,0,0.14);
        }

        .analytics-button:active {
          transform: translateY(0) scale(0.98);
        }

        /* =====================================================
           HERO STATUS PILLS
        ===================================================== */

        .status-pill {
          transition:
            transform 300ms ease,
            background 300ms ease,
            border-color 300ms ease;
        }

        .status-pill:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .analytics-hover,
          .aurora-hero,
          .hero-aurora,
          .hero-title,
          .metric-card,
          .metric-inner,
          .metric-icon,
          .metric-number,
          .metric-progress,
          .analytics-panel,
          .panel-number,
          .panel-decoration,
          .insight-card,
          .insight-card::after,
          .insight-title,
          .analytics-button,
          .status-pill {
            transition: none !important;
          }

          .analytics-hover:hover,
          .aurora-hero:hover,
          .metric-card:hover,
          .analytics-panel:hover,
          .insight-card:hover,
          .analytics-button:hover,
          .status-pill:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* ======================================================
            AURORA HERO
        ====================================================== */}
        <section
          className="aurora-hero relative overflow-hidden rounded-[32px]"
          style={{
            minHeight: '280px',
            background:
              'linear-gradient(120deg, #17152F 0%, #25205A 42%, #43306B 72%, #172B38 100%)',
            boxShadow:
              '0 30px 70px rgba(91,92,190,0.20)',
          }}
        >

          {/* Violet Aurora */}
          <div
            className="hero-aurora hero-aurora-left absolute -left-24 -top-32 h-[330px] w-[330px] rounded-full blur-3xl opacity-70"
            style={{
              background:
                'radial-gradient(circle, rgba(139,92,246,0.65) 0%, rgba(139,92,246,0) 70%)',
            }}
          />

          {/* Pink Aurora */}
          <div
            className="hero-aurora hero-aurora-pink absolute right-[15%] -top-40 h-[350px] w-[350px] rounded-full blur-3xl opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(244,114,182,0.65) 0%, rgba(244,114,182,0) 70%)',
            }}
          />

          {/* Blue Aurora */}
          <div
            className="hero-aurora hero-aurora-blue absolute right-[-80px] bottom-[-140px] h-[400px] w-[400px] rounded-full blur-3xl opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(91,140,255,0.7) 0%, rgba(91,140,255,0) 70%)',
            }}
          />

          {/* Emerald Aurora */}
          <div
            className="hero-aurora hero-aurora-green absolute left-[35%] bottom-[-180px] h-[350px] w-[350px] rounded-full blur-3xl opacity-25"
            style={{
              background:
                'radial-gradient(circle, rgba(52,211,153,0.65) 0%, rgba(52,211,153,0) 70%)',
            }}
          />

          {/* Diagonal light */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              background:
                'linear-gradient(120deg, transparent 25%, rgba(255,255,255,0.45) 25.2%, transparent 25.6%, transparent 60%, rgba(255,255,255,0.25) 60.2%, transparent 60.6%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-6 sm:p-9">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">

              <div className="max-w-2xl">

                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 backdrop-blur-md">

                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background:
                        'linear-gradient(135deg, #A78BFA, #F472B6)',
                      boxShadow:
                        '0 0 14px rgba(167,139,250,0.9)',
                    }}
                  />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
                    Employer Analytics
                  </span>

                </div>

                {/* Title */}
                <h2 className="hero-title mt-5 text-4xl sm:text-5xl font-black tracking-[-0.045em] text-white">

                  Hiring

                  <span
                    className="ml-2"
                    style={{
                      background:
                        'linear-gradient(90deg, #A78BFA, #F472B6, #FB923C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Intelligence
                  </span>

                </h2>

                <p className="mt-4 max-w-xl text-sm sm:text-base leading-7 text-white/65">
                  Understand your recruitment pipeline through candidate
                  matches, applicant activity, and emerging skill demand.
                </p>

              </div>

              {/* Export buttons */}
              <div className="flex flex-wrap gap-2 no-print">

                <Button
                  variant="outline"
                  onClick={onExportPdf}
                  disabled={!data}
                  className="
                    analytics-button
                    !rounded-2xl
                    !border-white/15
                    !bg-white/[0.08]
                    !text-white
                    !backdrop-blur-md
                    hover:!bg-white/[0.14]
                  "
                >
                  📄 Export PDF
                </Button>

                <Button
                  onClick={onExportCsv}
                  disabled={!data}
                  className="
                    analytics-button
                    !rounded-2xl
                    !border-0
                    !bg-white
                    !text-[#28204F]
                    !font-bold
                    hover:!bg-white/90
                  "
                >
                  ↓ Export CSV
                </Button>

              </div>

            </div>

            {/* Bottom Hero Information */}
            <div className="mt-8 flex flex-wrap gap-3">

              <div className="status-pill rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2.5 backdrop-blur-md">

                <span className="text-[10px] text-white/45">
                  DATA STATUS
                </span>

                <div className="mt-0.5 flex items-center gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />

                  <span className="text-xs font-semibold text-white/80">
                    {data ? 'Analytics Ready' : 'Loading Analytics'}
                  </span>

                </div>

              </div>

              <div className="status-pill rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2.5 backdrop-blur-md">

                <span className="text-[10px] text-white/45">
                  VIEW
                </span>

                <div className="mt-0.5 text-xs font-semibold text-white/80">
                  Recruitment Overview
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ======================================================
            FLOATING METRIC CARDS
        ====================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ====================================================
              JOB OPENINGS
          ==================================================== */}
          <div
            className="metric-card relative overflow-hidden rounded-[26px] p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,92,246,0.55), rgba(255,255,255,0.8), rgba(91,140,255,0.4))',
            }}
          >

            <div className="metric-inner relative overflow-hidden rounded-[25px] bg-white/85 backdrop-blur-xl p-5 sm:p-6">

              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-50 transition-all duration-500"
                style={{
                  background:
                    'radial-gradient(circle, #A78BFA, transparent 70%)',
                }}
              />

              <div className="relative z-10">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#858391]">
                      Job Openings
                    </p>

                    <p className="mt-1 text-xs text-[#A2A0AA]">
                      Active listings
                    </p>

                  </div>

                  <div
                    className="metric-icon flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, #EDE9FE, #DBEAFE)',
                    }}
                  >
                    <span className="text-lg">◈</span>
                  </div>

                </div>

                <div className="mt-7 flex items-end justify-between">

                  <div className="metric-number text-4xl font-black tracking-tight text-[#191827]">
                    {data?.jobOpenings ?? '—'}
                  </div>

                  <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#635BCE]">
                    Active
                  </span>

                </div>

                <div className="mt-5 h-2 rounded-full bg-[#F0EFF5] overflow-hidden">

                  <div
                    className="metric-progress h-full rounded-full"
                    style={{
                      width: '72%',
                      background:
                        'linear-gradient(90deg, #8B5CF6, #5B8CFF)',
                    }}
                  />

                </div>

              </div>

            </div>
          </div>

          {/* ====================================================
              NEW APPLICANTS
          ==================================================== */}
          <div
            className="metric-card relative overflow-hidden rounded-[26px] p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(244,114,182,0.55), rgba(255,255,255,0.85), rgba(251,146,60,0.45))',
            }}
          >

            <div className="metric-inner relative overflow-hidden rounded-[25px] bg-white/85 backdrop-blur-xl p-5 sm:p-6">

              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-50"
                style={{
                  background:
                    'radial-gradient(circle, #F472B6, transparent 70%)',
                }}
              />

              <div className="relative z-10">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#858391]">
                      New Applicants
                    </p>

                    <p className="mt-1 text-xs text-[#A2A0AA]">
                      Across all listings
                    </p>

                  </div>

                  <div
                    className="metric-icon flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, #FCE7F3, #FFEDD5)',
                    }}
                  >
                    <span className="text-lg">◎</span>
                  </div>

                </div>

                <div className="mt-7 flex items-end justify-between">

                  <div className="metric-number text-4xl font-black tracking-tight text-[#191827]">
                    {data?.newApplicants ?? '—'}
                  </div>

                  <span className="rounded-full bg-[#FFF1F2] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#DB5B76]">
                    New
                  </span>

                </div>

                <div className="mt-5 flex items-end gap-1 h-5">

                  <span className="w-2 rounded-t-full bg-[#FBCFE8] h-2 transition-all duration-300 hover:h-3" />
                  <span className="w-2 rounded-t-full bg-[#F9A8D4] h-3 transition-all duration-300 hover:h-5" />
                  <span className="w-2 rounded-t-full bg-[#F472B6] h-4 transition-all duration-300 hover:h-6" />
                  <span className="w-2 rounded-t-full bg-[#FB923C] h-3 transition-all duration-300 hover:h-5" />
                  <span className="w-2 rounded-t-full bg-[#F97316] h-5 transition-all duration-300 hover:h-7" />

                </div>

              </div>

            </div>
          </div>

          {/* ====================================================
              TOP MATCHES
          ==================================================== */}
          <div
            className="metric-card relative overflow-hidden rounded-[26px] p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(52,211,153,0.55), rgba(255,255,255,0.85), rgba(91,140,255,0.45))',
            }}
          >

            <div className="metric-inner relative overflow-hidden rounded-[25px] bg-white/85 backdrop-blur-xl p-5 sm:p-6">

              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-45"
                style={{
                  background:
                    'radial-gradient(circle, #34D399, transparent 70%)',
                }}
              />

              <div className="relative z-10">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#858391]">
                      Top Matches
                    </p>

                    <p className="mt-1 text-xs text-[#A2A0AA]">
                      Best candidate fits
                    </p>

                  </div>

                  <div
                    className="metric-icon flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, #D1FAE5, #DBEAFE)',
                    }}
                  >
                    <span className="text-lg">✦</span>
                  </div>

                </div>

                <div className="mt-7 flex items-end justify-between">

                  <div className="metric-number text-4xl font-black tracking-tight text-[#191827]">
                    {data?.topMatches ?? '—'}
                  </div>

                  <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#159A70]">
                    Best Fit
                  </span>

                </div>

                <div className="mt-5 flex items-center gap-1.5">

                  <span className="h-2 w-2 rounded-full bg-[#34D399]" />
                  <span className="h-2 w-2 rounded-full bg-[#34D399]/70" />
                  <span className="h-2 w-2 rounded-full bg-[#34D399]/45" />
                  <span className="h-2 w-2 rounded-full bg-[#34D399]/20" />

                  <span className="ml-1 text-[10px] text-[#8D929A]">
                    High relevance
                  </span>

                </div>

              </div>

            </div>
          </div>

        </section>

        {/* ======================================================
            LARGE ANALYTICS CARDS
        ====================================================== */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.25fr] gap-5">

          {/* ====================================================
              MATCH QUALITY
          ==================================================== */}
          <div
            className="analytics-panel relative overflow-hidden rounded-[30px] p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, #DDD6FE, #FFFFFF, #FBCFE8)',
            }}
          >

            <div className="rounded-[29px] bg-white overflow-hidden">

              <div className="p-5 sm:p-7">

                <div className="flex items-start justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="panel-number text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B97A7]">
                        01
                      </span>

                      <span className="h-px w-8 bg-[#DCD9E4]" />

                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B0ACB8]">
                        Candidate Quality
                      </span>

                    </div>

                    <h3 className="mt-3 text-2xl font-black tracking-tight text-[#191827]">
                      Match Overview
                    </h3>

                    <p className="mt-1.5 text-xs text-[#888691]">
                      Candidate distribution by match level
                    </p>

                  </div>

                  <div
                    className="panel-decoration h-12 w-12 rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, #EDE9FE, #FCE7F3)',
                    }}
                  />

                </div>

              </div>

              <div className="h-80 px-3 sm:px-5 pb-5">

                <ResponsiveContainer width="100%" height="100%">

                  <PieChart>

                    <Pie
                      data={matchData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      outerRadius={94}
                      innerRadius={57}
                      paddingAngle={5}
                      stroke="none"
                    >

                      {matchData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}

                    </Pie>

                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{
                        color: '#ffffff',
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: 11,
                        paddingTop: 12,
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>
          </div>

          {/* ====================================================
              SKILLS DEMAND
          ==================================================== */}
          <div
            className="analytics-panel analytics-panel-dark relative overflow-hidden rounded-[30px] p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, #C7D2FE, #E0E7FF, #A7F3D0)',
            }}
          >

            <div
              className="relative overflow-hidden rounded-[29px]"
              style={{
                background:
                  'linear-gradient(135deg, #17152F 0%, #211B45 55%, #152D35 100%)',
              }}
            >

              <div
                className="absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl opacity-30"
                style={{
                  background:
                    'radial-gradient(circle, #8B5CF6, transparent 70%)',
                }}
              />

              <div
                className="absolute left-1/3 -bottom-32 h-64 w-64 rounded-full blur-3xl opacity-20"
                style={{
                  background:
                    'radial-gradient(circle, #34D399, transparent 70%)',
                }}
              />

              <div className="relative z-10">

                <div className="p-5 sm:p-7">

                  <div className="flex items-start justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="panel-number text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F8298]">
                          02
                        </span>

                        <span className="h-px w-8 bg-white/10" />

                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#81859B]">
                          Market Signals
                        </span>

                      </div>

                      <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
                        Skills Demand
                      </h3>

                      <p className="mt-1.5 text-xs text-white/45">
                        Skills appearing across hiring activity
                      </p>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.12] hover:border-white/20">

                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#A7F3D0]">
                        INSIGHT
                      </span>

                    </div>

                  </div>

                </div>

                <div className="h-80 px-3 sm:px-5 pb-5">

                  <ResponsiveContainer width="100%" height="100%">

                    <BarChart
                      data={data?.skillsInsights || []}
                      margin={{
                        top: 10,
                        right: 8,
                        left: -12,
                        bottom: 8,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="4 6"
                        stroke="rgba(255,255,255,0.07)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="skill"
                        tick={{
                          fontSize: 10,
                          fill: '#979AAD',
                        }}
                        axisLine={{
                          stroke: 'rgba(255,255,255,0.08)',
                        }}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: '#979AAD',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{
                          fill: 'rgba(255,255,255,0.04)',
                        }}
                      />

                      <Bar
                        dataKey="value"
                        radius={[10, 10, 3, 3]}
                        barSize={32}
                        fill="#8B5CF6"
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>
          </div>

        </div>

        {/* ======================================================
            FINAL INSIGHT CARDS
        ====================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Candidate Pipeline */}
          <div
            className="insight-card rounded-[24px] p-5"
            style={{
              background:
                'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              border:
                '1px solid rgba(139,92,246,0.12)',
            }}
          >

            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B7FC0]">
              Candidate Pipeline
            </div>

            <h4 className="insight-title mt-2 text-sm font-extrabold text-[#24203B]">
              Review your strongest matches
            </h4>

            <p className="mt-1.5 text-xs leading-5 text-[#77718C]">
              Use match quality to quickly understand candidate relevance.
            </p>

          </div>

          {/* Applicant Activity */}
          <div
            className="insight-card rounded-[24px] p-5"
            style={{
              background:
                'linear-gradient(135deg, #FFF1F7 0%, #FFE8F0 100%)',
              border:
                '1px solid rgba(244,114,182,0.12)',
            }}
          >

            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4779D]">
              Applicant Activity
            </div>

            <h4 className="insight-title mt-2 text-sm font-extrabold text-[#3B202C]">
              Track incoming applications
            </h4>

            <p className="mt-1.5 text-xs leading-5 text-[#8E717D]">
              Monitor new applicants across your active listings.
            </p>

          </div>

          {/* Skills Intelligence */}
          <div
            className="insight-card rounded-[24px] p-5"
            style={{
              background:
                'linear-gradient(135deg, #ECFDF5 0%, #DFF8ED 100%)',
              border:
                '1px solid rgba(52,211,153,0.14)',
            }}
          >

            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4B9A7B]">
              Skills Intelligence
            </div>

            <h4 className="insight-title mt-2 text-sm font-extrabold text-[#18352A]">
              Understand hiring demand
            </h4>

            <p className="mt-1.5 text-xs leading-5 text-[#648176]">
              Identify the skills appearing most frequently in recruitment.
            </p>

          </div>

        </section>

      </div>
    </div>
  );
}