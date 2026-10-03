import React from 'react';

export function Card({
  children,
  className = '',
  title,
  action,
  ...rest
}) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-white
        rounded-2xl
        border border-slate-200/80
        p-5
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        transition-all
	duration-300
	ease-out

	focus-within:ring-2
	focus-within:ring-brand-blue-500/20

        ${className}
      `}
      {...rest}
    >
      {/* Subtle animated highlight */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-brand-blue-400/50
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      {(title || action) && (
        <div className="relative flex items-center justify-between gap-4 mb-4">
          {title && (
            <h3
              className="
                text-base
                font-semibold
                text-slate-900
                transition-colors
                duration-300
                group-hover:text-brand-blue-700
              "
            >
              {title}
            </h3>
          )}

          {action && (
            <div
              className="
                shrink-0
                transition-transform
                duration-300
                group-hover:translate-x-0.5
              "
            >
              {action}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        {children}
      </div>
    </div>
  );
}

export function StatPill({
  label,
  value,
  tone = 'blue',
}) {
  const tones = {
    blue:
      'bg-brand-blue-100 text-brand-blue-700 ring-brand-blue-200/50',
    green:
      'bg-brand-green-100 text-brand-green-600 ring-brand-green-200/50',
    orange:
      'bg-brand-orange-100 text-brand-orange-600 ring-brand-orange-200/50',
    slate:
      'bg-slate-100 text-slate-700 ring-slate-200',
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1
        px-2.5
        py-1
        rounded-full
        text-xs
        font-medium
        ring-1
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-sm
        ${tones[tone] || tones.blue}
      `}
    >
      {label && (
        <span className="opacity-80">
          {label}
        </span>
      )}

      <span className="font-semibold">
        {value}
      </span>
    </span>
  );
}