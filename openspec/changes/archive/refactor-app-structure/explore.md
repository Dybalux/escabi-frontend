# Exploration: Refactor App Structure (v2)

**Date**: 2026-06-14
**Context**: Fresh start — previous attempt (3 PRs in feature branch family) never reached main. This exploration evaluates what's still valid against the current main state (post api-services-layer archive at commit `d14be29`).

---

## 1. Current state of `src/App.jsx`

**File**: `src/App.jsx` — **324 lines** (current main)

The file is a monolith mixing the following concerns:

| Concern | Line Range | What it does | Extractable to |
|---------|-----------|--------------|----------------|
| **Imports** | 1–46 | 24 imports (react-router, contexts, pages, components, services, hooks) | AppRoutes.jsx (pages/components), App.jsx (providers/router only) |
| **ProtectedRoute** | 28–41 | Inline guard: spinner while auth loading, redirect to `/login` if unauthenticated | AppRoutes.jsx (kept inline per design) or own file (deferrable) |
| **Maintenance mode logic** | 43–95 | `getSystemStatus` polling, `inMaintenance` state, 503 handling, 30s interval, admin skip | `useMaintenanceMode` hook |
| **Age verification logic** | 97–107 | `showBlur` state, `localStorage.getItem('ageVerified')`, `showAgeVerificationToast` call | `useAgeVerification` hook |
| **Route definitions** | 133–249 | 19 `<Route>` elements (public, protected, payment, admin, 404) | `AppRoutes` component |
| **Layout shell** | 129–253 | `<div id="app-content">`, `<Header />`, `<main>`, `<Footer />` | `AppRoutes` component |
| **Toaster setup** | 254–307 | `react-hot-toast` configuration with gradients, durations, positions | `AppRoutes` component |
| **App root** | 312–324 | `BrowserRouter → AuthProvider → CartProvider → AppRoutes` | Kept in `App.jsx` (slim wrapper) |

