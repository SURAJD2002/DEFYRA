import React from 'react';
import { Lock, FileCheck2, RefreshCw, BarChart3, Shield, Check } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function EvidenceSection() {
  const pillars = [
    {
      icon: Lock,
      title: 'Cryptographic SHA-256 Proof',
      desc: 'All captured payloads, network traces, tool execution parameters, and model outputs are hashed upon collection and cryptographically sealed.',
    },
    {
      icon: BarChart3,
      title: 'DEFYRA RiskModel v0.1',
      desc: 'Transparent multi-factor scoring factoring in blast radius, agent autonomy, data sensitivity, and privilege level. Zero fake 100% security scores.',
    },
    {
      icon: RefreshCw,
      title: 'Automated Retest Lifecycle',
      desc: 'Once remediations are deployed, rerun exact regression payloads to verify and prove vulnerability resolution before production signing.',
    },
    {
      icon: FileCheck2,
      title: 'Point-in-Time Assurance Reports',
      desc: 'Executive and technical reports complete with scope boundaries, tested methodology, reproduction steps, and verifiable evidence references.',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-b border-defyra-border/50 bg-defyra-surface/30">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Description */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="cyan" size="sm">
              Indisputable Proof
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Evidence-Driven Security. Not Subjective Claims.
            </h2>
            <p className="text-sm sm:text-base text-defyra-textMuted leading-relaxed">
              DEFYRA stands on the principle of <strong className="text-white">PROVE. PROTECT. TRUST.</strong> We replace hand-waving assertions with tamper-evident technical artifacts that engineering and executive leadership can rely on.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Immutable audit trails for compliance (SOC 2, ISO 27001, EU AI Act)',
                'Zero client credentials stored in evidence traces',
                'Point-in-time boundaries clearly demarcated',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Pillars Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Card key={idx} className="border-defyra-border bg-defyra-card/80 p-5 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-defyra-surface border border-defyra-border text-defyra-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{pillar.title}</h4>
                  <p className="text-xs text-defyra-textMuted leading-relaxed">{pillar.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
