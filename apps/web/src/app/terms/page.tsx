import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | DEFYRA',
  description: 'Terms of Service for DEFYRA AI Security Validation.',
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8 text-slate-300">
          <div className="space-y-3">
            <Badge variant="slate" size="sm">Legal & Governance</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-xs font-mono text-defyra-textSubtle">
              Last Updated: September 1, 2026 • Commercial entity: MARKEET TECHNOLOGIES PRIVATE LIMITED
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-600/40 bg-amber-950/20 text-xs text-amber-300 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Counsel Review Notice:</strong> These terms represent the V0.1 foundational operational agreement. Specific statements of work (SOW) govern enterprise engagements.
            </span>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">1. Authorized Testing Boundary</h2>
              <p>
                All security validation and red teaming activities are strictly constrained to client-authorized assets, environments, and IP ranges explicitly demarcated in signed assessment scopes. Unauthorized target execution is prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">2. Point-in-Time Assurance & Limitations</h2>
              <p>
                Technical reports reflect system posture solely at the specific point in time and under the explicit methodology and threat models evaluated. No security validation guarantees 100% immunity against future unknown vulnerabilities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">3. Commercial Operating Entity</h2>
              <p>
                All services, deliverables, warranties, and liability limitations are entered into with MARKEET TECHNOLOGIES PRIVATE LIMITED.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
