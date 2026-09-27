import React from 'react';

export function Card({ children, className = '', title, action, ...rest }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300/80 ${className}`}
      {...rest}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatPill({ label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-brand-blue-100 text-brand-blue-700',
    green: 'bg-brand-green-100 text-brand-green-600',
    orange: 'bg-brand-orange-100 text-brand-orange-600',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>
      {label && <span className="opacity-80">{label}</span>}
      <span>{value}</span>
    </span>
  );
}
