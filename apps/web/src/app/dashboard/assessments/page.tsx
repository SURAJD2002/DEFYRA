'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Plus, ArrowRight, PlayCircle, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Assessment, Project } from '@/types';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New assessment form
  const [asmName, setAsmName] = useState('');
  const [asmDesc, setAsmDesc] = useState('');
  const [asmType, setAsmType] = useState('AI_SECURITY_VALIDATION');
  const [asmEnv, setAsmEnv] = useState<'development' | 'staging' | 'production'>('staging');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      const projRes = await fetch('/api/v1/projects');
      const projData = await projRes.json();
      if (projData.success && projData.data.length > 0) {
        setProjects(projData.data);
        const pId = selectedProjectId || projData.data[0].id;
        setSelectedProjectId(pId);

        const asmRes = await fetch(`/api/v1/projects/${pId}/assessments`);
        const asmData = await asmRes.json();
        if (asmData.success) {
          setAssessments(asmData.data);
        }
      }
    } catch {
      // Fallback handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [selectedProjectId]);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      // Fetch assets for the project to auto-authorize in scope
      const assetRes = await fetch(`/api/v1/projects/${selectedProjectId}/assets`);
      const assetData = await assetRes.json();
      const assetIds = (assetData.data || []).map((a: any) => a.id);

      if (assetIds.length === 0) {
        setModalError('Project must contain at least one cataloged asset before scoping an assessment.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`/api/v1/projects/${selectedProjectId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: asmName,
          description: asmDesc,
          assessmentType: asmType,
          environment: asmEnv,
          authorizedAssetIds: assetIds,
          authorizedTestIds: ['DEF-INJ-001', 'DEF-INJ-002', 'DEF-AGC-001'],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error?.message || 'Failed to create assessment.');
        setIsSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setAsmName('');
      setAsmDesc('');
      fetchAssessments();
    } catch {
      setModalError('Network error while scoping assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-defyra-cyan" />
            Security Assessments
          </h1>
          <p className="text-xs sm:text-sm text-defyra-textMuted mt-1 font-mono">
            Customer-grade security validation evaluations, risk scoring, and evidence audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-defyra-surface border border-defyra-border rounded-lg text-xs font-mono px-3 py-2 text-slate-300"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Project: {p.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-2 font-mono text-xs shadow-lg shadow-sky-950/40"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Assessment List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading scoped security assessments...
        </div>
      ) : assessments.length === 0 ? (
        <Card className="border-defyra-border bg-defyra-card/50 p-12 text-center space-y-4">
          <Shield className="h-12 w-12 text-defyra-cyan mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-white">No Security Assessments Scoped Yet</h3>
          <p className="text-xs text-defyra-textMuted max-w-md mx-auto">
            Define an assessment scope, configure test plans against cataloged AI assets, and generate point-in-time assurance reports.
          </p>
          <Button variant="accent" size="sm" onClick={() => setIsModalOpen(true)} className="font-mono text-xs">
            Scope First Assessment
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((asm) => (
            <Card
              key={asm.id}
              className="border-defyra-border bg-defyra-card/60 hover:border-defyra-cyan/40 transition-all group flex flex-col justify-between"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      asm.status === 'COMPLETED'
                        ? 'emerald'
                        : asm.status === 'RUNNING'
                        ? 'cyan'
                        : asm.status === 'REVIEW'
                        ? 'amber'
                        : 'default'
                    }
                  >
                    {asm.status}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-500">{asm.environment}</span>
                </div>

                <CardTitle className="text-base text-white group-hover:text-defyra-cyan transition-colors">
                  {asm.name}
                </CardTitle>

                <p className="text-xs text-defyra-textMuted line-clamp-2">{asm.description || 'No description provided.'}</p>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="p-3 rounded-lg border border-defyra-border/50 bg-defyra-surface/30 text-xs font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-slate-200">{asm.assessmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scoped Assets:</span>
                    <span className="text-slate-200">{asm.scope.authorizedAssetIds.length} Assets</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Cases:</span>
                    <span className="text-slate-200">{asm.testPlan.length} Tests</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-defyra-border/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(asm.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/dashboard/assessments/${asm.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-defyra-cyan hover:underline"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scope New Assessment Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Scope Customer Security Assessment"
        description="Configure target assets, environment bounds, and initial test plan for formal security review."
        maxWidth="md"
      >
        {modalError && (
          <div className="mb-4 p-3 rounded-lg border border-rose-600/50 bg-rose-950/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAssessment} className="space-y-4">
          <Input
            label="ASSESSMENT NAME"
            placeholder="e.g. Q3 Autonomous Reasoning Agent Security Validation"
            value={asmName}
            onChange={(e) => setAsmName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="ASSESSMENT TYPE"
              options={[
                { value: 'AI_SECURITY_VALIDATION', label: 'AI Security Validation' },
                { value: 'AI_RED_TEAM', label: 'AI Red Teaming' },
                { value: 'AGENT_SECURITY', label: 'Autonomous Agent Security' },
                { value: 'RAG_SECURITY', label: 'RAG & Vector Security' },
                { value: 'TOOL_API_SECURITY', label: 'Tool & API Permission Security' },
                { value: 'MCP_SECURITY', label: 'Model Context Protocol (MCP)' },
              ]}
              value={asmType}
              onChange={(e) => setAsmType(e.target.value)}
            />
            <Select
              label="ENVIRONMENT"
              options={[
                { value: 'development', label: 'Development' },
                { value: 'staging', label: 'Staging' },
                { value: 'production', label: 'Production' },
              ]}
              value={asmEnv}
              onChange={(e) => setAsmEnv(e.target.value as any)}
            />
          </div>

          <Textarea
            label="OBJECTIVES & SCOPE DESCRIPTION"
            placeholder="Define testing boundaries, target expectations, and compliance objectives..."
            value={asmDesc}
            onChange={(e) => setAsmDesc(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-defyra-border/50">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="font-mono text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm" isLoading={isSubmitting} className="font-mono text-xs">
              Initialize Assessment Scope
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
