import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Flame, ShieldAlert, ArrowRight, Target, Crosshair, Terminal } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Adversarial AI Red Teaming | DEFYRA',
  description:
    'Simulate sophisticated real-world adversaries to uncover prompt injection vulnerabilities, jailbreaks, and reasoning bypasses.',
};

export default function AiRedTeamingPage() {
  return (
    <div className="py-16 md:py-24 space-y-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">
              Adversarial Simulation
            </Badge>
            <span className="font-mono text-xs text-defyra-textSubtle uppercase">
              DEFYRA Red Team
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Adversarial AI Red Teaming
          </h1>
          <p className="text-base sm:text-lg text-defyra-textMuted leading-relaxed">
            Automated guardrails and naive filters fail against adaptive attackers. DEFYRA blends specialized adversarial testing techniques with deep AI attack surface analysis to stress-test your AI systems before adversaries do.
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <Button variant="accent" size="md" className="font-mono text-xs">
                Request AI Red Team Scoping
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Vectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Card className="border-defyra-border bg-defyra-card">
            <CardHeader className="p-6 pb-2">
              <div className="p-2.5 rounded-lg bg-indigo-950/40 text-defyra-violet w-fit mb-2">
                <Target className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white">Multi-Turn Jailbreaks</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-defyra-textMuted leading-relaxed">
              Adversaries rarely exploit models in a single prompt. We probe conversational drift, persuasion chains, context exhaustion, and persona shifts across prolonged multi-turn sessions.
            </CardContent>
          </Card>

          <Card className="border-defyra-border bg-defyra-card">
            <CardHeader className="p-6 pb-2">
              <div className="p-2.5 rounded-lg bg-indigo-950/40 text-defyra-violet w-fit mb-2">
                <Crosshair className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white">Semantic Evasion</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-defyra-textMuted leading-relaxed">
              Testing model resilience against obfuscation, cipher encodings (Base64, Rot13, Unicode homoglyphs, low-resource languages), and token perturbation bypasses.
            </CardContent>
          </Card>

          <Card className="border-defyra-border bg-defyra-card">
            <CardHeader className="p-6 pb-2">
              <div className="p-2.5 rounded-lg bg-indigo-950/40 text-defyra-violet w-fit mb-2">
                <Terminal className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white">System Prompt Extraction</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-defyra-textMuted leading-relaxed">
              Evaluating how easily internal business logic, proprietary prompts, hidden developer rules, and embedded API token hints can be exfiltrated.
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
