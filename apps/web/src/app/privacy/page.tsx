import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | DEFYRA',
  description: 'Privacy Policy and Data Protection standards for DEFYRA.',
};

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8 text-slate-300">
          <div className="space-y-3">
            <Badge variant="slate" size="sm">Legal & Governance</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-xs font-mono text-defyra-textSubtle">
              Last Updated: September 1, 2026 • Operated by MARKEET TECHNOLOGIES PRIVATE LIMITED
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-600/40 bg-amber-950/20 text-xs text-amber-300 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Counsel Review Notice:</strong> This privacy policy constitutes the V0.1 architectural baseline. Final legal counsel review is conducted prior to production commercial signing.
            </span>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">1. Scope of Data Ingestion</h2>
              <p>
                DEFYRA processes business contact information submitted through authorized inquiry forms solely to evaluate and coordinate technical security assessments. We do not sell or monetize client data.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">2. Assessment Evidence & Telemetry</h2>
              <p>
                Technical artifacts, network logs, and model output traces captured during security validation are isolated in tenant-partitioned object storage with SHA-256 integrity verification. Access is restricted to authorized security leads under mutual NDA.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white">3. Zero Secret Storage Principle</h2>
              <p>
                DEFYRA strictly prohibits and scrubs production secrets, client credentials, API keys, and personal financial identifiers from test telemetry logs.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
