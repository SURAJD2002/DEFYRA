'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Plus,
  ArrowRight,
  Boxes,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { ProjectWithStats } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<'development' | 'staging' | 'production'>('staging');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const envOptions = [
    { value: 'development', label: 'Development (Sandbox / Lab)' },
    { value: 'staging', label: 'Staging (Pre-Production Mirror)' },
    { value: 'production', label: 'Production (Explicit Authorization Required)' },
  ];

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/v1/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Error fetching projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      // First get user's active org ID
      const meRes = await fetch('/api/v1/me');
      const meData = await meRes.json();
      if (!meData.success || !meData.data.activeOrganization) {
        setFormError('Could not resolve active organization tenant.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: meData.data.activeOrganization.id,
          name,
          description,
          environment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error?.message || 'Failed to create project.');
        setIsSubmitting(false);
        return;
      }

      // Reset form and reload
      setName('');
      setDescription('');
      setEnvironment('staging');
      setIsModalOpen(false);
      fetchProjects();
    } catch {
      setFormError('Network error while saving project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
            <Badge variant="cyan" size="sm">
              {projects.length} Total
            </Badge>
          </div>
          <p className="text-xs text-defyra-textMuted mt-1">
            Scoped workspaces for validating autonomous agents, models, and tool chains.
          </p>
        </div>

        <Button
          size="sm"
          variant="accent"
          onClick={() => setIsModalOpen(true)}
          className="font-mono text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500">
          Loading authorized projects...
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-defyra-border bg-defyra-card p-12 text-center space-y-3">
          <FolderGit2 className="h-10 w-10 text-defyra-cyan mx-auto opacity-60" />
          <h3 className="text-base font-semibold text-white">No Projects Initialized</h3>
          <p className="text-xs text-defyra-textMuted max-w-sm mx-auto">
            Create your first project to begin cataloging assets and defining security evaluation scopes.
          </p>
          <Button
            size="sm"
            variant="accent"
            onClick={() => setIsModalOpen(true)}
            className="font-mono text-xs mt-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className="border-defyra-border bg-defyra-card hover:border-defyra-cyan/40 transition-all flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-defyra-cyan" />
                      <span>{proj.id}</span>
                    </div>
                    <Badge
                      variant={
                        proj.environment === 'production'
                          ? 'rose'
                          : proj.environment === 'staging'
                          ? 'amber'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {proj.environment}
                    </Badge>
                  </div>
                  <CardTitle className="text-base text-white hover:text-defyra-cyan transition-colors">
                    <Link href={`/dashboard/projects/${proj.id}`}>{proj.name}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4 text-xs">
                  <p className="text-defyra-textMuted line-clamp-2 leading-relaxed">
                    {proj.description || 'No project description.'}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300 pt-2 border-t border-defyra-border/40">
                    <div className="flex items-center gap-1">
                      <Boxes className="h-3.5 w-3.5 text-defyra-cyan" />
                      <span>{proj.assetCount} Assets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                      <span>0 Findings</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 mt-auto border-t border-defyra-border/20 flex items-center justify-between">
                <span className="text-[10px] font-mono text-defyra-textSubtle">
                  {new Date(proj.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/dashboard/projects/${proj.id}`}
                  className="text-xs font-mono text-defyra-cyan hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initialize New Project"
        description="Define an authorized boundary for AI security validation and asset grouping."
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg border border-rose-600/50 bg-rose-950/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="PROJECT NAME"
            placeholder="e.g. Autonomous Customer Support Agent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="TARGET ENVIRONMENT"
            options={envOptions}
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as any)}
          />

          <Textarea
            label="PROJECT DESCRIPTION & SCOPE"
            placeholder="Describe the architecture, models used, and testing objectives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-defyra-border/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={isSubmitting}
              className="font-mono text-xs"
            >
              Initialize Project
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
