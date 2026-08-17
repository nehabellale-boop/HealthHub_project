import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase().trim();
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-400';

  switch (normalized) {
    case 'CONFIRMED':
    case 'ACTIVE':
    case 'PAID':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/70';
      dotColor = 'bg-emerald-500';
      break;
    case 'COMPLETED':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200/70';
      dotColor = 'bg-sky-500';
      break;
    case 'PENDING':
    case 'PARTIALLY_PAID':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/70';
      dotColor = 'bg-amber-500';
      break;
    case 'CANCELLED':
    case 'UNPAID':
    case 'RESIGNED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/70';
      dotColor = 'bg-rose-500';
      break;
    case 'ON_LEAVE':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200/70';
      dotColor = 'bg-purple-500';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200/80';
      dotColor = 'bg-slate-400';
  }

  const label = normalized.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${colorClasses} tracking-tight whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
};
