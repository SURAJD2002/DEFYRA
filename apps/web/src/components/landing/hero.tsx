import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Terminal, Cpu, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-defyra-border/50">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-defyra-cyan/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[300px] bg-defyra-indigo/10 blur-[120px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Top Pill Descriptor */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-defyra-surface border border-defyra-border shadow-md">
            <span className="flex h-2 w-2 rounded-full bg-defyra-cyan animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
              DEFYRA • AI SECURITY & CYBER DEFENSE
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              SECURING THE <br className="hidden sm:inline" />
              <span className="text-gradient-cyan">FUTURE OF AI.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              We help organizations identify, validate and reduce risks in AI systems, agents and workflows.
            </p>
          </div>

          {/* Principle & Promise Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Badge variant="cyan" size="sm" className="px-3 py-1">
              Principle: PROVE. PROTECT. TRUST.
            </Badge>
            <Badge variant="purple" size="sm" className="px-3 py-1">
              Promise: Prove What AI Can Do.
            </Badge>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="accent" className="w-full sm:w-auto font-mono text-sm px-8">
                Request an AI Security Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="#attack-path" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-mono text-sm px-6">
                Explore Our Approach
              </Button>
            </Link>
          </div>

          {/* Terminal / Live Validation Snapshot Preview */}
          <div className="pt-8 max-w-2xl mx-auto text-left">
            <div className="rounded-xl border border-defyra-border bg-defyra-surface/90 shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-defyra-border">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">defyra-audit-stream // v0.1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-defyra-cyan bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    SCOPED ASSURANCE
                  </span>
                </div>
              </div>
              <div className="p-4 font-mono text-xs text-slate-300 space-y-2 leading-relaxed bg-[#050914]/90">
                <div className="text-slate-400">
                  <span className="text-defyra-cyan">$</span> defyra validate --target agent-runtime-01 --scope strict
                </div>
                <div className="text-slate-400 text-[11px]">
                  [+] Verifying tenant authorization: <span className="text-emerald-400">OK</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  [+] Validating tool sandbox permissions: <span className="text-defyra-cyan">14 boundaries checked</span>
                </div>
                <div className="text-slate-300 text-[11px] pl-3 border-l-2 border-amber-500/60">
                  <span className="text-amber-400 font-semibold">[OBSERVATION]</span> Indirect prompt injection attempted tool escalation.
                  <br />
                  <span className="text-slate-400">→ Intercepted by DEFYRA Execution Boundary. Evidence SHA256: 8f9a2b...</span>
                </div>
                <div className="text-emerald-400 text-[11px] pt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Validation Completed: Point-in-time assurance evidence captured.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
