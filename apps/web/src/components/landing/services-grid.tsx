import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Flame,
  Bot,
  Database,
  Wrench,
  KeyRound,
  Server,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface ServiceItem {
  id: string;
  title: string;
  category: 'Validation' | 'Assessment' | 'Research' | 'Platform Pipeline';
  badgeVariant: 'cyan' | 'purple' | 'emerald' | 'amber';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  deliverables: string[];
  href: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'ai-security-validation',
    title: 'AI Security Validation',
    category: 'Validation',
    badgeVariant: 'cyan',
    icon: ShieldCheck,
    description:
      'Rigorous, evidence-backed security validation to verify whether deployed AI models and systems adhere to explicit safety and isolation constraints.',
    deliverables: ['Scope boundary verification', 'SHA-256 evidence chain', 'RiskModel v0.1 analysis'],
    href: '/security-validation',
  },
  {
    id: 'ai-red-teaming',
    title: 'Adversarial AI Red Teaming',
    category: 'Assessment',
    badgeVariant: 'purple',
    icon: Flame,
    description:
      'Expert-led and automated adversarial simulation probing for prompt overrides, jailbreaks, logic evasion, and multi-turn manipulation.',
    deliverables: ['Custom jailbreak taxonomy', 'Model boundary stress test', 'Exploit recreation traces'],
    href: '/ai-red-teaming',
  },
  {
    id: 'agent-security-assessment',
    title: 'Agent Security Assessment',
    category: 'Assessment',
    badgeVariant: 'purple',
    icon: Bot,
    description:
      'Targeted validation of autonomous agent decision loops, preventing excessive agency, runaway delegation, and unconstrained action execution.',
    deliverables: ['Autonomous loop limits', 'Sub-agent delegation audit', 'Blast radius scoring'],
    href: '/agent-security',
  },
  {
    id: 'rag-memory-security',
    title: 'RAG & Memory Security Testing',
    category: 'Validation',
    badgeVariant: 'cyan',
    icon: Database,
    description:
      'Ensuring vector databases, semantic caches, and long-term memory stores are immune to context poisoning, ACL bypass, and tenant bleed.',
    deliverables: ['Vector injection fuzzing', 'Cross-tenant bleed tests', 'Memory tampering audit'],
    href: '/security-validation#rag-memory',
  },
  {
    id: 'tool-api-security',
    title: 'Tool & API Security Validation',
    category: 'Validation',
    badgeVariant: 'cyan',
    icon: Wrench,
    description:
      'Testing the boundary between LLM reasoning and code execution. Probing function-calling endpoints, REPLs, and backend microservices.',
    deliverables: ['Sandbox breakout testing', 'SSRF egress filtering audit', 'Parameter injection tests'],
    href: '/security-validation#tool-apis',
  },
  {
    id: 'agent-identity-auth',
    title: 'Agent Identity & Authorization',
    category: 'Assessment',
    badgeVariant: 'purple',
    icon: KeyRound,
    description:
      'Validating that agent service accounts, OAuth tokens, and delegated credentials enforce least privilege and resist identity forgery.',
    deliverables: ['Credential scoping audit', 'HITL approval validation', 'IDOR boundary testing'],
    href: '/agent-security#identity',
  },
  {
    id: 'mcp-security-testing',
    title: 'Model Context Protocol (MCP) Testing',
    category: 'Research',
    badgeVariant: 'amber',
    icon: Server,
    description:
      'Deep security evaluation of MCP servers, client handshakes, tool manifests, resource spoofing, and capability declarations.',
    deliverables: ['MCP manifest audit', 'Host OS capability containment', 'Protocol spoofing tests'],
    href: '/research#mcp',
  },
  {
    id: 'continuous-ai-validation',
    title: 'Continuous AI Security Validation',
    category: 'Platform Pipeline',
    badgeVariant: 'emerald',
    icon: Activity,
    description:
      'Automated CI/CD security gatekeeper testing new agent prompts, tools, and model weights against regression test suites prior to deployment.',
    deliverables: ['Automated retest pipeline', 'Drift & regression alerts', 'Compliance audit exports'],
    href: '/security-validation#continuous',
  },
];

export function ServicesGrid() {
  return (
    <section className="py-20 md:py-28 border-b border-defyra-border/50 bg-defyra-bg">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <Badge variant="cyan" size="sm">
            Validation & Assurance Portfolio
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Cybersecurity Services Engineered for AI
          </h2>
          <p className="text-sm sm:text-base text-defyra-textMuted leading-relaxed">
            DEFYRA provides specialized security validation and red teaming designed specifically for the unique vulnerabilities of modern AI systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                className="flex flex-col justify-between border-defyra-border bg-defyra-card hover:border-defyra-cyan/50 hover:shadow-xl hover:shadow-cyan-950/20 transition-all group"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-lg bg-defyra-surface border border-defyra-border text-defyra-cyan group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant={service.badgeVariant} size="sm">
                        {service.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base text-white group-hover:text-defyra-cyan transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <p className="text-xs text-defyra-textMuted leading-relaxed">
                      {service.description}
                    </p>
                    <div className="pt-2 border-t border-defyra-border/40 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-defyra-textSubtle block">
                        Key Deliverables
                      </span>
                      {service.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <span className="h-1 w-1 rounded-full bg-defyra-cyan" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="p-5 pt-0 mt-auto">
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-1 text-xs font-mono font-medium text-defyra-cyan hover:text-cyan-300 transition-colors"
                  >
                    <span>Explore Methodology</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
