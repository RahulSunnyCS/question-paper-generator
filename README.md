# Deterministic Server-side PDF Generation

This repository includes Playwright-based PDF generation utilities exposed through a Next.js API route.

## Added structure

```txt
/lib/pdf
  browserManager.ts
  renderHtml.ts
  generatePdf.ts
/app/api/generate-pdf/route.ts
/shared/types/paper.ts
```

## 1) Install dependencies

```bash
npm install
npx playwright install chromium
```

## 2) Run the backend server that hosts PDF generation

```bash
npm run dev:backend
```

This starts a Next.js server (default: `http://localhost:3000`) with the route:

- `POST /api/generate-pdf`

For production mode:

```bash
npm run build:backend
npm run start:backend
```

## 3) Call the API route

```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "paperTitle": "Midterm Exam",
    "subject": "Mathematics",
    "duration": "2 Hours",
    "totalMarks": 100,
    "instructions": ["Answer all questions", "Show all steps"],
    "sections": [
      {
        "id": "sec-1",
        "title": "Algebra",
        "instructions": "Solve any 2 questions",
        "questions": [
          {
            "id": "q-1",
            "type": "Descriptive",
            "text": "Factorize x^2 + 5x + 6",
            "marks": 5,
            "matchPairs": []
          }
        ]
      }
    ]
  }' \
  --output paper.pdf
```


## Running frontend and backend on different ports

If you run the webpack frontend and Next.js backend separately, keep them on different ports and let webpack proxy API calls:

```bash
# terminal 1 (backend)
npm run dev:backend

# terminal 2 (frontend, defaults to 3009)
npm run start
```

Optional environment overrides:

- `FE_PORT` (default `3009`) for webpack dev server.
- `BACKEND_URL` (default `http://localhost:3000`) proxy target for `/api/*` requests.

Example:

```bash
FE_PORT=3010 BACKEND_URL=http://localhost:3000 npm run start
```

The frontend can keep calling `/api/generate-pdf`; webpack forwards it to the backend to avoid 404/CORS issues.

## Frontend state management note

The frontend still uses Zustand for paper builder state via `src/store/paperBuilderStore.ts`, so `zustand` remains a required dependency and has not been removed.

## Notes on determinism and performance

- A single Chromium instance is launched and reused (singleton manager).
- New page per request; page is always closed to prevent memory leaks.
- HTML template renderer is pure and typed (`Paper -> string`).
- Print output is fixed to A4 with `20mm` margins and `printBackground: true`.
- Animations/transitions are disabled during render.
- Fonts are awaited before PDF creation.
- Minimal logging is included for observability.

## Concurrency readiness

Current structure keeps concerns separated so request-level concurrency controls (queue, semaphore, pooled pages) can be added later without changing route contract.
