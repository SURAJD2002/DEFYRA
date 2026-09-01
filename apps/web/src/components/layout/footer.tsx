import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { Container } from './container';

export function Footer() {
  return (
    <footer className="border-t border-defyra-border/70 bg-defyra-bg pt-16 pb-12 text-slate-400">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-defyra-border/50">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-defyra-surface border border-defyra-border text-defyra-cyan">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-mono text-lg font-bold tracking-wider text-white">DEFYRA</span>
            </div>
            <p className="text-xs font-mono text-defyra-cyan tracking-widest uppercase">
              PROVE. PROTECT. TRUST.
            </p>
            <p className="text-xs text-defyra-textMuted leading-relaxed max-w-sm">
              AI Security Validation for the Agentic Era. Validating the complete attack chain across autonomous agents, tools, RAG pipelines, and enterprise systems.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <Lock className="h-3 w-3 text-emerald-400" />
                Evidence-Driven Assurance
              </span>
            </div>
          </div>

          {/* Validation Services */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Validation Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/security-validation" className="hover:text-defyra-cyan transition-colors">
                  AI Security Validation
                </Link>
              </li>
              <li>
                <Link href="/ai-red-teaming" className="hover:text-defyra-cyan transition-colors">
                  Adversarial Red Teaming
                </Link>
              </li>
              <li>
                <Link href="/agent-security" className="hover:text-defyra-cyan transition-colors">
                  Agent Security Assessment
                </Link>
              </li>
              <li>
                <Link href="/security-validation#rag-memory" className="hover:text-defyra-cyan transition-colors">
                  RAG & Memory Validation
                </Link>
              </li>
              <li>
                <Link href="/security-validation#tool-apis" className="hover:text-defyra-cyan transition-colors">
                  Tool & API Authorization
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Platform */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Research & Threat Intel
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/research" className="hover:text-defyra-cyan transition-colors">
                  Agent Attack Vectors
                </Link>
              </li>
              <li>
                <Link href="/research#mcp" className="hover:text-defyra-cyan transition-colors">
                  MCP Protocol Security
                </Link>
              </li>
              <li>
                <Link href="/research#methodology" className="hover:text-defyra-cyan transition-colors">
                  Validation Methodology
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-defyra-cyan transition-colors">
                  About DEFYRA
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/security" className="hover:text-defyra-cyan transition-colors">
                  Responsible Disclosure
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-defyra-cyan transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-defyra-cyan transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-defyra-cyan transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Corporate Identity & Legal Disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-defyra-textSubtle font-mono">
          <div className="space-y-1 text-center md:text-left">
            <p>
              © {new Date().getFullYear()} DEFYRA. DEFYRA is a cybersecurity product and commercial brand operated by{' '}
              <strong className="text-slate-300 font-medium">MARKEET TECHNOLOGIES PRIVATE LIMITED</strong>.
            </p>
            <p className="text-[10px]">
              All security assessments are point-in-time evaluations conducted exclusively within authorized scopes and environments.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine v0.1 Sandbox Ready
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
