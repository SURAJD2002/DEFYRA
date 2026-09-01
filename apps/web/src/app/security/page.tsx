import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Mail, Key } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Responsible Disclosure & Security | DEFYRA',
  description: 'DEFYRA Responsible Disclosure Policy and Security Commitments.',
};

export default function SecurityPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8 text-slate-300">
          <div className="space-y-3">
            <Badge variant="cyan" size="sm">Security Posture</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Responsible Disclosure Policy</h1>
            <p className="text-xs font-mono text-defyra-textSubtle">
              DEFYRA • Operated by MARKEET TECHNOLOGIES PRIVATE LIMITED
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Our Commitment to Security</h2>
              <p>
                DEFYRA treats application security as an existential priority. We welcome responsible security researchers to report potential vulnerabilities in our web platform and infrastructure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. Reporting Guidelines</h2>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-defyra-cyan font-bold">•</span>
                  <span>Notify us promptly upon discovering any security issue.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-defyra-cyan font-bold">•</span>
                  <span>Do not access, modify, or destroy client data or operational systems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-defyra-cyan font-bold">•</span>
                  <span>Provide adequate detail and reproduction steps to allow us to verify the issue.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-defyra-cyan font-bold">•</span>
                  <span>Allow us reasonable time to remediate before public disclosure.</span>
                </li>
              </ul>
            </section>

            <div className="p-6 rounded-xl border border-defyra-border bg-defyra-surface space-y-2">
              <div className="flex items-center gap-2 text-defyra-cyan font-mono text-xs font-semibold">
                <Mail className="h-4 w-4" />
                <span>Security Point of Contact</span>
              </div>
              <p className="text-xs text-slate-300">
                Please transmit encrypted vulnerability reports to: <code className="text-defyra-cyan font-mono">security@defyra.ai</code>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
