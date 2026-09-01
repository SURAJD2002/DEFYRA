import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { AssessmentRequestForm } from '@/components/forms/assessment-request-form';

export const metadata: Metadata = {
  title: 'Request an AI Security Assessment | DEFYRA',
  description:
    'Contact DEFYRA to schedule a scoped AI Security Validation, Red Teaming, or Agent Authorization assessment.',
};

export default function ContactPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Initiate Scoped Security Assessment
            </h1>
            <p className="text-sm sm:text-base text-defyra-textMuted max-w-xl mx-auto leading-relaxed">
              Submit your AI architecture scope for review. All engagements are conducted under mutual NDA within strictly authorized boundaries.
            </p>
          </div>

          <AssessmentRequestForm />
        </div>
      </Container>
    </div>
  );
}
