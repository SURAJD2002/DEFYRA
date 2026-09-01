# Development Guide — DEFYRA

## 1. Prerequisites
- **Node.js**: >= 18.x (tested on v23.x)
- **npm**: >= 9.x
- **Docker & Docker Compose** (optional for local PostgreSQL/Redis)

## 2. Directory Structure
```
defyra/
├── apps/
│   └── web/                     # Next.js App Router (Public web & /api/v1/)
├── packages/
│   ├── types/                   # TypeScript contracts (Assets, Tests, Findings)
│   └── validation/              # Shared Zod validation schemas
├── database/
│   ├── migrations/              # PostgreSQL schema migrations
│   └── seeds/                   # Seed test catalog
├── docs/                        # Specifications & architecture guides
├── docker-compose.yml           # Dev environment
└── .env.example                 # Environment variable templates
```

## 3. Local Setup
```bash
# 1. Install dependencies
cd apps/web && npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Run development server
npm run dev

# 4. Run automated test suite
npm test

# 5. Typecheck & lint
npm run typecheck
npm run lint
```

## 4. Coding Standards & Guidelines
- **TypeScript**: Strict mode enabled (`noImplicitAny: true`).
- **Styling**: Tailwind CSS using custom design tokens from `tailwind.config.ts`.
- **Security**: Never hardcode secrets. Always validate user inputs with Zod schemas.
- **Accessibility**: Semantic HTML, ARIA attributes, keyboard-navigable dialogs and menus.
