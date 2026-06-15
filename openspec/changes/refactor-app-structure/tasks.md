# Tasks: Refactor App Structure

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~400 added, ~306 removed (~706 total) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | 4 PRs stacked-to-main (each under 400 lines) |
| Delivery strategy | ask-always |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | `useMaintenanceMode` hook | PR 1 | Salvage from `feature/refactor-app-structure-phase1-hooks`, fix import |
| 2 | `useAgeVerification` hook | PR 2 | Salvage from `feature/refactor-app-structure-phase1-hooks`, rename param |
| 3 | `AppRoutes` + `ProtectedRoute` | PR 3 | Salvage from `feature/refactor-app-structure-phase2-routes`, extract ProtectedRoute, add lazy |
| 4 | Slim `App.jsx` | PR 4 | Salvage from `feature/refactor-app-structure-phase3-app` |

## Phase 1: Foundation — `useMaintenanceMode` Hook (PR 1)

- [x] 1.1 Create `src/hooks/` directory.
- [x] 1.2 Create `src/hooks/useMaintenanceMode.js` salvaged from `feature/refactor-app-structure-phase1-hooks`.
- [x] 1.3 Update import: `getSystemStatus` from `'../services/system'` (NOT `'../services/api'`).
- [x] 1.4 Rename `skipPathPrefix` param to `shouldBypass` (boolean, default `false`); skip polling when `true`.
- [x] 1.5 Verify: `bun run build` passes, ESLint clean.

## Phase 2: Foundation — `useAgeVerification` Hook (PR 2)

- [x] 2.1 Create `src/hooks/useAgeVerification.js` salvaged from `feature/refactor-app-structure-phase1-hooks`.
- [x] 2.2 Rename `isAdmin` param to `shouldBypass` (boolean); skip toast when `true`.
- [x] 2.3 Verify: `bun run build` passes, ESLint clean.

## Phase 3: Core — `ProtectedRoute` + `AppRoutes` (PR 3)

- [x] 3.1 Create `src/components/ProtectedRoute.jsx` extracted from inline guard in AppRoutes (spec RG-3).
- [x] 3.2 Create `src/components/AppRoutes.jsx` salvaged from `feature/refactor-app-structure-phase2-routes`.
- [x] 3.3 Convert all 19 page imports to `React.lazy()` + wrap route elements in `<Suspense fallback={Spinner}>` (spec AR-1).
- [x] 3.4 Replace inline `isAdmin` with `shouldBypass` using `useMaintenanceMode({ shouldBypass })` and `useAgeVerification({ ..., shouldBypass })`.
- [x] 3.5 Verify: `bun run build` passes, ESLint clean.

## Phase 4: Integration — Slim `App.jsx` (PR 4)

- [x] 4.1 Rewrite `src/App.jsx` to 18-line provider wrapper (BrowserRouter → AuthProvider → CartProvider → AppRoutes).
- [x] 4.2 Remove all old imports, inline ProtectedRoute, maintenance logic, age logic, routes, layout, Toaster from App.jsx.
- [x] 4.3 Verify: `bun run build` passes, ESLint clean.

## Phase 5: Final Verification (after all PRs merged)

- [ ] 5.1 Smoke: Maintenance screen renders on 503 response.
- [ ] 5.2 Smoke: Age verification toast appears for unverified non-admin users.
- [ ] 5.3 Smoke: Admin bypass (`shouldBypass`) skips both maintenance screen and age toast.
- [ ] 5.4 Smoke: Age blur dismisses on toast confirmation.
- [ ] 5.5 Smoke: All 19 routes reachable with correct auth gating.
