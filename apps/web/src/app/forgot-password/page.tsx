'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Container } from '@/components/layout/container';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="py-16 md:py-24 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Container className="max-w-md">
        <div className="text-center space-y-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-defyra-surface border border-defyra-border mx-auto text-defyra-cyan shadow-lg shadow-cyan-500/10">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Password Recovery</h1>
          <p className="text-xs text-defyra-textMuted font-mono">
            DEFYRA AI Security & Cyber Defense
          </p>
        </div>

        <Card className="border-defyra-border bg-defyra-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg text-white">Reset Account Access</CardTitle>
            <CardDescription className="text-xs">
              Enter your corporate email address. If an active tenant exists, recovery instructions will be dispatched.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-4 space-y-4">
            {submitted ? (
              <div className="p-4 rounded-xl border border-emerald-700/50 bg-emerald-950/30 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Recovery Instructions Dispatched</span>
                </div>
                <p className="text-slate-300">
                  If an active account is registered for <strong className="text-white">{email}</strong>, a secure password reset link has been transmitted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="CORPORATE EMAIL"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" variant="accent" size="md" className="w-full font-mono text-xs">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="pt-2 text-center text-xs text-defyra-textMuted border-t border-defyra-border/40">
              <Link href="/login" className="text-defyra-cyan inline-flex items-center gap-1 hover:underline">
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
