# Archive Report: refactor-app-structure

## Outcome

**Status**: ARCHIVED — INTENTIONAL WITH WARNINGS
**Date**: 2026-06-15
**Verdict source**: `verify-report.md` (PASS WITH WARNINGS)
**Approval**: User explicitly chose to archive without running Phase 5 smoke tests.

## Delta Sync Summary

The delta spec (`openspec/changes/archive/refactor-app-structure/spec.md`) defines ADDED, MODIFIED, and REMOVED requirements targeting four main specs. The main specs already contain the post-change state — they were created/updated during the sdd-spec phase and verified by sdd-verify. **No additional merge was required.**

| Main Spec | Action | Reason |
|-----------|--------|--------|
| `openspec/specs/app-routing/spec.md` | No-op (already in target state) | AR-1 through AR-4 already reflect the AppRoutes refactor (lazy loading, route definitions, layout shell, Toaster config) |
| `openspec/specs/route-guard/spec.md` | No-op (already in target state) | RG-1 through RG-3 already document ProtectedRoute extraction and auth gating |
| `openspec/specs/maintenance-mode/spec.md` | No-op (already in target state) | MM-1 through MM-4 already document the `useMaintenanceMode` hook with `shouldBypass` and 30s polling |
| `openspec/specs/age-verification/spec.md` | No-op (already in target state) | AV-1 through AV-3 already document the `useAgeVerification` hook with localStorage and toast integration |

**MODIFIED Requirement** (App.jsx Root Component): The slim 18-line App.jsx is enforced structurally by the new specs (no inline logic in App.jsx — all extracted). No standalone main-spec requirement exists for App.jsx because the refactor's contract is "absence of inline logic in App.jsx", which is implicit in the new component-owned specs.

**REMOVED Requirements** (inline implementations): These have no further main-spec presence — the migration note (use the new hook/component) is the only lasting record.

## Implementation Summary

Four stacked-to-main PRs delivered the refactor:

| PR | Title | Lines |
|----|-------|-------|
| #14 | `useMaintenanceMode` hook | +54 |
| #15 | `useAgeVerification` hook | +21 |
| #16 | `AppRoutes` + `ProtectedRoute` + `Spinner` | +254 |
| #17 | Slim `App.jsx` (324 → 18) | +4 / −310 |

App.jsx reduction: 324 lines → 18 lines (94% reduction).

## Task Completion Gate

| Phase | Tasks | Complete | Notes |
|-------|-------|----------|-------|
| Phase 1 | 5 | 5/5 ✅ | useMaintenanceMode hook |
| Phase 2 | 3 | 3/3 ✅ | useAgeVerification hook |
| Phase 3 | 5 | 5/5 ✅ | AppRoutes + ProtectedRoute + Spinner |
| Phase 4 | 3 | 3/3 ✅ | Slim App.jsx |
| Phase 5 | 5 | 0/5 ⚠️ | **Intentionally deferred** — manual browser smoke tests. User decision documented in W-2. |

**Total**: 16/21 tasks checked. The 5 unchecked Phase 5 tasks are smoke tests requiring manual browser interaction. sdd-archive is closing the cycle with the user's explicit approval. Any future regression discovered in smoke test scope can be filed as a follow-up change.

## Warnings Preserved From Verify Report

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| W-1 | Warning | Spec AR-2 lists 19 aspirational routes that differ from the actual 19 routes in the implementation | **Open** — known mismatch, not a regression. Implementation preserves original app's actual routes. Spec was aspirational. Follow-up change recommended to align spec with reality. |
| W-2 | Warning | Phase 5 smoke tests (5.1–5.5) remain unchecked | **Intentionally deferred** — user approved archive without running them. Documented here per gentle-ai stricter policy. |
| W-3 | Warning | Design doc import graph says `getSystemStatus (../services/api)` but actual is `../services/system` | **Open** — design doc has a stale reference. Task 1.3 was authoritative and explicitly specified `../services/system`. Cosmetic doc fix. |

**CRITICAL issues**: None. Build passes, lint clean, 19 lazy-loaded routes operational.

## Archive Conventions

- **Folder location**: `openspec/changes/archive/refactor-app-structure/` (matches the existing `api-services-layer/` archive pattern in this repo)
- **Date prefix**: **Not used** — deviates from the sdd-archive skill default of `YYYY-MM-DD-` to match the existing repo convention. The `rules.archive` in `openspec/config.yaml` does not require a date prefix.
- **Contents preserved**: `design.md`, `proposal.md`, `spec.md`, `tasks.md`, `verify-report.md`, `explore.md`, plus this `archive-report.md`

## Source of Truth

Main specs reflecting the new behavior:

- `openspec/specs/app-routing/spec.md` (AR-1, AR-2, AR-3, AR-4)
- `openspec/specs/route-guard/spec.md` (RG-1, RG-2, RG-3)
- `openspec/specs/maintenance-mode/spec.md` (MM-1, MM-2, MM-3, MM-4)
- `openspec/specs/age-verification/spec.md` (AV-1, AV-2, AV-3)

## Recommended Follow-ups (out of archive scope)

1. Run Phase 5 smoke tests in a real browser (tasks 5.1–5.5) — file a new change if any regression surfaces
2. Update `openspec/specs/app-routing/spec.md` AR-2 to reflect the actual 19 routes (W-1)
3. Fix stale `../services/api` reference in `design.md` (W-3)
4. Consider suggestions S-1, S-2, S-3 from the verify report as a future polish change

## SDD Cycle Complete

The change has been proposed, designed, specified, task-planned, applied across 4 PRs, verified (PASS WITH WARNINGS), and archived.

**Ready for the next change.**
