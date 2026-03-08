# CLAUDE.md — Question Paper Generator

This file provides guidance for AI assistants working in this codebase.

## Architecture Overview

This is a **dual-process full-stack application** for creating and generating exam question papers as PDFs.

- **Frontend**: React + Zustand + Tailwind, bundled by Webpack, runs on port **3009**
- **Backend**: Next.js (API routes only), runs on port **3000**
- **Communication**: Webpack dev server proxies `/api/*` requests from frontend → backend

The two processes must run concurrently for local development. There is no database — all state lives in a Zustand store on the frontend.

## Directory Structure

```
/
├── app/                        # Next.js backend (API routes only)
│   ├── api/generate-pdf/
│   │   └── route.ts            # POST /api/generate-pdf endpoint
│   ├── layout.tsx
│   └── page.tsx
├── lib/                        # Server-side utilities (backend only)
│   └── pdf/
│       ├── browserManager.ts   # Playwright Chromium singleton
│       ├── generatePdf.ts      # Core PDF generation logic
│       └── renderHtml.ts       # Paper → HTML string (pure function)
├── shared/                     # Types shared between frontend & backend
│   └── types/
│       └── paper.ts            # Paper, Section, Question, MatchPair, QuestionType
├── src/                        # Frontend React application
│   ├── components/
│   │   ├── ui/                 # shadcn-style base components (button, input, select, etc.)
│   │   ├── PaperBuilder.tsx    # Main form UI for building a question paper
│   │   ├── PaginatedPreview.tsx# Real-time paginated print preview (uses pagedjs)
│   │   ├── PaginatedPreview.css
│   │   ├── QuestionPaperPrintLayout.tsx  # Renders paper as an exam-style HTML layout
│   │   └── DownloadPdfButton.tsx
│   ├── hooks/
│   │   └── useGeneratePdf.ts   # Hook: calls /api/generate-pdf, manages loading/error
│   ├── lib/
│   │   └── utils.ts            # cn() utility for Tailwind class merging
│   ├── store/
│   │   └── paperBuilderStore.ts# Zustand store: all paper state and mutations
│   ├── types/
│   │   ├── paper.ts            # Frontend-side type re-exports
│   │   └── pagedjs.d.ts        # Type declaration for pagedjs module
│   ├── App.tsx
│   ├── index.tsx               # React entry point
│   └── styles.css
├── public/
│   └── index.html              # Webpack HTML template
├── package.json
├── tsconfig.json               # Strict TS, target ES2020, path alias @/* → src/*
├── webpack.config.js           # Frontend bundler config
├── tailwind.config.js
├── postcss.config.js
└── components.json             # shadcn/ui config
```

## Development Setup

### Prerequisites

```bash
npm install
npx playwright install chromium   # Required for PDF generation
```

### Running Locally

Start **both** processes in separate terminals:

```bash
# Terminal 1 — Backend (Next.js, port 3000)
npm run dev:backend

# Terminal 2 — Frontend (Webpack dev server, port 3009)
npm start
```

Open the app at `http://localhost:3009`. The frontend proxies `/api/*` to the backend automatically.

### Environment Variables

| Variable      | Default                  | Description                        |
|---------------|--------------------------|------------------------------------|
| `FE_PORT`     | `3009`                   | Frontend dev server port           |
| `BACKEND_URL` | `http://localhost:3000`  | Backend URL for API proxy          |

Set these in a `.env` file (gitignored) or as shell environment variables.

## Available Scripts

| Script                   | Description                            |
|--------------------------|----------------------------------------|
| `npm start`              | Frontend dev server (port 3009)        |
| `npm run build`          | Frontend production build → `dist/`    |
| `npm run dev:backend`    | Backend Next.js dev server (port 3000) |
| `npm run build:backend`  | Next.js production build               |
| `npm run start:backend`  | Start Next.js production server        |
| `npm run typecheck`      | TypeScript type check (no emit)        |

## Key Concepts

### Data Model

All paper data flows through a single shared type definition in `shared/types/paper.ts`:

```typescript
Paper {
  paperTitle: string
  subject: string
  duration: string
  totalMarks: number
  instructions: string[]
  sections: Section[]
}

Section {
  id: string          // random UID (Math.random().toString(36).slice(2,10))
  title: string
  instructions: string
  questions: Question[]
}

Question {
  id: string
  type: QuestionType  // 'Fill in the Blanks' | 'Match the Following' | 'Descriptive'
  text: string
  marks: number | ''
  blankAnswer?: string
  matchPairs: MatchPair[]
}

MatchPair {
  id: string
  left: string
  right: string
}
```

