import React from 'react';

export function SkillBar({ name, level, value, color = '#2563eb' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0">
        <div className="text-sm font-medium text-slate-800">{name}</div>
        {level && <div className="text-xs text-slate-500">{level}</div>}
      </div>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-10 text-right text-xs font-semibold text-slate-600">
        {value}%
      </div>
    </div>
  );
}
