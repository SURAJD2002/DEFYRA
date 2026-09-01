import React from 'react';
import { Metadata } from 'next';
import { Shield, Lock, CheckCircle2, Building, Terminal } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About DEFYRA | AI Security & Cyber Defense',
  description:
    'DEFYRA is operated by MARKEET TECHNOLOGIES PRIVATE LIMITED, validating autonomous AI systems and agentic workflows under the principle: PROVE. PROTECT. TRUST.',
};

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24 space-y-16">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              Corporate & Mission
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            About DEFYRA
          </h1>
          <p className="text-base sm:text-lg text-defyra-textMuted leading-relaxed">
            Securing the transition from informational AI to autonomous agentic action.
          </p>
        </div>

        {/* Core Philosophy Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card className="border-defyra-border bg-defyra-card p-6 space-y-3">
            <div className="font-mono text-xs font-bold text-defyra-cyan uppercase tracking-wider">
              01. PROVE
            </div>
            <h3 className="text-lg font-semibold text-white">Evidence-Driven Proof</h3>
            <p className="text-xs text-defyra-textMuted leading-relaxed">
              We reject unsubstantiated security claims. Every validation produces tamper-evident technical artifacts, cryptographic hashes, and exact reproduction steps.
            </p>
          </Card>

          <Card className="border-defyra-border bg-defyra-card p-6 space-y-3">
            <div className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">
              02. PROTECT
            </div>
            <h3 className="text-lg font-semibold text-white">Full-Chain Defense</h3>
            <p className="text-xs text-defyra-textMuted leading-relaxed">
              From the user prompt to API execution, tool sandboxing, and database mutations, we engineer robust protection boundaries at every layer of the agent lifecycle.
            </p>
          </Card>

          <Card className="border-defyra-border bg-defyra-card p-6 space-y-3">
            <div className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
              03. TRUST
            </div>
            <h3 className="text-lg font-semibold text-white">Earned Enterprise Trust</h3>
            <p className="text-xs text-defyra-textMuted leading-relaxed">
              By providing rigorous assurance and point-in-time validation, we empower engineering leaders to confidently deploy autonomous AI systems into production.
            </p>
          </Card>
        </div>

        {/* Operating Entity Details */}
        <div className="p-8 rounded-2xl border border-defyra-border bg-defyra-surface/60 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-defyra-surface border border-defyra-border text-defyra-cyan">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Commercial & Legal Identity</h3>
              <p className="text-xs font-mono text-defyra-textSubtle">
                Operating entity disclosure
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-w-3xl">
            <p>
              <strong>DEFYRA</strong> is a specialized cybersecurity product and commercial brand owned and operated by <strong className="text-white">MARKEET TECHNOLOGIES PRIVATE LIMITED</strong>.
            </p>
            <p className="text-defyra-textMuted">
              All commercial contracts, security validation engagements, mutual non-disclosure agreements, and point-in-time technical reports are formally executed under Markeet Technologies Private Limited.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
