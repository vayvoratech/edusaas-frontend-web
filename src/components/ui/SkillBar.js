import React from 'react';

export function SkillBar({
  name,
  level,
  value,
  color = '#2563eb',
}) {
  const clampedValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  return (
    <div
      className="
        group
        flex
        items-center
        gap-3
        w-full
        p-2
        -m-2
        rounded-2xl
        transition-all
        duration-300
        hover:bg-slate-50/80
        dark:hover:bg-slate-900/60
      "
    >
      {/* =====================================================
          SKILL NAME
      ===================================================== */}
      <div className="w-32 sm:w-36 shrink-0 min-w-0">

        <div
          className="
            text-sm
            font-bold
            text-slate-800
            dark:text-slate-100
            truncate
            transition-colors
            duration-200
            group-hover:text-blue-600
            dark:group-hover:text-blue-400
          "
        >
          {name}
        </div>

        {level && (
          <div
            className="
              mt-0.5
              text-[10px]
              font-semibold
              text-slate-400
              dark:text-slate-500
              truncate
              uppercase
              tracking-wide
            "
          >
            {level}
          </div>
        )}

      </div>

      {/* =====================================================
          PROGRESS BAR
      ===================================================== */}
      <div
        className="
          relative
          flex-1
          h-3
          rounded-full
          bg-slate-100
          dark:bg-slate-800
          overflow-hidden
          border
          border-slate-200/60
          dark:border-slate-700/50
          shadow-inner
        "
      >

        {/* Soft background glow */}
        <div
          className="
            absolute
            inset-y-0
            left-0
            rounded-full
            blur-md
            opacity-20
            transition-all
            duration-700
          "
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color,
          }}
        />

        {/* Main progress */}
        <div
          className="
            relative
            h-full
            rounded-full
            transition-all
            duration-700
            ease-out
            overflow-hidden
          "
          style={{
            width: `${clampedValue}%`,
            background: `linear-gradient(
              90deg,
              ${color},
              ${color}dd,
              #06b6d4
            )`,
            boxShadow: `0 2px 10px ${color}40`,
          }}
        >

          {/* Shine */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-transparent
              via-white/30
              to-transparent
              -translate-x-full
              group-hover:translate-x-full
              transition-transform
              duration-1000
            "
          />

          {/* Highlight */}
          <div
            className="
              absolute
              top-0.5
              left-1
              right-1
              h-[2px]
              rounded-full
              bg-white/25
            "
          />

        </div>

      </div>

      {/* =====================================================
          VALUE
      ===================================================== */}
      <div
        className="
          w-11
          shrink-0
          text-right
          text-xs
          font-extrabold
          text-slate-600
          dark:text-slate-300
          transition-all
          duration-200
          group-hover:text-blue-600
          dark:group-hover:text-blue-400
        "
      >
        {clampedValue}%
      </div>

    </div>
  );
}