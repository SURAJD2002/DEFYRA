'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Database,
  Cpu,
  Wrench,
  Key,
  Lock,
  Globe,
  Building,
  AlertTriangle,
  FileCheck,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Stage {
  id: number;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  vulnerabilities: string[];
  validationTechnique: string;
  evidenceCollected: string;
  testIdRef: string;
}

const ATTACK_STAGES: Stage[] = [
  {
    id: 1,
    name: 'Untrusted Input',
    category: 'Ingestion Layer',
    icon: Globe,
    tagline: 'Adversarial payloads, document uploads, web scrapers, user chats',
    vulnerabilities: [
      'Direct prompt injection overrides',
      'Invisible zero-font payload injection in PDFs',
      'Multimodal image-embedded jailbreaks',
    ],
    validationTechnique: 'Systematic semantic perturbation & multi-modal injection sweeps',
    evidenceCollected: 'Raw input stream, tokenized representations, boundary safety logs',
    testIdRef: 'DEF-INJ-001 / DEF-INJ-003',
  },
  {
    id: 2,
    name: 'AI / Agent',
    category: 'Reasoning Engine',
    icon: Cpu,
    tagline: 'LLM reasoning core, prompt planners, decision synthesizers',
    vulnerabilities: [
      'Meta-prompt and system instruction leakage',
      'Persona manipulation and role hijacking',
      'Guardrail bypass via multi-turn persuasion',
    ],
    validationTechnique: 'Adversarial red teaming & reasoning boundary extraction',
    evidenceCollected: 'Step-by-step reasoning tokens, temperature drift logs, guardrail scores',
    testIdRef: 'DEF-DAT-001 / DEF-IDN-001',
  },
  {
    id: 3,
    name: 'Context / RAG',
    category: 'Knowledge Retrieval',
    icon: Database,
    tagline: 'Vector databases, enterprise knowledge bases, chunk retrieval',
    vulnerabilities: [
      'Indirect prompt injection via poisoned documents',
      'ACL filtering bypass across confidential indices',
      'Vector semantic collision attacks',
    ],
    validationTechnique: 'Vector injection fuzzing & cross-tenant ACL boundary probing',
    evidenceCollected: 'Retrieved chunk metadata, similarity scores, ACL evaluation traces',
    testIdRef: 'DEF-INJ-002 / DEF-RAG-002',
  },
  {
    id: 4,
    name: 'Memory',
    category: 'State Persistence',
    icon: Zap,
    tagline: 'Semantic cache, short-term session state, long-term memory stores',
    vulnerabilities: [
      'Cross-session memory leakage across tenants',
      'Persistent adversarial memory poisoning',
      'Unauthorized state mutation across sessions',
    ],
    validationTechnique: 'Multi-tenant state isolation testing & memory poison verification',
    evidenceCollected: 'Cross-tenant query traces, persistent memory delta logs',
    testIdRef: 'DEF-DAT-002 / DEF-MEM-001',
  },
  {
    id: 5,
    name: 'Tools',
    category: 'Capability Layer',
    icon: Wrench,
    tagline: 'Function calls, Python REPLs, shell executors, MCP server tools',
    vulnerabilities: [
      'Unbounded filesystem read/write traversal',
      'MCP protocol server capability escalation',
      'Command injection in generated tool arguments',
    ],
    validationTechnique: 'Sandbox containment verification & argument boundary fuzzing',
    evidenceCollected: 'Tool call arguments, container syscall captures, OS sandbox logs',
    testIdRef: 'DEF-AGC-001 / DEF-MCP-001',
  },
  {
    id: 6,
    name: 'Identity',
    category: 'Authentication',
    icon: Key,
    tagline: 'Agent service accounts, OAuth tokens, delegated user identities',
    vulnerabilities: [
      'Agent credential impersonation',
      'Static superuser key leakage in context',
      'Token privilege escalation across microservices',
    ],
    validationTechnique: 'Identity binding audits & ephemeral token scope inspection',
    evidenceCollected: 'Outgoing bearer headers, OAuth scope traces, JWT claim validations',
    testIdRef: 'DEF-IDN-001 / DEF-DAT-003',
  },
  {
    id: 7,
    name: 'Permissions',
    category: 'Authorization',
    icon: Lock,
    tagline: 'Role-based access control, tool allowlists, HITL triggers',
    vulnerabilities: [
      'Client-side permission reliance (skipping server check)',
      'Bypassing Human-In-The-Loop approval gates',
      'Horizontal privilege escalation via tool parameters (IDOR)',
    ],
    validationTechnique: 'Server-side capability testing & authorization matrix fuzzing',
    evidenceCollected: 'Server response codes, RBAC denial records, HITL challenge logs',
    testIdRef: 'DEF-AUT-001 / DEF-AUT-002',
  },
  {
    id: 8,
    name: 'APIs',
    category: 'Integration Boundary',
    icon: Globe,
    tagline: 'Internal REST/gRPC microservices, third-party webhooks',
    vulnerabilities: [
      'Server-Side Request Forgery (SSRF) to cloud metadata',
      'Unauthenticated internal API endpoints',
      'Excessive data exposure in API response models',
    ],
    validationTechnique: 'Egress network filtering audit & private CIDR boundary scans',
    evidenceCollected: 'Egress pcap records, HTTP request/response transcripts',
    testIdRef: 'DEF-API-001 / DEF-API-002',
  },
  {
    id: 9,
    name: 'Business Systems',
    category: 'Target Infrastructure',
    icon: Building,
    tagline: 'CRM, ERP, production databases, payment gateways, code repos',
    vulnerabilities: [
      'Unintended database mutation or DROP executions',
      'Autonomous financial transaction triggering',
      'Code repository tampering or malicious PR submission',
    ],
    validationTechnique: 'Simulated high-impact action barriers & blast radius containment',
    evidenceCollected: 'Database transaction logs, sandbox containment traces',
    testIdRef: 'DEF-AGC-002',
  },
  {
    id: 10,
    name: 'Business Impact',
    category: 'Risk Manifestation',
    icon: AlertTriangle,
    tagline: 'Data exfiltration, financial loss, brand destruction, regulatory fines',
    vulnerabilities: [
      'Catastrophic customer data compromise',
      'Material financial liability',
      'EU AI Act & regulatory compliance violations',
    ],
    validationTechnique: 'Comprehensive risk scoring via DEFYRA RiskModel v0.1',
    evidenceCollected: 'Point-in-time assurance report, cryptographic SHA-256 evidence chain',
    testIdRef: 'DEF-REP-001',
  },
];

