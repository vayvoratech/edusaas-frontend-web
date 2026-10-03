import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import {
  getMyRecommendations,
  enrollCourse,
  getMyEnrollments,
  fetchGapReport,
  getCourses,
} from "../services/api";

const iconFor = (title = "") => {
  const t = title.toLowerCase();

  if (t.includes("python")) return "🐍";
  if (t.includes("sql")) return "🗄️";
  if (t.includes("machine")) return "🤖";
  if (t.includes("deep")) return "🧠";
  if (t.includes("git")) return "🌿";
  if (t.includes("preprocess") || t.includes("data")) return "📊";
  if (t.includes("stat")) return "📈";

  return "📘";
};

const styles = `
  .recommendations-page {
    --rp-blue: #2563eb;
    --rp-indigo: #4f46e5;
    --rp-violet: #7c3aed;
    --rp-cyan: #06b6d4;
    --rp-purple: #9333ea;
    --rp-text: #0f172a;
    --rp-muted: #64748b;
    --rp-border: rgba(148, 163, 184, 0.22);

    position: relative;
    min-height: 100vh;
    overflow: hidden;
    padding: 28px 24px 70px;
    color: var(--rp-text);
    background:
      radial-gradient(circle at 5% 5%, rgba(59,130,246,.12), transparent 28%),
      radial-gradient(circle at 94% 8%, rgba(124,58,237,.11), transparent 27%),
      radial-gradient(circle at 50% 100%, rgba(6,182,212,.08), transparent 30%),
      linear-gradient(135deg, #f8fbff 0%, #f7f9ff 48%, #fbf9ff 100%);
  }

  .recommendations-page::before,
  .recommendations-page::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(2px);
    opacity: .65;
    z-index: 0;
  }

  .recommendations-page::before {
    width: 420px;
    height: 420px;
    top: 180px;
    left: -250px;
    background: radial-gradient(circle, rgba(37,99,235,.10), transparent 68%);
    animation: recommendationFloat 10s ease-in-out infinite;
  }

  .recommendations-page::after {
    width: 500px;
    height: 500px;
    right: -280px;
    bottom: 100px;
    background: radial-gradient(circle, rgba(124,58,237,.10), transparent 68%);
    animation: recommendationFloatReverse 13s ease-in-out infinite;
  }

  .recommendations-inner {
    position: relative;
    z-index: 1;
    max-width: 1500px;
    margin: 0 auto;
  }

  /* HERO */

  .recommendation-hero {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.32) !important;
    border-radius: 30px !important;
    padding: 34px !important;
    margin-bottom: 26px;
    color: white;
    background:
      radial-gradient(circle at 88% 15%, rgba(255,255,255,.22), transparent 23%),
      radial-gradient(circle at 15% 100%, rgba(6,182,212,.30), transparent 32%),
      linear-gradient(135deg, #312e81 0%, #4338ca 30%, #2563eb 66%, #0891b2 100%) !important;
    box-shadow:
      0 25px 65px rgba(37,99,235,.20),
      0 8px 25px rgba(79,70,229,.12),
      inset 0 1px 0 rgba(255,255,255,.28) !important;
  }

  .recommendation-hero::before {
    content: "";
    position: absolute;
    width: 280px;
    height: 280px;
    right: -90px;
    top: -110px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 50%;
    box-shadow:
      0 0 0 35px rgba(255,255,255,.035),
      0 0 0 70px rgba(255,255,255,.025);
    animation: heroOrbit 12s linear infinite;
  }

  .recommendation-hero::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 1px;
    left: 0;
    top: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.65),
      transparent
    );
    animation: heroShimmer 4s ease-in-out infinite;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 150px;
    gap: 30px;
    align-items: center;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    margin-bottom: 14px;
    padding: 8px 13px;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 999px;
    color: rgba(255,255,255,.96);
    background: rgba(255,255,255,.11);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.15);
    backdrop-filter: blur(10px);
    font-size: 12px;
    font-weight: 850;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .hero-title {
    max-width: 850px;
    margin: 0;
    font-size: clamp(30px, 4vw, 52px);
    line-height: 1.02;
    letter-spacing: -.045em;
    font-weight: 950;
    color: #fff;
    text-shadow: 0 5px 25px rgba(15,23,42,.18);
  }

  .hero-title-gradient {
    background: linear-gradient(
      90deg,
      #ffffff 0%,
      #dbeafe 40%,
      #cffafe 75%,
      #ffffff 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradientText 6s ease-in-out infinite;
  }

  .hero-description {
    max-width: 780px;
    margin: 16px 0 22px;
    color: rgba(255,255,255,.86);
    font-size: 15px;
    line-height: 1.75;
    font-weight: 550;
    letter-spacing: .005em;
  }

  .hero-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 12px;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 999px;
    background: rgba(255,255,255,.10);
    color: rgba(255,255,255,.96);
    font-size: 12px;
    font-weight: 800;
    backdrop-filter: blur(10px);
    transition: transform .25s ease, background .25s ease;
  }

  .hero-pill:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,.17);
  }

  .hero-score-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .readiness-ring {
    position: relative;
    width: 132px;
    height: 132px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background:
      conic-gradient(
        #ffffff var(--score),
        rgba(255,255,255,.16) var(--score)
      );
    box-shadow:
      0 0 35px rgba(255,255,255,.14),
      0 0 65px rgba(34,211,238,.12);
    animation: readinessPulse 4s ease-in-out infinite;
  }

  .readiness-ring::before {
    content: "";
    position: absolute;
    width: 104px;
    height: 104px;
    border-radius: 50%;
    background: linear-gradient(145deg, #312e81, #2563eb);
    box-shadow: inset 0 0 18px rgba(0,0,0,.13);
  }

  .readiness-content {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .readiness-number {
    display: block;
    color: #fff;
    font-size: 30px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -.04em;
  }

  .readiness-label {
    display: block;
    margin-top: 6px;
    color: rgba(255,255,255,.70);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  /* SECTION HEADERS */

  .recommendation-section {
    margin-top: 30px;
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 18px;
    margin-bottom: 16px;
  }

  .section-heading-left {
    min-width: 0;
  }

  .section-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 5px;
    color: #6366f1;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .section-eyebrow::before {
    content: "";
    width: 24px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
  }

  .section-title {
    margin: 0;
    font-size: clamp(22px, 3vw, 30px);
    line-height: 1.1;
    font-weight: 950;
    letter-spacing: -.035em;
    background: linear-gradient(
      100deg,
      #0f172a 0%,
      #3730a3 45%,
      #7c3aed 72%,
      #0891b2 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .section-subtitle {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.55;
    font-weight: 560;
  }

  .section-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 12px;
    border: 1px solid rgba(99,102,241,.16);
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(99,102,241,.07), rgba(6,182,212,.06));
    color: #4f46e5;
    font-size: 11px;
    font-weight: 850;
  }

  /* GENERIC PREMIUM CARD */

  .premium-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(148,163,184,.18) !important;
    border-radius: 22px !important;
    background:
      linear-gradient(145deg, rgba(255,255,255,.97), rgba(248,250,252,.94)) !important;
    box-shadow:
      0 10px 35px rgba(15,23,42,.055),
      0 2px 8px rgba(15,23,42,.035),
      inset 0 1px 0 rgba(255,255,255,.95) !important;
    transition:
      transform .3s ease,
      box-shadow .3s ease,
      border-color .3s ease;
  }

  .premium-card::before {
    content: "";
    position: absolute;
    width: 180px;
    height: 180px;
    top: -110px;
    right: -100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,.08), transparent 70%);
    pointer-events: none;
  }

  .premium-card:hover {
    transform: translateY(-4px);
    border-color: rgba(99,102,241,.24) !important;
    box-shadow:
      0 20px 45px rgba(37,99,235,.09),
      0 7px 18px rgba(15,23,42,.055),
      0 0 0 1px rgba(99,102,241,.035) !important;
  }

  /* PROFILE */

  .profile-card {
    padding: 25px !important;
  }

  .skill-row {
    margin-top: 18px;
  }

  .skill-topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-bottom: 8px;
  }

  .skill-name {
    color: #1e293b;
    font-size: 13px;
    font-weight: 850;
    letter-spacing: -.01em;
  }

  .skill-percentage {
    font-size: 13px;
    font-weight: 950;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .skill-track {
    position: relative;
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: #eef2f7;
    box-shadow: inset 0 1px 3px rgba(15,23,42,.06);
  }

  .skill-progress {
    position: relative;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      #2563eb 0%,
      #4f46e5 48%,
      #7c3aed 75%,
      #06b6d4 100%
    );
    box-shadow:
      0 0 14px rgba(79,70,229,.24),
      inset 0 1px 0 rgba(255,255,255,.3);
    transition: width 1s cubic-bezier(.2,.8,.2,1);
  }

  .skill-progress::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.35),
      transparent
    );
    transform: translateX(-100%);
    animation: progressShimmer 3s ease-in-out infinite;
  }

  /* ROADMAP */

  .roadmap-card {
    padding: 25px !important;
  }

  .roadmap-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
  }

  .roadmap-step {
    position: relative;
    min-height: 155px;
    padding: 17px;
    border: 1px solid rgba(148,163,184,.17);
    border-radius: 18px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    box-shadow: 0 7px 20px rgba(15,23,42,.045);
    transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
  }

  .roadmap-step:hover {
    transform: translateY(-5px);
    border-color: rgba(99,102,241,.25);
    box-shadow:
      0 16px 30px rgba(37,99,235,.09),
      0 0 25px rgba(124,58,237,.05);
  }

  .roadmap-number {
    display: inline-grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 10px;
    margin-bottom: 13px;
    color: white;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    box-shadow: 0 6px 16px rgba(79,70,229,.24);
    font-size: 12px;
    font-weight: 950;
  }

  .roadmap-title {
    min-height: 40px;
    margin: 0 0 13px;
    color: #172033;
    font-size: 13px;
    line-height: 1.4;
    font-weight: 850;
    letter-spacing: -.01em;
  }

  .roadmap-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 9px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 1;
    font-weight: 850;
  }

  .roadmap-status.completed {
    color: #047857;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
  }

  .roadmap-status.recommended {
    color: #4338ca;
    background: #eef2ff;
    border: 1px solid #c7d2fe;
  }

  .roadmap-arrow {
    position: absolute;
    top: 50%;
    right: -17px;
    z-index: 3;
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #6366f1;
    background: #fff;
    border: 1px solid #c7d2fe;
    box-shadow: 0 4px 12px rgba(79,70,229,.12);
    transform: translateY(-50%);
    font-size: 12px;
    font-weight: 950;
  }

  /* COURSE CARDS */

  .course-grid,
  .ai-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .course-card,
  .ai-course-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(148,163,184,.18) !important;
    border-radius: 22px !important;
    background: linear-gradient(145deg, #ffffff, #f8fafc) !important;
    box-shadow:
      0 10px 30px rgba(15,23,42,.05),
      inset 0 1px 0 rgba(255,255,255,.9) !important;
    transition:
      transform .3s ease,
      box-shadow .3s ease,
      border-color .3s ease;
  }

  .course-card::before,
  .ai-course-card::before {
    content: "";
    position: absolute;
    width: 220px;
    height: 220px;
    top: -140px;
    right: -100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,.10), transparent 70%);
    pointer-events: none;
  }

  .course-card:hover,
  .ai-course-card:hover {
    transform: translateY(-6px);
    border-color: rgba(79,70,229,.25) !important;
    box-shadow:
      0 22px 45px rgba(37,99,235,.10),
      0 0 35px rgba(124,58,237,.06) !important;
  }

  .course-inner {
    position: relative;
    z-index: 1;
    padding: 22px;
  }

  .course-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }

  .course-icon {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 16px;
    background:
      linear-gradient(145deg, #eff6ff, #eef2ff 52%, #faf5ff);
    border: 1px solid rgba(99,102,241,.13);
    box-shadow:
      0 8px 20px rgba(79,70,229,.09),
      inset 0 1px 0 #fff;
    font-size: 26px;
    transition: transform .3s ease;
  }

  .course-card:hover .course-icon,
  .ai-course-card:hover .course-icon {
    transform: scale(1.08) rotate(-3deg);
  }

  .course-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
  }

  .course-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 8px;
    border-radius: 999px;
    font-size: 9px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: .02em;
  }

  .course-badge.difficulty {
    color: #475569;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
  }

  .course-badge.ai {
    color: #4338ca;
    background: #eef2ff;
    border: 1px solid #c7d2fe;
  }

  .course-badge.priority {
    color: #be123c;
    background: #fff1f2;
    border: 1px solid #fecdd3;
  }

  .course-badge.confidence {
    color: #047857;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
  }

  .course-title {
    margin: 0;
    color: #111827;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 900;
    letter-spacing: -.025em;
    transition: color .25s ease;
  }

  .course-card:hover .course-title,
  .ai-course-card:hover .course-title {
    background: linear-gradient(90deg, #1d4ed8, #6366f1, #7c3aed);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .course-reason {
    margin: 10px 0 18px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.65;
    font-weight: 560;
  }

  .course-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 18px;
  }

  .course-metric {
    padding: 10px 8px;
    border-radius: 12px;
    background: linear-gradient(145deg, #f8fafc, #f1f5f9);
    border: 1px solid #e5e7eb;
    text-align: center;
  }

  .course-metric-label {
    display: block;
    margin-bottom: 3px;
    color: #94a3b8;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .course-metric-value {
    display: block;
    overflow: hidden;
    color: #334155;
    font-size: 11px;
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .course-actions {
    display: flex;
    gap: 9px;
  }

  .course-actions > * {
    flex: 1;
  }

  .premium-action {
    border-radius: 12px !important;
    font-size: 12px !important;
    font-weight: 850 !important;
    transition:
      transform .25s ease,
      box-shadow .25s ease !important;
  }

  .premium-action:hover {
    transform: translateY(-2px);
  }

  .enrolled-action {
    width: 100%;
    min-height: 42px;
    border: 1px solid #a7f3d0;
    border-radius: 12px;
    color: #047857;
    background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
    font-size: 12px;
    font-weight: 900;
    cursor: default;
  }

  /* AI SECTION */

  .ai-section-card {
    padding: 25px !important;
    border-color: rgba(99,102,241,.20) !important;
    background:
      radial-gradient(circle at 100% 0%, rgba(124,58,237,.09), transparent 30%),
      linear-gradient(145deg, #ffffff, #f8faff) !important;
  }

  .ai-course-card {
    border-color: rgba(99,102,241,.20) !important;
    background:
      radial-gradient(circle at 100% 0%, rgba(99,102,241,.08), transparent 30%),
      linear-gradient(145deg, #ffffff, #f8faff) !important;
  }

  .ai-reason {
    margin: 12px 0 15px;
    padding: 11px 12px;
    border-left: 3px solid #6366f1;
    border-radius: 0 10px 10px 0;
    color: #475569;
    background: linear-gradient(90deg, rgba(99,102,241,.07), rgba(99,102,241,.025));
    font-size: 12px;
    line-height: 1.6;
    font-weight: 600;
  }

  .prerequisite-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 9px;
    margin-bottom: 10px;
    border-radius: 999px;
    color: #047857;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    font-size: 10px;
    font-weight: 850;
  }

  /* EMPTY / NO ASSESSMENT */

  .no-assessment-card {
    padding: 32px !important;
    text-align: center;
  }

  .no-assessment-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 17px;
    display: grid;
    place-items: center;
    border-radius: 22px;
    background: linear-gradient(135deg, #eff6ff, #eef2ff, #faf5ff);
    border: 1px solid rgba(99,102,241,.14);
    box-shadow:
      0 12px 30px rgba(79,70,229,.10),
      0 0 30px rgba(124,58,237,.08);
    font-size: 32px;
    animation: iconFloat 4s ease-in-out infinite;
  }

  .no-assessment-title {
    margin: 0;
    font-size: 23px;
    font-weight: 950;
    letter-spacing: -.035em;
    background: linear-gradient(90deg, #1d4ed8, #6366f1, #9333ea);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .no-assessment-text {
    max-width: 650px;
    margin: 9px auto 20px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.7;
    font-weight: 550;
  }

  .pending-score {
    width: 108px;
    height: 108px;
    margin: 0 auto;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background:
      conic-gradient(#c7d2fe 0 18%, #eef2ff 18% 100%);
    box-shadow: 0 0 35px rgba(99,102,241,.10);
  }

  .pending-score-inner {
    width: 82px;
    height: 82px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fff;
    color: #6366f1;
    font-size: 26px;
    font-weight: 950;
  }

  .status-mini {
    display: inline-flex;
    margin-top: 9px;
    padding: 5px 9px;
    border-radius: 999px;
    color: #6366f1;
    background: #eef2ff;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  /* ERROR */

  .recommendation-error {
    margin-bottom: 18px;
    padding: 12px 14px;
    border: 1px solid #fecaca;
    border-radius: 13px;
    color: #b91c1c;
    background: linear-gradient(135deg, #fff1f2, #fff);
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 7px 20px rgba(239,68,68,.05);
  }

  /* BUTTONS */

  .gradient-button {
    border: 0 !important;
    border-radius: 12px !important;
    background: linear-gradient(135deg, #2563eb, #4f46e5 55%, #7c3aed) !important;
    box-shadow:
      0 9px 22px rgba(79,70,229,.20),
      inset 0 1px 0 rgba(255,255,255,.22) !important;
    font-weight: 850 !important;
    transition:
      transform .25s ease,
      box-shadow .25s ease !important;
  }

  .gradient-button:hover {
    transform: translateY(-2px);
    box-shadow:
      0 13px 28px rgba(79,70,229,.26),
      0 0 22px rgba(99,102,241,.10) !important;
  }

  /* RESPONSIVE */

  @media (max-width: 1100px) {
    .roadmap-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .roadmap-arrow {
      display: none;
    }
  }

  @media (max-width: 850px) {
    .recommendations-page {
      padding: 20px 16px 55px;
    }

    .recommendation-hero {
      padding: 26px !important;
      border-radius: 24px !important;
    }

    .hero-content {
      grid-template-columns: 1fr;
    }

    .hero-score-wrap {
      justify-content: flex-start;
    }

    .course-grid,
    .ai-grid {
      grid-template-columns: 1fr;
    }

    .roadmap-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .recommendations-page {
      padding: 15px 11px 45px;
    }

    .recommendation-hero {
      padding: 21px !important;
      border-radius: 21px !important;
    }

    .hero-title {
      font-size: 31px;
    }

    .hero-description {
      font-size: 13px;
      line-height: 1.65;
    }

    .section-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 9px;
    }

    .section-title {
      font-size: 24px;
    }

    .profile-card,
    .roadmap-card,
    .ai-section-card {
      padding: 19px !important;
    }

    .roadmap-grid {
      grid-template-columns: 1fr;
    }

    .course-inner {
      padding: 18px;
    }

    .course-top {
      flex-direction: column;
    }

    .course-badges {
      justify-content: flex-start;
    }

    .course-title {
      font-size: 17px;
    }

    .course-metrics {
      grid-template-columns: 1fr;
    }

    .course-actions {
      flex-direction: column;
    }

    .readiness-ring {
      width: 116px;
      height: 116px;
    }

    .readiness-ring::before {
      width: 92px;
      height: 92px;
    }

    .readiness-number {
      font-size: 27px;
    }
  }

  @keyframes recommendationFloat {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(35px, -25px, 0);
    }
  }

  @keyframes recommendationFloatReverse {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(-35px, 25px, 0);
    }
  }

  @keyframes heroOrbit {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes heroShimmer {
    0%, 100% {
      transform: translateX(-100%);
      opacity: 0;
    }
    45% {
      transform: translateX(100%);
      opacity: .8;
    }
    55% {
      opacity: 0;
    }
  }

  @keyframes gradientText {
    0%, 100% {
      background-position: 0% center;
    }
    50% {
      background-position: 100% center;
    }
  }

  @keyframes readinessPulse {
    0%, 100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.08);
    }
  }

  @keyframes progressShimmer {
    0% {
      transform: translateX(-100%);
    }
    55%, 100% {
      transform: translateX(100%);
    }
  }

  @keyframes iconFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .recommendations-page *,
    .recommendations-page *::before,
    .recommendations-page *::after {
      animation: none !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default function RecommendationsPage() {
  const { user } = useAuth();

  const [recs, setRecs] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [learningPathway, setLearningPathway] = useState([]);
  const [gapData, setGapData] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [coursesCatalog, setCoursesCatalog] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError(null);

        let currentUserId = user?.id;

        if (!currentUserId) {
          try {
            const storedUser = JSON.parse(
              localStorage.getItem("edu_user") || "{}"
            );
            currentUserId = storedUser?.id;
          } catch (e) {
            currentUserId = null;
          }
        }

        const [
          recommendationResponse,
          enrollmentResponse,
          gapResponse,
          catalogResponse,
        ] = await Promise.all([
          getMyRecommendations(),
          getMyEnrollments().catch(() => []),
          currentUserId
            ? fetchGapReport(currentUserId).catch(() => null)
            : Promise.resolve(null),
          getCourses().catch(() => []),
        ]);

        if (!mounted) return;

        if (gapResponse) {
          setGapData(gapResponse);
        }

        const enrollmentList = Array.isArray(enrollmentResponse)
          ? enrollmentResponse
          : [];

        setUserEnrollments(enrollmentList);

        const ids = new Set(
          enrollmentList
            .map((item) => item?.course_id ?? item?.course?.id ?? item?.id)
            .filter(Boolean)
        );

        setEnrolledIds(ids);

        const catalogList = Array.isArray(catalogResponse)
          ? catalogResponse
          : Array.isArray(catalogResponse?.courses)
          ? catalogResponse.courses
          : [];

        setCoursesCatalog(catalogList);

        const recommendationList = Array.isArray(recommendationResponse)
          ? recommendationResponse
          : Array.isArray(recommendationResponse?.recommendations)
          ? recommendationResponse.recommendations
          : [];

        const aiItem = recommendationList.find(
          (item) =>
            item?.type === "ai_suggestions" ||
            item?.source === "ai"
        );

        if (aiItem) {
          setAiRecs(
            Array.isArray(aiItem?.suggestions)
              ? aiItem.suggestions
              : []
          );

          if (
            Array.isArray(aiItem?.learning_pathway) &&
            aiItem.learning_pathway.length > 0
          ) {
            setLearningPathway(aiItem.learning_pathway);
          }
        }

        setRecs(
          recommendationList.filter(
            (item) => item?.type !== "ai_suggestions"
          )
        );
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load recommendations."
          );
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const onEnroll = async (courseId) => {
    try {
      setBusyId(courseId);
      setError(null);

      await enrollCourse(courseId);

      setEnrolledIds((previous) => {
        const next = new Set(previous);
        next.add(courseId);
        return next;
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to enroll in this course."
      );
    } finally {
      setBusyId(null);
    }
  };

  const skillGapList = gapData?.recommendations?.skill_gap || [];

  const hasAssessment = Boolean(
    gapData && skillGapList.length > 0
  );

  let userDomainName = "AI Engineer";

  try {
    const stored = JSON.parse(
      localStorage.getItem("edu_user") || "{}"
    );

    if (stored?.domain_role_name) {
      userDomainName = stored.domain_role_name;
    }
  } catch (e) {
    userDomainName = "AI Engineer";
  }

  /*
   * ------------------------------------------------------------
   * NO ASSESSMENT
   * ------------------------------------------------------------
   */

  if (!hasAssessment) {
    return (
      <div className="recommendations-page">
        <style>{styles}</style>

        <div className="recommendations-inner">
          <Card className="recommendation-hero">
            <div className="hero-content">
              <div>
                <div className="hero-badge">
                  🚀 {userDomainName} Career Path
                </div>

                <h1 className="hero-title">
                  Personalized{" "}
                  <span className="hero-title-gradient">
                    AI Learning Recommendations
                  </span>
                </h1>

                <p className="hero-description">
                  Build a learning journey around your current skills,
                  identify important gaps, and discover courses that
                  match your career direction. Complete your initial
                  assessment to unlock your personalized roadmap.
                </p>

                <Link to="/app/assessments/initial">
                  <Button className="gradient-button">
                    Start Initial Assessment →
                  </Button>
                </Link>
              </div>

              <div className="hero-score-wrap">
                <div
                  className="readiness-ring"
                  style={{ "--score": "0%" }}
                >
                  <div className="readiness-content">
                    <span className="readiness-number">--</span>
                    <span className="readiness-label">
                      Not Assessed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="recommendation-section">
            <div className="course-grid">
              <Card className="premium-card no-assessment-card">
                <div className="no-assessment-icon">📈</div>

                <h2 className="no-assessment-title">
                  Skill Profile
                </h2>

                <span className="status-mini">
                  Pending Assessment
                </span>

                <p className="no-assessment-text">
                  Your skill scores will appear here after completing
                  the initial assessment.
                </p>

                <strong
                  style={{
                    display: "block",
                    color: "#94a3b8",
                    fontSize: "18px",
                    fontWeight: 900,
                  }}
                >
                  No Skill Scores Available
                </strong>
              </Card>

              <Card className="premium-card no-assessment-card">
                <div className="no-assessment-icon">🗺️</div>

                <h2 className="no-assessment-title">
                  Learning Roadmap
                </h2>

                <span className="status-mini">
                  Pending Assessment
                </span>

                <p className="no-assessment-text">
                  Your personalized learning sequence will be
                  generated from your assessment results.
                </p>

                <strong
                  style={{
                    display: "block",
                    color: "#94a3b8",
                    fontSize: "18px",
                    fontWeight: 900,
                  }}
                >
                  Roadmap Locked
                </strong>
              </Card>
            </div>
          </div>

          <div className="recommendation-section">
            <Card className="premium-card no-assessment-card">
              <div className="no-assessment-icon">🎯</div>

              <h2 className="no-assessment-title">
                Personalized Recommendations Awaiting Assessment
              </h2>

              <p className="no-assessment-text">
                Complete the initial assessment to unlock
                skill-based recommendations, readiness insights,
                learning priorities, and your personalized AI
                learning pathway.
              </p>

              <Link to="/app/assessments/initial">
                <Button className="gradient-button">
                  Take Initial Assessment →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * ASSESSMENT DATA
   * ------------------------------------------------------------
   */

  const readinessScore = Math.round(
    gapData?.readiness_score ?? 0
  );

  const colorPalette = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
  ];

  const dynamicSkills = skillGapList.map((skill, index) => {
    const maxLevel = skill?.required_level || 4;

    const pct = Math.min(
      100,
      Math.round(
        ((skill?.student_level || 0) / maxLevel) * 100
      )
    );

    return {
      name:
        skill?.skill_name ||
        skill?.name ||
        skill?.skill ||
        "Skill",
      score: pct,
      studentLevel: skill?.student_level || 0,
      requiredLevel: maxLevel,
      status: skill?.status,
      color: colorPalette[index % colorPalette.length],
    };
  });

  const strengths = [...dynamicSkills]
    .filter(
      (skill) =>
        skill.status === "Ready" || skill.score >= 60
    )
    .sort((a, b) => b.score - a.score);

  const strengthsList =
    strengths.length > 0
      ? strengths.slice(0, 2)
      : [...dynamicSkills]
          .sort((a, b) => b.score - a.score)
          .slice(0, 2);

  const improvements = [...dynamicSkills]
    .filter(
      (skill) =>
        skill.status === "Needs Improvement" ||
        skill.score < 60
    )
    .sort((a, b) => a.score - b.score);

  const improvementsList =
    improvements.length > 0
      ? improvements.slice(0, 2)
      : [...dynamicSkills]
          .sort((a, b) => a.score - b.score)
          .slice(0, 2);

  /*
   * ------------------------------------------------------------
   * ROADMAP
   * ------------------------------------------------------------
   */

  let pathway = [];

  if (learningPathway.length > 0) {
    pathway = learningPathway.map((item, index) => {
      if (typeof item === "string") {
        return {
          title: item,
          targetId: null,
          status: null,
        };
      }

      const title =
        item?.course_name ||
        item?.title ||
        item?.course_title ||
        item?.step ||
        "";

      const targetId =
        item?.course_id ||
        item?.id ||
        null;

      let resolvedTitle = title;

      if (!resolvedTitle) {
        const matchedCourse =
          coursesCatalog.find(
            (course) =>
              String(course?.id) === String(targetId)
          ) ||
          recs
            .map((recommendation) => recommendation?.course)
            .find(
              (course) =>
                String(course?.id) === String(targetId)
            ) ||
          aiRecs.find(
            (recommendation) =>
              String(
                recommendation?.course_id ||
                  recommendation?.id
              ) === String(targetId)
          );

        resolvedTitle =
          matchedCourse?.title ||
          matchedCourse?.course_name ||
          matchedCourse?.name ||
          "";
      }

      if (!resolvedTitle && item?.status === "COMPLETED") {
        const completedEnrollment = userEnrollments.find(
          (enrollment) =>
            String(
              enrollment?.course_id ||
                enrollment?.course?.id
            ) === String(targetId) &&
            String(
              enrollment?.status || ""
            ).toUpperCase() === "COMPLETED"
        );

        resolvedTitle =
          completedEnrollment?.course?.title ||
          completedEnrollment?.course?.course_name ||
          completedEnrollment?.course_title ||
          "";
      }

      return {
        title:
          resolvedTitle ||
          `Module ${index + 1}`,
        targetId,
        status: item?.status || null,
      };
    });
  } else if (skillGapList.length > 0) {
    pathway = skillGapList.map((skill) => ({
      title: `${
        skill?.skill_name ||
        skill?.name ||
        skill?.skill ||
        "Skill"
      } Mastery`,
      status: null,
      targetId: null,
    }));
  }

  return (
    <div className="recommendations-page">
      <style>{styles}</style>

      <div className="recommendations-inner">
        {/* HERO */}

        <Card className="recommendation-hero">
          <div className="hero-content">
            <div>
              <div className="hero-badge">
                🚀 {userDomainName} Career Path
              </div>

              <h1 className="hero-title">
                Personalized{" "}
                <span className="hero-title-gradient">
                  AI Learning Recommendations
                </span>
              </h1>

              <p className="hero-description">
                Your recommendations are built from your assessment
                results, current skill levels, learning gaps, and
                career pathway. Follow the roadmap to focus your
                learning where it matters most.
              </p>

              <div className="hero-pills">
                {strengthsList.map((skill) => (
                  <span
                    className="hero-pill"
                    key={`strength-${skill.name}`}
                  >
                    💪 Strong
                    <strong>{skill.name}</strong>
                    <span>({skill.score}%)</span>
                  </span>
                ))}

                {improvementsList.map((skill) => (
                  <span
                    className="hero-pill"
                    key={`improve-${skill.name}`}
                  >
                    🔥 Improve
                    <strong>{skill.name}</strong>
                    <span>({skill.score}%)</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-score-wrap">
              <div
                className="readiness-ring"
                style={{
                  "--score": `${Math.min(
                    100,
                    Math.max(0, readinessScore)
                  )}%`,
                }}
              >
                <div className="readiness-content">
                  <span className="readiness-number">
                    {readinessScore}%
                  </span>

                  <span className="readiness-label">
                    Readiness
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* SKILL PROFILE */}

        <section className="recommendation-section">
          <div className="section-heading">
            <div className="section-heading-left">
              <div className="section-eyebrow">
                Your Progress
              </div>

              <h2 className="section-title">
                📊 Skill Profile
              </h2>

              <p className="section-subtitle">
                A live view of your assessed skills and current
                proficiency levels.
              </p>
            </div>

            <span className="section-badge">
              ✦ {dynamicSkills.length > 0
                ? "Live Assessment Data"
                : "Initial Profile"}
            </span>
          </div>

          <Card className="premium-card profile-card">
            {dynamicSkills.map((skill) => (
              <div
                className="skill-row"
                key={skill.name}
              >
                <div className="skill-topline">
                  <span className="skill-name">
                    {skill.name}
                  </span>

                  <span className="skill-percentage">
                    {skill.score}%
                  </span>
                </div>

                <div className="skill-track">
                  <div
                    className="skill-progress"
                    style={{
                      width: `${skill.score}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* ROADMAP */}

        <section className="recommendation-section">
          <div className="section-heading">
            <div className="section-heading-left">
              <div className="section-eyebrow">
                Your Next Steps
              </div>

              <h2 className="section-title">
                🛣 Recommended Learning Roadmap
              </h2>

              <p className="section-subtitle">
                Follow the recommended sequence to progressively
                strengthen your career-ready skills.
              </p>
            </div>

            <span className="section-badge">
              {learningPathway.length > 0
                ? "✦ Dynamic AI Pathway"
                : "✦ Skill Gap Pathway"}
            </span>
          </div>

          <Card className="premium-card roadmap-card">
            {pathway.length > 0 ? (
              <div className="roadmap-grid">
                {pathway.map((step, index) => (
                  <div
                    className="roadmap-step"
                    key={`${step.title}-${index}`}
                  >
                    <div className="roadmap-number">
                      {index + 1}
                    </div>

                    <h3 className="roadmap-title">
                      {step.title}
                    </h3>

                    <span
                      className={`roadmap-status ${
                        String(step.status || "").toUpperCase() ===
                        "COMPLETED"
                          ? "completed"
                          : "recommended"
                      }`}
                    >
                      {String(
                        step.status || ""
                      ).toUpperCase() === "COMPLETED"
                        ? "✓ Completed"
                        : "✦ Recommended"}
                    </span>

                    {index < pathway.length - 1 && (
                      <span className="roadmap-arrow">
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-assessment-card">
                <div className="no-assessment-icon">
                  🗺️
                </div>

                <h3 className="no-assessment-title">
                  Your Roadmap Is Being Prepared
                </h3>

                <p className="no-assessment-text">
                  Your assessment data is available, but a detailed
                  learning pathway has not been generated yet.
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* RECOMMENDED COURSES */}

        <section className="recommendation-section">
          <div className="section-heading">
            <div className="section-heading-left">
              <div className="section-eyebrow">
                Personalized Learning
              </div>

              <h2 className="section-title">
                📚 Recommended Courses
              </h2>

              <p className="section-subtitle">
                Courses prioritized around your assessment results
                and current learning gaps.
              </p>
            </div>

            <span className="section-badge">
              ✦ AI Prioritized
            </span>
          </div>

          {error && (
            <div className="recommendation-error">
              ⚠️ {error}
            </div>
          )}

          {recs.length > 0 ? (
            <div className="course-grid">
              {recs.map((r, index) => {
                const course = r?.course;

                if (!course) return null;

                const courseId = course?.id;
                const enrolled = enrolledIds.has(courseId);

                const difficulty =
                  course?.difficulty ||
                  course?.level ||
                  "Intermediate";

                const duration =
                  course?.duration_hours ||
                  (String(difficulty).toLowerCase() ===
                  "advanced"
                    ? 12
                    : 6);

                const category =
                  course?.category ||
                  course?.domain ||
                  "Technology";

                const rating =
                  course?.rating || 4.8;

                return (
                  <Card
                    className="course-card"
                    key={
                      courseId ||
                      `${course?.title || "course"}-${index}`
                    }
                  >
                    <div className="course-inner">
                      <div className="course-top">
                        <div className="course-icon">
                          {iconFor(course?.title)}
                        </div>

                        <div className="course-badges">
                          <span className="course-badge difficulty">
                            {difficulty}
                          </span>

                          <span className="course-badge ai">
                            ⭐ AI Recommended
                          </span>

                          {(r?.priority === "high" ||
                            r?.high_priority ||
                            r?.is_high_priority) && (
                            <span className="course-badge priority">
                              🎯 High Priority
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="course-title">
                        {course?.title ||
                          course?.course_name ||
                          "Recommended Course"}
                      </h3>

                      <p className="course-reason">
                        {r?.reason ||
                          r?.recommendation_reason ||
                          "Recommended based on your current assessment and learning profile."}
                      </p>

                      <div className="course-metrics">
                        <div className="course-metric">
                          <span className="course-metric-label">
                            Duration
                          </span>

                          <span className="course-metric-value">
                            {duration} Hours
                          </span>
                        </div>

                        <div className="course-metric">
                          <span className="course-metric-label">
                            Category
                          </span>

                          <span className="course-metric-value">
                            {category}
                          </span>
                        </div>

                        <div className="course-metric">
                          <span className="course-metric-label">
                            Rating
                          </span>

                          <span className="course-metric-value">
                            ⭐ {rating}
                          </span>
                        </div>
                      </div>

                      <div className="course-actions">
                        {enrolled ? (
                          <button
                            type="button"
                            className="enrolled-action"
                            disabled
                          >
                            ✓ Enrolled
                          </button>
                        ) : (
                          <Button
                            className="gradient-button premium-action"
                            onClick={() =>
                              onEnroll(courseId)
                            }
                            disabled={
                              busyId === courseId
                            }
                          >
                            {busyId === courseId
                              ? "Enrolling..."
                              : "Enroll Now →"}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="premium-action"
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </section>

        {/* AI SUGGESTIONS */}

        {aiRecs.length > 0 && (
          <section className="recommendation-section">
            <div className="section-heading">
              <div className="section-heading-left">
                <div className="section-eyebrow">
                  Intelligent Discovery
                </div>

                <h2 className="section-title">
                  🤖 AI Personalized Course Suggestions
                </h2>

                <p className="section-subtitle">
                  Recommendations generated using hybrid
                  collaborative filtering &amp; content vectors.
                </p>
              </div>

              <span className="section-badge">
                ✦ AI Engine
              </span>
            </div>

            <Card className="premium-card ai-section-card">
              <div className="ai-grid">
                {aiRecs.map((item, index) => {
                  const title =
                    item?.course_name ||
                    item?.title ||
                    item?.course_title ||
                    "AI Recommended Course";

                  const confidence =
                    item?.confidence ??
                    item?.score ??
                    null;

                  return (
                    <Card
                      className="ai-course-card"
                      key={`${title}-${index}`}
                    >
                      <div className="course-inner">
                        <div className="course-top">
                          <div className="course-icon">
                            {iconFor(title)}
                          </div>

                          <div className="course-badges">
                            {confidence !== null && (
                              <span className="course-badge confidence">
                                ✦{" "}
                                {typeof confidence ===
                                "number"
                                  ? `${Math.round(
                                      confidence > 1
                                        ? confidence
                                        : confidence * 100
                                    )}% Match`
                                  : confidence}
                              </span>
                            )}

                            <span className="course-badge ai">
                              🤖 AI Pick
                            </span>
                          </div>
                        </div>

                        <h3 className="course-title">
                          {title}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 7,
                            marginTop: 10,
                          }}
                        >
                          {item?.difficulty && (
                            <span className="course-badge difficulty">
                              {item.difficulty}
                            </span>
                          )}

                          {item?.category && (
                            <span className="course-badge difficulty">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {item?.prerequisite_completed && (
                          <div
                            className="prerequisite-badge"
                            style={{ marginTop: 12 }}
                          >
                            ✓ Prerequisite Completed
                          </div>
                        )}

                        {item?.recommendation_reason && (
                          <div className="ai-reason">
                            {item.recommendation_reason}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          className="premium-action"
                        >
                          View Details →
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </section>
        )}

        {/* EMPTY RECOMMENDATIONS */}

        {recs.length === 0 && aiRecs.length === 0 && (
          <section className="recommendation-section">
            <Card className="premium-card no-assessment-card">
              <div className="no-assessment-icon">
                🤖
              </div>

              <h2 className="no-assessment-title">
                Generating AI Recommendations...
              </h2>

              <p className="no-assessment-text">
                Your assessment has been processed. Personalized
                course recommendations are being prepared from your
                skill profile and learning pathway.
              </p>

              <span className="status-mini">
                AI Recommendation Engine
              </span>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}