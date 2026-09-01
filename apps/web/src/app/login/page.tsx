'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight, AlertTriangle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Authentication failed. Please check credentials.');
        setIsLoading(false);
        return;
      }

      // Successful login
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
          <h1 className="text-2xl font-bold text-white tracking-tight">DEFYRA Security Portal</h1>
          <p className="text-xs text-defyra-textMuted font-mono">
            Authenticated AI Security & Validation Platform
          </p>
        </div>

        <Card className="border-defyra-border bg-defyra-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg text-white">Sign In to Workspace</CardTitle>
            <CardDescription className="text-xs">
              Enter your corporate credentials to access authorized security assets.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-rose-600/50 bg-rose-950/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="CORPORATE EMAIL"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-300">PASSWORD</span>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-mono text-defyra-cyan hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                size="md"
                isLoading={isLoading}
                className="w-full font-mono text-xs mt-2"
              >
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                Authenticate & Access Dashboard
              </Button>
            </form>

            {/* Quick Demo Credentials Info for Sandbox Testing */}
            <div className="p-3 rounded-lg bg-defyra-surface border border-defyra-border/70 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-defyra-cyan font-semibold flex items-center gap-1">
                <Key className="h-3 w-3" />
                <span>Seed Founder Credentials:</span>
              </div>
              <div className="text-slate-300 flex justify-between">
                <span>Email:</span>
                <span className="text-white">founder@defyra.ai</span>
              </div>
              <div className="text-slate-300 flex justify-between">
                <span>Password:</span>
                <span className="text-white">DefyraSecurity2026!</span>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-defyra-textMuted border-t border-defyra-border/40">
              Don&apos;t have an organization account?{' '}
              <Link href="/signup" className="text-defyra-cyan font-medium hover:underline">
                Create Organization
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
