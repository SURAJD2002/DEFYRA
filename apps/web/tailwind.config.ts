import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        defyra: {
          bg: '#040711',
          surface: '#0B1120',
          surfaceHover: '#131D33',
          card: '#0D1527',
          cardHover: '#16223D',
          border: '#1E293B',
          borderHighlight: '#334155',
          cyan: '#38BDF8',
          blue: '#2563EB',
          indigo: '#4F46E5',
          violet: '#818CF8',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          textMuted: '#94A3B8',
          textSubtle: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
        'radial-glow': 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, rgba(4, 7, 17, 0) 70%)',
        'purple-glow': 'radial-gradient(ellipse at center, rgba(129, 140, 248, 0.12) 0%, rgba(4, 7, 17, 0) 70%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
