'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertOctagon, ExternalLink, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FindingRecord, Assessment } from '@/types';

export default function AssessmentFindingsPage({ params }: { params: { id: string } }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [asmRes, findRes] = await Promise.all([
        fetch(`/api/v1/assessments/${params.id}`),
        fetch(`/api/v1/assessments/${params.id}/findings`),
      ]);
      const asmData = await asmRes.json();
      if (asmData.success) setAssessment(asmData.data);

      const findData = await findRes.json();
      if (findData.success) setFindings(findData.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/assessments/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Assessment
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-mono text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Assessment Findings: {assessment?.name || params.id}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              Validated security vulnerabilities and candidate observations.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="font-mono">
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {findings.length === 0 ? (
        <Card className="border-border/60 bg-card/40 p-8 text-center">
          <p className="text-muted-foreground font-mono">No findings recorded for this assessment yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {findings.map((f) => (
            <Card key={f.id} className="border-border/60 bg-card/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'rose' : 'amber'}>
                      {f.severity}
                    </Badge>
                    <Badge variant="slate" className="font-mono text-xs">
                      {f.testId}
                    </Badge>
                    <Badge variant="cyan" className="font-mono text-xs">
                      Status: {f.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-mono">{f.title}</CardTitle>
                </div>
                <Link href={`/dashboard/findings/${f.id}`}>
                  <Button variant="outline" size="sm" className="font-mono">
                    Inspect & Review
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2 text-sm font-mono text-muted-foreground">
                <p>{f.description}</p>
                <div className="text-xs flex gap-6 pt-2 border-t border-border/40">
                  <span>Risk Score: <strong className="text-foreground">{f.riskScore} / 10.0</strong></span>
                  <span>Confidence: <strong className="text-foreground">{(f.confidence * 100).toFixed(0)}%</strong></span>
                  <span>Evidence Records: <strong className="text-foreground">{f.evidenceIds.length}</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
