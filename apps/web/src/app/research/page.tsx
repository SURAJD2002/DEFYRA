import React from 'react';
import { Metadata } from 'next';
import { Terminal, Server, Shield, FileText, Lock, ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'AI Threat Research & Vulnerability Intel | DEFYRA',
  description:
    'Research publications, Model Context Protocol (MCP) vulnerability analyses, and agentic attack vector taxonomies from DEFYRA.',
};

export default function ResearchPage() {
  return (
    <div className="py-16 md:py-24 space-y-16">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">
              Threat Intelligence
            </Badge>
            <span className="font-mono text-xs text-defyra-textSubtle uppercase">
              DEFYRA Research Lab
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI Threat Research & Attack Vector Taxonomies
          </h1>
          <p className="text-base sm:text-lg text-defyra-textMuted leading-relaxed">
            Investigating emerging failure modes in agentic systems, Model Context Protocol (MCP) implementations, and multi-tenant reasoning architectures.
          </p>
        </div>

        {/* Featured Research Briefs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* MCP Protocol Security */}
          <div id="mcp" className="scroll-mt-24">
            <Card className="border-defyra-border bg-defyra-card h-full">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="amber" size="sm">
                    Protocol Brief
                  </Badge>
                  <span className="font-mono text-[11px] text-slate-400">DEF-RES-2026-01</span>
                </div>
                <CardTitle className="text-xl text-white">
                  Model Context Protocol (MCP) Security & Host Isolation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3 text-xs text-defyra-textMuted leading-relaxed">
                <p>
                  As MCP standardizes how AI agents interface with local servers and developer environments, malicious MCP tool manifests and unconstrained protocol capabilities introduce severe host privilege escalation vectors.
                </p>
                <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border font-mono text-[11px] text-slate-300">
                  Key Focus: Manifest integrity verification, dynamic capability sandboxing, and resource URI spoofing defenses.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Attack Vector Taxonomy */}
          <div id="methodology" className="scroll-mt-24">
            <Card className="border-defyra-border bg-defyra-card h-full">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="cyan" size="sm">
                    Taxonomy Standard
                  </Badge>
                  <span className="font-mono text-[11px] text-slate-400">DEF-TAX-v0.1</span>
                </div>
                <CardTitle className="text-xl text-white">
                  Agentic Attack Path Taxonomy (10-Stage Model)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3 text-xs text-defyra-textMuted leading-relaxed">
                <p>
                  A comprehensive mapping of agentic vulnerabilities across the ingestion layer, reasoning engine, memory stores, tool wrappers, identity delegation, and backend systems.
                </p>
                <div className="p-3 rounded-lg bg-defyra-bg border border-defyra-border font-mono text-[11px] text-slate-300">
                  Key Focus: Measurable validation criteria for OWASP LLM Top 10 and real-world autonomous tool execution.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
