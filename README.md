# Deterministic Server-side PDF Generation

This repository now includes deterministic Playwright-based PDF generation utilities for Next.js server routes.

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
npm install playwright
npx playwright install chromium
```

## 2) Make sure your TypeScript path aliases support root imports (recommended)

If your Next.js project uses path aliases, add aliases like:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/lib/*": ["lib/*"],
      "@/shared/*": ["shared/*"]
    }
  }
}
```

> The example route currently uses relative imports so it works even without aliases.

## 3) Start your Next.js app

```bash
npm run dev
```

## 4) Call the API route

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
