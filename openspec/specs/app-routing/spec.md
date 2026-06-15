# App Routing Specification

## Purpose

Defines the `AppRoutes` component that consolidates all route definitions, layout shell, lazy loading, and toast configuration extracted from the monolithic `App.jsx`.

## Requirements

### Requirement: AR-1 Lazy-Loaded Route Components

The system SHALL lazy-load all page components using `React.lazy()` to enable code splitting. Each route's page component MUST be wrapped in `React.lazy()` with a dynamic `import()` expression.

#### Scenario: Route component loads on navigation

- GIVEN the user navigates to `/productos`
- WHEN the route matches
- THEN the `Productos` component is fetched via dynamic import
- AND a loading fallback is displayed until the chunk resolves

#### Scenario: Route component fails to load

- GIVEN a network error prevents the chunk from loading
- WHEN the lazy import rejects
- THEN the router error boundary handles the failure
- AND the user sees an error state (not a blank screen)

### Requirement: AR-2 Route Definitions

The system SHALL define exactly 19 routes organized into 4 categories: public (home, products, product detail, cart, about, contact, FAQ), protected (checkout, order confirmation, my orders, profile, order detail), payment (payment success, payment failure), admin (admin dashboard, admin products, admin orders, admin users), and a catch-all 404 route.

#### Scenario: Public route is accessible without authentication

- GIVEN an unauthenticated user
- WHEN navigating to `/nosotros`
- THEN the About page renders

#### Scenario: Protected route requires authentication

- GIVEN an unauthenticated user
- WHEN navigating to `/checkout`
- THEN the ProtectedRoute guard redirects to `/login`

#### Scenario: Unknown route shows 404

- GIVEN any user
- WHEN navigating to `/ruta-inexistente`
- THEN the 404 NotFound page renders

### Requirement: AR-3 Layout Shell

The system SHALL render a consistent layout shell for all routes consisting of a `<div id="app-content">` wrapper containing `<Header />`, a `<main>` element wrapping the `<Outlet />` or route content, and `<Footer />`.

#### Scenario: Layout renders on every route

- GIVEN any valid route
- WHEN the page renders
- THEN Header appears at top, main content in center, Footer at bottom

### Requirement: AR-4 Toaster Configuration

The system SHALL configure `react-hot-toast` Toaster with custom styling (gradients, durations, positions) inline within the `AppRoutes` component. Toast settings MUST NOT be extracted to a separate module.

#### Scenario: Toast displays with configured styling

- GIVEN an action triggers a toast notification
- WHEN the toast renders
- THEN it uses the configured gradient, duration, and position settings
