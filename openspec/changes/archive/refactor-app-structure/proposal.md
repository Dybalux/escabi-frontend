# Proposal: Refactor App.jsx Structure

## Intent

App.jsx (324 lines) is a monolith mixing providers, routing, maintenance polling,
age verification, and a ProtectedRoute guard. This refactor extracts each concern
into a dedicated module so the root App is a thin wrapper. No behavior changes.

## Scope

### In Scope
- Extract maintenance mode polling into `src/hooks/useMaintenanceMode.js`
- Extract age verification blur logic into `src/hooks/useAgeVerification.js`
- Move routing + ProtectedRoute into `src/components/AppRoutes.jsx`
- Slim `App.jsx` to ~25 lines (BrowserRouter + AuthProvider + CartProvider + AppRoutes)
- Preserve all current behavior: loading spinners, admin bypass, 30s polling, toast styles

### Out of Scope
- Extracting Toaster config to a separate component (deferrable)
- Extracting ProtectedRoute to its own file (deferrable)
- Adding tests or changing any visual/behavioral logic
- Modifying `src/main.jsx`

## Capabilities

### New Capabilities
None — pure structural refactor, no new user-facing capabilities.

### Modified Capabilities
None — no spec-level behavior changes.

## Approach

Three extraction passes, each independently testable:

1. **useMaintenanceMode hook**: Move 3 useState + 1 useEffect from AppRoutes
   into a custom hook. Contract: `() => { inMaintenance, maintenanceMsg, checkingStatus }`.
   Handles `getSystemStatus()` call, 503 fallback, 30s polling (skips `/admin` routes),
   and interval cleanup.

2. **useAgeVerification hook**: Move showBlur state + useEffect into a hook.
   Contract: `({ user, loading, inMaintenance }) => { showBlur }`.
   Reads `localStorage('ageVerified')`, checks `user.role !== 'admin'`, triggers
   `showAgeVerificationToast` with blur-dismissal callback.

3. **AppRoutes component**: Move ProtectedRoute + all Route elements + Header/Footer/
   Toaster into `src/components/AppRoutes.jsx`. Consumes both hooks via composition.
   `isBypassed` logic stays here (combines user.role + pathname).

4. **App.jsx**: Reduce to BrowserRouter → AuthProvider → CartProvider → AppRoutes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/hooks/useMaintenanceMode.js` | New | Maintenance polling hook (~60 lines) |
| `src/hooks/useAgeVerification.js` | New | Age verification blur hook (~30 lines) |
| `src/components/AppRoutes.jsx` | New | Routing + guards + layout (~270 lines) |
| `src/App.jsx` | Modified | Thin provider wrapper (~25 lines, was 324) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Admin bypass breaks if user.role loads after maintenance check | Low | `isBypassed` computation preserved verbatim in AppRoutes; no logic change |
| Interval polling behavior differs after extraction | Low | Keep identical useEffect dependency array `[]` and 30s interval |
| Import path cascade breaks other files | Low | Only App.jsx is imported externally (by main.jsx); internal imports self-contained |
| Build fails due to missing hook file reference | Low | `bun run build` verification step catches this immediately |

## Rollback Plan

`git revert` the commit. All changes are additive (new files + one file rewrite); no
shared state, database, or API contracts are touched. Instant rollback.

## Dependencies

None. Uses existing `getSystemStatus` from `src/services/api.js` and
`showAgeVerificationToast` from `src/components/UI/AgeVerificationToast.jsx`.

## Success Criteria

- [ ] `bun run build` passes with zero errors
- [ ] App.jsx is ≤ 30 lines (providers + router only)
- [ ] Three new files exist: `useMaintenanceMode.js`, `useAgeVerification.js`, `AppRoutes.jsx`
- [ ] Manual smoke test: maintenance screen renders on 503, age toast appears for unverified non-admin, admin routes bypass maintenance, blur dismisses on age confirm
