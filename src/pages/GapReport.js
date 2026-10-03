import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Gauge } from '../components/ui/Gauge';
import { SkillBar } from '../components/ui/SkillBar';
import { useAuth } from '../context/AuthContext';
import { fetchGapReport, aimlAnalyzeSkillGap } from '../services/api';

/* =========================================================
   PROFESSIONAL SVG ICONS
========================================================= */

const IconBase = ({ children, size = 22, strokeWidth = 2, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const AnalyticsIcon = ({ size = 28, className = '' }) => (
  <IconBase size={size} className={className}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M7 15l3-4 3 2 5-7" />
    <circle cx="7" cy="15" r="1" />
    <circle cx="10" cy="11" r="1" />
    <circle cx="13" cy="13" r="1" />
    <circle cx="18" cy="6" r="1" />
  </IconBase>
);

const CompareIcon = ({ size = 18 }) => (
  <IconBase size={size}>
    <path d="M8 3v14" />
    <path d="M5 6l3-3 3 3" />
    <path d="M16 21V7" />
    <path d="M13 18l3 3 3-3" />
  </IconBase>
);

const DownloadIcon = ({ size = 18 }) => (
  <IconBase size={size}>
    <path d="M12 3v11" />
    <path d="m8 10 4 4 4-4" />
    <path d="M5 21h14" />
    <path d="M5 17v4" />
    <path d="M19 17v4" />
  </IconBase>
);

const FileIcon = ({ size = 18 }) => (
  <IconBase size={size}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h6" />
  </IconBase>
);

const CheckCircleIcon = ({ size = 22 }) => (
  <IconBase size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16 9" />
  </IconBase>
);

const AlertIcon = ({ size = 22 }) => (
  <IconBase size={size}>
    <path d="M10.3 3.5 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.5a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 16h.01" />
  </IconBase>
);

const TargetIcon = ({ size = 23 }) => (
  <IconBase size={size}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
  </IconBase>
);

const SparklesIcon = ({ size = 23 }) => (
  <IconBase size={size}>
    <path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z" />
    <path d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13Z" />
    <path d="m5 14-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z" />
  </IconBase>
);

const BriefcaseIcon = ({ size = 23 }) => (
  <IconBase size={size}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
    <path d="M10 12v2h4v-2" />
  </IconBase>
);

const BrainIcon = ({ size = 25 }) => (
  <IconBase size={size}>
    <path d="M9 4a3 3 0 0 0-3 3v.5A3.5 3.5 0 0 0 3 11a3.5 3.5 0 0 0 3 3.5V16a3 3 0 0 0 3 3" />
    <path d="M15 4a3 3 0 0 1 3 3v.5a3.5 3.5 0 0 1 3 3.5 3.5 3.5 0 0 1-3 3.5V16a3 3 0 0 1-3 3" />
    <path d="M9 4a3 3 0 0 1 3-2 3 3 0 0 1 3 2" />
    <path d="M9 19a3 3 0 0 0 3 2 3 3 0 0 0 3-2" />
    <path d="M9 8h1" />
    <path d="M14 8h1" />
    <path d="M9 13h1" />
    <path d="M14 13h1" />
    <path d="M12 6v12" />
  </IconBase>
);

const ChevronIcon = ({ size = 16 }) => (
  <IconBase size={size}>
    <path d="m9 18 6-6-6-6" />
  </IconBase>
);

const ClockIcon = ({ size = 20 }) => (
  <IconBase size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </IconBase>
);

const GaugeIcon = ({ size = 23 }) => (
  <IconBase size={size}>
    <path d="M4 15a8 8 0 1 1 16 0" />
    <path d="M12 12l4-4" />
    <circle cx="12" cy="12" r="1.5" />
    <path d="M7 18h10" />
  </IconBase>
);

/* =========================================================
   MAIN GAP REPORT
========================================================= */

export default function GapReport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [live, setLive] = useState(null);

  useEffect(() => {
    let currentUserId = user?.id;

    try {
      const stored = JSON.parse(localStorage.getItem('edu_user') || '{}');

      if (stored?.id) {
        currentUserId = stored.id;
      }
    } catch (e) {
      // Preserve existing fallback behavior.
    }

    if (!currentUserId) return;

    fetchGapReport(currentUserId)
      .then((data) => {
        setLive(data);
      })
      .catch((err) => {
        console.error('Failed to fetch gap report:', err);
      });
  }, [user?.id]);

  const readiness = live?.readiness_score ?? 0;

  const needs = (live?.missing_skills ?? []).map((name) => ({
    name,
  }));

  const breakdown = live?.recommendations?.skill_gap ?? [];

  const strengths = breakdown.filter(
    (skill) => skill.status === 'Ready'
  );

  const hasGapReport = live && breakdown.length > 0;

  let readinessCategory = 'Needs Improvement';
  let readinessColor = '#ef4444';
  let readinessMessage =
    'Your current skills are below the expected level for this role.';

  if (readiness >= 80) {
    readinessCategory = 'Excellent';
    readinessColor = '#10b981';
    readinessMessage =
      'You are job-ready for most role requirements.';
  } else if (readiness >= 60) {
    readinessCategory = 'Good';
    readinessColor = '#84cc16';
    readinessMessage =
      'You are close to meeting the required skill level.';
  } else if (readiness >= 40) {
    readinessCategory = 'Average';
    readinessColor = '#f59e0b';
    readinessMessage =
      'Several important skills still require improvement.';
  }

  let domainRole = 'Target Role';

  try {
    const stored = JSON.parse(localStorage.getItem('edu_user') || '{}');

    if (stored?.domain_role_name) {
      domainRole = stored.domain_role_name;
    }
  } catch (e) {
    // Preserve existing behavior.
  }

  if (user?.domain_role) {
    domainRole = user.domain_role;
  }

  const skillsRemaining = needs.length;

  return (
    <>
      <style>{`
        /* =====================================================
           GAP REPORT PREMIUM DESIGN
        ===================================================== */

        .gap-report-page {
          position: relative;
          min-height: 100%;
          padding: 30px;
          overflow: hidden;
          background:
            radial-gradient(circle at 4% 2%, rgba(99,102,241,.13), transparent 25%),
            radial-gradient(circle at 96% 7%, rgba(168,85,247,.12), transparent 24%),
            radial-gradient(circle at 50% 100%, rgba(14,165,233,.08), transparent 28%),
            #f8fafc;
          color: #172033;
        }

        .gap-report-page::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          right: -220px;
          top: 230px;
          border-radius: 999px;
          background: rgba(129,140,248,.10);
          filter: blur(50px);
          pointer-events: none;
        }

        .gap-report-page > * {
          position: relative;
          z-index: 1;
        }

        .gap-report-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        /* HEADER */

        .gap-main-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          margin-bottom: 26px;
        }

        .gap-header-left {
          min-width: 0;
        }

        .gap-header-title-row {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 7px;
        }

        .gap-header-icon {
          width: 50px;
          height: 50px;
          flex: 0 0 50px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed);
          box-shadow:
            0 12px 28px rgba(79,70,229,.25),
            inset 0 1px 0 rgba(255,255,255,.35);
        }

        .gap-main-title {
          margin: 0;
          font-size: clamp(28px, 3vw, 38px);
          line-height: 1.12;
          font-weight: 950;
          letter-spacing: -0.045em;
          color: #111827;
        }

        .gap-main-title span {
          background: linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gap-main-subtitle {
          margin: 0;
          font-size: 16px;
          line-height: 1.55;
          font-weight: 600;
          color: #64748b;
        }

        .gap-header-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
        }

        .gap-action-btn {
          min-height: 46px;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 13px !important;
          font-size: 14px !important;
          font-weight: 800 !important;
          padding: 10px 15px !important;
          white-space: nowrap;
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            filter .2s ease;
        }

        .gap-action-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.02);
        }

        /* CARD WRAPPERS */

        .gap-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(148,163,184,.22) !important;
          border-radius: 20px !important;
          background:
            linear-gradient(145deg, rgba(255,255,255,.98), rgba(248,250,252,.96)) !important;
          box-shadow:
            0 10px 30px rgba(15,23,42,.055),
            0 2px 7px rgba(15,23,42,.035);
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .gap-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #4f46e5, #9333ea);
          opacity: .9;
        }

        .gap-card:hover {
          transform: translateY(-3px);
          border-color: rgba(99,102,241,.28) !important;
          box-shadow:
            0 18px 42px rgba(15,23,42,.09),
            0 5px 15px rgba(79,70,229,.07);
        }

        .gap-card h3,
        .gap-card h4 {
          color: #172033;
        }

        .gap-card p,
        .gap-card span,
        .gap-card td,
        .gap-card th {
          color: inherit;
        }

        /* CARD TITLES */

        .gap-section-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 19px;
        }

        .gap-section-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          box-shadow: 0 8px 20px rgba(79,70,229,.18);
        }

        .gap-section-title {
          margin: 0;
          font-size: 21px !important;
          line-height: 1.25;
          font-weight: 900 !important;
          letter-spacing: -0.025em;
          color: #172033 !important;
        }

        .gap-section-subtitle {
          margin: 3px 0 0;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 600;
          color: #64748b;
        }

        /* TOP THREE CARDS */

        .gap-overview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 22px;
        }

        .gap-overview-card {
          min-height: 315px;
          padding: 24px;
        }

        .gap-readiness-content {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 225px;
        }

        .gap-readiness-label {
          margin-top: 10px;
          text-align: center;
          font-size: 17px;
          font-weight: 900;
          color: ${readinessColor};
        }

        .gap-readiness-message {
          max-width: 300px;
          margin: 6px auto 0;
          text-align: center;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 600;
          color: #64748b;
        }

        .gap-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-top: 6px;
        }

        .gap-list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 13px;
          border: 1px solid rgba(226,232,240,.9);
          border-radius: 13px;
          background: rgba(248,250,252,.82);
          transition: transform .2s ease, background .2s ease;
        }

        .gap-list-item:hover {
          transform: translateX(3px);
          background: rgba(241,245,249,.98);
        }

        .gap-list-icon {
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .gap-strength-icon {
          color: #059669;
        }

        .gap-warning-icon {
          color: #ea580c;
        }

        .gap-list-text {
          font-size: 15px;
          line-height: 1.4;
          font-weight: 750;
          color: #334155;
        }

        .gap-empty {
          padding: 22px 10px;
          text-align: center;
          font-size: 15px;
          font-weight: 650;
          color: #94a3b8;
        }

        /* SKILL GAP ANALYSIS */

        .gap-analysis-card {
          padding: 25px;
          margin-bottom: 22px;
        }

        .gap-analysis-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .gap-legend {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }

        .gap-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          white-space: nowrap;
        }

        .gap-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .gap-analysis-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* DETAILED TABLE */

        .gap-detail-card {
          padding: 25px;
          margin-bottom: 22px;
        }

        .gap-detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .gap-count-badge {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 850;
          color: #4338ca;
          background: linear-gradient(
            135deg,
            rgba(224,231,255,.9),
            rgba(237,233,254,.9)
          );
          border: 1px solid rgba(129,140,248,.2);
          white-space: nowrap;
        }

        .gap-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
        }

        .gap-table {
          width: 100%;
          min-width: 780px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .gap-table th {
          padding: 14px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          font-weight: 900;
          color: #475569 !important;
          text-align: left;
          white-space: nowrap;
        }

        .gap-table td {
          padding: 16px;
          border-bottom: 1px solid #eef2f7;
          font-size: 15px;
          font-weight: 650;
          color: #334155 !important;
          background: rgba(255,255,255,.8);
        }

        .gap-table tr:last-child td {
          border-bottom: 0;
        }

        .gap-table tbody tr {
          transition: background .2s ease;
        }

        .gap-table tbody tr:hover td {
          background: #f8fafc;
        }

        .gap-skill-name {
          font-size: 15px;
          font-weight: 900;
          color: #172033 !important;
        }

        .gap-progress-cell {
          min-width: 220px;
        }

        .gap-progress-line {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gap-progress-track {
          flex: 1;
          height: 9px;
          min-width: 100px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .gap-progress-fill {
          height: 100%;
          border-radius: inherit;
          transition: width .5s ease;
        }

        .gap-progress-value {
          min-width: 46px;
          text-align: right;
          font-size: 13px;
          font-weight: 900;
          color: #475569;
        }

        .gap-number {
          font-size: 15px;
          font-weight: 850;
          color: #334155 !important;
        }

        .gap-negative {
          font-weight: 950;
          color: #dc2626 !important;
        }

        .gap-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 112px;
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
        }

        .gap-status-ready {
          color: #047857;
          background: #d1fae5;
        }

        .gap-status-close {
          color: #a16207;
          background: #fef3c7;
        }

        .gap-status-improve {
          color: #b91c1c;
          background: #fee2e2;
        }

        /* TWO LOWER CARDS */

        .gap-two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 22px;
        }

        .gap-lower-card {
          height: 100%;
          padding: 25px;
        }

        .gap-priority-list,
        .gap-recommendation-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gap-priority-item,
        .gap-recommendation-item {
          position: relative;
          padding: 15px;
          border-radius: 15px;
          border: 1px solid #e2e8f0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,.95),
            rgba(248,250,252,.95)
          );
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .gap-priority-item:hover,
        .gap-recommendation-item:hover {
          transform: translateY(-2px);
          border-color: rgba(99,102,241,.25);
          box-shadow: 0 9px 22px rgba(15,23,42,.06);
        }

        .gap-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .gap-item-title {
          font-size: 16px;
          font-weight: 900;
          color: #172033;
        }

        .gap-item-level {
          font-size: 13px;
          font-weight: 750;
          color: #64748b;
          margin-top: 5px;
        }

        .gap-item-gap {
          margin-top: 9px;
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 8px;
          background: #fff1f2;
          color: #dc2626;
          font-size: 12px;
          font-weight: 900;
        }

        .gap-recommendation-text {
          margin-top: 7px;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 650;
          color: #64748b;
        }

        /* CAREER SUMMARY */

        .gap-summary-card {
          padding: 25px;
          margin-bottom: 22px;
        }

        .gap-summary-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 13px;
        }

        .gap-summary-item {
          min-height: 140px;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background:
            radial-gradient(circle at 100% 0%, rgba(99,102,241,.10), transparent 45%),
            #ffffff;
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .gap-summary-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(15,23,42,.07);
        }

        .gap-summary-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #4f46e5;
          background: #eef2ff;
          margin-bottom: 13px;
        }

        .gap-summary-label {
          font-size: 12px;
          line-height: 1.3;
          font-weight: 850;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: .045em;
        }

        .gap-summary-value {
          margin-top: 7px;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 950;
          color: #172033;
          word-break: break-word;
        }

        .gap-summary-value.gradient {
          background: linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* NO REPORT */

        .gap-no-report {
          padding: 28px;
          margin-bottom: 22px;
        }

        .gap-no-report-inner {
          min-height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          border: 1px dashed #cbd5e1;
          border-radius: 18px;
          background:
            radial-gradient(circle at 50% 0%, rgba(99,102,241,.08), transparent 45%),
            #f8fafc;
        }

        .gap-no-report-icon {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          border-radius: 22px;
          color: #4f46e5;
          background: linear-gradient(
            135deg,
            #eef2ff,
            #ede9fe
          );
          box-shadow: 0 12px 30px rgba(79,70,229,.12);
          margin-bottom: 17px;
        }

        .gap-no-report-title {
          margin: 0;
          font-size: 25px;
          font-weight: 950;
          letter-spacing: -.025em;
          color: #172033;
        }

        .gap-no-report-text {
          max-width: 560px;
          margin: 8px auto 20px;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 600;
          color: #64748b;
        }

        /* SIMULATOR */

        .gap-simulator {
          position: relative;
          overflow: hidden;
          padding: 27px;
          border-radius: 22px;
          border: 1px solid rgba(99,102,241,.25);
          background:
            radial-gradient(circle at 0% 0%, rgba(59,130,246,.18), transparent 34%),
            radial-gradient(circle at 100% 0%, rgba(168,85,247,.18), transparent 32%),
            linear-gradient(135deg, #f8faff, #f5f3ff 55%, #faf5ff);
          box-shadow:
            0 18px 45px rgba(79,70,229,.09);
        }

        .gap-simulator::after {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          right: -180px;
          bottom: -180px;
          border-radius: 50%;
          background: rgba(59,130,246,.09);
          filter: blur(25px);
          pointer-events: none;
        }

        .gap-simulator > * {
          position: relative;
          z-index: 1;
        }

        .gap-simulator-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .gap-simulator-title-wrap {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .gap-simulator-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex: 0 0 48px;
          border-radius: 15px;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb, #4f46e5, #9333ea);
          box-shadow: 0 11px 27px rgba(79,70,229,.22);
        }

        .gap-simulator-title {
          margin: 0;
          font-size: 23px;
          line-height: 1.2;
          font-weight: 950;
          color: #172033;
        }

        .gap-simulator-subtitle {
          margin: 4px 0 0;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 600;
          color: #64748b;
        }

        .gap-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border-radius: 999px;
          color: #3730a3;
          background: rgba(238,242,255,.95);
          border: 1px solid rgba(129,140,248,.25);
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .gap-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px rgba(34,197,94,.12);
        }

        .gap-simulator-grid {
          display: grid;
          grid-template-columns: minmax(0, 7fr) minmax(330px, 5fr);
          gap: 20px;
        }

        .gap-simulator-panel {
          padding: 21px;
          border: 1px solid rgba(226,232,240,.85);
          border-radius: 18px;
          background: rgba(255,255,255,.82);
          box-shadow: 0 8px 24px rgba(15,23,42,.045);
        }

        .gap-field-label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 900;
          color: #334155;
        }

        .gap-role-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 23px;
        }

        .gap-role-btn {
          min-height: 53px;
          padding: 10px 13px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          text-align: left;
          transition:
            transform .2s ease,
            border-color .2s ease,
            background .2s ease,
            color .2s ease,
            box-shadow .2s ease;
        }

        .gap-role-btn:hover {
          transform: translateY(-2px);
          border-color: #a5b4fc;
          color: #4338ca;
          box-shadow: 0 8px 18px rgba(79,70,229,.08);
        }

        .gap-role-btn.active {
          color: #ffffff;
          border-color: transparent;
          background: linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed);
          box-shadow: 0 10px 22px rgba(79,70,229,.2);
        }

        .gap-skills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
        }

        .gap-skill-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid #dbe4f0;
          background: #ffffff;
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform .18s ease,
            background .18s ease,
            border-color .18s ease,
            color .18s ease;
        }

        .gap-skill-chip:hover {
          transform: translateY(-1px);
          border-color: #a5b4fc;
          color: #4338ca;
        }

        .gap-skill-chip.active {
          color: #ffffff;
          border-color: transparent;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 7px 17px rgba(79,70,229,.17);
        }

        .gap-analyze-btn {
          width: 100%;
          min-height: 51px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 13px;
          color: #ffffff;
          background: linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed);
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(79,70,229,.19);
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            filter .2s ease;
        }

        .gap-analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(79,70,229,.25);
          filter: brightness(1.03);
        }

        .gap-analyze-btn:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .gap-error {
          margin-top: 12px;
          padding: 11px 13px;
          border-radius: 11px;
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 750;
        }

        /* SIMULATION RESULTS */

        .gap-results-empty {
          min-height: 305px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .gap-results-empty-icon {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border-radius: 19px;
          color: #4f46e5;
          background: linear-gradient(135deg, #eef2ff, #f3e8ff);
          margin-bottom: 15px;
        }

        .gap-results-empty-title {
          font-size: 18px;
          font-weight: 900;
          color: #172033;
        }

        .gap-results-empty-text {
          max-width: 330px;
          margin-top: 6px;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 600;
          color: #64748b;
        }

        .gap-result-role {
          font-size: 14px;
          font-weight: 800;
          color: #64748b;
        }

        .gap-result-role strong {
          color: #172033;
        }

        .gap-result-score {
          display: flex;
          align-items: flex-end;
          gap: 5px;
          margin-top: 10px;
        }

        .gap-result-score-number {
          font-size: 43px;
          line-height: 1;
          font-weight: 950;
          background: linear-gradient(90deg, #2563eb, #4f46e5, #9333ea);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gap-result-score-percent {
          padding-bottom: 4px;
          font-size: 16px;
          font-weight: 900;
          color: #64748b;
        }

        .gap-result-progress {
          height: 11px;
          margin: 13px 0 21px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .gap-result-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #2563eb, #4f46e5, #9333ea);
        }

        .gap-result-heading {
          margin: 0 0 9px;
          font-size: 14px;
          font-weight: 900;
          color: #334155;
        }

        .gap-missing-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 17px;
        }

        .gap-missing-chip {
          padding: 7px 9px;
          border-radius: 8px;
          background: #fff1f2;
          color: #be123c;
          font-size: 12px;
          font-weight: 850;
        }

        .gap-guidance {
          padding: 13px;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            rgba(239,246,255,.95),
            rgba(245,243,255,.95)
          );
          border: 1px solid rgba(165,180,252,.25);
        }

        .gap-guidance-title {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 5px;
          color: #4338ca;
          font-size: 13px;
          font-weight: 900;
        }

        .gap-guidance-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 650;
          color: #64748b;
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {
          .gap-summary-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .gap-simulator-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1000px) {
          .gap-overview-grid {
            grid-template-columns: 1fr;
          }

          .gap-overview-card {
            min-height: auto;
          }

          .gap-readiness-content {
            min-height: 245px;
          }

          .gap-two-column {
            grid-template-columns: 1fr;
          }

          .gap-main-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .gap-header-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 760px) {
          .gap-report-page {
            padding: 20px 15px;
          }

          .gap-main-title {
            font-size: 30px;
          }

          .gap-main-subtitle {
            font-size: 15px;
          }

          .gap-header-icon {
            width: 46px;
            height: 46px;
            flex-basis: 46px;
          }

          .gap-analysis-header {
            flex-direction: column;
          }

          .gap-legend {
            justify-content: flex-start;
          }

          .gap-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .gap-simulator {
            padding: 19px;
          }

          .gap-simulator-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .gap-role-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .gap-report-page {
            padding: 15px 11px;
          }

          .gap-main-title {
            font-size: 27px;
          }

          .gap-header-title-row {
            align-items: flex-start;
          }

          .gap-header-actions {
            width: 100%;
            flex-direction: column;
          }

          .gap-action-btn {
            width: 100%;
          }

          .gap-overview-card,
          .gap-analysis-card,
          .gap-detail-card,
          .gap-lower-card,
          .gap-summary-card,
          .gap-no-report {
            padding: 19px;
          }

          .gap-section-title {
            font-size: 19px !important;
          }

          .gap-summary-grid {
            grid-template-columns: 1fr;
          }

          .gap-summary-item {
            min-height: 125px;
          }

          .gap-table-wrap {
            border-radius: 12px;
          }

          .gap-simulator-panel {
            padding: 16px;
          }

          .gap-simulator-title {
            font-size: 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gap-card,
          .gap-list-item,
          .gap-priority-item,
          .gap-recommendation-item,
          .gap-summary-item,
          .gap-action-btn,
          .gap-role-btn,
          .gap-skill-chip,
          .gap-analyze-btn {
            transition: none !important;
          }

          .gap-progress-fill,
          .gap-result-progress-fill {
            transition: none !important;
          }
        }
      `}</style>

      <div className="gap-report-page">
        <div className="gap-report-container">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="gap-main-header">
            <div className="gap-header-left">
              <div className="gap-header-title-row">
                <div className="gap-header-icon">
                  <AnalyticsIcon size={27} />
                </div>

                <h2 className="gap-main-title">
                  Gap Analysis <span>Report</span>
                </h2>
              </div>

              <p className="gap-main-subtitle">
                Your skills vs. the requirements for {domainRole} roles.
              </p>
            </div>

            <div className="gap-header-actions">
              <Button
                variant="outline"
                className="gap-action-btn"
              >
                <CompareIcon size={17} />
                <span>Compare with Industry</span>
              </Button>

              <Button
                variant="primary"
                className="gap-action-btn"
              >
                <DownloadIcon size={17} />
                <span>Download Report</span>
              </Button>

              <Button
                variant="accent"
                className="gap-action-btn"
              >
                <FileIcon size={17} />
                <span>Export PDF</span>
              </Button>
            </div>
          </div>

          {/* =====================================================
              NO REPORT
          ===================================================== */}

          {!hasGapReport ? (
            <>
              <div className="gap-card gap-no-report">
                <div className="gap-no-report-inner">
                  <div className="gap-no-report-icon">
                    <AnalyticsIcon size={35} />
                  </div>

                  <h3 className="gap-no-report-title">
                    No Gap Report Available
                  </h3>

                  <p className="gap-no-report-text">
                    Complete your assessment to unlock your personalized
                    skill-gap analysis, readiness insights, strengths,
                    improvement areas, and career recommendations.
                  </p>

                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate('/app/assessments/initial')
                    }
                    className="gap-action-btn"
                  >
                    <TargetIcon size={17} />
                    <span>Take Assessment</span>
                  </Button>
                </div>
              </div>

              <AISkillGapSimulator user={user} />
            </>
          ) : (
            <>
              {/* =====================================================
                  1. READINESS / STRENGTHS / NEEDS
              ===================================================== */}

              <div className="gap-overview-grid">

                {/* READINESS */}
                <div className="gap-card gap-overview-card">
                  <div className="gap-section-heading">
                    <div className="gap-section-icon">
                      <GaugeIcon size={22} />
                    </div>

                    <div>
                      <h3 className="gap-section-title">
                        Readiness Overview
                      </h3>

                      <p className="gap-section-subtitle">
                        Your overall career readiness
                      </p>
                    </div>
                  </div>

                  <div className="gap-readiness-content">
                    <div>
                      <Gauge
                        value={readiness}
                        size={200}
                        label="Overall Readiness"
                      />

                      <div
                        className="gap-readiness-label"
                        style={{ color: readinessColor }}
                      >
                        {readinessCategory}
                      </div>

                      <p className="gap-readiness-message">
                        {readinessMessage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* STRENGTHS */}
                <div className="gap-card gap-overview-card">
                  <div className="gap-section-heading">
                    <div
                      className="gap-section-icon"
                      style={{
                        background:
                          'linear-gradient(135deg,#059669,#10b981)',
                      }}
                    >
                      <CheckCircleIcon size={22} />
                    </div>

                    <div>
                      <h3 className="gap-section-title">
                        Strengths
                      </h3>

                      <p className="gap-section-subtitle">
                        Skills already meeting requirements
                      </p>
                    </div>
                  </div>

                  {strengths.length > 0 ? (
                    <div className="gap-list">
                      {strengths.map((skill) => (
                        <div
                          key={skill.skill_id}
                          className="gap-list-item"
                        >
                          <div className="gap-list-icon gap-strength-icon">
                            <CheckCircleIcon size={20} />
                          </div>

                          <div className="gap-list-text">
                            {skill.skill_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="gap-empty">
                      No strengths identified yet.
                    </div>
                  )}
                </div>

                {/* NEEDS IMPROVEMENT */}
                <div className="gap-card gap-overview-card">
                  <div className="gap-section-heading">
                    <div
                      className="gap-section-icon"
                      style={{
                        background:
                          'linear-gradient(135deg,#ea580c,#f97316)',
                      }}
                    >
                      <AlertIcon size={22} />
                    </div>

                    <div>
                      <h3 className="gap-section-title">
                        Needs Improvement
                      </h3>

                      <p className="gap-section-subtitle">
                        Skills requiring focused development
                      </p>
                    </div>
                  </div>

                  {needs.length > 0 ? (
                    <div className="gap-list">
                      {needs.map((skill, index) => (
                        <div
                          key={`${skill.name}-${index}`}
                          className="gap-list-item"
                        >
                          <div className="gap-list-icon gap-warning-icon">
                            <AlertIcon size={20} />
                          </div>

                          <div className="gap-list-text">
                            {skill.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="gap-empty">
                      No improvement areas identified.
                    </div>
                  )}
                </div>
              </div>

              {/* =====================================================
                  2. SKILL GAP ANALYSIS
              ===================================================== */}

              <div className="gap-card gap-analysis-card">
                <div className="gap-analysis-header">
                  <div className="gap-section-heading" style={{ marginBottom: 0 }}>
                    <div className="gap-section-icon">
                      <AnalyticsIcon size={22} />
                    </div>

                    <div>
                      <h3 className="gap-section-title">
                        Skill Gap Analysis
                      </h3>

                      <p className="gap-section-subtitle">
                        Compare your current level with role requirements
                      </p>
                    </div>
                  </div>

                  <div className="gap-legend">
                    <div className="gap-legend-item">
                      <span
                        className="gap-legend-dot"
                        style={{ background: '#ef4444' }}
                      />
                      Low (0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“40%)
                    </div>

                    <div className="gap-legend-item">
                      <span
                        className="gap-legend-dot"
                        style={{ background: '#f97316' }}
                      />
                      Moderate (41ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“70%)
                    </div>

                    <div className="gap-legend-item">
                      <span
                        className="gap-legend-dot"
                        style={{ background: '#22c55e' }}
                      />
                      High (71ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“100%)
                    </div>
                  </div>
                </div>

                <div className="gap-analysis-list">
                  {breakdown.map((b) => {
                    const percentage = Math.min(
                      100,
                      Math.max(
                        0,
                        Number(b.student_level / b.required_level) * 100
                      )
                    );

                    const color = `hsl(${percentage * 1.2}, 80%, 45%)`;

                    return (
                      <SkillBar
                        key={b.skill_id}
                        name={b.skill_name}
                        value={percentage.toFixed(2)}
                        color={color}
                      />
                    );
                  })}
                </div>
              </div>

              {/* =====================================================
                  3. DETAILED SKILL BREAKDOWN
              ===================================================== */}

              <div className="gap-card gap-detail-card">
                <div className="gap-detail-header">
                  <div className="gap-section-heading" style={{ marginBottom: 0 }}>
                    <div className="gap-section-icon">
                      <GaugeIcon size={22} />
                    </div>

                    <div>
                      <h3 className="gap-section-title">
                        Detailed Skill Breakdown
                      </h3>

                      <p className="gap-section-subtitle">
                        Current proficiency compared with expected levels
                      </p>
                    </div>
                  </div>

                  <div className="gap-count-badge">
                    {breakdown.length} Skills Analyzed
                  </div>
                </div>

                {breakdown.length === 0 ? (
                  <div className="gap-empty">
                    No skill breakdown available.
                  </div>
                ) : (
                  <div className="gap-table-wrap">
                    <table className="gap-table">
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Progress</th>
                          <th>Yours</th>
                          <th>Required</th>
                          <th>Gap</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {breakdown.map((skill) => {
                          const percentage = Math.round(
                            (skill.student_level /
                              skill.required_level) *
                              100
                          );

                          const visualPercentage = Math.min(
                            100,
                            Math.max(0, percentage)
                          );

                          const color = `hsl(${Math.min(
                            100,
                            Math.max(0, percentage)
                          ) * 1.2}, 80%, 45%)`;

                          const status =
                            skill.gap === 0
                              ? 'Ready'
                              : skill.gap === 1
                              ? 'Close'
                              : 'Needs Improvement';

                          return (
                            <tr key={skill.skill_id}>
                              <td>
                                <div className="gap-skill-name">
                                  {skill.skill_name}
                                </div>
                              </td>

                              <td className="gap-progress-cell">
                                <div className="gap-progress-line">
                                  <div className="gap-progress-track">
                                    <div
                                      className="gap-progress-fill"
                                      style={{
                                        width: `${visualPercentage}%`,
                                        background: color,
                                      }}
                                    />
                                  </div>

                                  <div className="gap-progress-value">
                                    {percentage}%
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className="gap-number">
                                  {skill.student_level}
                                </span>
                              </td>

                              <td>
                                <span className="gap-number">
                                  {skill.required_level}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={
                                    skill.gap === 0
                                      ? 'gap-number'
                                      : 'gap-negative'
                                  }
                                >
                                  {skill.gap === 0
                                    ? 0
                                    : `-${skill.gap}`}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`gap-status ${
                                    status === 'Ready'
                                      ? 'gap-status-ready'
                                      : status === 'Close'
                                      ? 'gap-status-close'
                                      : 'gap-status-improve'
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* =====================================================
                  4. PRIORITY + AI RECOMMENDATIONS
              ===================================================== */}

              <div className="gap-two-column">

                {/* PRIORITY AREAS */}
                <div className="gap-card gap-lower-card">
                  <div className="gap-section-heading">
                    <div
                      className="gap-section-icon"
                      style={{
                        background:
                          'linear-gradient(135deg,#dc2626,#f97316)',
                      }}
                    >
                      <TargetIcon size={22} />
                    </div>

                    <div>
                      <h3 className="gap-section-title">
                        Priority Areas
                      </h3>

                      <p className="gap-section-subtitle">
                        Focus on the largest skill gaps first
                      </p>
                    </div>
                  </div>

                  <div className="gap-priority-list">
                    {[...breakdown]
                      .sort((a, b) => b.gap - a.gap)
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item.skill_id}
                          className="gap-priority-item"
                        >
                          <div className="gap-item-top">
                            <div className="gap-item-title">
                              {item.skill_name}
                            </div>
                          </div>

                          <div className="gap-item-level">
                            Current level: {item.student_level} Ãƒâ€šÃ‚Â· Required:{' '}
                            {item.required_level}
                          </div>

                          <div className="gap-item-gap">
                            Gap: -{item.gap}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* AI RECOMMENDATIONS */}
                <div className="gap-card gap-lower-card">
                  <div className="gap-section-heading">
                    <div
                      className="gap-section-icon"
                      style={{
                        background:
                          'linear-gradient(135deg,#7c3aed,#9333ea)',
                      }}
                    >
                      <SparklesIcon size={22} />
                    </div>

                    <div>
                      <h3 className="gap-section-title">
                        AI Recommendations
                      </h3>

                      <p className="gap-section-subtitle">
                        Personalized guidance based on your gaps
                      </p>
                    </div>
                  </div>

                  <div className="gap-recommendation-list">
                    {(live?.recommendations?.suggestions || [])
                      .slice(0, 4)
                      .map((s, index) => (
                        <div
                          key={`${s.skill}-${index}`}
                          className="gap-recommendation-item"
                        >
                          <div className="gap-item-title">
                            {s.skill}
                          </div>

                          <div className="gap-recommendation-text">
                            {s.suggestion}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* =====================================================
                  5. CAREER READINESS SUMMARY
              ===================================================== */}

              <div className="gap-card gap-summary-card">
                <div className="gap-section-heading">
                  <div
                    className="gap-section-icon"
                    style={{
                      background:
                        'linear-gradient(135deg,#0f766e,#0891b2)',
                    }}
                  >
                    <BriefcaseIcon size={22} />
                  </div>

                  <div>
                    <h3 className="gap-section-title">
                      Career Readiness Summary
                    </h3>

                    <p className="gap-section-subtitle">
                      A quick view of your current career position
                    </p>
                  </div>
                </div>

                <div className="gap-summary-grid">

                  <div className="gap-summary-item">
                    <div className="gap-summary-icon">
                      <GaugeIcon size={19} />
                    </div>

                    <div className="gap-summary-label">
                      Current Readiness
                    </div>

                    <div className="gap-summary-value gradient">
                      {readiness}%
                    </div>
                  </div>

                  <div className="gap-summary-item">
                    <div className="gap-summary-icon">
                      <BriefcaseIcon size={19} />
                    </div>

                    <div className="gap-summary-label">
                      Target Role
                    </div>

                    <div className="gap-summary-value">
                      {domainRole}
                    </div>
                  </div>

                  <div className="gap-summary-item">
                    <div className="gap-summary-icon">
                      <TargetIcon size={19} />
                    </div>

                    <div className="gap-summary-label">
                      Skills Remaining
                    </div>

                    <div className="gap-summary-value gradient">
                      {skillsRemaining}
                    </div>
                  </div>

                  <div className="gap-summary-item">
                    <div className="gap-summary-icon">
                      <ClockIcon size={19} />
                    </div>

                    <div className="gap-summary-label">
                      Estimated Time
                    </div>

                    <div className="gap-summary-value">
                      ~{Math.max(2, skillsRemaining * 3)} Weeks
                    </div>
                  </div>

                  <div className="gap-summary-item">
                    <div className="gap-summary-icon">
                      <ChevronIcon size={19} />
                    </div>

                    <div className="gap-summary-label">
                      Next Best Action
                    </div>

                    <div className="gap-summary-value">
                      Focus on {needs[0]?.name || 'Core Skills'}
                    </div>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  6. AI SKILL GAP SIMULATOR
              ===================================================== */}

              <AISkillGapSimulator user={user} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   AI SKILL GAP SIMULATOR
========================================================= */

const PRESET_CAREER_ROLES = {
  'Full Stack Developer': [
    'React',
    'Node.js',
    'SQL',
    'TypeScript',
    'Git',
    'REST APIs',
  ],

  'AI / ML Engineer': [
    'Python',
    'Machine Learning',
    'TensorFlow',
    'SQL',
    'Data Analysis',
    'Docker',
  ],

  'Cloud & DevOps Engineer': [
    'Docker',
    'Kubernetes',
    'AWS',
    'Linux',
    'CI/CD',
    'Python',
  ],

  'Data Scientist': [
    'Python',
    'Statistics',
    'SQL',
    'Pandas',
    'Data Visualization',
    'Machine Learning',
  ],
};

const COMMON_STUDENT_SKILLS = [
  'Python',
  'JavaScript',
  'React',
  'SQL',
  'Git',
  'HTML/CSS',
  'Node.js',
  'Docker',
  'Linux',
  'Data Analysis',
];

function AISkillGapSimulator({ user }) {
  const [selectedRole, setSelectedRole] = useState(
    'Full Stack Developer'
  );

  const [mySkills, setMySkills] = useState([
    'Python',
    'JavaScript',
    'SQL',
    'Git',
  ]);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSkill = (skill) => {
    setMySkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const required = PRESET_CAREER_ROLES[selectedRole];

      const res = await aimlAnalyzeSkillGap({
        student_skills: mySkills,
        required_skills: required,
      });

      const result =
        res?.data?.result ||
        res?.result ||
        res?.data ||
        res;

      setAnalysis(result);
    } catch (err) {
      console.error('AI skill gap analysis failed:', err);

      /*
       * Preserve offline fallback.
       */

      try {
        const required = PRESET_CAREER_ROLES[selectedRole];

        const studentLower = mySkills.map((skill) =>
          skill.toLowerCase()
        );

        const matched = required.filter((skill) =>
          studentLower.includes(skill.toLowerCase())
        );

        const missing = required.filter(
          (skill) =>
            !studentLower.includes(skill.toLowerCase())
        );

        const readiness = Math.round(
          (matched.length / required.length) * 100
        );

        setAnalysis({
          role: selectedRole,
          readiness,
          matched_skills: matched,
          missing_skills: missing,
          report: required.map((skill) => ({
            skill,
            status: studentLower.includes(
              skill.toLowerCase()
            )
              ? 'Ready'
              : 'Needs Improvement',
            gap: studentLower.includes(
              skill.toLowerCase()
            )
              ? 0
              : 2,
          })),
        });
      } catch (fallbackError) {
        console.error(
          'Fallback skill gap analysis failed:',
          fallbackError
        );

        setError(
          'Unable to analyze your skills right now. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const normalizedAnalysis =
    analysis?.result ||
    analysis?.data ||
    analysis ||
    null;

  const resultReadiness =
    normalizedAnalysis?.readiness ??
    normalizedAnalysis?.readiness_score ??
    normalizedAnalysis?.score ??
    0;

  const resultMissing =
    normalizedAnalysis?.missing_skills ||
    normalizedAnalysis?.missing ||
    normalizedAnalysis?.gaps ||
    [];

  const resultGuidance =
    normalizedAnalysis?.guidance ||
    normalizedAnalysis?.recommendation ||
    normalizedAnalysis?.suggestion ||
    normalizedAnalysis?.message ||
    'Focus on the missing competencies and build practical projects to strengthen your readiness.';

  return (
    <div className="gap-simulator">
      <div className="gap-simulator-header">
        <div className="gap-simulator-title-wrap">
          <div className="gap-simulator-icon">
            <BrainIcon size={25} />
          </div>

          <div>
            <h3 className="gap-simulator-title">
              AI Career Skill Gap Simulator
            </h3>

            <p className="gap-simulator-subtitle">
              Simulate your readiness for different career roles
              using your current skills.
            </p>
          </div>
        </div>

        <div className="gap-live-badge">
          <span className="gap-live-dot" />
          Live AI Engine
        </div>
      </div>

      <div className="gap-simulator-grid">

        {/* =====================================================
            LEFT PANEL
        ===================================================== */}

        <div className="gap-simulator-panel">
          <label className="gap-field-label">
            Target Career Role
          </label>

          <div className="gap-role-grid">
            {Object.keys(PRESET_CAREER_ROLES).map((role) => (
              <button
                key={role}
                type="button"
                className={`gap-role-btn ${
                  selectedRole === role ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedRole(role);
                  setAnalysis(null);
                  setError(null);
                }}
              >
                {role}
              </button>
            ))}
          </div>

          <label className="gap-field-label">
            Your Acquired Skills
          </label>

          <div className="gap-skills-wrap">
            {COMMON_STUDENT_SKILLS.map((skill) => {
              const active = mySkills.includes(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  className={`gap-skill-chip ${
                    active ? 'active' : ''
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {active && (
                    <CheckCircleIcon size={14} />
                  )}

                  {skill}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="gap-analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <SparklesIcon size={18} />
                <span>Analyze Skill Gap</span>
              </>
            )}
          </button>

          {error && (
            <div className="gap-error">
              {error}
            </div>
          )}
        </div>

        {/* =====================================================
            RIGHT PANEL
        ===================================================== */}

        <div className="gap-simulator-panel">

          {!normalizedAnalysis ? (
            <div className="gap-results-empty">
              <div className="gap-results-empty-icon">
                <AnalyticsIcon size={29} />
              </div>

              <div className="gap-results-empty-title">
                No Simulation Computed
              </div>

              <div className="gap-results-empty-text">
                Select your target role, choose your current
                skills, and run the AI analysis to see your
                simulated career readiness.
              </div>
            </div>
          ) : (
            <div>
              <div className="gap-result-role">
                Simulation for{' '}
                <strong>{selectedRole}</strong>
              </div>

              <div className="gap-result-score">
                <div className="gap-result-score-number">
                  {resultReadiness}
                </div>

                <div className="gap-result-score-percent">
                  %
                </div>
              </div>

              <div className="gap-result-progress">
                <div
                  className="gap-result-progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, Number(resultReadiness) || 0)
                    )}%`,
                  }}
                />
              </div>

              <h4 className="gap-result-heading">
                Missing Competencies
              </h4>

              <div className="gap-missing-list">
                {resultMissing.length > 0 ? (
                  resultMissing.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="gap-missing-chip"
                    >
                      {typeof skill === 'string'
                        ? skill
                        : skill?.skill ||
                          skill?.name ||
                          'Skill'}
                    </span>
                  ))
                ) : (
                  <span className="gap-item-level">
                    No major missing competencies detected.
                  </span>
                )}
              </div>

              <div className="gap-guidance">
                <div className="gap-guidance-title">
                  <SparklesIcon size={16} />
                  AI Guidance
                </div>

                <p className="gap-guidance-text">
                  {typeof resultGuidance === 'string'
                    ? resultGuidance
                    : JSON.stringify(resultGuidance)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}