### State Management

The entire paper-building state lives in `src/store/paperBuilderStore.ts` (Zustand). This includes:
- Paper metadata (title, subject, duration, marks, instructions)
- Sections and questions (add/remove/update operations)
- Validation logic

### PDF Generation Flow

1. User clicks "Download PDF" → `useGeneratePdf.ts` calls `POST /api/generate-pdf` with the `Paper` JSON
2. `app/api/generate-pdf/route.ts` validates payload with `isPaperPayload()` type guard
3. `lib/pdf/renderHtml.ts` converts the `Paper` object to a complete HTML string with embedded CSS
4. `lib/pdf/generatePdf.ts` uses Playwright (Chromium singleton from `browserManager.ts`) to render the HTML and export PDF
5. PDF is returned as a binary blob with `Content-Disposition: attachment` header

### Print Preview

`PaginatedPreview.tsx` renders `<QuestionPaperPrintLayout />` inside an iframe and uses **pagedjs** to paginate the content in real-time as the user edits, showing an accurate page-break preview before downloading.

## Code Conventions

### TypeScript

- **Strict mode** is enabled — no implicit `any`, no unchecked indexing
- Path alias `@/*` maps to `src/*` (configured in both `tsconfig.json` and `webpack.config.js`)
- Type guards (e.g., `isPaperPayload`) are used at API boundaries instead of `as` casts
- Prefer `interface` for object shapes that represent domain entities, `type` for unions/aliases

### Naming

- **Components**: PascalCase (`PaperBuilder`, `DownloadPdfButton`)
- **Functions/variables**: camelCase (`generatePdf`, `renderHtml`, `defaultQuestion`)
- **Constants**: camelCase or SCREAMING_SNAKE_CASE for module-level primitives (`A4_VIEWPORT`)
- **Types/Interfaces**: PascalCase (`Paper`, `QuestionType`)
- **Files**: PascalCase for React components, camelCase for utilities/hooks/stores

### React

- Functional components only — no class components
- Use `useCallback` / `useMemo` for handlers/derived values passed as props
- Accordion component uses React Context for local UI state
- `forwardRef` is used on base input components in `src/components/ui/`

### Styling

- **Tailwind CSS** for component styling in `src/`
- **Inline CSS** in `renderHtml.ts` for the PDF template (necessary for deterministic Playwright rendering — external stylesheets are unreliable)
- **Custom CSS** in `PaginatedPreview.css` for print preview layout
- `cn()` from `src/lib/utils.ts` is used for conditional class composition

### Security

- `renderHtml.ts` HTML-escapes all user-provided string values before embedding them in the HTML template — always maintain this when adding new fields
- The API validates request body shape with `isPaperPayload()` before processing

## API Reference

### `POST /api/generate-pdf`

**Request body**: `Paper` JSON object
**Response (200)**: `application/pdf` binary blob
**Response (400)**: `{ error: string }` — invalid payload
**Response (500)**: `{ error: string }` — generation failure
**Headers set on success**: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename=...`, `Cache-Control: no-store`

## Testing

There is currently **no test suite** in this repository. When adding tests, consider:
- Unit tests for `renderHtml.ts` (pure function — easy to test)
- Unit tests for `isPaperPayload` type guard
- Unit tests for Zustand store mutations in `paperBuilderStore.ts`
- Integration tests for the `/api/generate-pdf` endpoint

Recommended test framework: **Vitest** (compatible with the TypeScript/ESM setup).

## Common Gotchas

- **Both servers must be running**: the frontend alone cannot generate PDFs — the backend (`npm run dev:backend`) must be running.
- **Playwright Chromium must be installed**: run `npx playwright install chromium` after `npm install`, or PDF generation will fail with a browser launch error.
- **`tsconfig.json` only includes `src/`**: backend files in `app/` and `lib/` use Next.js's own TypeScript compilation, not webpack's `ts-loader`. Keeping them separate avoids conflicts.
- **Inline CSS in `renderHtml.ts`**: don't switch to external stylesheets — Playwright can fail to load them reliably in the headless context.
- **UID generation**: IDs for sections/questions use `Math.random().toString(36).slice(2, 10)` — not cryptographically secure, but sufficient for ephemeral UI state.
- **No authentication**: the PDF endpoint is unauthenticated. If deploying publicly, add rate limiting or auth.
