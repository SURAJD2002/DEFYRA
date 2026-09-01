import React from 'react';
import { Bot, Wrench, Key, Database, AlertCircle, ArrowUpRight, ShieldAlert, Cpu } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function ProblemSection() {
  const problems = [
    {
      icon: Bot,
      title: 'From Generating Answers to Taking Actions',
      description:
        'Yesterday, AI generated passive text. Today, autonomous agents execute shell scripts, invoke internal APIs, modify databases, and dispatch financial transactions.',
    },
    {
      icon: Wrench,
      title: 'Unchecked Tool & Capability Abuse',
      description:
        'When an agent is given tool execution rights (Python REPL, SQL execution, file access), a single indirect prompt injection can hijack the tool call with full machine authority.',
    },
    {
      icon: Database,
      title: 'Cross-Tenant Memory & RAG Bleed',
      description:
        'Autonomous agents maintain persistent memory and semantic vector caches. Without cryptographic tenant boundaries, private context easily bleeds across sessions.',
    },
    {
      icon: Key,
      title: 'Delegated Identity & Superuser Sprawl',
      description:
        'Agents frequently run with high-privilege service credentials. If an agent is coerced, the attacker inherits those credentials without triggering standard perimeter alerts.',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-b border-defyra-border/50 bg-defyra-surface/30">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <Badge variant="purple" size="sm">
            The Agentic Paradigm Shift
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            The Agentic Security Problem
          </h2>
          <p className="text-sm sm:text-base text-defyra-textMuted leading-relaxed">
            AI is moving from generating text to orchestrating enterprise systems. As autonomy increases, perimeter defenses become blind to reasoning-level exploits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((prob, i) => {
            const Icon = prob.icon;
            return (
              <Card key={i} className="border-defyra-border bg-defyra-card/70 hover:border-defyra-cyan/40 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-defyra-cyan">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">{prob.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-defyra-textMuted leading-relaxed pl-1">
                    {prob.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* The Core DEFYRA Solution Banner */}
        <div className="mt-12 rounded-2xl border border-defyra-cyan/30 bg-gradient-to-r from-cyan-950/40 via-defyra-surface to-indigo-950/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <ShieldAlert className="h-5 w-5 text-defyra-cyan" />
              DEFYRA Validates What Actually Happens When AI Acts
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              We do not just evaluate chatbot toxicity. We execute scoped, authorized security tests to prove whether your agents can be tricked into exceeding their intended authority.
            </p>
          </div>
          <div className="font-mono text-xs text-defyra-cyan font-semibold shrink-0 uppercase tracking-wider bg-defyra-bg px-4 py-2 rounded-lg border border-defyra-border">
            PROVE. PROTECT. TRUST.
          </div>
        </div>
      </Container>
    </section>
  );
}
