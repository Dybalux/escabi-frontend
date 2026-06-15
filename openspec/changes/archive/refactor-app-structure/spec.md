# Delta: App Structure Refactor

## ADDED Requirements

### Requirement: Maintenance Mode Polling Hook

The system MUST provide a `useMaintenanceMode` hook returning `{ inMaintenance, maintenanceMsg, checkingStatus }` encapsulating all status polling.

| # | Scenario | GIVEN | WHEN | THEN |
|---|----------|-------|------|------|
| 1 | Initial check | app mounts, `getSystemStatus()` called | response has `maintenance_mode: true` | `inMaintenance=true`, `maintenanceMsg` from server or default |
| 2 | 503 handling | app mounts, `getSystemStatus()` throws | error status is `503` | `inMaintenance=true` with error or default message |
| 3 | Admin skip polling | interval active (30s) | pathname starts with `/admin` | `checkStatus()` skipped for that tick |
| 4 | Cleanup on unmount | hook mounted with active interval | component unmounts | interval cleared via `clearInterval` |
| 5 | Non-503 errors | `getSystemStatus()` throws | error status is NOT `503` | `inMaintenance=false` |

### Requirement: Age Verification Blur Hook

The system MUST provide a `useAgeVerification` hook returning `{ showBlur }` that triggers the age toast when conditions are met.

| # | Scenario | GIVEN | WHEN | THEN |
|---|----------|-------|------|------|
| 1 | Unverified non-admin | `loading=false`, `inMaintenance=false`, no `ageVerified` in localStorage | user role is NOT `admin` | `showBlur=true`, `showAgeVerificationToast` called with blur-dismissal callback |
| 2 | Admin suppressed | `loading=false`, no `ageVerified` | user role IS `admin` | `showBlur=false`, no toast |
| 3 | Maintenance suppressed | `inMaintenance=true` | hook evaluates | `showBlur=false` |
| 4 | Already verified | `ageVerified` in localStorage | hook evaluates | `showBlur=false` |

### Requirement: AppRoutes Component

The system MUST provide an `AppRoutes` component rendering all routes, layout shell (Header/Footer), Toaster, and guards.

| # | Scenario | GIVEN | WHEN | THEN |
|---|----------|-------|------|------|
| 1 | Loading spinner | `checkingStatus=true`, pathname NOT `/admin*` | AppRoutes renders | spinner displayed, no routes yet |
| 2 | Admin bypass maintenance | `inMaintenance=true`, `isBypassed=true` (admin role or `/admin` path) | AppRoutes renders | full route layout renders, NOT MaintenanceScreen |
| 3 | Maintenance blocks non-admin | `inMaintenance=true`, `isBypassed=false` | AppRoutes renders | ONLY MaintenanceScreen displayed |
| 4 | Protected redirect | user NOT authenticated | navigate to `/products`, `/cart`, `/orders` | redirect to `/login` |
| 5 | Protected loading | auth `loading=true` | protected route accessed | spinner shown (no redirect, no content) |
| 6 | Layout shell | NOT in maintenance (or admin bypasses) | any route renders | Header above `<main>`, Footer below `<main>` |
| 7 | 404 catch-all | pathname matches no route | user navigates | NotFound page rendered |
| 8 | Toaster config | app renders, toast triggered | — | position `top-center`, `gutter:8`, `containerStyle.top:80`, default `3000ms`, success/error/loading gradients as defined |

## MODIFIED Requirements

### Requirement: App.jsx Root Component

App.jsx MUST be a thin provider wrapper: `BrowserRouter` → `AuthProvider` → `CartProvider` → `AppRoutes`. No routing, polling, or UI state.
(Previously: 324-line monolith with routing, polling, age verification, ProtectedRoute, Toaster, all Route definitions)

| # | Scenario | GIVEN | WHEN | THEN |
|---|----------|-------|------|------|
| 1 | Provider tree | app starts | App.jsx mounts | BrowserRouter wrapping AuthProvider wrapping CartProvider wrapping AppRoutes |
| 2 | No inline logic | App.jsx source | inspected | NO `useState`, `useEffect`, `getSystemStatus`, `showAgeVerificationToast`, `Routes`, `Route`, or `Toaster` |

## REMOVED Requirements

### Requirement: Inline Maintenance Polling in App.jsx

(Reason: Extracted to `useMaintenanceMode` hook — same behavior, different module)
(Migration: Import from `src/hooks/useMaintenanceMode.js`)

### Requirement: Inline Age Verification Logic in App.jsx

(Reason: Extracted to `useAgeVerification` hook — same behavior, different module)
(Migration: Import from `src/hooks/useAgeVerification.js`)

### Requirement: Inline Route Definitions and ProtectedRoute in App.jsx

(Reason: Extracted to `AppRoutes` component — same behavior, different module)
(Migration: Import `AppRoutes` from `src/components/AppRoutes.jsx`)
