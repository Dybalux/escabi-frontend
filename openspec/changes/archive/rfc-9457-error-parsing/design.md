# Design: RFC 9457 Error Response Parsing

## Technical Approach

One new utility module (`src/utils/errors.js`) with two pure functions. All 18 consumer files drop direct `error.response?.data` access in favor of the parser. Two PRs: PR 1 ships the parser + fixes 2 BREAKS files; PR 2 migrates remaining 16.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Module shape | Two plain exported functions, no class | Stateless, tree-shakeable, zero overhead. No instantiation needed. |
| Axios interceptor | Rejected | Hides real RFC 9457 format from devs. Parser makes format explicit at every call site. |
| `errors` default | Always `[]`, never `null`/`undefined` | Consumers iterate safely without null checks. |
| Fallback chain | `detail` → `title` → generic message | Matches RFC 9457 semantics: `detail` is human-readable, `title` is short label. |
| Backward compat | Inline shape detection in `parseApiError` | Old format may coexist during rollout. Normalize transparently. |
| Unrecognized shapes | `console.warn` + best-effort extraction | Never throws — consumers always get a string. |

## Detection & Normalization Logic

`parseApiError(error)` extracts `error.response?.data` and branches on shape: RFC 9457 (`type`+`title`+`status`) → direct map; `Array.isArray(detail)` → old Pydantic with `loc[last]→pointer`, `msg→detail`; `typeof detail==='string'` → old string; no response → network error; else → `console.warn` + best-effort. Always returns `errors: []`.

`parseValidationErrors(errors)` normalizes both formats in one loop: `pointer?.replace(/^#\//,'')` or `loc[last]` → key; `detail ?? msg` → value. Null/empty → `{}`.

## File Changes

### PR 1: Parser + Break Fixes (3 files, ~70 lines changed)

| File | Action | Current → New |
|------|--------|---------------|
| `src/utils/errors.js` | **Create** | New module. Exports `parseApiError`, `parseValidationErrors`. |
| `src/pages/Home.jsx` L95 | Modify | `error.response?.data?.detail?.[0]?.msg \|\| error.response?.data?.detail` → `parseApiError(error).detail` |
| `src/components/Admin/ProductForm.jsx` L174-193 | Modify | `Array.isArray(errorData.detail)` + `err.loc`/`err.msg` loop → `parseApiError(error).detail` for display; add `parseValidationErrors(errors)` for per-field mapping when needed |

### PR 2: Remaining Migration (16 files, ~50 lines changed)

| File | Line(s) | Current Pattern | New |
|------|---------|----------------|-----|
| `useMaintenanceMode.js` | L32 | `error.response?.data?.message` | `parseApiError(error).detail \|\| 'fallback'` |
| `ProductManagement.jsx` | L61-62 | `data?.detail \|\| data?.message` | `parseApiError(error).detail \|\| 'fallback'` |
| `AuthContext.jsx` | L73,124,162 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `CartContext.jsx` | L49,63,105,119 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `Cart.jsx` | L178 | `error.response?.data?.detail` | `parseApiError(error).detail` (keep `status` checks above) |
| `ComboForm.jsx` | L147 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `BulkPriceUpdate.jsx` | L55 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `ComboManagement.jsx` | L49 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `PaymentSettings.jsx` | L88 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `PricingSettings.jsx` | L68 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `UserManagement.jsx` | L69 | `error.response?.data?.detail` | `parseApiError(error).detail \|\| 'fallback'` |
| `OrderManagement.jsx` | L26,40 | Hardcoded toast messages | `parseApiError(error).detail \|\| 'fallback'` (now reads server errors) |
| `ShippingSettings.jsx` | L39,92 | Hardcoded toast messages | `parseApiError(error).detail \|\| 'fallback'` (now reads server errors) |
| `client.js` | L58 | `console.error(..., error.response.data)` | `console.error(..., parseApiError(error))` for structured log |
| `orders.js` | — | `error.response?.status` only | **No change** — status checks unaffected |
| `App.jsx` | — | No error handling | **No change** |

**Import added to all modified files**: `import { parseApiError } from '../utils/errors'` (path adjusted per file depth).

## Interfaces / Contracts

```js
// src/utils/errors.js

/**
 * @param {Error} error - Axios error object (or any error)
 * @returns {{ title: string, detail: string, status: number|null, errors: Array<{pointer:string, detail:string, code:string|null}> }}
 */
export function parseApiError(error) { ... }

/**
 * @param {Array|undefined|null} errors - RFC 9457 errors array or old Pydantic detail array
 * @returns {Record<string, string>} field → message
 */
export function parseValidationErrors(errors) { ... }
```

## Verification

| Gate | Command | Catches |
|------|---------|---------|
| Build | `bun run build` | Import errors, syntax, missing exports across all files |
| Lint | `bun run lint` | Unused vars, consistent style on changed files |
| Manual | Staging backend | Correct messages on Home, ProductForm, Cart, login |

No test runner configured per `openspec/config.yaml`. Build + lint is the verification gate.

## Rollback

Revert PR commits via `git revert`. Parser is additive — no existing paths removed. PR 2 replaces direct access; reverting restores it.

## Open Questions

- [ ] ShippingSettings.jsx and OrderManagement.jsx currently show hardcoded error messages (no `error.response?.data` access). Spec lists them for migration. Confirm: change hardcoded messages to `parseApiError(error).detail || 'hardcoded fallback'` to let server errors reach UI?
- [ ] ProductForm.jsx currently maps Pydantic `loc[]`/`msg` to a single comma-joined error string. After migration, does it need per-field mapping (using `parseValidationErrors`) or is the top-level `detail` sufficient?
