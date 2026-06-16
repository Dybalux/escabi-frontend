## Exploration: RFC 9457 Error Response Parsing

### Current State

The backend `webmarket` has migrated to RFC 9457 (`application/problem+json`) error responses. The frontend `escabi-frontend` still contains error handling logic written against the old FastAPI/Pydantic default format.

**Format change (old → new):**

```jsonc
// OLD FastAPI default
{"detail": "Stock insuficiente."}
{"detail": [{"loc": ["body","age"], "msg": "...", "type": "..."}]}

// NEW RFC 9457
{
  "type": "https://api.altotrago.com/errors/insufficient-stock",
  "title": "Insufficient Stock",
  "status": 409,
  "detail": "Stock insuficiente.",
  "instance": "/cart/add"
}
{
  "type": "https://api.altotrago.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Request validation failed.",
  "instance": "/cart/add",
  "errors": [
    {"pointer": "#/age", "detail": "value is not a valid integer", "code": "type_error.integer"}
  ]
}
```

### Affected Areas

| File | Pattern | Severity | Notes |
|------|---------|----------|-------|
| `src/pages/Home.jsx` | `error.response?.data?.detail?.[0]?.msg` | **BREAKS** | Expects old Pydantic array with `msg` property. New format has `detail` as string and `errors` array with `detail` property. |
| `src/components/Admin/ProductForm.jsx` | `Array.isArray(errorData.detail)` with `err.loc` and `err.msg` | **BREAKS** | Expects old Pydantic validation array format. New format uses `errors` array with `pointer` and `detail` instead of `loc` and `msg`. |
| `src/hooks/useMaintenanceMode.js` | `error.response?.data?.message` | **WORKS-BUT-STALE** | RFC 9457 uses `detail` not `message`. Fallback to hardcoded string works, but stale field name. |
| `src/pages/Admin/ProductManagement.jsx` | `error.response?.data?.message` | **WORKS-BUT-STALE** | Same as above — fallback to `message` is stale but covered by `detail` fallback. |
| `src/components/Admin/ProductForm.jsx` | `errorData.message` fallback | **WORKS-BUT-STALE** | Same as above. |
| `src/context/AuthContext.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/context/CartContext.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/components/Cart/Cart.jsx` | `error.response?.status` / `error.response?.data?.detail` | **OK** | Status checks unaffected. Detail fallback OK. |
| `src/components/Admin/ComboForm.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/components/Admin/BulkPriceUpdate.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/pages/Admin/ComboManagement.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/pages/Admin/PaymentSettings.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/pages/Admin/PricingSettings.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/pages/Admin/UserManagement.jsx` | `error.response?.data?.detail` | **OK** | `detail` is top-level in RFC 9457. |
| `src/services/client.js` | `error.response?.status` / `error.response.data` | **OK** | Only logs raw data; status checks unaffected. |
| `src/services/orders.js` | `error.response?.status` | **OK** | Status checks unaffected. |

### Content-Type Handling

Axios handles `application/problem+json` automatically because it is a JSON subtype. The axios default response parser intercepts any `Content-Type` containing `json` and parses it. No frontend configuration change is needed for the media type itself.

### Approaches

#### 1. Minimal Fix — Patch Only Broken Files
Only fix the 2 files that will break (`Home.jsx`, `ProductForm.jsx`). Update them to read from the new RFC 9457 `errors` array when present, otherwise fall back to `detail`.

- **Pros**: Smallest code change, lowest risk, fastest to ship.
- **Cons**: Leaves stale `message` fallbacks in place. No central error handling utility. Future files may repeat the same mistakes.
- **Effort**: Low (~10 lines changed)

#### 2. Unified Error Parser — Create `src/utils/errors.js`
Create a central RFC 9457 error parsing utility and update all call sites to use it. The utility would:
- Accept an Axios error object
- Return a normalized object: `{ title, detail, status, errors: [{ pointer, detail, code }] }`
- Handle both old and new formats for backward compatibility during transition

- **Pros**: Centralized parsing, consistent behavior, easy to maintain, future-proof.
- **Cons**: Requires touching all 16 files that read error data. More lines changed.
- **Effort**: Medium (~40-60 lines changed across 16 files)

#### 3. Axios Interceptor Transformation
Transform the error response in `client.js` response interceptor to maintain backward compatibility while adding new fields. Map `errors` array to old-style `detail` array when `application/problem+json` is detected.

- **Pros**: Zero changes in components. All existing code keeps working.
- **Cons**: Hides the real format. Adds technical debt. Confusing for developers who expect RFC 9457.
- **Effort**: Low (~15 lines in one file)

### Recommendation

**Approach 2 (Unified Error Parser)** with a phased rollout:
1. Create `src/utils/errors.js` with a `parseApiError(error)` function.
2. In the first PR, fix the **BREAKS** files (`Home.jsx`, `ProductForm.jsx`) and the **WORKS-BUT-STALE** files (`useMaintenanceMode.js`, `ProductManagement.jsx`).
3. Leave the **OK** files as-is since they already read `detail` correctly. They can be migrated lazily or in a follow-up PR.

This balances safety (minimal risk) with architecture (centralized parsing). The OK files don't need immediate changes because `detail` is still the top-level human-readable message in RFC 9457.

### Risks

1. **Validation error details are lost**: `Home.jsx` and `ProductForm.jsx` currently extract field-level validation messages from `detail?.[0]?.msg` (old format). With RFC 9457, these move to `errors[].detail`. Users will see a generic "Request validation failed" instead of specific field errors until these files are updated.
2. **Maintenance message fallback**: `useMaintenanceMode.js` reads `message` which no longer exists in RFC 9457. The hardcoded fallback works, but the server-sent maintenance message is ignored.
3. **Testing gap**: The project has **no test runner** (openspec config confirms this). All changes must be verified manually against a staging backend that returns RFC 9457 responses.

### PR Slicing Recommendation

This change is small (~25 lines if we do the minimal fix, ~60 lines if we add the utility). It fits comfortably within the **400-line review budget**. A single PR is recommended.

If the team prefers to be conservative:
- **PR #1**: Create `src/utils/errors.js` + fix `Home.jsx` and `ProductForm.jsx` (the BREAKS files)
- **PR #2**: Fix `useMaintenanceMode.js` and `ProductManagement.jsx` (the WORKS-BUT-STALE files)

### Ready for Proposal

**Yes**. The scope is clear: update error parsing to handle RFC 9457 `application/problem+json` responses. The exact files and severity are identified. The recommended approach (unified parser with phased rollout) balances safety and maintainability.
