'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertOctagon, Filter, ArrowRight, Shield, CheckCircle2, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FindingRecord, Severity, FindingLifecycleStatus } from '@/types';

export default function FindingsPage() {
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFindings() {
      try {
        const res = await fetch('/api/v1/findings');
        const data = await res.json();
        if (data.success) {
          setFindings(data.data);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    }
    fetchFindings();
  }, []);

  const filtered = findings.filter((f) => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertOctagon className="h-6 w-6 text-rose-500" />
            Vulnerability Findings
          </h1>
          <p className="text-xs sm:text-sm text-defyra-textMuted mt-1 font-mono">
            Security finding lifecycle, human review gates, remediation tracking, and cryptographic retests.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-defyra-surface border border-defyra-border rounded-lg text-xs font-mono px-3 py-2 text-slate-300"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-defyra-surface border border-defyra-border rounded-lg text-xs font-mono px-3 py-2 text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="REMEDIATION_REQUIRED">Remediation Required</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      {isLoading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading vulnerability findings...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-defyra-border bg-defyra-card/50 p-12 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-white">No Vulnerability Findings Match Criteria</h3>
          <p className="text-xs text-defyra-textMuted max-w-md mx-auto">
            All executed test assertions passed or findings have been filtered out.
          </p>
        </Card>
      ) : (
        <Card className="border-defyra-border bg-defyra-card/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-defyra-border bg-defyra-surface/40 text-defyra-textMuted uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Finding ID</th>
                  <th className="px-4 py-3">Title & Test</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Recorded At</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-defyra-border/40">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-defyra-surface/30 transition-colors">
                    <td className="px-4 py-3.5 text-defyra-cyan font-bold">{f.id}</td>
                    <td className="px-4 py-3.5">
                      <span className="block text-white font-semibold">{f.title}</span>
                      <span className="text-[10px] text-slate-400">{f.testId}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          f.severity === 'CRITICAL' || f.severity === 'HIGH'
                            ? 'rose'
                            : f.severity === 'MEDIUM'
                            ? 'amber'
                            : 'default'
                        }
                      >
                        {f.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-rose-400 font-bold">{f.riskScore}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          f.status === 'RESOLVED'
                            ? 'emerald'
                            : f.status === 'CONFIRMED' || f.status === 'REMEDIATION_REQUIRED'
                            ? 'rose'
                            : f.status === 'CANDIDATE'
                            ? 'amber'
                            : 'default'
                        }
                      >
                        {f.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/dashboard/findings/${f.id}`}
                        className="inline-flex items-center gap-1 text-xs text-defyra-cyan hover:underline"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
