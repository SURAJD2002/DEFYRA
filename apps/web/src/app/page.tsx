import React from 'react';
import { Hero } from '@/components/landing/hero';
import { ProblemSection } from '@/components/landing/problem-section';
import { AttackPathVisualizer } from '@/components/landing/attack-path-visualizer';
import { ServicesGrid } from '@/components/landing/services-grid';
import { MethodologySection } from '@/components/landing/methodology-section';
import { TestCatalogPreview } from '@/components/landing/test-catalog-preview';
import { EvidenceSection } from '@/components/landing/evidence-section';
import { CtaSection } from '@/components/landing/cta-section';
import { Container } from '@/components/layout/container';

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* 1. Hero */}
      <Hero />

      {/* 2. The Agentic Security Problem */}
      <ProblemSection />

      {/* 3. The Full-Chain AI Attack Path Visualizer */}
      <section id="attack-path" className="py-20 md:py-28 border-b border-defyra-border/50 bg-defyra-bg scroll-mt-20">
        <Container>
          <AttackPathVisualizer />
        </Container>
      </section>

      {/* 4. Validation Services */}
      <ServicesGrid />

      {/* 5. 12-Stage Validation Methodology */}
      <MethodologySection />

      {/* 6. Comprehensive AI Test Catalog Matrix */}
      <TestCatalogPreview />

      {/* 7. Evidence-Driven Assurance & Retest */}
      <EvidenceSection />

      {/* 8. Call to Action */}
      <CtaSection />
    </div>
  );
}
