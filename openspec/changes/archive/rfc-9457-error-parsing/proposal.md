# Proposal: RFC 9457 Error Response Parsing

## Intent

Backend `webmarket` migrated to RFC 9457 (`application/problem+json`). Frontend error parsing still reads old FastAPI format — 2 files break, 2 read stale fields, 14 work but are fragile. Create a unified `src/utils/errors.js` parser to normalize all error reading.

## Scope

### In Scope
- Create `src/utils/errors.js` with `parseApiError(error)` → `{ title, detail, status, errors }` and `parseValidationErrors(errors)` → `Record<field, message>`
- Migrate all 18 error-reading files to use the parser (2 BREAKS, 2 STALE, 14 OK)
- Normalize `errors` to always-`[]` (RFC 9457 makes it optional — parser fills default)
- Fallback chain: `detail` → `title` → generic message; `console.warn` on unrecognized shapes
- Parser handles old format for transition safety

### Out of Scope
- No Axios interceptor transformation (hides real format, adds tech debt)
- No test infrastructure (no test runner configured — verify with `bun run build` + lint)
- No new error UI — pure parsing migration, same display paths

## Capabilities

### New Capabilities
- `api-error-handling`: Centralized RFC 9457 error parser. Exports `parseApiError(error)` returning normalized `{ title, detail, status, errors }` and `parseValidationErrors(errors)` returning `Record<field, message>` (converts JSON Pointer `"#/name"` → field name `"name"`). Handles old Pydantic format for backward compatibility. Always returns a string message — never `null`, never throws.

### Modified Capabilities
- None — consumer file changes are implementation details (same fields, same behavior, centralized path).

## Approach

**2 PRs, stacked-to-main**:

| PR | Files | What |
|----|-------|------|
| PR 1 | `src/utils/errors.js` (new), `Home.jsx`, `ProductForm.jsx` | Parser + fix 2 BREAKS |
| PR 2 | `useMaintenanceMode.js`, `ProductManagement.jsx` + 14 OK files | Migrate remaining 16 files |

**PR 1**: Create parser utility. Fix `Home.jsx` (old `detail?.[0]?.msg` → `parseApiError(error).errors`) and `ProductForm.jsx` (old Pydantic `detail` array with `loc`/`msg` → `parseValidationErrors(errors)` returning per-field messages).

**PR 2**: Fix `useMaintenanceMode.js` (503 path: `message` → `detail` so admin-set message reaches users; success path unchanged). Fix `ProductManagement.jsx` (`message` fallback → parser). Migrate 14 OK files (replace direct `error.response?.data?.detail` with `parseApiError(error).detail`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/utils/errors.js` | New | Central RFC 9457 error parser |
| `src/pages/Home.jsx` | Modified | BREAKS — Pydantic array → `parseApiError` |
| `src/components/Admin/ProductForm.jsx` | Modified | BREAKS — Pydantic validation → `parseValidationErrors` |
| `src/hooks/useMaintenanceMode.js` | Modified | STALE — `message` → `detail` on 503 path |
| `src/pages/Admin/ProductManagement.jsx` | Modified | STALE — `message` fallback → parser |
| 14 consumer files | Modified | Direct `detail` access → `parseApiError(error).detail` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Parser swallows error details silently | Low | `console.warn` on unrecognized shapes; fallback always returns a string |
| Field-level validation lost during migration | Low | `parseValidationErrors` preserves per-field mapping via pointer→field conversion |
| Old format still arriving during transition | Low | Parser handles both old (`detail[]` with `loc`/`msg`) and new (`errors[]` with `pointer`/`detail`) |
| No test runner — manual verification only | Medium | `bun run build` + lint catches syntax; verify against staging backend |

## Rollback Plan

Revert PR commits via `git revert`. Parser is additive — no existing code paths removed. PR 2 replaces direct access with parser call; reverting restores direct access. No database, config, or infra changes.

## Dependencies

- Backend `webmarket` already serving RFC 9457 responses (confirmed deployed)
- Axios auto-parses `application/problem+json` as JSON (no config change needed)

## Success Criteria

- [ ] `parseApiError(error)` returns `{ title, detail, status, errors }` for RFC 9457, old format, and unexpected shapes
- [ ] `parseValidationErrors(errors)` converts `pointer` (`"#/name"`) → field name, maps `detail` → message
- [ ] `Home.jsx` and `ProductForm.jsx` display field-level errors from RFC 9457 responses
- [ ] `useMaintenanceMode.js` reads admin-set maintenance message from `detail` on 503
- [ ] All 18 files build without error (`bun run build` passes)
- [ ] No ESLint violations in changed files
