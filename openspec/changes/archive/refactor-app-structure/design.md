# Design: Refactor App.jsx Structure

## Technical Approach

Three extraction passes, zero behavior change. Move maintenance polling → `useMaintenanceMode`, age verification → `useAgeVerification`, routing → `AppRoutes`. Root `App.jsx` becomes a thin provider wrapper. No new dependencies, no API changes.

## Component Tree

**Before** (324 lines in one file):
```
App
 └─ BrowserRouter → AuthProvider → CartProvider → AppRoutes (inline)
      ├─ ProtectedRoute (inline)
      ├─ Maintenance polling (useState + useEffect ×1)
      ├─ Age verification (useState + useEffect ×1)
      └─ Routes + Header + Footer + Toaster
```

**After** (4 files, ~25 + 60 + 30 + 270 lines):
```
App (~25 lines)
 └─ BrowserRouter → AuthProvider → CartProvider → AppRoutes (~270 lines)
      ├─ useMaintenanceMode()  → { inMaintenance, maintenanceMsg, checkingStatus }
      ├─ useAgeVerification()  → { showBlur }
      ├─ ProtectedRoute (inline, unchanged)
      └─ Routes + Header + Footer + Toaster
```

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `window.location.pathname` vs `useLocation()` for admin-route skip | `useLocation` would be stale inside 30s `setInterval` closure unless wrapped in `useRef`; `window.location.pathname` is always fresh | **Keep `window.location.pathname`** — polling guard, not reactive routing |
| `localStorage.getItem('ageVerified')` direct vs dependency-injected | Injecting adds indirection for a 1-line boolean read; no test infrastructure exists to benefit from mockability | **Keep direct localStorage** — project pattern, no DI framework |
| `ProtectedRoute` extracted vs kept inline | Out of scope (proposal lists as deferrable); extraction changes nothing for this refactor | **Keep inline in AppRoutes.jsx** |
| Pass `isAdmin` as hook param vs each hook computing it | Current code duplicates `user?.role === 'admin'` in `isBypassed` and age effect. Consolidating removes a subtle divergence risk. | **Compute `isAdmin` once in AppRoutes, pass to both hooks** |

## Hook Contracts

### `useMaintenanceMode({ skipPathPrefix? })`

```
Parameters:  { skipPathPrefix?: string }   // default '/admin'
Returns:     { inMaintenance: boolean, maintenanceMsg: string, checkingStatus: boolean }
Side effects: GET /system-status on mount; polls every 30s (skips when pathname starts with skipPathPrefix);
              on 503 from any request, sets inMaintenance=true with error message;
              cleanup: clears interval on unmount
```

### `useAgeVerification({ user, loading, inMaintenance, isAdmin })`

```
Parameters:  { user: object|null, loading: boolean, inMaintenance: boolean, isAdmin: boolean }
Returns:     { showBlur: boolean }
Side effects: When !loading && !inMaintenance && !isAdmin && !localStorage.ageVerified && !showBlur:
              calls showAgeVerificationToast(callback → setShowBlur(false));
              callback also writes localStorage.ageVerified='true' inside toast button
```

## Control Flow (order is load-bearing)

```
AppRoutes render
  ├─ 1. useMaintenanceMode()           ← fires on mount, sets checkingStatus→false
  ├─ 2. useAgeVerification()           ← waits for !loading, depends on inMaintenance
  ├─ 3. if checkingStatus && !admin    → spinner (blocks all below)
  ├─ 4. if inMaintenance && !isBypassed → <MaintenanceScreen> (blocks all below)
  └─ 5. render app layout + routes + Toaster (with showBlur CSS class)
```

Steps 3→4→5 are the same conditional chain as today, verbatim.

## Import Graph

```
main.jsx ──→ App (unchanged)

App ──→ BrowserRouter (react-router-dom)
     ──→ AuthProvider (./context/AuthContext)
     ──→ CartProvider (./context/CartContext)
     ──→ AppRoutes (./components/AppRoutes)          ← new default import

AppRoutes ──→ Routes, Route, Navigate (react-router-dom)
          ──→ useAuth (./context/AuthContext)
          ──→ useMaintenanceMode (../hooks/useMaintenanceMode)   ← new
          ──→ useAgeVerification (../hooks/useAgeVerification)   ← new
          ──→ 18 page/component imports (Header, Footer, Login, ...)  ← moved from App
          ──→ Toaster (react-hot-toast)

useMaintenanceMode ──→ useState, useEffect (react)
                   ──→ getSystemStatus (../services/api)

useAgeVerification ──→ useState, useEffect (react)
                    ──→ showAgeVerificationToast (../components/UI/AgeVerificationToast)
```

## New Directory Structure

```
src/
├── hooks/                         ← directory created (currently does not exist)
│   ├── useMaintenanceMode.js      ← new: ~60 lines
│   └── useAgeVerification.js      ← new: ~30 lines
├── components/
│   ├── AppRoutes.jsx              ← new: ~270 lines (was inline in App.jsx)
│   └── ... (31 existing files, unchanged)
├── App.jsx                        ← modified: 324 → ~25 lines
└── main.jsx                       ← unchanged
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useMaintenanceMode.js` | Create | Polling hook: 3 states + 1 useEffect, `getSystemStatus()` + 30s interval + 503 handling |
| `src/hooks/useAgeVerification.js` | Create | Blur hook: 1 state + 1 useEffect, localStorage read + toast trigger |
| `src/components/AppRoutes.jsx` | Create | Routing component: consumes both hooks, ProtectedRoute, all Routes, Header, Footer, Toaster |
| `src/App.jsx` | Modify | Strip to BrowserRouter + AuthProvider + CartProvider + AppRoutes (~25 lines) |

## Edge Cases

1. **Interval closure over `checkStatus`**: The current pattern defines `checkStatus` inside `useEffect` and references it in `setInterval`. The refactored hook preserves this exactly — `checkStatus` reads `window.location.pathname` at call time, not capture time. No stale-closure risk.

2. **Race between `checkingStatus` and admin route**: Admin users on `/admin/*` skip the loading spinner (`checkingStatus && !window.location.pathname.startsWith('/admin')`). The `checkingStatus` check runs BEFORE `inMaintenance && !isBypassed`. This ordering is preserved identically.

3. **`isBypassed` composition**: Currently uses both `user?.role === 'admin'` AND `window.location.pathname.startsWith('/admin')`. The `user?.role` check covers authenticated admins on any page; the pathname check covers the login page for admins who haven't loaded yet. Both guards remain in AppRoutes unchanged.

4. **`main.jsx` zero-touch**: Imports `App` from `./App.jsx` — the export name is unchanged (`export default App`). No modification needed.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | Zero regressions | `bun run build` — pass/fail gate |
| Manual smoke | Maintenance screen on 503, age toast, admin bypass, blur dismiss | Same manual checks as today; no test runner configured |

## Migration / Rollout

No migration required. `git revert` the commit restores the single-file App.jsx instantly. All changes are additive (3 new files + 1 rewrite); no shared state or API contracts touched.

## Open Questions

None — all decisions resolved above.
