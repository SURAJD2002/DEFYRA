import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';

export function CtaSection() {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-defyra-bg via-defyra-surface to-defyra-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-defyra-cyan/10 blur-[140px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl border border-defyra-cyan/40 bg-gradient-to-b from-defyra-card/90 to-[#070D1B]/95 p-8 sm:p-14 text-center space-y-8 shadow-2xl backdrop-blur-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono text-xs font-semibold">
            <Lock className="h-3.5 w-3.5 text-defyra-cyan" />
            <span>Authorized Security Assessments</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Validate Your AI System&apos;s Security Posture?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Schedule a technical consultation and scoped AI Security Validation assessment with the DEFYRA engineering team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="accent" className="w-full sm:w-auto font-mono text-sm px-8">
                Request an AI Security Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/security-validation" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-mono text-sm px-6">
                Review Assessment Scope
              </Button>
            </Link>
          </div>

          <p className="text-[11px] font-mono text-defyra-textSubtle pt-2">
            Commercial security evaluations operated by <strong>MARKEET TECHNOLOGIES PRIVATE LIMITED</strong>.
          </p>
        </div>
      </Container>
    </section>
  );
}
