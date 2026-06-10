# Tasks: Refactor App.jsx Structure

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~650 (3 new files ~360 lines + App.jsx ~300 deleted / ~25 added) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: hooks (tasks 1.1–2.1) → PR 2: AppRoutes (task 2.2) → PR 3: App.jsx rewrite + verify (tasks 3.1–4.1) |
| Delivery strategy | ask-on-risk |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Create `src/hooks/` + `useMaintenanceMode.js` | PR 1 | Base branch; independently verifiable via import check |
| 2 | Create `useAgeVerification.js` | PR 1 (same) | Depends on hooks dir; both hooks fit under budget together |
| 3 | Create `AppRoutes.jsx` with both hooks consumed | PR 2 | Depends on PR 1 hooks existing; largest single file (~270 lines) |
| 4 | Rewrite `App.jsx` + build verification | PR 3 | Depends on PR 2; final integration, ~300-line diff |

## Phase 1: Foundation (Directory + Maintenance Hook)

- [x] 1.1 Create `src/hooks/` directory and `useMaintenanceMode.js` with: `useState` for `inMaintenance`, `maintenanceMsg`, `checkingStatus`; `useEffect` with `getSystemStatus()` call, 30s `setInterval` that skips when `window.location.pathname.startsWith('/admin')`, interval cleanup on unmount, 503 error handling.
- [x] 1.2 Export hook as default: `export default function useMaintenanceMode({ skipPathPrefix } = {})` returning `{ inMaintenance, maintenanceMsg, checkingStatus }`.

## Phase 2: Core Implementation (Age Hook + AppRoutes)

- [x] 2.1 Create `src/hooks/useAgeVerification.js` with: `useState` for `showBlur`; `useEffect` that triggers `showAgeVerificationToast` when `!loading && !inMaintenance && !isAdmin && !localStorage.ageVerified && !showBlur`; toast callback sets `showBlur` false and writes `localStorage.ageVerified='true'`. Export default returning `{ showBlur }`.
- [x] 2.2 Create `src/components/AppRoutes.jsx`: move all imports from App.jsx (routes, pages, Header, Footer, Toaster, ProtectedRoute, MaintenanceScreen, both hooks); compute `isAdmin = user?.role === 'admin'` once; call `useMaintenanceMode()` and `useAgeVerification({ user, loading, inMaintenance, isAdmin })`; preserve control flow order: checkingStatus spinner → maintenance screen → layout + routes + Toaster; `isBypassed = isAdmin || window.location.pathname.startsWith('/admin')`.

## Phase 3: Integration (Rewrite App.jsx)

- [ ] 3.1 Rewrite `src/App.jsx` to ~25 lines: import `BrowserRouter`, `AuthProvider`, `CartProvider`, `AppRoutes`; render `BrowserRouter → AuthProvider → CartProvider → AppRoutes`; remove all `useState`, `useEffect`, `useAuth`, route definitions, `ProtectedRoute`, `Toaster`, `getSystemStatus`, `showAgeVerificationToast`, `MaintenanceScreen`.

## Phase 4: Verification

- [ ] 4.1 Run `bun run build` — must pass with zero errors.
- [ ] 4.2 Manual smoke test checklist: (a) maintenance screen renders on 503, (b) age toast appears for unverified non-admin, (c) admin routes bypass maintenance, (d) blur dismisses on age confirm, (e) all routes navigate correctly, (f) `main.jsx` import of `App` still works.
