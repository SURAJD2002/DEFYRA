'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Send,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contactSubmissionSchema, ContactSubmissionInput } from '@/lib/validation';

export function AssessmentRequestForm() {
  const [formData, setFormData] = useState<ContactSubmissionInput>({
    name: '',
    workEmail: '',
    company: '',
    role: '',
    companySize: '11-50',
    aiSystemType: 'Autonomous Agentic Workflow (Multi-Tool)',
    scopeDescription: '',
    message: '',
    noCredentialsAcknowledged: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    referenceId: string;
    timestamp: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const companySizeOptions = [
    { value: '1-10', label: '1 - 10 employees (Early Stage)' },
    { value: '11-50', label: '11 - 50 employees (Growth)' },
    { value: '51-200', label: '51 - 200 employees (Mid-Market)' },
    { value: '201-1000', label: '201 - 1,000 employees (Enterprise)' },
    { value: '1000+', label: '1,000+ employees (Global Enterprise)' },
  ];

  const aiSystemOptions = [
    { value: 'Autonomous Agentic Workflow (Multi-Tool)', label: 'Autonomous Agentic Workflow (Multi-Tool)' },
    { value: 'RAG & Vector Retrieval Pipeline', label: 'RAG & Vector Retrieval Pipeline' },
    { value: 'Customer-Facing AI / LLM Application', label: 'Customer-Facing AI / LLM Application' },
    { value: 'Model Context Protocol (MCP) Integration', label: 'Model Context Protocol (MCP) Integration' },
    { value: 'Internal Copilot / Developer Agent', label: 'Internal Copilot / Developer Agent' },
    { value: 'Custom Fine-Tuned LLM Service', label: 'Custom Fine-Tuned LLM Service' },
  ];

  const handleChange = (field: keyof ContactSubmissionInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Client-side Zod validation
    const result = contactSubmissionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setServerError(data.error?.message || 'Failed to submit assessment request. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSubmissionSuccess({
        referenceId: data.data.referenceId,
        timestamp: data.meta.timestamp,
      });
    } catch (err) {
      setServerError('Network error while transmitting request. Please verify connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <Card className="border-emerald-700/50 bg-defyra-card/90 shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-600/50 text-emerald-400 mx-auto">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Assessment Request Received</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Our AI security engineering team has received your submission and will review your scope requirements under mutual non-disclosure.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-defyra-bg border border-defyra-border max-w-md mx-auto font-mono text-xs text-left space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-defyra-textSubtle">Inquiry Reference ID:</span>
            <span className="text-defyra-cyan font-bold">{submissionSuccess.referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-defyra-textSubtle">Received Timestamp:</span>
            <span>{submissionSuccess.timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-defyra-textSubtle">Operating Entity:</span>
            <span>MARKEET TECHNOLOGIES PVT LTD</span>
          </div>
        </div>

        <p className="text-xs text-defyra-textSubtle">
          We will contact you via your work email within 1 business day to schedule a scoping interview.
        </p>

        <Button
          variant="outline"
          onClick={() => {
            setSubmissionSuccess(null);
            setFormData({
              name: '',
              workEmail: '',
              company: '',
              role: '',
              companySize: '11-50',
              aiSystemType: 'Autonomous Agentic Workflow (Multi-Tool)',
              scopeDescription: '',
              message: '',
              noCredentialsAcknowledged: false,
            });
          }}
          className="font-mono text-xs"
        >
          Submit Another Request
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-defyra-border bg-defyra-card/90 shadow-2xl backdrop-blur-md">
      <CardHeader className="p-6 sm:p-8 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="cyan" size="sm">
            Engagement Ingestion
          </Badge>
        </div>
        <CardTitle className="text-xl sm:text-2xl text-white">
          Request an AI Security Assessment
        </CardTitle>
        <CardDescription>
          Initiate a technical scoping review for your AI systems, agents, or LLM infrastructure.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
        {/* MANDATORY SECURITY NOTICE BANNER */}
        <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-4 flex items-start gap-3 text-xs text-amber-200 leading-relaxed">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300 uppercase tracking-wide">
              Mandatory Security Notice
            </p>
            <p>
              Do not submit passwords, API keys, credentials, production secrets, or sensitive personal data through this form. Assessment access is arranged only during authorized scoping under signed agreements.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="rounded-xl border border-rose-600/50 bg-rose-950/30 p-4 flex items-start gap-3 text-xs text-rose-300">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="FULL NAME"
              placeholder="e.g. Elena Rostova"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
            />
            <Input
              label="WORK EMAIL"
              type="email"
              placeholder="e.g. elena@company.com"
              value={formData.workEmail}
              onChange={(e) => handleChange('workEmail', e.target.value)}
              error={errors.workEmail}
              helperText="Corporate email required"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="COMPANY / ORGANIZATION"
              placeholder="e.g. Nova Systems Inc."
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              error={errors.company}
              required
            />
            <Input
              label="YOUR ROLE / TITLE"
              placeholder="e.g. CISO / VP of Engineering"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              error={errors.role}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="COMPANY SIZE"
              options={companySizeOptions}
              value={formData.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
              error={errors.companySize}
            />
            <Select
              label="PRIMARY AI SYSTEM TYPE"
              options={aiSystemOptions}
              value={formData.aiSystemType}
              onChange={(e) => handleChange('aiSystemType', e.target.value)}
              error={errors.aiSystemType}
            />
          </div>

          <Textarea
            label="WHAT ARE YOU TRYING TO SECURE? (SCOPE SUMMARY)"
            placeholder="Briefly describe the AI workflow, tools accessible, and security risks of concern (e.g. agent tool breakout, prompt injection in document ingestion, cross-tenant memory leakage)..."
            value={formData.scopeDescription}
            onChange={(e) => handleChange('scopeDescription', e.target.value)}
            error={errors.scopeDescription}
            rows={3}
            required
          />

          <Textarea
            label="ADDITIONAL MESSAGE / TIMELINE (OPTIONAL)"
            placeholder="Target timeline, regulatory drivers (e.g. EU AI Act, SOC2), or specific testing requirements..."
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            error={errors.message}
            rows={2}
          />

          {/* SAFETY ACKNOWLEDGEMENT CHECKBOX */}
          <div className="p-4 rounded-xl bg-defyra-surface border border-defyra-border space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.noCredentialsAcknowledged}
                onChange={(e) => handleChange('noCredentialsAcknowledged', e.target.checked)}
                className="h-4 w-4 mt-1 rounded border-defyra-border bg-defyra-bg text-defyra-cyan focus:ring-defyra-cyan focus:ring-offset-defyra-bg"
                required
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I confirm that <strong className="text-white">no passwords, API keys, secrets, production tokens, or sensitive personal data</strong> are included in this form submission.
              </span>
            </label>
            {errors.noCredentialsAcknowledged && (
              <p className="text-xs text-rose-400 font-mono pl-7">
                {errors.noCredentialsAcknowledged}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isSubmitting}
            className="w-full font-mono text-sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Scoped Assessment Request
          </Button>

          <p className="text-[11px] text-center text-defyra-textSubtle font-mono">
            Transmitted securely over TLS. Initial validation requests are processed by MARKEET TECHNOLOGIES PRIVATE LIMITED.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
