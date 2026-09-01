import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Bot, Key, ShieldCheck, ArrowRight, Lock, Wrench, AlertTriangle, Layers } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Agent Security & Authorization Assessment | DEFYRA',
  description:
    'Validate autonomous AI agents, tool invocation boundaries, identity delegation, and blast-radius controls.',
};

export default function AgentSecurityPage() {
  return (
    <div className="py-16 md:py-24 space-y-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              Agentic Era Defense
            </Badge>
            <span className="font-mono text-xs text-defyra-textSubtle uppercase">
              DEFYRA Agent Guard
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Agent Security & Authorization Assessment
          </h1>
          <p className="text-base sm:text-lg text-defyra-textMuted leading-relaxed">
            Autonomous agents act as automated operators inside your cloud infrastructure. DEFYRA validates whether their decisions, delegated identities, and execution loops are safely bounded.
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <Button variant="accent" size="md" className="font-mono text-xs">
                Request Agent Security Audit
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Security Domains */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <Card className="border-defyra-border bg-defyra-card">
            <CardHeader className="p-6 pb-2">
              <div className="p-2.5 rounded-lg bg-cyan-950/40 text-defyra-cyan w-fit mb-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-white">Excessive Agency & Runaway Loops</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-3 text-xs text-slate-300">
              <p>
                Agents operating across multiple sub-agents can enter unconstrained recursive execution loops or execute irreversible business actions without human oversight.
              </p>
              <ul className="space-y-1.5 text-defyra-textMuted">
                <li>• Verification of hard compute & cost budget circuit breakers</li>
                <li>• Human-In-The-Loop (HITL) mandatory approval enforcement</li>
                <li>• Blast radius containment for database mutations</li>
              </ul>
            </CardContent>
          </Card>

          <Card id="identity" className="border-defyra-border bg-defyra-card scroll-mt-24">
            <CardHeader className="p-6 pb-2">
              <div className="p-2.5 rounded-lg bg-cyan-950/40 text-defyra-cyan w-fit mb-2">
                <Key className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-white">Delegated Identity & Token Binding</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-3 text-xs text-slate-300">
              <p>
                How do your microservices know whether an API request came from a legitimate user or a compromised agent impersonating an administrator?
              </p>
              <ul className="space-y-1.5 text-defyra-textMuted">
                <li>• Cryptographic token scoping vs static superuser credentials</li>
                <li>• Insecure Direct Object Reference (IDOR) probing via tool parameters</li>
                <li>• Least-privilege validation across multi-agent swarms</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
