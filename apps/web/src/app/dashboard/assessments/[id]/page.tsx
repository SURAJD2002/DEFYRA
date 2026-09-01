'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Play,
  FileCheck2,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Assessment, FindingRecord, SecurityReport } from '@/types';

export default function AssessmentWorkspacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [activeTab, setActiveTab] = useState<'scope' | 'testplan' | 'findings' | 'report'>('scope');
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessmentData = async () => {
    try {
      const [asmRes, findRes, repRes] = await Promise.all([
        fetch(`/api/v1/assessments/${params.id}`),
        fetch(`/api/v1/assessments/${params.id}/findings`),
        fetch(`/api/v1/assessments/${params.id}/report`),
      ]);

      const asmData = await asmRes.json();
      if (asmData.success) {
        setAssessment(asmData.data);
      }

      const findData = await findRes.json();
      if (findData.success) {
        setFindings(findData.data);
      }

      const repData = await repRes.json();
      if (repData.success) {
        setReport(repData.data);
      }
    } catch {
      setError('Failed to fetch assessment workspace data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentData();
  }, [params.id]);

  const handleExecuteTestPlan = async () => {
    setIsExecuting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/assessments/${params.id}/tests`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Execution error');
      } else {
        fetchAssessmentData();
        setActiveTab('findings');
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/assessments/${params.id}/report`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
        fetchAssessmentData();
        setActiveTab('report');
      }
    } catch {
      setError('Failed to generate report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="py-24 text-center text-xs font-mono text-slate-500">
        Loading Assessment Workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-defyra-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/assessments"
              className="text-defyra-textMuted hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold text-white tracking-tight">{assessment.name}</h1>
            <Badge
              variant={
                assessment.status === 'COMPLETED'
                  ? 'emerald'
                  : assessment.status === 'RUNNING'
                  ? 'cyan'
                  : assessment.status === 'REVIEW'
                  ? 'amber'
                  : 'default'
              }
            >
              {assessment.status}
            </Badge>
          </div>
          <p className="text-xs text-defyra-textMuted font-mono">
            {assessment.assessmentType} • Environment: {assessment.environment} • Created:{' '}
            {new Date(assessment.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAssessmentData}
            className="font-mono text-xs text-slate-400"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={handleExecuteTestPlan}
            isLoading={isExecuting}
            className="gap-2 font-mono text-xs shadow-lg shadow-sky-950/40"
          >
            <Play className="h-3.5 w-3.5" />
            Execute Test Plan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            isLoading={isGeneratingReport}
            className="gap-2 font-mono text-xs border-emerald-800/40 text-emerald-400 hover:bg-emerald-950/30"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Generate Security Report
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-900/50 bg-rose-950/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-defyra-border/50 pb-2">
        <button
          onClick={() => setActiveTab('scope')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'scope'
              ? 'bg-defyra-surface text-defyra-cyan font-semibold border border-defyra-border'
              : 'text-defyra-textMuted hover:text-white'
          }`}
        >
          1. Security Scope ({assessment.scope.authorizedAssetIds.length} Assets)
        </button>

        <button
          onClick={() => setActiveTab('testplan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'testplan'
              ? 'bg-defyra-surface text-defyra-cyan font-semibold border border-defyra-border'
              : 'text-defyra-textMuted hover:text-white'
          }`}
        >
          2. Test Plan ({assessment.testPlan.length} Tests)
        </button>

        <button
          onClick={() => setActiveTab('findings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'findings'
              ? 'bg-defyra-surface text-defyra-cyan font-semibold border border-defyra-border'
              : 'text-defyra-textMuted hover:text-white'
          }`}
        >
          3. Findings & Review ({findings.length})
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'report'
              ? 'bg-defyra-surface text-defyra-cyan font-semibold border border-defyra-border'
              : 'text-defyra-textMuted hover:text-white'
          }`}
        >
          4. Security Assurance Report
        </button>
      </div>

      {/* Tab: Scope */}
      {activeTab === 'scope' && (
        <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Target Boundaries & Environment</h3>
              <div className="p-4 rounded-lg border border-defyra-border/70 bg-defyra-surface/40 font-mono text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-defyra-textMuted">Environment:</span>
                  <span className="text-emerald-400 font-semibold">{assessment.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-defyra-textMuted">Production Gate:</span>
                  <span>{assessment.scope.productionApproved ? 'Dual Approved' : 'Staging / Isolated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-defyra-textMuted">Kill Switch Policy:</span>
                  <span className="text-defyra-cyan">4-Tier Fail-Closed Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Authorized Asset Inventory</h3>
              <div className="p-4 rounded-lg border border-defyra-border/70 bg-defyra-surface/40 font-mono text-xs space-y-2 text-slate-300">
                {assessment.scope.authorizedAssetIds.map((astId) => (
                  <div key={astId} className="flex justify-between items-center py-1 border-b border-defyra-border/40 last:border-0">
                    <span className="text-defyra-cyan">{astId}</span>
                    <Badge variant="default" size="sm">IN-SCOPE</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Test Plan */}
      {activeTab === 'testplan' && (
        <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Deterministic Test Execution Plan</h3>
          <div className="space-y-3">
            {assessment.testPlan.map((tp, idx) => (
              <div
                key={tp.testId}
                className="p-4 rounded-lg border border-defyra-border/70 bg-defyra-surface/30 flex items-center justify-between font-mono text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-defyra-textMuted">#{idx + 1}</span>
                    <span className="text-defyra-cyan font-bold">{tp.testId}</span>
                    <Badge variant={tp.priority === 'CRITICAL' ? 'rose' : 'default'} size="sm">
                      {tp.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-400 font-sans text-xs">{tp.expectedBehavior}</p>
                </div>

                <Badge
                  variant={
                    tp.status === 'PASSED'
                      ? 'emerald'
                      : tp.status === 'FAILED'
                      ? 'rose'
                      : 'default'
                  }
                >
                  {tp.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Findings */}
      {activeTab === 'findings' && (
        <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Assessment Vulnerability Findings</h3>
            <span className="text-xs font-mono text-defyra-textMuted">{findings.length} findings recorded</span>
          </div>

          {findings.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              No findings generated yet. Execute the test plan to evaluate models and agents.
            </div>
          ) : (
            <div className="space-y-3">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-defyra-cyan font-bold">{f.id}</span>
                      <span className="text-white font-semibold">{f.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="rose">{f.severity}</Badge>
                      <Badge variant="amber">{f.status}</Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{f.description}</p>

                  <div className="pt-2 border-t border-rose-900/30 flex items-center justify-between text-[11px] font-mono text-defyra-textMuted">
                    <span>
                      Risk Score: <strong className="text-rose-400">{f.riskScore}</strong> ({f.riskModelVersion})
                    </span>
                    <Link
                      href={`/dashboard/findings/${f.id}`}
                      className="text-defyra-cyan hover:underline inline-flex items-center gap-1"
                    >
                      <span>Review & Remediate</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Report */}
      {activeTab === 'report' && (
        <Card className="border-defyra-border bg-defyra-card/60 p-6 space-y-6">
          {!report ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500 space-y-3">
              <p>No formal security report generated for this assessment yet.</p>
              <Button variant="accent" size="sm" onClick={handleGenerateReport} className="font-mono text-xs">
                Generate Security Assurance Report
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="p-4 rounded-lg border border-defyra-cyan/40 bg-defyra-surface/60 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-sm">{report.title}</span>
                  <Badge variant="emerald">VERIFIED</Badge>
                </div>
                <div className="text-defyra-textMuted">
                  Report ID: <span className="text-slate-300">{report.id}</span> • Generated:{' '}
                  <span className="text-slate-300">{new Date(report.generatedAt).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-defyra-border/50 text-[11px] text-slate-400 break-all">
                  SHA-256 Content Hash: <span className="text-defyra-cyan">{report.reportHash}</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Executive Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-lg bg-defyra-surface/30 border border-defyra-border/40">
                  {report.content.executiveSummary}
                </p>
              </div>

              {/* Key Risk Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
                <div className="p-3 rounded-lg border border-rose-900/50 bg-rose-950/20">
                  <span className="block text-xl font-bold text-rose-400">{report.content.riskSummary.criticalCount}</span>
                  <span className="text-[10px] text-defyra-textMuted">Critical Findings</span>
                </div>
                <div className="p-3 rounded-lg border border-amber-900/50 bg-amber-950/20">
                  <span className="block text-xl font-bold text-amber-400">{report.content.riskSummary.highCount}</span>
                  <span className="text-[10px] text-defyra-textMuted">High Findings</span>
                </div>
                <div className="p-3 rounded-lg border border-cyan-900/50 bg-cyan-950/20">
                  <span className="block text-xl font-bold text-defyra-cyan">{report.content.riskSummary.overallRiskScore}</span>
                  <span className="text-[10px] text-defyra-textMuted">Overall Risk Score</span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20">
                  <span className="block text-xl font-bold text-emerald-400">{report.content.retestResults.length}</span>
                  <span className="text-[10px] text-defyra-textMuted">Retests Verified</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
