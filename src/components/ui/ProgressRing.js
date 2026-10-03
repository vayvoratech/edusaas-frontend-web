import React from 'react';

export function ProgressRing({
  value,
  size = 96,
  stroke = 10,
  label,
  sublabel
}) {
  const clamped = Math.max(
    0,
    Math.min(100, value)
  );

  const radius = (size - stroke) / 2;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (clamped / 100) * circumference;

  const color =
    clamped >= 70
      ? '#10b981'
      : clamped >= 40
      ? '#f97316'
      : '#ef4444';

  const gradientId = `progressGradient-${size}-${stroke}-${Math.round(
    clamped
  )}`;

  const glowId = `progressGlow-${size}-${stroke}-${Math.round(
    clamped
  )}`;

  return (
    <div className="inline-flex flex-col items-center">

      {/* =====================================================
          RING
      ===================================================== */}
      <div
        className="
          relative
          flex
          items-center
          justify-center
          rounded-full
          transition-all
          duration-500
        "
        style={{
          width: size,
          height: size,
        }}
      >

        {/* Outer glow */}
        <div
          className="
            pointer-events-none
            absolute
            inset-[10%]
            rounded-full
            blur-xl
            opacity-25
            transition-all
            duration-500
          "
          style={{
            backgroundColor: color,
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="
            relative
            -rotate-90
            overflow-visible
          "
        >

          <defs>

            {/* Gradient */}
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={color}
              />

              <stop
                offset="55%"
                stopColor={
                  clamped >= 70
                    ? '#14b8a6'
                    : clamped >= 40
                    ? '#fb923c'
                    : '#f43f5e'
                }
              />

              <stop
                offset="100%"
                stopColor={
                  clamped >= 70
                    ? '#06b6d4'
                    : clamped >= 40
                    ? '#f59e0b'
                    : '#dc2626'
                }
              />
            </linearGradient>

            {/* Glow filter */}
            <filter
              id={glowId}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                stdDeviation="2.5"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

          </defs>

          {/* =================================================
              Background Track
          ================================================= */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="
              text-slate-100
              dark:text-slate-800
            "
          />

          {/* =================================================
              Inner Track
          ================================================= */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={Math.max(
              1,
              stroke * 0.22
            )}
            fill="none"
            className="
              text-slate-200/60
              dark:text-slate-700/60
            "
          />

          {/* =================================================
              Progress
          ================================================= */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter={`url(#${glowId})`}
            style={{
              transition:
                'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* =================================================
              Highlight
          ================================================= */}
          {clamped > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="white"
              strokeWidth={Math.max(
                1,
                stroke * 0.12
              )}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={
                offset + stroke * 0.25
              }
              strokeLinecap="round"
              opacity="0.22"
              pointerEvents="none"
              style={{
                transition:
                  'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          )}

          {/* =================================================
              Center Percentage
          ================================================= */}
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            transform={`rotate(90 ${size / 2} ${
              size / 2
            })`}
            fontSize={size * 0.22}
            fontWeight="800"
            fill="currentColor"
            className="
              text-slate-900
              dark:text-white
            "
          >
            {clamped}%
          </text>

        </svg>

        {/* Small center glow */}
        <div
          className="
            pointer-events-none
            absolute
            w-[18%]
            h-[18%]
            rounded-full
            blur-md
            opacity-10
          "
          style={{
            backgroundColor: color,
          }}
        />

      </div>

      {/* =====================================================
          LABEL
      ===================================================== */}
      {(label || sublabel) && (
        <div className="text-center mt-3">

          {label && (
            <div
              className="
                text-xs
                font-bold
                tracking-tight
                text-slate-700
                dark:text-slate-200
              "
            >
              {label}
            </div>
          )}

          {sublabel && (
            <div
              className="
                mt-0.5
                text-[10px]
                font-medium
                text-slate-400
                dark:text-slate-500
              "
            >
              {sublabel}
            </div>
          )}

        </div>
      )}

    </div>
  );
}