import React from 'react';

export function ProgressRing({ value, size = 96, stroke = 10, label, sublabel }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70 ? '#10b981' : clamped >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          fontSize={size * 0.22}
          fontWeight="700"
          fill="#0f172a"
        >
          {clamped}%
        </text>
      </svg>
      {(label || sublabel) && (
        <div className="text-center mt-2">
          {label && <div className="text-xs font-medium text-slate-600">{label}</div>}
          {sublabel && <div className="text-[10px] text-slate-400">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}
