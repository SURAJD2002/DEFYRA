import React from 'react';
import {
  Users,
  FolderGit2,
  Boxes,
  ShieldCheck,
  PlayCircle,
  Eye,
  FileCheck,
  AlertOctagon,
  Scale,
  Wrench,
  RotateCw,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';

const WORKFLOW_STEPS = [
  { step: '01', title: 'Customer & Scope', icon: Users, desc: 'Enterprise onboarding & mutual non-disclosure baseline' },
  { step: '02', title: 'Project Context', icon: FolderGit2, desc: 'Target environment bounds (Staging / Pre-prod / Lab)' },
  { step: '03', title: 'Asset Inventory', icon: Boxes, desc: 'Cataloging models, agents, tools, RAG, and MCP servers' },
  { step: '04', title: 'Authorization', icon: ShieldCheck, desc: 'Dual-key cryptographic scope signing & allowlisting' },
  { step: '05', title: 'Security Test', icon: PlayCircle, desc: 'Sandboxed execution of calibrated test definitions' },
  { step: '06', title: 'Observation', icon: Eye, desc: 'Telemetry extraction, token drift, and syscall monitoring' },
  { step: '07', title: 'Evidence Vault', icon: FileCheck, desc: 'SHA-256 immutable cryptographic hash recording' },
  { step: '08', title: 'Finding', icon: AlertOctagon, desc: 'Categorized vulnerability identification & severity rating' },
  { step: '09', title: 'Risk Engine', icon: Scale, desc: 'DEFYRA RiskModel v0.1 multi-factor scoring' },
  { step: '10', title: 'Remediation', icon: Wrench, desc: 'Architectural mitigation guidance and code patches' },
  { step: '11', title: 'Retest', icon: RotateCw, desc: 'Automated delta verification to prove vulnerability closure' },
  { step: '12', title: 'Report', icon: FileSpreadsheet, desc: 'Point-in-time executive & technical assurance report' },
];

export function MethodologySection() {
  return (
    <section className="py-20 md:py-28 border-b border-defyra-border/50 bg-defyra-surface/40">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <Badge variant="cyan" size="sm">
            Disciplined Security Engineering
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            The DEFYRA Validation Workflow
          </h2>
          <p className="text-sm sm:text-base text-defyra-textMuted leading-relaxed">
            Every security engagement follows an auditable 12-stage validation lifecycle to ensure authorized execution, zero collateral damage, and indisputable proof.
          </p>
        </div>

        {/* 12-Step Visual Flow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative p-5 rounded-xl border border-defyra-border bg-defyra-card/80 hover:border-defyra-cyan/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-defyra-cyan bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    STAGE {step.step}
                  </span>
                  <div className="p-2 rounded-lg bg-defyra-surface text-slate-400 group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-defyra-cyan transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-defyra-textMuted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Audit & Point-in-time Notice Box */}
        <div className="mt-10 p-5 rounded-xl border border-slate-800 bg-defyra-bg/80 flex items-center justify-between flex-wrap gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-defyra-cyan" />
            <span>Guaranteed Non-Destructive Testing: Dual-confirmation required for production environments.</span>
          </div>
          <div className="text-defyra-textSubtle">
            Workflow Standard v0.1 • MARKEET TECHNOLOGIES PRIVATE LIMITED
          </div>
        </div>
      </Container>
    </section>
  );
}
