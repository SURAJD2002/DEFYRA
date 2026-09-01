import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Strip HTML angle brackets
    .trim();
}

export function formatTimestamp(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

export function calculateRiskScore(severity: string, exploitability = 0.8, blastRadius = 0.8): number {
  const baseMap: Record<string, number> = {
    CRITICAL: 9.5,
    HIGH: 7.8,
    MEDIUM: 5.2,
    LOW: 2.8,
    INFORMATIONAL: 0.5,
  };
  const base = baseMap[severity] || 5.0;
  const score = base * 0.6 + exploitability * 2.0 + blastRadius * 2.0;
  return Math.min(10.0, Math.max(0.1, parseFloat(score.toFixed(1))));
}
