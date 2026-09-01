import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DEFYRA — AI Security & Cyber Defense | AI Security Validation for the Agentic Era',
  description:
    'DEFYRA helps organizations identify, validate, and reduce risks in AI systems, agents, and workflows. Scoped AI Security Validation, Red Teaming, and Agent Security.',
  keywords: [
    'AI Security',
    'AI Security Validation',
    'AI Red Teaming',
    'Agent Security',
    'Agentic AI Security',
    'LLM Security',
    'RAG Security',
    'MCP Security',
    'Model Context Protocol',
  ],
  authors: [{ name: 'MARKEET TECHNOLOGIES PRIVATE LIMITED' }],
  openGraph: {
    title: 'DEFYRA — AI Security & Cyber Defense',
    description: 'Prove What AI Can Do. AI Security Validation for the Agentic Era.',
    url: 'https://defyra.ai',
    siteName: 'DEFYRA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEFYRA — AI Security & Cyber Defense',
    description: 'Securing the Future of AI. Scoped AI Security Validation and Red Teaming.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-defyra-bg font-sans text-slate-100 antialiased flex flex-col selection:bg-defyra-cyan selection:text-slate-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
