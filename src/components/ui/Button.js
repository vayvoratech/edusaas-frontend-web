import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}) {
  const base =
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-medium transition-all duration-300 ease-out active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variants = {
    primary:
      'bg-brand-blue-500 hover:bg-brand-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(59,130,246,0.25)] focus:ring-brand-blue-500/30',

    success:
      'bg-brand-green-500 hover:bg-brand-green-600 text-white shadow-[0_4px_12px_rgba(34,197,94,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(34,197,94,0.25)] focus:ring-brand-green-500/30',

    accent:
      'bg-brand-orange-500 hover:bg-brand-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(249,115,22,0.25)] focus:ring-brand-orange-500/30',

    outline:
      'border border-slate-300 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-brand-blue-300 hover:bg-brand-blue-50/40 hover:text-brand-blue-700 hover:shadow-md focus:ring-brand-blue-500/20',

    ghost:
      'text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm focus:ring-slate-300/50',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {/* Subtle shine animation */}
      <span
        className="
          pointer-events-none
          absolute
          inset-0
          -translate-x-full
          bg-gradient-to-r
          from-transparent
          via-white/15
          to-transparent
          transition-transform
          duration-700
          group-hover:translate-x-full
        "
      />

      <span className="relative z-10 flex items-center justify-center gap-2 transition-transform duration-200 group-hover:scale-[1.01]">
        {children}
      </span>
    </button>
  );
}