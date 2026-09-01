import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded-full border tracking-wide uppercase';

  const variants = {
    default: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
    cyan: 'bg-cyan-950/40 text-cyan-300 border-cyan-700/50 shadow-sm shadow-cyan-950/30',
    purple: 'bg-indigo-950/40 text-indigo-300 border-indigo-700/50 shadow-sm shadow-indigo-950/30',
    emerald: 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50',
    amber: 'bg-amber-950/40 text-amber-300 border-amber-700/50',
    rose: 'bg-rose-950/40 text-rose-300 border-rose-700/50',
    slate: 'bg-slate-900/80 text-slate-400 border-slate-800',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
