import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = ShieldAlert,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-defyra-border bg-defyra-surface/40',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-defyra-surface border border-defyra-borderHighlight text-defyra-cyan mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-white mb-1.5">{title}</h4>
      <p className="text-sm text-defyra-textMuted max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
