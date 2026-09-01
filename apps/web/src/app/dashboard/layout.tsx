'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  FolderGit2,
  Boxes,
  PlayCircle,
  Activity,
  AlertOctagon,
  FileCheck2,
  RotateCw,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronDown,
  Lock,
  Building,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserProfile, Organization, UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderGit2 },
  { name: 'Assets', href: '/dashboard/assets', icon: Boxes },
  { name: 'Assessments', href: '/dashboard/assessments', icon: Shield },
  { name: 'Findings', href: '/dashboard/findings', icon: AlertOctagon },
  { name: 'Reports', href: '/dashboard/reports', icon: FileSpreadsheet, disabled: true, badge: 'Phase 4' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('VIEWER');
  const [isLoading, setIsLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/v1/me');
        const data = await res.json();
        if (!res.ok || !data.success) {
          router.push('/login');
          return;
        }
        setCurrentUser(data.data.user);
        setActiveOrg(data.data.activeOrganization);
        setCurrentRole(data.data.role);
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-defyra-bg text-slate-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-defyra-cyan border-t-transparent" />
          <span>Verifying security session...</span>
        </div>
      </div>
    );
  }

  const roleStyles: Record<UserRole, string> = {
    OWNER: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
    ADMIN: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
    SECURITY_LEAD: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50',
    ANALYST: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
    VIEWER: 'bg-slate-900 text-slate-400 border-slate-800',
  };

  return (
    <div className="flex h-screen bg-defyra-bg text-slate-100 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-defyra-border bg-defyra-surface/90 backdrop-blur-md">
        {/* Workspace Brand */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-defyra-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-defyra-bg border border-defyra-border text-defyra-cyan">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-base font-bold tracking-wider text-white">DEFYRA</span>
              <span className="block text-[8px] font-mono uppercase tracking-widest text-defyra-textSubtle">
                Security Core
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
            v0.1
          </span>
        </div>

        {/* Active Tenant / Organization Display */}
        <div className="p-3 border-b border-defyra-border/60">
          <div className="rounded-lg bg-defyra-bg/80 border border-defyra-border p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Building className="h-4 w-4 text-defyra-cyan shrink-0" />
              <div className="truncate">
                <span className="block text-xs font-semibold text-white truncate">
                  {activeOrg?.name || 'Organization'}
                </span>
                <span className="block text-[9px] font-mono text-defyra-textSubtle">
                  Tenant: {activeOrg?.slug || 'active'}
                </span>
              </div>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${roleStyles[currentRole]}`}>
              {currentRole}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-slate-500 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 rounded bg-slate-900 border border-slate-800 text-slate-500">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                  isActive
                    ? 'bg-defyra-cyan/15 text-defyra-cyan border border-defyra-cyan/30 font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-defyra-surfaceHover hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Account & Logout Footer */}
        <div className="p-3 border-t border-defyra-border bg-defyra-bg/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <span className="block text-xs font-medium text-white truncate">
                  {currentUser?.fullName}
                </span>
                <span className="block text-[10px] text-defyra-textSubtle truncate font-mono">
                  {currentUser?.email}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex h-14 items-center justify-between px-4 border-b border-defyra-border bg-defyra-surface">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-defyra-cyan" />
            <span className="font-mono text-sm font-bold text-white">DEFYRA</span>
          </div>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden p-4 border-b border-defyra-border bg-defyra-surface space-y-2">
            {NAV_ITEMS.filter((i) => !i.disabled).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-defyra-bg"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-xs font-mono text-rose-400"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-defyra-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
