# Route Guard Specification

## Purpose

Defines the `ProtectedRoute` component that gates access to authenticated-only routes, displaying a loading spinner while auth state resolves and redirecting unauthenticated users to `/login`.

## Requirements

### Requirement: RG-1 Auth State Resolution

The system SHALL read the authentication context's `isAuthenticated` and `loading` states. While `loading` is true, the component MUST render a loading spinner. Once `loading` is false, the component SHALL evaluate `isAuthenticated`.

#### Scenario: Loading spinner displays while auth resolves

- GIVEN the auth context is still loading
- WHEN the user navigates to a protected route
- THEN a loading spinner renders
- AND the route content is not displayed

#### Scenario: Auth resolves to authenticated

- GIVEN the auth context has finished loading
- AND the user is authenticated
- WHEN the protected route renders
- THEN the requested page content displays

### Requirement: RG-2 Redirect on Unauthenticated

The system SHALL redirect to `/login` when `loading` is false and `isAuthenticated` is false. The redirect MUST use React Router's `<Navigate>` component.

#### Scenario: Unauthenticated user redirected to login

- GIVEN the auth context has finished loading
- AND the user is NOT authenticated
- WHEN the user navigates to `/mi-perfil`
- THEN the user is redirected to `/login`
- AND the protected page does NOT render

### Requirement: RG-3 Component Location

The `ProtectedRoute` component SHALL be defined in its own file at `src/components/ProtectedRoute.jsx` and exported as the default export.

#### Scenario: ProtectedRoute is importable

- GIVEN the file `src/components/ProtectedRoute.jsx` exists
- WHEN another module imports it
- THEN the import resolves to the ProtectedRoute component
