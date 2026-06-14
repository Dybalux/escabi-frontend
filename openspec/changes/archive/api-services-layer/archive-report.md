# Archive Report: API Services Layer

**Archived by**: sdd-archive agent
**Date**: 2026-06-14
**Verify verdict**: PASS
**Apply state**: 9/9 tasks complete + 1 follow-up PR (App.jsx:45) merged

## What was archived

The `api-services-layer` change — a refactor of the 264-line `src/services/api.js` god-file (axios client + 48 helpers in one module, 2 raw `api` leaks to consumer files) into a 15-file domain module architecture (1 client + 14 domain modules). Delivered as a 10-PR chain (9 planned + 1 follow-up), stacked-to-main, all under the 400-line budget per PR.

## Capability created

A new capability `api-services-layer` now lives at `openspec/specs/api-services-layer/spec.md`. It describes the post-refactor state of the HTTP client and domain helper layer. The previous change-folder delta (`openspec/changes/api-services-layer/specs/api-services-layer/spec.md`) was consumed by the sync and is not part of the audit trail — the main spec is the source of truth from this point forward.

## Archive contents

```
openspec/changes/archive/api-services-layer/
├── proposal.md
├── design.md
├── tasks.md
└── verify-report.md
```

No `specs/` subdirectory: the delta has been applied to produce the main spec. No `apply-progress.md` engram reference file: the apply progress lives in Engram topic `sdd/api-services-layer/apply-progress` (read-only during archive).

## Final state of the refactor

- `src/services/api.js` — 28 lines, pure re-export shim, zero inline logic, no `import axios`, no `export default api`
- 14 domain modules: `client` + 8 public (`auth`, `products`, `combos`, `cart`, `orders`, `payments`, `shipping`, `system`) + 5 admin (`adminUsers`, `adminOrders`, `adminProducts`, `adminCombos`, `adminSettings`)
- 0 leakers (all `import api` from `src/` removed)
- 0 shim consumers (all `from.*services/api` outside `src/services/` removed)
- Total: ~720 lines refactored into 15 files
- Stack: stacked-to-main, all PRs under 400-line budget

## Chain summary

| # | PR | Branch | Commit | Merge |
|---|----|--------|--------|-------|
| 1 | client foundation | `refactor/services-client-foundation` | `cbb625f` | `8f39483` |
| 2 | auth module | `refactor/services-auth-module` | `525edce` | `1d4d3b7` |
| 3 | products + combos | `refactor/services-products-combos` | `231d4a1`, `b07a9d1` | `6be5097` |
| 4 | cart module | `refactor/services-cart-module` | `9753933` | `5a27c44` |
| 5 | orders + payments | `refactor/services-orders-payments` | `669d19f`, `32aa456` | `baa945d` |
| 6 | shipping + system | `refactor/services-shipping-system` | `b5f8f55`, `da16a80` | `c43edea` |
| 7 | admin/users + admin/orders | `refactor/services-admin-users-orders` | `3b68158`, `20c47b2` | `3dd5f80` |
| 8 | admin/products + admin/combos | `refactor/services-admin-products-combos` | `40aa7cd`, `6062842` | `c378395` |
| 9 | admin/settings + leakers + shim final | `refactor/services-admin-settings-leakers-shim-final` | `ca5092c`, `ce009eb`, `36d3c2f` | `f11b1fb` |
| 13 | App.jsx shim consumer cleanup (follow-up) | `refactor/app-jsx-system-explicit-import` | `30c55e0` | `5357ca8` |

All merged to `main`. All under 400-line budget. Largest PR: PR 1 (~220 lines). Verify: 18/18 spec requirements met, 0 behavioral regressions, 0 non-goal implementations.

## Destructive deltas (per `rules.archive` warning)

The change applied 2 REMOVED requirements from the previous spec state:

- **Single God-File Export (`api.js`)** — Removed: 48 helpers in one module is replaced by 14 domain modules. The file `src/services/api.js` itself was NOT deleted (per design decision P4); it remains as a 28-line re-export shim for backward compatibility. Deletion is deferred to a follow-up change.
- **Default Axios Instance Export** — Removed: `export default api` was replaced by named-export consumption restricted to domain modules. The 2 leaker files (`PricingSettings.jsx`, `BulkPriceUpdate.jsx`) now use named helpers.

The code-level destruction was already completed and verified in PR 9 and PR 13. The archive operation only formalizes the spec-level removal of these requirements. No further destructive action is taken by the archive.

## Sibling change status

`openspec/changes/refactor-app-structure/` is an unrelated active change that shares the `openspec/` root. It was NOT touched by this archive operation. Its lifecycle continues independently.

## Pre-existing openspec state

`openspec/` was entirely untracked in git prior to this archive commit. The archive commit is the first git-tracked state of the OpenSpec artifacts for this project — `proposal.md`, `design.md`, `tasks.md`, `verify-report.md`, and the new main spec all enter version control in a single commit.

## Verification

- `bun run build` — to be confirmed post-commit
- `bun run lint` — to be confirmed post-commit
- `ls openspec/changes/archive/api-services-layer/` — contains 4 files, no specs/ subdir ✅
- `ls openspec/specs/api-services-layer/` — contains spec.md ✅
- `ls openspec/changes/api-services-layer/` — does NOT exist ✅

## Out of scope (intentionally NOT done)

- No code changes in `src/`
- No deletion of `src/services/api.js` (deferred per P4)
- No barrel `services/index.js` (explicit per-domain imports only)
- No `Co-Authored-By` or AI attribution in the archive commit

## SDD cycle

The change has been fully proposed, designed, specced, task-broken, applied (10 PRs), verified (PASS), and archived. The capability `api-services-layer` is now part of the project's source of truth at `openspec/specs/api-services-layer/spec.md`. Ready for the next change.
