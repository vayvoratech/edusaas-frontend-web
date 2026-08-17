import React from 'react';

export function Gauge({ value, size = 160, label = 'Readiness' }) {
  const clamped = Math.max(0, Math.min(100, value));
  const width = size;
  const height = size / 2 + 20;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const stroke = 14;

  const startAngle = Math.PI;
  const endAngle = 0;
  const valueAngle = startAngle - (clamped / 100) * Math.PI;

  const polar = (angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle) * -1];

  const arc = (a1, a2, color) => {
    const [x1, y1] = polar(a1);
    const [x2, y2] = polar(a2);
    const largeArc = Math.abs(a1 - a2) > Math.PI ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  const segRed = arc(startAngle, startAngle - Math.PI / 3, '#ef4444');
  const segOrange = arc(
    startAngle - Math.PI / 3,
    startAngle - (2 * Math.PI) / 3,
    '#f97316'
  );
  const segGreen = arc(
    startAngle - (2 * Math.PI) / 3,
    endAngle,
    '#10b981'
  );

  const [nx, ny] = polar(valueAngle);

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={width} height={height}>
        {segRed}
        {segOrange}
        {segGreen}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        <circle cx={cx} cy={cy} r="5" fill="#0f172a" />
      </svg>
      <div className="-mt-2 text-center">
        <div className="text-2xl font-bold text-slate-900">{clamped}%</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
