'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderGit2,
  Boxes,
  Shield,
  ArrowLeft,
  Plus,
  PlayCircle,
  AlertOctagon,
  FileCheck2,
  RotateCw,
  FileSpreadsheet,
  AlertTriangle,
  Server,
  Layers,
  Wrench,
  Cpu,
  Database,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Asset, AssetType, AssetEnvironment } from '@/types';

interface ProjectDetail {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  status: 'active' | 'archived';
  role: string;
  assetCount: number;
  relationshipCount: number;
  findingCount: number;
  testCount: number;
  createdAt: string;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Asset creation modal
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('AGENT');
  const [assetDesc, setAssetDesc] = useState('');
  const [assetEnv, setAssetEnv] = useState<AssetEnvironment>('staging');
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [assetModalError, setAssetModalError] = useState<string | null>(null);

  const assetTypeOptions = [
    { value: 'AGENT', label: 'Autonomous Agent' },
    { value: 'MODEL', label: 'Foundation / Fine-Tuned Model' },
    { value: 'RAG', label: 'RAG / Vector Database' },
    { value: 'MEMORY', label: 'Semantic Memory / Cache Store' },
    { value: 'TOOL', label: 'Tool / Code Execution Function' },
    { value: 'API', label: 'API Endpoint / Webhook' },
    { value: 'IDENTITY', label: 'Service Account / OAuth Identity' },
    { value: 'PERMISSION', label: 'Permission Boundary / RBAC Rule' },
    { value: 'DATA_SOURCE', label: 'Enterprise Data Source' },
    { value: 'MCP_SERVER', label: 'Model Context Protocol (MCP) Server' },
    { value: 'APPLICATION', label: 'Client Application' },
  ];

