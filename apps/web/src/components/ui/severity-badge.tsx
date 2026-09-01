import React from 'react';
import { Severity } from '@/types';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const styles: Record<Severity, { bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      border: 'border-rose-800/60',
      dot: 'bg-rose-500 shadow-rose-500/50',
    },
    HIGH: {
      bg: 'bg-orange-950/40',
      text: 'text-orange-400',
      border: 'border-orange-800/60',
      dot: 'bg-orange-500 shadow-orange-500/50',
    },
    MEDIUM: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-800/60',
      dot: 'bg-amber-500 shadow-amber-500/50',
    },
    LOW: {
      bg: 'bg-blue-950/40',
      text: 'text-blue-400',
      border: 'border-blue-800/60',
      dot: 'bg-blue-500 shadow-blue-500/50',
    },
    INFORMATIONAL: {
      bg: 'bg-slate-900/60',
      text: 'text-slate-400',
      border: 'border-slate-800',
      dot: 'bg-slate-500 shadow-slate-500/50',
    },
  };

  const current = styles[severity] || styles.INFORMATIONAL;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold tracking-wider uppercase border',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shadow-sm', current.dot)} />
      {severity}
    </span>
  );
}
