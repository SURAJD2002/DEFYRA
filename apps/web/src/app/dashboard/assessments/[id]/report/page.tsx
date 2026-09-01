'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, Shield, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecurityReport, Assessment } from '@/types';

export default function AssessmentReportPage({ params }: { params: { id: string } }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/assessments/${params.id}`),
      fetch(`/api/v1/assessments/${params.id}/report`),
    ])
      .then(async ([asmRes, repRes]) => {
        const asmData = await asmRes.json();
        if (asmData.success) setAssessment(asmData.data);
        const repData = await repRes.json();
        if (repData.success) setReport(repData.data);
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/assessments/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Assessment
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
            Security Assessment Report
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Cryptographically sealed assurance report with SHA-256 integrity hash.
          </p>
        </div>
      </div>

      {!report ? (
        <Card className="border-border/60 bg-card/40 p-8 text-center">
          <p className="text-muted-foreground font-mono">
            No report generated yet. Generate the final assessment report from the assessment workspace after test execution and review.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-border/60 bg-card/40 font-mono">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <Badge variant="cyan">
                  Status: GENERATED
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground pt-1">Report ID: {report.id}</p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div className="p-3 bg-muted/20 rounded border border-border/40 text-xs">
                <span className="text-muted-foreground">SHA-256 Point-in-Time Report Integrity Hash:</span>
                <p className="text-primary font-bold break-all mt-0.5">{report.reportHash}</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-1">1. Executive Summary</h4>
                <p className="text-muted-foreground">{report.content.executiveSummary}</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-1">2. Methodology & Scope</h4>
                <p className="text-muted-foreground">{report.content.methodology}</p>
                <p className="text-muted-foreground mt-1">{report.content.scopeSummary}</p>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-1">3. Residual Risk & Assessment Conclusion</h4>
                <p className="text-muted-foreground">{report.content.conclusion}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
