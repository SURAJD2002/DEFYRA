import React from 'react';
import { TestRunStatus, FindingStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: TestRunStatus | FindingStatus;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const styles: Record<string, { bg: string; text: string; dot: string; pulse?: boolean }> = {
    QUEUED: { bg: 'bg-slate-900/60', text: 'text-slate-400', dot: 'bg-slate-400' },
    RUNNING: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', dot: 'bg-cyan-400', pulse: true },
    COMPLETED: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    FAILED: { bg: 'bg-rose-950/40', text: 'text-rose-400', dot: 'bg-rose-400' },
    CANCELLED: { bg: 'bg-amber-950/40', text: 'text-amber-400', dot: 'bg-amber-400' },
    Open: { bg: 'bg-rose-950/40', text: 'text-rose-400', dot: 'bg-rose-400' },
    Acknowledged: { bg: 'bg-amber-950/40', text: 'text-amber-400', dot: 'bg-amber-400' },
    Remediating: { bg: 'bg-blue-950/40', text: 'text-blue-400', dot: 'bg-blue-400', pulse: true },
    'Ready for Retest': { bg: 'bg-cyan-950/40', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    Resolved: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    'Accepted Risk': { bg: 'bg-slate-900/60', text: 'text-slate-400', dot: 'bg-slate-400' },
  };

  const current = styles[status] || { bg: 'bg-slate-900', text: 'text-slate-400', dot: 'bg-slate-400' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-medium border border-defyra-border',
        current.bg,
        current.text,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          current.dot,
          current.pulse && 'animate-ping'
        )}
      />
      {status}
    </span>
  );
}
