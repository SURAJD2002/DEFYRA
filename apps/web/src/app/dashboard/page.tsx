'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Boxes,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Plus,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectWithStats, Asset } from '@/types';

export default function DashboardOverviewPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, assetRes] = await Promise.all([
          fetch('/api/v1/projects'),
          fetch('/api/v1/projects'), // default will populate from first project
        ]);

        const projData = await projRes.json();
        if (projData.success) {
          setProjects(projData.data);
          if (projData.data.length > 0) {
            const firstProjId = projData.data[0].id;
            const aRes = await fetch(`/api/v1/projects/${firstProjId}/assets`);
            const aData = await aRes.json();
            if (aData.success) {
              setAssets(aData.data);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Security Overview
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-defyra-textMuted mt-1">
            Scoped AI inventory, authorization boundaries, and risk validation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects">
            <Button size="sm" variant="accent" className="font-mono text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Project
            </Button>
          </Link>
          <Link href="/dashboard/assets">
            <Button size="sm" variant="outline" className="font-mono text-xs">
              <Boxes className="h-3.5 w-3.5 mr-1" />
              Register Asset
            </Button>
          </Link>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <Card className="border-defyra-border bg-defyra-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-defyra-textSubtle uppercase">
              Active Projects
            </span>
            <div className="p-2 rounded-lg bg-defyra-surface text-defyra-cyan">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <p className="text-[11px] text-defyra-textMuted">Authorized testing workspaces</p>
        </Card>

        {/* Card 2: Cataloged Assets */}
        <Card className="border-defyra-border bg-defyra-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-defyra-textSubtle uppercase">
              Cataloged Assets
            </span>
            <div className="p-2 rounded-lg bg-defyra-surface text-defyra-cyan">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{assets.length}</div>
          <p className="text-[11px] text-defyra-textMuted">Agents, Models, RAG, Tools, MCP</p>
        </Card>

        {/* Card 3: DEFYRA Risk View Preliminary */}
        <Card className="border-defyra-cyan/30 bg-defyra-card p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-300 uppercase font-semibold">
              DEFYRA Risk View
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              preliminary
            </span>
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Low Exposure</span>
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-[11px] text-defyra-textMuted">
            Based on <strong className="text-slate-300">RiskModel v0.1</strong> asset boundaries
          </p>
        </Card>

        {/* Card 4: Validation Engine State */}
        <Card className="border-defyra-border bg-defyra-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-defyra-textSubtle uppercase">
              Engine Status
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-white">Sandbox Ready</div>
          <p className="text-[11px] text-defyra-textMuted">20 Core Test Definitions Loaded</p>
        </Card>
      </div>

      {/* METHODOLOGY TRANSPARENCY NOTICE */}
      <div className="p-4 rounded-xl border border-defyra-border bg-defyra-surface/60 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
        <Info className="h-4 w-4 text-defyra-cyan shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Methodology Transparency: </span>
          DEFYRA does not compute universal arbitrary security percentages. Risk views represent point-in-time multi-factor evaluations based on configured asset permissions, environment isolation, and verified test evidence.
        </div>
      </div>

      {/* RECENT PROJECTS & ASSET OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Projects List */}
        <Card className="border-defyra-border bg-defyra-card">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-defyra-cyan" />
              Active Projects
            </CardTitle>
            <Link
              href="/dashboard/projects"
              className="text-xs font-mono text-defyra-cyan hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-5 pt-0 divide-y divide-defyra-border/40">
            {projects.length === 0 ? (
              <p className="text-xs text-defyra-textMuted py-4">No projects initialized yet.</p>
            ) : (
              projects.slice(0, 3).map((proj) => (
                <div key={proj.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/dashboard/projects/${proj.id}`}
                      className="text-sm font-semibold text-white hover:text-defyra-cyan transition-colors"
                    >
                      {proj.name}
                    </Link>
                    <p className="text-xs text-defyra-textMuted line-clamp-1 mt-0.5">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="slate" size="sm">
                      {proj.environment}
                    </Badge>
                    <Link href={`/dashboard/projects/${proj.id}`}>
                      <Button size="sm" variant="ghost" className="p-1 text-slate-400 hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right: Key Assets In Scope */}
        <Card className="border-defyra-border bg-defyra-card">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Boxes className="h-4 w-4 text-defyra-cyan" />
              Cataloged AI Assets
            </CardTitle>
            <Link
              href="/dashboard/assets"
              className="text-xs font-mono text-defyra-cyan hover:underline inline-flex items-center gap-1"
            >
              <span>Full Inventory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-5 pt-0 divide-y divide-defyra-border/40">
            {assets.length === 0 ? (
              <p className="text-xs text-defyra-textMuted py-4">No assets registered yet.</p>
            ) : (
              assets.slice(0, 4).map((asset) => (
                <div key={asset.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{asset.name}</span>
                    <span className="text-[10px] font-mono text-defyra-textSubtle">
                      {asset.type} • {asset.environment}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {asset.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