**Key observation**: The structure is identical to the pre-refactor state of the old attempt, except for **line 45**:
- **Current main**: `import { getSystemStatus } from './services/system';` (explicit path, from api-services-layer PR #13)
- **Old attempt**: `import { getSystemStatus } from './services/api';` (via api.js shim)

This is the only material difference between the old attempt's starting point and current main.

---

## 2. Old spec requirements — re-evaluation

The old spec defined 3 ADDED requirements and 2 MODIFIED/REMOVED requirements.

### useMaintenanceMode hook

- **Still valid?** ✅ **Yes.** The maintenance polling logic is still inline in `App.jsx:55–95` and is the largest single block of extractable logic.
- **Conflicts with current main?** ⚠️ **Minor import path conflict.** The old hook imports `getSystemStatus` from `'../services/api'`. On current main, `App.jsx` imports from `'../services/system'`. The `api.js` shim still re-exports `getSystemStatus` (line 28), so the old import path **still works**, but it's inconsistent with the new explicit-import convention established by api-services-layer PR #13.
- **Updates needed?** Update the import to `'../services/system'` for consistency. No logic changes.

### useAgeVerification hook

- **Still valid?** ✅ **Yes.** The age verification blur logic is still inline in `App.jsx:97–107` and is cleanly extractable.
- **Conflicts with current main?** None. The `showAgeVerificationToast` import path is unchanged.
- **Updates needed?** None. The old hook file is still valid as-is.

### AppRoutes component

- **Still valid?** ✅ **Yes.** The route list, layout shell, Toaster, and guards are all unchanged.
- **Conflicts with current main?** None. The route list is identical. The `ProtectedRoute` guard is identical. The `isBypassed` logic (now called `isAdmin` in the old refactored version) is identical.
- **Updates needed?** None, except the `isAdmin` variable name is more accurate than the old `isBypassed` — the old design already made this decision.

---

## 3. What's new since the old attempt

### api-services-layer changes (already on main)

The api-services-layer refactor (PRs #11–#13) was merged to main. Relevant impacts:

1. **`getSystemStatus` explicit path**: PR #13 (commit `30c55e0`) changed `App.jsx:45` from `'./services/api'` to `'./services/system'`. The new `refactor-app-structure` hook should follow this convention.
2. **`src/services/` directory is stable**: 15 files (client, api.js shim, 8 public domain, 5 admin, system). No new helpers need to be created.
3. **`src/hooks/` directory does NOT exist**: The old attempt's hooks were never created on main. The new attempt will create this directory.

### No other changes affecting this refactor

- No new routes added
- No new auth or cart context changes
- No new toast or maintenance screen changes
- `main.jsx` still imports `App` from `./App.jsx` (unchanged)

---

## 4. Salvageable artifacts from the feature branch

### `feature/refactor-app-structure-phase3-app:src/App.jsx`

The final refactored App.jsx is **18 lines** (4 imports + provider tree + export). This is **fully salvageable**.

```jsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './components/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### `feature/refactor-app-structure-phase1-hooks:src/hooks/useMaintenanceMode.js`

**52 lines.** The logic is **fully salvageable** with one import path update:
- Old: `import { getSystemStatus } from '../services/api';`
- New: `import { getSystemStatus } from '../services/system';` (matches api-services-layer convention)

No other changes needed.

### `feature/refactor-app-structure-phase1-hooks:src/hooks/useAgeVerification.js`

**20 lines.** The logic is **fully salvageable as-is**. No changes needed.

### `feature/refactor-app-structure-phase2-routes:src/components/AppRoutes.jsx`

**248 lines.** The component is **fully salvageable** as-is. All imports, routes, layout shell, Toaster config, and guards match the current main state. No changes needed.

**Note**: The `AppRoutes` component in the old phase2 branch uses `useMaintenanceMode` and `useAgeVerification` hooks, so it assumes the hooks exist. This is correct for the final state.

---

## 5. Risks and concerns

### 1. Import path inconsistency (api-services-layer conflict)

**Severity**: Low
**Details**: The old hooks import `getSystemStatus` from `'../services/api'`. While the api.js shim still re-exports it (line 28), the explicit path `'../services/system'` is the new convention. Using the shim path works but is technically a regression in clarity.
**Mitigation**: Update the hook import to `'../services/system'` during the new apply phase.

### 2. No merge conflict expected (but watch the line)

**Severity**: Low
**Details**: The api-services-layer PR #13 modified `App.jsx:45` (the `getSystemStatus` import). The new refactor will delete that entire line (along with the rest of App.jsx). Git will handle this cleanly since the new App.jsx is a complete rewrite. No actual merge conflict is expected.
**Mitigation**: The apply phase should simply rewrite App.jsx; no need to re-apply the api-services-layer changes.

### 3. No test infrastructure

**Severity**: Medium
**Details**: No test runner, no test files. Verification is limited to `bun run build`, lint, and manual smoke testing. This is the same as the old attempt (which passed verify with warnings).
**Mitigation**: Manual smoke test checklist: maintenance screen on 503, age toast for unverified non-admin, admin bypass, blur dismiss on confirm.

### 4. Scope creep risk

**Severity**: Medium
**Details**: The old attempt stayed disciplined (3 PRs, no new behavior). The new attempt should also avoid extracting Toaster config or ProtectedRoute to separate files — those are deferrable.
**Mitigation**: Explicitly keep Toaster inline in AppRoutes and ProtectedRoute inline in AppRoutes.

### 5. Feature branch family failure mode

**Severity**: High (process risk)
**Details**: The old attempt failed because the 3 PRs were merged into a feature branch family (`feature/refactor-app-structure-phase1/2/3`) and then the final merge to main never happened. The code was correct but the delivery strategy failed.
**Mitigation**: Use **stacked-to-main** (each PR merges directly to main, like api-services-layer did successfully). This avoids the "feature branch graveyard" problem.

---

## 6. Recommendations

### Re-use old spec? ✅ Yes, with minimal updates

The 3 ADDED requirements from the old spec are **still 100% valid**. The only update needed is:
- `useMaintenanceMode` hook import path: `'../services/api'` → `'../services/system'`

No new requirements are needed. No existing requirements are obsolete.

### PR slicing

Recommended 3 PRs, **stacked-to-main** (each merges directly to `main`):

| PR | Content | Files | Est. Lines (added + removed) | Reviewable? |
|----|---------|-------|------------------------------|-------------|
| **PR 1** | Create `useMaintenanceMode` hook | `src/hooks/useMaintenanceMode.js` (new) | ~52 added | ✅ Under 400 |
| **PR 2** | Create `useAgeVerification` hook + `AppRoutes` component | `src/hooks/useAgeVerification.js` (new), `src/components/AppRoutes.jsx` (new) | ~20 + 248 = 268 added | ✅ Under 400 |
| **PR 3** | Slim `App.jsx` to 18-line wrapper | `src/App.jsx` (rewrite) | ~18 added, ~306 removed = 324 changed | ✅ Under 400 |

**Alternative 2-PR slicing** (if we want fewer PRs):
- PR 1: Both hooks (72 added)
- PR 2: AppRoutes + App.jsx slim (248 + 18 added, 306 removed = 572 changed) — **exceeds 400-line review budget**. Not recommended.

**Alternative 4-PR slicing** (if we want smaller PRs):
- PR 1: `useMaintenanceMode` (52 added)
- PR 2: `useAgeVerification` (20 added)
- PR 3: `AppRoutes` component (248 added)
- PR 4: `App.jsx` slim (324 changed)
This is also valid and keeps every PR under 200 lines. Slightly more overhead but maximizes review focus.

**Recommendation**: Stick with **3 PRs** — the old approach was proven correct and the verify report passed. The only change is the delivery strategy.

### Chain strategy: **stacked-to-main**

**Reasoning**: The api-services-layer change (6 PRs) successfully reached main using stacked-to-main. The old `refactor-app-structure` attempt (3 PRs) failed using feature-branch-chain. The pattern is clear: stacked-to-main works, feature-branch-chains die.

Stacked-to-main means:
1. PR 1 branches from `main`, merges to `main`
2. PR 2 branches from updated `main`, merges to `main`
3. PR 3 branches from updated `main`, merges to `main`

No long-lived feature branch. No final "merge the feature branch" step that can be forgotten.

### Estimated total lines

- New code: `useMaintenanceMode` (52) + `useAgeVerification` (20) + `AppRoutes` (248) + `App.jsx` (18) = **338 lines added**
- Removed code: old `App.jsx` (324) = **306 lines removed** (18 lines of the new App.jsx remain)
- Total changed: **~644 lines** (338 added + 306 removed)
- Per PR max: **324 lines** (PR 3)

All within the 400-line review budget.

### Open questions

1. **Should we rename `isAdmin` to `shouldBypass`?** The old verify report suggested this as a cosmetic improvement. Not required, but worth considering in the design phase.
2. **Should the hooks directory be created in PR 1 or should both hooks be created together?** The old attempt created both in phase1. This is still the right approach.
3. **Should `ProtectedRoute` be extracted to its own file?** The old spec says deferrable. Current scope should keep it inline in `AppRoutes.jsx` to minimize blast radius.

---

## Summary

| Artifact | Still Valid? | Notes |
|----------|-------------|-------|
| `useMaintenanceMode` hook | ✅ Yes | Update import to `../services/system` |
| `useAgeVerification` hook | ✅ Yes | No changes needed |
| `AppRoutes` component | ✅ Yes | No changes needed |
| `App.jsx` slim (18 lines) | ✅ Yes | No changes needed |
| Old spec requirements | ✅ Yes | All 3 ADDED reqs still apply |
| Old design decisions | ✅ Yes | All architecture decisions still valid |

**Verdict**: The old attempt was architecturally correct and the code was sound. It failed on **process** (feature branch chain), not on **technical merit**. The new attempt should reuse the old spec and design almost verbatim, with only the import path update and a switch to **stacked-to-main** delivery.

**Ready for Proposal**: ✅ Yes.