export function AttackPathVisualizer() {
  const [selectedStage, setSelectedStage] = useState<Stage>(ATTACK_STAGES[0]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="cyan" size="sm">
          Core Differentiator
        </Badge>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          The Full-Chain AI Attack Path
        </h2>
        <p className="text-sm sm:text-base text-defyra-textMuted leading-relaxed">
          AI security cannot be solved by simple prompt firewalls. DEFYRA validates the complete attack chain from untrusted input down to business impact.
        </p>
      </div>

      {/* Interactive Attack Path Horizontal / Grid Stepper */}
      <div className="overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 min-w-[950px] lg:min-w-0 lg:grid lg:grid-cols-5 xl:grid-cols-10">
          {ATTACK_STAGES.map((stage, idx) => {
            const isSelected = selectedStage.id === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 group ${
                  isSelected
                    ? 'bg-defyra-surfaceHover border-defyra-cyan shadow-lg shadow-cyan-500/10 ring-1 ring-defyra-cyan'
                    : 'bg-defyra-surface/60 border-defyra-border hover:border-slate-600 hover:bg-defyra-surface'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span
                    className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-defyra-cyan text-slate-950'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    0{stage.id}
                  </span>
                  {idx < ATTACK_STAGES.length - 1 && (
                    <ArrowRight className="hidden lg:hidden xl:block h-3 w-3 text-slate-600 -mr-1" />
                  )}
                </div>

                <div
                  className={`p-2 rounded-lg mb-2 transition-transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-cyan-950/80 text-defyra-cyan border border-cyan-700/50'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span
                  className={`text-xs font-medium tracking-tight truncate w-full ${
                    isSelected ? 'text-white font-semibold' : 'text-slate-300'
                  }`}
                >
                  {stage.name}
                </span>
                <span className="text-[9px] font-mono text-defyra-textSubtle truncate w-full mt-0.5">
                  {stage.category}
                </span>

                {isSelected && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-defyra-cyan" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep Dive Card */}
      <Card className="border-defyra-cyan/40 bg-gradient-to-br from-defyra-surface via-defyra-card to-defyra-surface shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <selectedStage.icon className="h-64 w-64 text-white" />
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-defyra-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-800/60 text-defyra-cyan">
                <selectedStage.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-defyra-cyan">
                    STAGE 0{selectedStage.id}
                  </span>
                  <Badge variant="slate" size="sm">
                    {selectedStage.category}
                  </Badge>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {selectedStage.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-defyra-textSubtle">Test Schema Reference:</span>
              <Badge variant="cyan" size="sm">
                {selectedStage.testIdRef}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-slate-300 font-medium">{selectedStage.tagline}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Real-World Vulnerabilities */}
            <div className="space-y-3 p-4 rounded-lg bg-defyra-bg/60 border border-defyra-border">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
                <ShieldAlert className="h-4 w-4" />
                <span>Threat Vectors Tested</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedStage.vulnerabilities.map((v, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Validation Technique */}
            <div className="space-y-3 p-4 rounded-lg bg-defyra-bg/60 border border-defyra-border">
              <div className="flex items-center gap-2 text-defyra-cyan font-mono text-xs font-semibold">
                <FileCheck className="h-4 w-4" />
                <span>DEFYRA Validation Method</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedStage.validationTechnique}
              </p>
            </div>

            {/* Evidence Collected */}
            <div className="space-y-3 p-4 rounded-lg bg-defyra-bg/60 border border-defyra-border">
              <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-semibold">
                <Zap className="h-4 w-4" />
                <span>Evidence & Cryptographic Proof</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedStage.evidenceCollected}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
