# Tasks: RFC 9457 Error Response Parsing

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120 (PR 1: ~70, PR 2: ~50) |
| 400-line budget risk | Low |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (parser + BREAKS) → PR 2 (remaining migration) |
| Delivery strategy | ask-always |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Create parser + fix 2 BREAKS files | PR 1 | Base = main; parser + Home.jsx + ProductForm.jsx |
| 2 | Migrate remaining 16 files | PR 2 | Base = main (after PR 1 merged); depends on PR 1 |

## Phase 1: Parser + BREAKS Fixes (PR 1)

- [x] 1.1 Create `src/utils/errors.js` with `parseApiError(error)` — RFC 9457 detection (`type`+`title`+`status`), old Pydantic array (`Array.isArray(detail)` with `loc`/`msg`), string detail, network error, and unrecognized shape with `console.warn`. Always returns `{ title, detail, status, errors: [] }`.
- [x] 1.2 Add `parseValidationErrors(errors)` to `src/utils/errors.js` — converts `errors` array (RFC 9457 `pointer` or old `loc`) to `Record<field, message>` by stripping `#/` prefix or taking `loc[last]`. Returns `{}` for null/empty.
- [x] 1.3 Fix `src/pages/Home.jsx` L95: replace `error.response?.data?.detail?.[0]?.msg \|\| error.response?.data?.detail \|\| 'Error al agregar al carrito'` with `import { parseApiError } from '../utils/errors'` and `parseApiError(error).detail \|\| 'Error al agregar al carrito'`.
- [x] 1.4 Fix `src/components/Admin/ProductForm.jsx` L168-193: replace `Array.isArray(errorData.detail)` branching with `import { parseApiError, parseValidationErrors } from '../../utils/errors'`. Use `parseApiError(error).detail` for top-level message and `parseValidationErrors(parseApiError(error).errors)` for per-field error mapping when displaying validation errors.
- [x] 1.5 Verify: `bun run build` passes with no errors.
- [x] 1.6 Verify: `bun run lint` passes with no violations in changed files.

## Phase 2: Remaining Migration (PR 2)

- [x] 2.1 Fix `src/hooks/useMaintenanceMode.js` L32: replace `error.response?.data?.message` with `import { parseApiError } from '../utils/errors'` and `parseApiError(error).detail \|\| 'Estamos realizando mejoras. Volvemos pronto.'`.
- [x] 2.2 Fix `src/pages/Admin/ProductManagement.jsx` L61-62: replace `error.response?.data?.detail \|\| error.response?.data?.message` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'Error al eliminar el producto. Puede que tenga pedidos asociados.'`.
- [x] 2.3 Fix `src/context/AuthContext.jsx` L73, L124, L162: replace `error.response?.data?.detail` with `import { parseApiError } from '../utils/errors'` and `parseApiError(error).detail \|\| 'fallback message'` per context.
- [x] 2.4 Fix `src/context/CartContext.jsx` L49, L63, L105, L119: replace `error.response?.data?.detail` with `import { parseApiError } from '../utils/errors'` and `parseApiError(error).detail \|\| 'fallback message'` per context.
- [x] 2.5 Fix `src/components/Cart/Cart.jsx` L178: replace `error.response?.data?.detail` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail`. Keep existing `status` checks above.
- [x] 2.6 Fix `src/components/Admin/ComboForm.jsx` L147: replace `error.response?.data?.detail` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'fallback'`.
- [x] 2.7 Fix `src/components/Admin/BulkPriceUpdate.jsx` L55: replace `error.response?.data?.detail` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'fallback'`.
- [x] 2.8 Fix `src/pages/Admin/ComboManagement.jsx` L49: replace `error.response?.data?.detail` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'fallback'`.
- [x] 2.9 Fix `src/pages/Admin/PaymentSettings.jsx` L88: replace `error.response?.data?.detail` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'fallback'`.
- [x] 2.10 Fix `src/pages/Admin/PricingSettings.jsx` L68: replace `error.response?.data?.detail` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'fallback'`.
- [x] 2.11 Fix `src/pages/Admin/UserManagement.jsx` L69: replace `error.response?.data?.detail` with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'fallback'`.
- [x] 2.12 Fix `src/pages/Admin/ShippingSettings.jsx` L41, L94: replace hardcoded toast messages with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'Error al cargar configuración de envíos'` / `parseApiError(error).detail \|\| 'Error al actualizar configuración de envíos'`.
- [x] 2.13 Fix `src/pages/Admin/OrderManagement.jsx` L28-29, L42: replace hardcoded messages with `import { parseApiError } from '../../utils/errors'` and `parseApiError(error).detail \|\| 'Error al cargar los pedidos'` / `parseApiError(error).detail \|\| 'Error al actualizar el estado'`.
- [x] 2.14 Fix `src/services/client.js` L56-58: add `import { parseApiError } from '../utils/errors'` and replace `console.error('Respuesta del servidor:', error.response.status, error.response.data)` with `console.error('❌ API error:', parseApiError(error))` for structured logging. Keep status checks above.
- [x] 2.15 Confirm `src/services/orders.js` — status checks only, no `data?.detail` access, no change needed.
- [x] 2.16 Confirm `src/App.jsx` — no error handling, no change needed.
- [x] 2.17 Verify: `bun run build` passes with no errors.
- [x] 2.18 Verify: `bun run lint` passes with no violations in changed files.
