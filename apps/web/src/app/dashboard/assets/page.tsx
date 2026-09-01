'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Plus,
  Filter,
  Search,
  AlertTriangle,
  Server,
  Layers,
  Cpu,
  Database,
  Key,
  Wrench,
  Globe,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Asset, AssetType, AssetEnvironment, ProjectWithStats } from '@/types';

export default function AssetInventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [envFilter, setEnvFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('AGENT');
  const [environment, setEnvironment] = useState<AssetEnvironment>('staging');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const projRes = await fetch('/api/v1/projects');
      const projData = await projRes.json();

      if (projData.success && projData.data.length > 0) {
        setProjects(projData.data);
        if (!selectedProjectId) {
          setSelectedProjectId(projData.data[0].id);
        }

        // Fetch assets across all projects in the active organization
        const assetPromises = projData.data.map((p: ProjectWithStats) =>
          fetch(`/api/v1/projects/${p.id}/assets`).then((r) => r.json())
        );
        const assetResults = await Promise.all(assetPromises);
        const combinedAssets: Asset[] = [];
        assetResults.forEach((res) => {
          if (res.success && Array.isArray(res.data)) {
            combinedAssets.push(...res.data);
          }
        });
        setAssets(combinedAssets);
      }
    } catch (err) {
      console.error('Failed to load asset inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedProjectId) {
      setModalError('Please select an active project for this asset.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name,
          description,
          environment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error?.message || 'Failed to create asset.');
        setIsSubmitting(false);
        return;
      }

      setName('');
      setDescription('');
      setIsModalOpen(false);
      fetchInventory();
    } catch {
      setModalError('Network error while saving asset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || asset.type === typeFilter;
    const matchesEnv = envFilter === 'ALL' || asset.environment === envFilter;
    return matchesSearch && matchesType && matchesEnv;
  });

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Asset Inventory</h1>
            <Badge variant="cyan" size="sm">
              {assets.length} In Scope
            </Badge>
          </div>
          <p className="text-xs text-defyra-textMuted mt-1">
            Catalog and enforce boundary governance across AI agents, tools, memory, and models.
          </p>
        </div>

        <Button
          size="sm"
          variant="accent"
          onClick={() => setIsModalOpen(true)}
          className="font-mono text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Register Asset
        </Button>
      </div>

      {/* FILTER BAR */}
      <Card className="border-defyra-border bg-defyra-surface/60 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by asset name or scope..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-defyra-border bg-defyra-bg pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-defyra-cyan focus:outline-none"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 w-full rounded-lg border border-defyra-border bg-defyra-bg px-3 text-xs text-slate-100 focus:border-defyra-cyan focus:outline-none"
            >
              <option value="ALL">All Asset Types</option>
              {assetTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="h-10 w-full rounded-lg border border-defyra-border bg-defyra-bg px-3 text-xs text-slate-100 focus:border-defyra-cyan focus:outline-none"
            >
              <option value="ALL">All Environments</option>
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ASSET INVENTORY TABLE */}
      {isLoading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500">
          Loading cataloged assets...
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="border-defyra-border bg-defyra-card p-12 text-center space-y-3">
          <Boxes className="h-10 w-10 text-defyra-cyan mx-auto opacity-50" />
          <h3 className="text-base font-semibold text-white">No Assets Found</h3>
          <p className="text-xs text-defyra-textMuted max-w-sm mx-auto">
            {assets.length === 0
              ? 'Register your AI models, agents, tools, or MCP servers to begin scoped validation.'
              : 'No assets match the active filter criteria.'}
          </p>
        </Card>
      ) : (
        <Card className="border-defyra-border bg-defyra-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-defyra-surface border-b border-defyra-border font-mono text-defyra-textSubtle text-[11px]">
                <tr>
                  <th className="p-3.5 font-medium">ASSET NAME</th>
                  <th className="p-3.5 font-medium">TYPE</th>
                  <th className="p-3.5 font-medium">ENVIRONMENT</th>
                  <th className="p-3.5 font-medium">PROJECT SCOPE</th>
                  <th className="p-3.5 font-medium">STATUS</th>
                  <th className="p-3.5 font-medium">UPDATED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-defyra-border/40 font-mono">
                {filteredAssets.map((asset) => {
                  const proj = projects.find((p) => p.id === asset.projectId);
                  return (
                    <tr key={asset.id} className="hover:bg-defyra-surface/50 transition-colors">
                      <td className="p-3.5 font-sans font-medium text-white">
                        <div>
                          <span>{asset.name}</span>
                          <span className="block text-[11px] font-mono text-defyra-textMuted line-clamp-1 font-normal">
                            {asset.description || 'No description provided.'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="cyan" size="sm">
                          {asset.type}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-300 capitalize">{asset.environment}</td>
                      <td className="p-3.5 font-sans text-slate-300">
                        {proj ? (
                          <Link
                            href={`/dashboard/projects/${proj.id}`}
                            className="hover:text-defyra-cyan transition-colors"
                          >
                            {proj.name}
                          </Link>
                        ) : (
                          'Global'
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-emerald-400">● {asset.status}</span>
                      </td>
                      <td className="p-3.5 text-defyra-textSubtle">
                        {new Date(asset.updatedAt || asset.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REGISTER ASSET MODAL */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register AI Asset"
        description="Catalog a new model, autonomous agent, function tool, RAG database, or MCP server."
        maxWidth="md"
      >
        {modalError && (
          <div className="mb-4 p-3 rounded-lg border border-rose-600/50 bg-rose-950/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleRegisterAsset} className="space-y-4">
          <Select
            label="PROJECT SCOPE"
            options={projects.map((p) => ({ value: p.id, label: `${p.name} (${p.environment})` }))}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          />

          <Input
            label="ASSET NAME"
            placeholder="e.g. Code Generation REPL Tool"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="ASSET TYPE"
              options={assetTypeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
            />
            <Select
              label="ENVIRONMENT"
              options={[
                { value: 'development', label: 'Development' },
                { value: 'staging', label: 'Staging' },
                { value: 'production', label: 'Production' },
              ]}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as AssetEnvironment)}
            />
          </div>

          <Textarea
            label="DESCRIPTION & CAPABILITY BOUNDARIES"
            placeholder="Document what data access, tools, or permissions this asset possesses..."
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
              Register Asset
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
