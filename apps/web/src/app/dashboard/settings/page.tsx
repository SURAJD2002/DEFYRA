'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Building,
  Users,
  ShieldCheck,
  Plus,
  UserPlus,
  AlertTriangle,
  Key,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Organization, MembershipWithUser, UserRole } from '@/types';

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<MembershipWithUser[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('VIEWER');
  const [isLoading, setIsLoading] = useState(true);

  // Invite Member Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('ANALYST');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchOrgData = async () => {
    try {
      const meRes = await fetch('/api/v1/me');
      const meData = await meRes.json();

      if (meData.success && meData.data.activeOrganization) {
        setOrg(meData.data.activeOrganization);
        setUserRole(meData.data.role);

        const memRes = await fetch(`/api/v1/organizations/${meData.data.activeOrganization.id}/members`);
        const memData = await memRes.json();
        if (memData.success) {
          setMembers(memData.data);
        }
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setInviteError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/organizations/${org.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setInviteError(data.error?.message || 'Failed to add member.');
        setIsSubmitting(false);
        return;
      }

      setInviteEmail('');
      setIsInviteModalOpen(false);
      fetchOrgData();
    } catch {
      setInviteError('Network error while inviting member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleStyles: Record<UserRole, string> = {
    OWNER: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
    ADMIN: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
    SECURITY_LEAD: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50',
    ANALYST: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
    VIEWER: 'bg-slate-900 text-slate-400 border-slate-800',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Settings</h1>
          <Badge variant="cyan" size="sm">
            Tenant Management
          </Badge>
        </div>
        <p className="text-xs text-defyra-textMuted mt-1">
          Manage workspace identity, membership access, and role-based permissions.
        </p>
      </div>

      {/* ORGANIZATION PROFILE CARD */}
      <Card className="border-defyra-border bg-defyra-card">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Building className="h-4 w-4 text-defyra-cyan" />
            Organization Profile
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 uppercase">
            {org?.status || 'active'}
          </span>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border">
              <span className="text-defyra-textSubtle block text-[10px]">ORGANIZATION NAME</span>
              <span className="text-slate-100 font-semibold">{org?.name}</span>
            </div>
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border">
              <span className="text-defyra-textSubtle block text-[10px]">TENANT SLUG</span>
              <span className="text-defyra-cyan">{org?.slug}</span>
            </div>
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border">
              <span className="text-defyra-textSubtle block text-[10px]">TENANT IDENTIFIER</span>
              <span className="text-slate-400 text-[11px] truncate block">{org?.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MEMBERSHIP & RBAC MANAGEMENT */}
      <Card className="border-defyra-border bg-defyra-card">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-defyra-cyan" />
            Workspace Members & Roles
          </CardTitle>
          {(userRole === 'OWNER' || userRole === 'ADMIN') && (
            <Button
              size="sm"
              variant="accent"
              onClick={() => setIsInviteModalOpen(true)}
              className="font-mono text-xs"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Add Member
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-defyra-surface border-b border-defyra-border font-mono text-defyra-textSubtle text-[11px]">
                <tr>
                  <th className="p-3.5 font-medium">MEMBER</th>
                  <th className="p-3.5 font-medium">EMAIL</th>
                  <th className="p-3.5 font-medium">ASSIGNED ROLE</th>
                  <th className="p-3.5 font-medium">MEMBER SINCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-defyra-border/40 font-mono">
                {members.map((mem) => (
                  <tr key={mem.id} className="hover:bg-defyra-surface/50 transition-colors">
                    <td className="p-3.5 font-sans font-medium text-white">{mem.user.fullName}</td>
                    <td className="p-3.5 text-slate-300">{mem.user.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                          roleStyles[mem.role] || roleStyles.VIEWER
                        }`}
                      >
                        {mem.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-defyra-textSubtle">
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* RBAC PERMISSIONS REFERENCE MATRIX */}
      <Card className="border-defyra-border bg-defyra-surface/60">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-defyra-cyan" />
            Centralized RBAC Governance Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-3 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-[11px]">
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border space-y-1">
              <span className="text-rose-400 font-bold block">OWNER</span>
              <p className="text-[10px] text-defyra-textMuted font-sans">
                Full organization control, member invites/removals, billing, and settings.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border space-y-1">
              <span className="text-purple-400 font-bold block">ADMIN</span>
              <p className="text-[10px] text-defyra-textMuted font-sans">
                Manage members, manage projects, register assets, oversee findings.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border space-y-1">
              <span className="text-cyan-400 font-bold block">SECURITY LEAD</span>
              <p className="text-[10px] text-defyra-textMuted font-sans">
                Run authorized security tests, manage findings, execute retests, generate reports.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border space-y-1">
              <span className="text-blue-400 font-bold block">ANALYST</span>
              <p className="text-[10px] text-defyra-textMuted font-sans">
                View projects and assets, update assigned findings, access test evidence.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border space-y-1">
              <span className="text-slate-400 font-bold block">VIEWER</span>
              <p className="text-[10px] text-defyra-textMuted font-sans">
                Read-only visibility into projects, cataloged assets, and published reports.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INVITE MEMBER MODAL */}
      <Dialog
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Add Organization Member"
        description="Grant a team member access to this workspace with explicit RBAC permissions."
        maxWidth="md"
      >
        {inviteError && (
          <div className="mb-4 p-3 rounded-lg border border-rose-600/50 bg-rose-950/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{inviteError}</span>
          </div>
        )}

        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="CORPORATE EMAIL"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="ROLE PERMISSION"
            options={[
              { value: 'ADMIN', label: 'Admin (Manage members & projects)' },
              { value: 'SECURITY_LEAD', label: 'Security Lead (Run tests & manage findings)' },
              { value: 'ANALYST', label: 'Analyst (Manage findings & view evidence)' },
              { value: 'VIEWER', label: 'Viewer (Read-only access)' },
            ]}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-defyra-border/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
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
              Add Member
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
