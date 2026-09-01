'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Terminal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from './container';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Security Validation', href: '/security-validation' },
    { label: 'AI Red Teaming', href: '/ai-red-teaming' },
    { label: 'Agent Security', href: '/agent-security' },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-defyra-border/70 bg-defyra-bg/90 backdrop-blur-md">
      <Container>
        <div className="flex h-18 items-center justify-between py-3.5">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-defyra-surface border border-defyra-border group-hover:border-defyra-cyan/60 transition-colors shadow-md">
              <Shield className="h-5 w-5 text-defyra-cyan transition-transform group-hover:scale-105" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/10 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold tracking-wider text-white">
                  DEFYRA
                </span>
                <span className="hidden sm:inline-block rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  v0.1
                </span>
              </div>
              <span className="hidden md:block text-[9px] font-mono uppercase tracking-widest text-defyra-textSubtle">
                AI Security & Cyber Defense
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    isActive
                      ? 'text-defyra-cyan bg-defyra-surface border border-defyra-cyan/30'
                      : 'text-slate-300 hover:text-white hover:bg-defyra-surface/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/contact">
              <Button size="sm" variant="accent" className="font-mono text-xs">
                Request Assessment
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-defyra-surface rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-defyra-border space-y-2 animate-in fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-mono text-slate-300 hover:bg-defyra-surface hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-defyra-border">
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                <Button size="md" variant="accent" className="w-full font-mono text-xs">
                  Request AI Security Assessment
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
