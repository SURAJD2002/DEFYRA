'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Container } from '@/components/layout/container';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          organizationName,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Failed to create organization account.');
        setIsLoading(false);
        return;
      }

      // Successful signup
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-24 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Container className="max-w-md">
        <div className="text-center space-y-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-defyra-surface border border-defyra-border mx-auto text-defyra-cyan shadow-lg shadow-cyan-500/10">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Organization Workspace</h1>
          <p className="text-xs text-defyra-textMuted font-mono">
            DEFYRA AI Security & Cyber Defense
          </p>
        </div>

        <Card className="border-defyra-border bg-defyra-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg text-white">Initialize Tenant Account</CardTitle>
            <CardDescription className="text-xs">
              The creator account will be assigned as tenant OWNER.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-rose-600/50 bg-rose-950/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5">
              <Input
                label="FULL NAME"
                placeholder="e.g. Marcus Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="ORGANIZATION NAME"
                placeholder="e.g. Cognitive Defense Labs"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
              />

              <Input
                label="CORPORATE WORK EMAIL"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="SECURE PASSWORD"
                type="password"
                placeholder="Min 8 chars, uppercase, number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Must contain uppercase, lowercase, and a number"
                required
              />

              <Button
                type="submit"
                variant="accent"
                size="md"
                isLoading={isLoading}
                className="w-full font-mono text-xs mt-3"
              >
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                Create Organization & Access
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-defyra-textMuted border-t border-defyra-border/40">
              Already have an organization account?{' '}
              <Link href="/login" className="text-defyra-cyan font-medium hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