  const fetchProjectData = async () => {
    try {
      const [projRes, assetRes] = await Promise.all([
        fetch(`/api/v1/projects/${params.id}`),
        fetch(`/api/v1/projects/${params.id}/assets`),
      ]);

      const projData = await projRes.json();
      if (!projRes.ok || !projData.success) {
        setError(projData.error?.message || 'Failed to load project details.');
        setIsLoading(false);
        return;
      }
      setProject(projData.data);

      const assetData = await assetRes.json();
      if (assetData.success) {
        setAssets(assetData.data);
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [params.id]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssetModalError(null);
    setIsSubmittingAsset(true);

    try {
      const res = await fetch(`/api/v1/projects/${params.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: assetType,
          name: assetName,
          description: assetDesc,
          environment: assetEnv,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAssetModalError(data.error?.message || 'Failed to register asset.');
        setIsSubmittingAsset(false);
        return;
      }

      setAssetName('');
      setAssetDesc('');
      setIsAssetModalOpen(false);
      fetchProjectData();
    } catch {
      setAssetModalError('Network error while registering asset.');
    } finally {
      setIsSubmittingAsset(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs font-mono text-slate-500">
        Loading project workspace...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Access Denied or Not Found</h2>
        <p className="text-xs text-defyra-textMuted">{error || 'This project does not exist.'}</p>
        <Link href="/dashboard/projects">
          <Button size="sm" variant="outline" className="font-mono text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: FolderGit2 },
    { id: 'assets', label: 'Assets', count: assets.length, icon: Boxes },
    { id: 'tests', label: 'Tests', count: 0, icon: PlayCircle },
    { id: 'findings', label: 'Findings', count: 0, icon: AlertOctagon },
    { id: 'evidence', label: 'Evidence', icon: FileCheck2 },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-defyra-textSubtle">
        <Link href="/dashboard/projects" className="hover:text-defyra-cyan transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-slate-200">{project.name}</span>
      </div>

      {/* Project Header Banner */}
      <div className="p-6 rounded-2xl border border-defyra-border bg-defyra-surface/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            <Badge
              variant={
                project.environment === 'production'
                  ? 'rose'
                  : project.environment === 'staging'
                  ? 'amber'
                  : 'slate'
              }
              size="sm"
            >
              {project.environment}
            </Badge>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              Role: {project.role}
            </span>
          </div>
          <p className="text-xs text-defyra-textMuted max-w-2xl leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            variant="accent"
            onClick={() => setIsAssetModalOpen(true)}
            className="font-mono text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-defyra-border bg-defyra-card p-5 space-y-1">
              <span className="text-[10px] font-mono text-defyra-textSubtle uppercase">
                Inventory In Scope
              </span>
              <div className="text-2xl font-bold text-white">{assets.length} Assets</div>
              <p className="text-[11px] text-defyra-textMuted">
                {project.relationshipCount} Inter-asset links established
              </p>
            </Card>

            <Card className="border-defyra-border bg-defyra-card p-5 space-y-1">
              <span className="text-[10px] font-mono text-defyra-textSubtle uppercase">
                Security Validations
              </span>
              <div className="text-2xl font-bold text-white">0 Test Runs</div>
              <p className="text-[11px] text-defyra-textMuted">Awaiting scheduled execution</p>
            </Card>

            <Card className="border-defyra-border bg-defyra-card p-5 space-y-1">
              <span className="text-[10px] font-mono text-defyra-textSubtle uppercase">
                Risk Status
              </span>
              <div className="text-2xl font-bold text-emerald-400">Baseline Ready</div>
              <p className="text-[11px] text-defyra-textMuted">Zero critical leaks identified</p>
            </Card>
          </div>

          {/* Quick Assets Table Snapshot */}
          <Card className="border-defyra-border bg-defyra-card">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-white">Assets Registered in this Project</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('assets')}
                className="font-mono text-xs"
              >
                Manage Assets
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {assets.length === 0 ? (
                <div className="py-8 text-center text-xs text-defyra-textMuted">
                  No assets cataloged yet. Register your agents, models, and tools.
                </div>
              ) : (
                <div className="divide-y divide-defyra-border/40">
                  {assets.map((ast) => (
                    <div key={ast.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-100 block">{ast.name}</span>
                        <span className="text-[10px] font-mono text-defyra-textSubtle">
                          {ast.type} • {ast.environment}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {ast.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: ASSETS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-defyra-textMuted">
              {assets.length} assets registered in project boundary
            </span>
            <Button
              size="sm"
              variant="accent"
              onClick={() => setIsAssetModalOpen(true)}
              className="font-mono text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Register New Asset
            </Button>
          </div>

          <Card className="border-defyra-border bg-defyra-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-defyra-surface border-b border-defyra-border font-mono text-defyra-textSubtle text-[11px]">
                  <tr>
                    <th className="p-3.5 font-medium">NAME</th>
                    <th className="p-3.5 font-medium">TYPE</th>
                    <th className="p-3.5 font-medium">ENVIRONMENT</th>
                    <th className="p-3.5 font-medium">STATUS</th>
                    <th className="p-3.5 font-medium">CREATED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-defyra-border/40 font-mono">
                  {assets.map((ast) => (
                    <tr key={ast.id} className="hover:bg-defyra-surface/50 transition-colors">
                      <td className="p-3.5 font-sans font-medium text-white">{ast.name}</td>
                      <td className="p-3.5">
                        <Badge variant="cyan" size="sm">
                          {ast.type}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-300">{ast.environment}</td>
                      <td className="p-3.5">
                        <span className="text-emerald-400">● {ast.status}</span>
                      </td>
                      <td className="p-3.5 text-defyra-textSubtle">
                        {new Date(ast.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: PLACEHOLDERS (Phase 3) */}
      {(activeTab === 'tests' ||
        activeTab === 'findings' ||
        activeTab === 'evidence' ||
        activeTab === 'reports') && (
        <Card className="border-defyra-border bg-defyra-card/60 p-12 text-center space-y-3">
          <Shield className="h-10 w-10 text-defyra-cyan mx-auto opacity-50" />
          <h3 className="text-base font-semibold text-white capitalize">
            {activeTab} Workflow Module
          </h3>
          <p className="text-xs text-defyra-textMuted max-w-md mx-auto">
            Coming in the next security workflow release: Scoped execution engine, SHA-256 evidence ingestion, and point-in-time assurance reports.
          </p>
        </Card>
      )}

      {/* ADD ASSET MODAL */}
      <Dialog
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title="Register Asset in Project Scope"
        description="Catalog models, agents, tools, RAG vector stores, or MCP servers."
        maxWidth="md"
      >
        {assetModalError && (
          <div className="mb-4 p-3 rounded-lg border border-rose-600/50 bg-rose-950/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{assetModalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAsset} className="space-y-4">
          <Input
            label="ASSET NAME"
            placeholder="e.g. Claude 3.5 Sonnet Reasoning Agent"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="ASSET TYPE"
              options={assetTypeOptions}
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
            />
            <Select
              label="ENVIRONMENT"
              options={[
                { value: 'development', label: 'Development' },
                { value: 'staging', label: 'Staging' },
                { value: 'production', label: 'Production' },
              ]}
              value={assetEnv}
              onChange={(e) => setAssetEnv(e.target.value as AssetEnvironment)}
            />
          </div>

          <Textarea
            label="DESCRIPTION & CAPABILITIES"
            placeholder="Describe what data, tools, or APIs this asset has access to..."
            value={assetDesc}
            onChange={(e) => setAssetDesc(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-defyra-border/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAssetModalOpen(false)}
              className="font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={isSubmittingAsset}
              className="font-mono text-xs"
            >
              Register Asset
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
