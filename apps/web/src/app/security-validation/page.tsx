import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, CheckCircle2, ArrowRight, Database, Wrench, Lock, Activity, Server } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'AI Security Validation & Assurance | DEFYRA',
  description:
    'Evidence-based security validation for enterprise AI models, RAG pipelines, tool execution environments, and autonomous agents.',
};

export default function SecurityValidationPage() {
  return (
    <div className="py-16 md:py-24 space-y-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              Core Discipline
            </Badge>
            <span className="font-mono text-xs text-defyra-textSubtle uppercase">
              DEFYRA Assurance
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI Security Validation & Assurance
          </h1>
          <p className="text-base sm:text-lg text-defyra-textMuted leading-relaxed">
            Move beyond subjective evaluations. DEFYRA executes calibrated, authorized security tests to mathematically prove whether your AI systems remain bounded, isolated, and resilient under adversarial conditions.
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <Button variant="accent" size="md" className="font-mono text-xs">
                Schedule Validation Assessment
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Validation Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          {/* RAG & Memory */}
          <div id="rag-memory" className="scroll-mt-24">
            <Card className="border-defyra-border bg-defyra-card h-full">
              <CardHeader className="p-6 pb-3">
                <div className="p-2.5 rounded-lg bg-defyra-surface w-fit text-defyra-cyan mb-2">
                  <Database className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl text-white">
                  RAG & Memory Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-4 text-xs text-slate-300">
                <p>
                  Retrieval-Augmented Generation (RAG) introduces massive unvalidated data streams into the LLM context. We validate:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-defyra-cyan font-bold">•</span>
                    <span><strong>Indirect Prompt Injection</strong> in retrieved web content, PDFs, and database chunks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-defyra-cyan font-bold">•</span>
                    <span><strong>Cross-Tenant ACL Filtering Bypass</strong> in multi-tenant vector databases.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-defyra-cyan font-bold">•</span>
                    <span><strong>Persistent Semantic Memory Poisoning</strong> across agent conversation threads.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Tools & APIs */}
          <div id="tool-apis" className="scroll-mt-24">
            <Card className="border-defyra-border bg-defyra-card h-full">
              <CardHeader className="p-6 pb-3">
                <div className="p-2.5 rounded-lg bg-defyra-surface w-fit text-defyra-cyan mb-2">
                  <Wrench className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl text-white">
                  Tool Execution & API Authorization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-4 text-xs text-slate-300">
                <p>
                  When LLMs invoke code and APIs, standard security boundaries can break down. We test:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-defyra-cyan font-bold">•</span>
                    <span><strong>Sandbox Breakouts</strong> in Python REPL, Bash execution, and container wrappers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-defyra-cyan font-bold">•</span>
                    <span><strong>SSRF Probing</strong> via web-fetching and scraper tools toward internal metadata.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-defyra-cyan font-bold">•</span>
                    <span><strong>Server-Side Capability Enforcement</strong> vs relying on LLM to obey instructions.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continuous Assurance */}
        <div id="continuous" className="mt-12 p-8 rounded-2xl border border-defyra-border bg-defyra-surface/60 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
            <Activity className="h-4 w-4" />
            <span>Continuous AI Security Assurance</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Automated Regression Gates for Model & Prompt Updates</h3>
          <p className="text-sm text-defyra-textMuted max-w-3xl leading-relaxed">
            AI vulnerabilities often re-emerge whenever a model weight updates, system prompts change, or new tools are added. DEFYRA creates continuous validation gates ensuring every deployment is regression-tested against previously proven threat vectors.
          </p>
        </div>
      </Container>
    </div>
  );
}
