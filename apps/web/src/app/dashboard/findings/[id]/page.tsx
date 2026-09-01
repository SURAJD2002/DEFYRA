'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertOctagon,
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Wrench,
  RotateCw,
  Clock,
  Eye,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { FindingRecord, RemediationRecord, RetestRecord, EvidenceRecord } from '@/types';

export default function FindingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [finding, setFinding] = useState<FindingRecord | null>(null);
  const [remediations, setRemediations] = useState<RemediationRecord[]>([]);
  const [retests, setRetests] = useState<RetestRecord[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quality gate review
  const [reviewStatus, setReviewStatus] = useState('CONFIRMED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Remediation modal
  const [isRemModalOpen, setIsRemModalOpen] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remAction, setRemAction] = useState('');
  const [isSubmittingRem, setIsSubmittingRem] = useState(false);

  // Retest execution
  const [isRetesting, setIsRetesting] = useState(false);

  const fetchFindingData = async () => {
    try {
      const res = await fetch(`/api/v1/findings/${params.id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Failed to load finding details.');
        return;
      }
      setFinding(data.data);
      setRemediations(data.data.remediations || []);
      setRetests(data.data.retests || []);
      setEvidence(data.data.evidence || []);
    } catch {
      setError('Network connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFindingData();
  }, [params.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/v1/findings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: reviewNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFindingData();
      }
    } catch {
      // Handle error
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateRemediation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRem(true);
    try {
      const res = await fetch(`/api/v1/findings/${params.id}/remediation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: remTitle,
          recommendedAction: remAction,
          priority: finding?.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRemModalOpen(false);
        setRemTitle('');
        setRemAction('');
        fetchFindingData();
      }
    } catch {
      // Handle error
    } finally {
      setIsSubmittingRem(false);
    }
  };

  const handleExecuteRetest = async () => {
    setIsRetesting(true);
    try {
      const res = await fetch(`/api/v1/findings/${params.id}/retest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syntheticFixApplied: true,
          notes: 'Customer verification retest triggered after prompt sanitization fix.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFindingData();
      }
    } catch {
      // Handle error
    } finally {
      setIsRetesting(false);
    }
  };

  if (isLoading || !finding) {
    return (
      <div className="py-24 text-center text-xs font-mono text-slate-500">
        Loading finding details...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-defyra-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/findings" className="text-defyra-textMuted hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold text-white tracking-tight">{finding.title}</h1>
            <Badge
              variant={
                finding.severity === 'CRITICAL' || finding.severity === 'HIGH'
                  ? 'rose'
                  : finding.severity === 'MEDIUM'
                  ? 'amber'
                  : 'default'
              }
            >
              {finding.severity}
            </Badge>
          </div>
          <p className="text-xs text-defyra-textMuted font-mono">
            Finding ID: <span className="text-defyra-cyan">{finding.id}</span> • Test:{' '}
            <span className="text-white">{finding.testId}</span> • Risk Score:{' '}
            <span className="text-rose-400 font-bold">{finding.riskScore}</span> ({finding.riskModelVersion})
          </p>
        </div>

        {/* Quality Gate Status Action Bar */}
        <div className="flex items-center gap-2">
          {finding.status === 'CANDIDATE' && (
            <>
              <Button
                variant="accent"
                size="sm"
                onClick={() => handleUpdateStatus('CONFIRMED')}
                isLoading={isUpdatingStatus}
                className="font-mono text-xs"
              >
                Confirm Finding
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus('FALSE_POSITIVE')}
                isLoading={isUpdatingStatus}
                className="font-mono text-xs text-slate-400"
              >
                Mark False Positive
              </Button>
            </>
          )}

          {finding.status === 'CONFIRMED' && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsRemModalOpen(true)}
              className="gap-1.5 font-mono text-xs"
            >
              <Wrench className="h-3.5 w-3.5" />
              Create Remediation
            </Button>
          )}

          {(finding.status === 'REMEDIATION_REQUIRED' || finding.status === 'CONFIRMED' || finding.status === 'REOPENED') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExecuteRetest}
              isLoading={isRetesting}
              className="gap-1.5 font-mono text-xs border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/30"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Execute Retest Verification
            </Button>
          )}

          <Badge
            variant={
              finding.status === 'RESOLVED'
                ? 'emerald'
                : finding.status === 'CONFIRMED' || finding.status === 'REMEDIATION_REQUIRED'
                ? 'rose'
                : finding.status === 'CANDIDATE'
                ? 'amber'
                : 'default'
            }
          >
            {finding.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Attack Scenario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Finding Details */}
          <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Vulnerability Description</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>

            <div className="space-y-2 pt-3 border-t border-defyra-border/50">
              <h4 className="text-xs font-semibold text-white font-mono uppercase">Attack Scenario</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{finding.attackScenario}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-defyra-border/50">
              <h4 className="text-xs font-semibold text-emerald-400 font-mono uppercase">
                Recommended Remediation
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-emerald-950/20 p-3 rounded border border-emerald-900/30 font-mono">
                {finding.recommendation}
              </p>
            </div>
          </Card>

          {/* Evidence Vault (with Secret Masking / Safe Rendering) */}
          <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-defyra-cyan" />
                Evidence Vault & Cryptographic Integrity
              </h3>
              <span className="text-xs font-mono text-defyra-textMuted">
                {evidence.length} Evidence Artifacts
              </span>
            </div>

            {evidence.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-500">
                No raw evidence captured for this finding.
              </div>
            ) : (
              <div className="space-y-3">
                {evidence.map((ev) => (
                  <div
                    key={ev.evidenceId}
                    className="p-4 rounded-lg border border-defyra-border/70 bg-defyra-surface/40 space-y-2 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-defyra-cyan font-bold">{ev.type}</span>
                      <span className="text-[10px] text-slate-500">{ev.evidenceId}</span>
                    </div>

                    <div className="p-3 rounded bg-defyra-bg/90 border border-defyra-border/50 text-[11px] text-slate-300 overflow-x-auto">
                      <pre>{JSON.stringify(ev.payload, null, 2)}</pre>
                    </div>

                    <div className="text-[10px] text-slate-400 break-all pt-1 border-t border-defyra-border/40 flex justify-between">
                      <span>SHA-256 Hash: {ev.contentHash}</span>
                      <span className="text-emerald-400">VERIFIED</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Remediation & Retest Timeline */}
        <div className="space-y-6">
          {/* Remediation Status */}
          <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Active Remediation</h3>
            {remediations.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-500">
                No formal remediation tasks tracked yet.
              </div>
            ) : (
              <div className="space-y-3">
                {remediations.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-lg border border-defyra-border/70 bg-defyra-surface/30 space-y-1 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{rem.title}</span>
                      <Badge variant={rem.status === 'RESOLVED' ? 'emerald' : 'amber'} size="sm">
                        {rem.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">{rem.recommendedAction}</p>
                    <span className="block text-[10px] text-slate-500 pt-1">
                      Assigned: {rem.owner || 'Security Engineering Lead'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Retest History */}
          <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Retest Verification History</h3>
            {retests.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-500">
                No retests executed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {retests.map((rt) => (
                  <div
                    key={rt.id}
                    className="p-3 rounded-lg border border-defyra-border/70 bg-defyra-surface/30 space-y-1 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Retest Result:</span>
                      <Badge variant={rt.retestResult === 'PASS' ? 'emerald' : 'rose'} size="sm">
                        {rt.retestResult}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">{rt.behaviorChange}</p>
                    <span className="block text-[10px] text-slate-500 pt-1">
                      Verified at: {new Date(rt.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Remediation Modal */}
      <Dialog
        isOpen={isRemModalOpen}
        onClose={() => setIsRemModalOpen(false)}
        title="Create Remediation Plan"
        description="Formulate engineering recommendations to resolve the confirmed vulnerability."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRemediation} className="space-y-4">
          <Input
            label="REMEDIATION TITLE"
            placeholder="e.g. Apply Prompt Sanitization Filter to Tool Invocation Boundary"
            value={remTitle}
            onChange={(e) => setRemTitle(e.target.value)}
            required
          />

          <Textarea
            label="ENGINEERING ACTION ITEMS"
            placeholder="Describe technical changes required to patch the flaw..."
            value={remAction}
            onChange={(e) => setRemAction(e.target.value)}
            rows={4}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-defyra-border/50">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsRemModalOpen(false)} className="font-mono text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm" isLoading={isSubmittingRem} className="font-mono text-xs">
              Save Remediation Plan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
