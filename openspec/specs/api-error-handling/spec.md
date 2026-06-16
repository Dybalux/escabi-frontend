# API Error Handling Specification

## Purpose

Unified RFC 9457 (`application/problem+json`) error parsing for the escabi-frontend. Replaces ad-hoc `error.response?.data?.detail` patterns with a centralized parser that normalizes all backend error responses into a consistent shape.

## Requirements

### Requirement: Error Parser Contract

The system SHALL export `parseApiError(error)` that accepts an Axios error object and returns a normalized object with shape `{ title: string, detail: string, status: number | undefined, errors: Array<{ pointer: string, detail: string, code: string }> }`. The function SHALL NOT throw and SHALL NOT return `null`.

| Field | RFC 9457 source | Fallback |
|-------|----------------|----------|
| `title` | `data.title` | `data.detail` (if string) or `"Unknown Error"` |
| `detail` | `data.detail` (string) | `data.title` or `"An unexpected error occurred"` |
| `status` | `data.status` | `error.response?.status` |
| `errors` | `data.errors` | `[]` (always an array) |

#### Scenario: RFC 9457 validation error response

- GIVEN backend returns `{ title: "Validation Error", status: 422, detail: "Request validation failed.", errors: [{ pointer: "#/name", detail: "required field", code: "missing" }] }`
- WHEN `parseApiError(error)` is called with the Axios error
- THEN result is `{ title: "Validation Error", detail: "Request validation failed.", status: 422, errors: [{ pointer: "#/name", detail: "required field", code: "missing" }] }`

#### Scenario: RFC 9457 simple error response

- GIVEN backend returns `{ title: "Not Found", status: 404, detail: "Product not found." }`
- WHEN `parseApiError(error)` is called
- THEN result is `{ title: "Not Found", detail: "Product not found.", status: 404, errors: [] }`

#### Scenario: Network error with no response body

- GIVEN `error.response` is `undefined` (network failure, DNS error)
- WHEN `parseApiError(error)` is called
- THEN result is `{ title: "Unknown Error", detail: "An unexpected error occurred", status: undefined, errors: [] }`

#### Scenario: Unrecognized response shape

- GIVEN backend returns `{ message: "Something broke" }` (neither RFC 9457 nor old format)
- WHEN `parseApiError(error)` is called
- THEN result returns a string message derived from available fields
- AND `console.warn` is called with the unrecognized shape for debugging

### Requirement: Validation Error Mapping

The system SHALL export `parseValidationErrors(errors)` that accepts an RFC 9457 `errors` array and returns a `Record<string, string>` mapping field names to error messages. JSON Pointer prefixes (`"#/"`) SHALL be stripped to produce plain field names.

| Input `pointer` | Output key | Output value |
|----------------|------------|-------------|
| `"#/name"` | `"name"` | `errors[0].detail` |
| `"#/price"` | `"price"` | `errors[1].detail` |
| `"#/combo/items"` | `"combo/items"` | `errors[2].detail` |

#### Scenario: Single field validation error

- GIVEN `errors = [{ pointer: "#/name", detail: "Name is required", code: "missing" }]`
- WHEN `parseValidationErrors(errors)` is called
- THEN result is `{ name: "Name is required" }`

#### Scenario: Multiple field validation errors

- GIVEN `errors = [{ pointer: "#/name", detail: "Required" }, { pointer: "#/price", detail: "Must be positive" }]`
- WHEN `parseValidationErrors(errors)` is called
- THEN result is `{ name: "Required", price: "Must be positive" }`

#### Scenario: Empty or null errors array

- GIVEN `errors` is `[]`, `null`, or `undefined`
- WHEN `parseValidationErrors(errors)` is called
- THEN result is `{}` (empty record)

### Requirement: Backward Compatibility

The parser SHALL handle legacy FastAPI/Pydantic error shapes during the transition period. Old format `detail` arrays with `loc` and `msg` properties SHALL be converted to the normalized `errors` array.

| Old field | New mapping |
|-----------|------------|
| `detail[].loc` (array like `["body", "name"]`) | `pointer: "#/name"` (last segment) |
| `detail[].msg` | `detail` (same value) |
| `detail` (plain string) | `detail` (same value) |

#### Scenario: Old Pydantic validation array

- GIVEN backend returns `{ detail: [{ loc: ["body", "name"], msg: "field required", type: "value_error.missing" }] }`
- WHEN `parseApiError(error)` is called
- THEN `errors` contains `[{ pointer: "name", detail: "field required", code: "value_error.missing" }]`
- AND `detail` is the first error message or the string detail

#### Scenario: Old Pydantic string detail

- GIVEN backend returns `{ detail: "Stock insuficiente." }`
- WHEN `parseApiError(error)` is called
- THEN result is `{ detail: "Stock insuficiente.", errors: [] }` with appropriate fallbacks for other fields

### Requirement: Consumer Migration

All 18 files that read error responses SHALL use `parseApiError(error)` instead of direct `error.response?.data` access patterns. No file SHALL access `error.response?.data?.detail`, `error.response?.data?.message`, or `error.response?.data?.detail?.[0]?.msg` directly after migration.

| File | Current pattern | New pattern |
|------|----------------|-------------|
| `Home.jsx` | `detail?.[0]?.msg` | `parseApiError(error).errors` |
| `ProductForm.jsx` | `err.loc` / `err.msg` | `parseValidationErrors(errors)` |
| `useMaintenanceMode.js` | `error.response?.data?.message` | `parseApiError(error).detail` |
| `ProductManagement.jsx` | `error.response?.data?.message` | `parseApiError(error).detail` |
| 14 other files | `error.response?.data?.detail` | `parseApiError(error).detail` |

#### Scenario: Home.jsx displays validation errors

- GIVEN user triggers a validation error on the home page
- WHEN the error is caught
- THEN `parseApiError(error).errors` provides the errors array for display
- AND no direct `detail?.[0]?.msg` access remains

#### Scenario: Maintenance mode reads server message

- GIVEN backend returns 503 with `{ detail: "Sistema en mantenimiento hasta las 15:00" }`
- WHEN `useMaintenanceMode` catches the error
- THEN the displayed message is `"Sistema en mantenimiento hasta las 15:00"` from `detail`
- AND the hardcoded fallback is used only when `detail` is absent

#### Scenario: Build passes after migration

- GIVEN all 18 files have been migrated to use the parser
- WHEN `bun run build` is executed
- THEN the build completes without errors
- AND ESLint reports no violations in changed files
