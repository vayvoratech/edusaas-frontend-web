import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  const variants = {
    primary:
      'bg-brand-blue-500 hover:bg-brand-blue-600 text-white shadow-sm focus:ring-brand-blue-500',
    success:
      'bg-brand-green-500 hover:bg-brand-green-600 text-white shadow-sm focus:ring-brand-green-500',
    accent:
      'bg-brand-orange-500 hover:bg-brand-orange-600 text-white shadow-sm focus:ring-brand-orange-500',
    outline:
      'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-300',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-200',
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
