# Tech Debt & Recommended Changes

Audit date: 2026-03-08

---

## Critical

### 1. No Test Suite
Zero tests exist. Recommended framework: **Vitest** (ESM-native, TypeScript-friendly).

Priority targets:
- `lib/pdf/renderHtml.ts` — pure function, easiest to unit test
- `isPaperPayload()` type guard in `app/api/generate-pdf/route.ts`
- Zustand store mutations in `src/store/paperBuilderStore.ts`
- `/api/generate-pdf` integration test with mocked Playwright

---

## High Priority

### 2. Security

| Issue | Location | Fix |
|-------|----------|-----|
| No rate limiting on PDF endpoint | `app/api/generate-pdf/route.ts` | Add IP-based rate limiting; concurrent Playwright requests can exhaust server resources |
| Payload validation too shallow | `route.ts:5-20` — only top-level fields checked | Replace `isPaperPayload()` with **Zod** schema that validates nested sections, questions, types, and value ranges |
| No CORS/CSRF protection | `app/api/generate-pdf/route.ts` | Add CORS headers restricted to your domain; consider CSRF tokens |
| `Math.random()` for IDs | `src/store/paperBuilderStore.ts:24` | Replace `Math.random().toString(36).slice(2,10)` with `crypto.randomUUID()` |

### 3. No Linting / Formatting / CI

Nothing is enforced. Add:
- **ESLint** with `eslint-plugin-react`, `eslint-plugin-react-hooks`, `@typescript-eslint`
- **Prettier** for consistent formatting
- **Husky** pre-commit hooks (typecheck + lint + format)
- **GitHub Actions** CI (typecheck → lint → test → build)

---

## Medium Priority

### 4. Error Handling Gaps

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/hooks/useGeneratePdf.ts` | 60 | `catch {}` swallows error — user sees generic message | `catch (err)` and surface `err.message` |
| `src/hooks/useGeneratePdf.ts` | 43 | Doesn't validate `Content-Type` is `application/pdf` before calling `.blob()` | Check header before consuming response |
| `lib/pdf/browserManager.ts` | 27 | `void closeBrowser()` in signal handlers — process may exit before cleanup | `await closeBrowser()` then `process.exit(0)` |
| `src/components/PaginatedPreview.tsx` | 56 | `void renderPagination()` silently swallows preview errors | `.catch(err => console.error(err))` |

### 5. Type Safety Gaps

| File | Issue | Fix |
|------|-------|-----|
| `src/hooks/useGeneratePdf.ts:13` | Unnecessary unsafe cast `paper as Paper & { title?: string }` | Remove cast; just use `paper.paperTitle` |
| `shared/types/paper.ts:13` | `marks: number \| ''` is non-idiomatic | Change to `marks: number \| null` throughout |
| `paperBuilderStore.ts:222` + `shared/types/paper.ts` | `'Descriptive'` is in `QuestionType` but absent from `questionTypes[]` and has no rendering logic | Either implement it fully or remove from the type |

### 6. Code Duplication

| Issue | Files | Fix |
|-------|-------|-----|
| Two independent paper layout implementations | `lib/pdf/renderHtml.ts` and `src/components/QuestionPaperPrintLayout.tsx` | Use `renderToString()` on the React component to power the PDF renderer; single source of truth |
| `escapeHtml()` is private | `lib/pdf/renderHtml.ts` | Move to `src/lib/utils.ts` as shared utility; any future render path may forget to escape |

### 7. State Management

| Issue | Fix |
|-------|-----|
| No persistence — refreshing loses all work | Add Zustand `persist` middleware with `localStorage` |
| No undo/redo — accidental deletion is unrecoverable | Add Zustand `temporal` middleware; expose undo/redo buttons |
| `defaultValue` array recreated every render in `PaperBuilder.tsx:64` | Accordion panels collapse on every `sections` change; store open state separately |

---

## Lower Priority

### 8. Hardcoded Paper Metadata

`subject`, `duration`, and `instructions` are hardcoded in `src/components/PaperBuilder.tsx:43-46`. Users cannot edit them from the UI. Add form fields and wire through the store.

### 9. Accessibility

| Issue | Location | Fix |
|-------|----------|-----|
| Accordion button missing `aria-expanded` | `src/components/ui/accordion.tsx:84` | Add `aria-expanded={open}` and `aria-controls` |
| Inputs not associated with labels | Throughout `PaperBuilder.tsx` | Add matching `htmlFor` / `id` pairs |
| Loading spinner not announced | `src/components/DownloadPdfButton.tsx` | Add `aria-hidden="true"` on spinner, `sr-only` text for screen readers |
| Error messages not announced | `DownloadPdfButton.tsx` | Add `role="alert"` to error container |

### 10. Environment Validation

`Number(process.env.FE_PORT)` silently returns `NaN` if the variable is invalid (`webpack.config.js`). Add explicit validation and create a `.env.example` documenting all variables.

### 11. Browser Singleton Risk

`lib/pdf/browserManager.ts` shares one Chromium process across all requests. A crash or stuck request blocks all subsequent PDF generation. For production, use a browser pool or a managed service (e.g., Browserless).

---

## Recommended Roadmap

### Phase 1 — Security & Stability
1. Replace `isPaperPayload()` with Zod schema validation
2. Add rate limiting to `/api/generate-pdf`
3. Fix `catch` blocks to log and surface real error messages
4. Add ESLint + Prettier + Husky pre-commit hooks

### Phase 2 — Quality
5. Set up Vitest; write tests for `renderHtml`, the Zod schema, and store mutations
6. Fix accessibility (aria attributes, label associations, alert roles)
7. Add GitHub Actions CI pipeline (typecheck → lint → test → build)

### Phase 3 — UX & Features
8. Add Zustand `persist` (localStorage) and `temporal` (undo/redo)
9. Expose `subject`, `duration`, and `instructions` as editable form fields
10. Consolidate PDF and preview rendering via `renderToString()`

### Phase 4 — Polish
11. Add JSDoc to hooks, store actions, and `generatePdf`
12. Add `.env.example` and environment validation at startup
13. Add troubleshooting section to `CLAUDE.md`
14. Mobile responsiveness testing

---

## Summary

| Category | Severity | Items |
|----------|----------|-------|
| Missing tests | Critical | 1 |
| Security | High | 4 |
| Tooling (lint/format/CI) | High | 1 |
| Error handling | Medium | 4 |
| Type safety | Medium | 3 |
| Code duplication | Medium | 2 |
| State management | Medium | 3 |
| Hardcoded metadata | Low | 1 |
| Accessibility | Low-Medium | 4 |
| Environment validation | Low | 1 |
| Browser singleton | Low | 1 |
