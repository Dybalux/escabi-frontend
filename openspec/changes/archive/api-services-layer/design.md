# Design: API Services Layer

## 1. Technical Approach

### The split: helper-to-module mapping

Every helper in `api.js` is assigned a destination module. The table below lists all 41 existing helpers plus 3 new ones.

| # | Helper | Source | Destination Module | URL |
|---|--------|--------|--------------------|-----|
| 1 | `register` | api.js:135 | `services/auth.js` | POST /auth/register |
| 2 | `login` | api.js:136 | `services/auth.js` | POST /auth/token |
| 3 | `getCurrentUser` | api.js:144 | `services/auth.js` | GET /auth/me |
| 4 | `verifyAge` | api.js:145 | `services/auth.js` | POST /age-verification/verify-age |
| 5 | `getProducts` | api.js:148 | `services/products.js` | GET /products/ |
| 6 | `getProduct` | api.js:149 | `services/products.js` | GET /products/{id} |
| 7 | `getCart` | api.js:152 | `services/cart.js` | GET /cart/ |
| 8 | `addToCart` | api.js:153 | `services/cart.js` | POST /cart/add |
| 9 | `addComboToCart` | api.js:155 | `services/cart.js` | POST /cart/add |
| 10 | `removeFromCart` | api.js:157 | `services/cart.js` | DELETE /cart/remove/{id} |
| 11 | `clearCart` | api.js:158 | `services/cart.js` | DELETE /cart/clear |
| 12 | `createOrder` | api.js:161 | `services/orders.js` | POST /orders/ |
| 13 | `getMyOrders` | api.js:165 | `services/orders.js` | GET /orders/me |
| 14 | `getOrder` | api.js:166 | `services/orders.js` | GET /orders/{id} |
| 15 | `validateOrder` | api.js:184 | `services/orders.js` | wraps `getOrder` |
| 16 | `selectPaymentMethod` | api.js:178 | `services/orders.js` | POST /orders/{id}/select-payment-method |
| 17 | `createPaymentPreference` | api.js:169 | `services/payments.js` | POST /payments/create-preference/{id} |
| 18 | `getPaymentSettings` | api.js:175 | `services/payments.js` | GET /payment-settings |
| 19 | `getShippingPrices` | api.js:240 | `services/shipping.js` | GET /orders/shipping-prices |
| 20 | `getCombos` | api.js:243 | `services/combos.js` | GET /combos/ |
| 21 | `getCombo` | api.js:244 | `services/combos.js` | GET /combos/{id} |
| 22 | `getAdminCombos` | api.js:247 | `services/combos.js` | GET /combos/admin/all |
| 23 | `createCombo` | api.js:249 | `services/combos.js` | POST /combos/admin |
| 24 | `updateCombo` | api.js:250 | `services/combos.js` | PUT /combos/admin/{id} |
| 25 | `deleteCombo` | api.js:251 | `services/combos.js` | DELETE /combos/admin/{id} |
| 26 | `getSystemStatus` | api.js:255 | `services/system.js` | GET /system-status |
| 27 | `getAdminSystemSettings` | api.js:256 | `services/system.js` | GET /admin/system-settings |
| 28 | `updateSystemStatus` | api.js:257 | `services/system.js` | PUT /admin/system-settings |
| 29 | `getAdminUsers` | api.js:203 | `services/admin/adminUsers.js` | GET /admin/users |
| 30 | `updateUserRole` | api.js:204 | `services/admin/adminUsers.js` | PUT /admin/users/{id}/role |
| 31 | `getAdminOrders` | api.js:208 | `services/admin/adminOrders.js` | GET /admin/orders |
| 32 | `updateOrderStatus` | api.js:209 | `services/admin/adminOrders.js` | PUT /orders/admin/{id}/status |
| 33 | `createProduct` | api.js:213 | `services/admin/adminProducts.js` | POST /products/ |
| 34 | `updateProduct` | api.js:214 | `services/admin/adminProducts.js` | PUT /products/{id} |
| 35 | `deleteProduct` | api.js:215 | `services/admin/adminProducts.js` | DELETE /products/{id} |
| 36 | `toggleProductActive` | api.js:216 | `services/admin/adminProducts.js` | PATCH /products/{id}/toggle-active |
| 37 | `getAdminPaymentSettings` | api.js:219 | `services/admin/adminSettings.js` | GET /admin/payment-settings |
| 38 | `updatePaymentSettings` | api.js:220 | `services/admin/adminSettings.js` | PUT /admin/payment-settings |
| 39 | `getShippingSettings` | api.js:223 | `services/admin/adminSettings.js` | GET /admin/shipping-settings |
| 40 | `updateShippingSettings` | api.js:224 | `services/admin/adminSettings.js` | PUT /admin/shipping-settings |
| 41 | `getAdminStats` | api.js:200 | `services/admin/adminSettings.js` | GET /admin/stats |
| 42 | `getPricingSettings` | **NEW** | `services/admin/adminSettings.js` | GET /admin/pricing-settings |
| 43 | `updatePricingSettings` | **NEW** | `services/admin/adminSettings.js` | PUT /admin/pricing-settings |
| 44 | `bulkUpdatePrices` | **NEW** | `services/admin/adminSettings.js` | POST /admin/bulk-price-update |

> **Note on `getShippingSettings`**: The Shipping spec requirement claims this goes to `shipping.js`, conflicting with the Admin Settings requirement. The actual code calls `GET /admin/shipping-settings` (admin endpoint, used only by `Admin/ShippingSettings.jsx`). Resolution: `getShippingSettings` lives in `admin/adminSettings.js`. `shipping.js` exports only `getShippingPrices` (public).

### `client.js` code outline

Every line of the interceptor logic (request interceptor, refresh flow, queue, `processQueue`) moves **verbatim** from `api.js` lines 1-132. The only behavioral change is the env check.

```js
// services/client.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// CHANGED: fail-fast instead of console.error
if (!API_URL) {
    throw new TypeError(
        'VITE_API_URL is not defined. Set it in your .env file.'
    );
}

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — UNCHANGED (api.js:17-25)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Refresh queue variables — UNCHANGED (api.js:27-29)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor — UNCHANGED (api.js:42-132)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 503: let App.jsx handle maintenance screen
        if (error.response?.status === 503) {
            return Promise.reject(error);
        }

        console.error('❌ Error en la API:', error.message);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor');
        }

        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh') &&
            !originalRequest.url.includes('/auth/token')) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await api.post('/auth/refresh', {
                    refresh_token: refreshToken
                });

                const { access_token, refresh_token: newRefreshToken } = response.data;

                localStorage.setItem('token', access_token);
                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                processQueue(null, access_token);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
```

### Re-export shim strategy

`api.js` transforms incrementally. Each domain PR:

1. **Creates** the domain module file.
2. **Removes** the inline helper functions from `api.js`.
3. **Adds** a re-export line: `export { helper1, helper2 } from './domainModule';`.
4. The default export (`export default api`) is **moved** to `client.js` in PR 1. The line in `api.js` is **replaced** with `import api from './client'; export default api;` (a pure re-export) so the 2 leaker files (`BulkPriceUpdate.jsx`, `PricingSettings.jsx`) keep working. The `export default api` line in `api.js` is **removed in PR 9** along with the leaker cleanups. `client.js` uses `export default api` (not named export) for consistency with the existing consumer pattern; the spec's "named export" wording refers to "domain modules should not import the raw instance" — a property that holds regardless of default vs named.

By PR 9, `api.js` contains only re-exports — zero inline helpers. Consumers still importing from `services/api` get the same exports via re-export pass-through, ensuring backward compatibility during the transition.

### Deviation P6-A (recorded 2026-06-11)

PR 1 was implemented with `export default api` in `client.js` and a `import api from './client'; export default api;` shim in `api.js`. The spec said "named export consumed only by domain modules" — this was interpreted as "domain modules must not import the raw instance", not as a strict named-vs-default requirement. Rationale: changing the import style mid-refactor would force every consumer file to also change its import syntax (`{ api }` instead of `api`), inflating every PR diff with cosmetic changes. Keeping the default export in client.js minimizes consumer churn. The default export in `api.js` shim is removed in PR 9 once the leakers are fixed.

The shim lives **directly in `api.js`** — no separate `api-legacy.js` file. This keeps the migration path simple: consumers change one import path per PR; the shim absorbs the rest. A separate legacy file would require two import path migrations per consumer (api → domain, then api-legacy → nothing), doubling the diff.

## 2. Module Dependency Graph

```
client.js          ← no imports from services/

  ├── auth.js      ← imports: client.js
  ├── products.js  ← imports: client.js
  ├── combos.js    ← imports: client.js
  │     └── admin/adminCombos.js  ← imports: ../combos.js (re-export only)
  ├── cart.js      ← imports: client.js
  ├── orders.js    ← imports: client.js (getOrder used internally by validateOrder)
  ├── payments.js  ← imports: client.js
  ├── shipping.js  ← imports: client.js
  ├── system.js    ← imports: client.js
  ├── admin/
  │   ├── adminUsers.js    ← imports: ../../client.js
  │   ├── adminOrders.js   ← imports: ../../client.js
  │   ├── adminProducts.js ← imports: ../../client.js
  │   ├── adminCombos.js   ← imports: ../../client.js + ../combos.js
  │   └── adminSettings.js ← imports: ../../client.js
  │
  └── api.js (shim) ← imports from ALL domain modules (re-exports)
```

**Key dependency rules:**
- `client.js` imports nothing from `services/` — it's the root.
- All domain modules import ONLY from `client.js` (except `adminCombos`).
- `adminCombos.js` imports from `client.js` AND re-exports from `../combos.js` (one-directional: combos → adminCombos).
- `orders.js` has an internal dependency (`validateOrder` calls `getOrder`), but both live in the same file — no cross-module import needed.
- **No circular imports** exist in this graph.

### `combos.js` ↔ `admin/adminCombos.js` decision

**Choice**: `combos.js` is the source of truth (implements all 6 helpers). `admin/adminCombos.js` re-exports the 4 admin helpers from `combos.js`.

**Rejected**: Both re-exporting from a third shared file — adds a file with zero unique logic. AdminCombos re-exporting to combos — would mean admin module "owns" public helpers, which breaks conceptual layering.

**Rationale**: Six helpers share a URL prefix (`/combos/`). They belong together. The admin re-export is a convenience for admin consumers that want `import { ... } from '../../services/admin/adminCombos'` rather than reaching into the public `combos` module directly. One-directional keeps the graph acyclic.

## 3. PR Slicing and Order

Strategy: **Stacked PRs to main** (each merges directly to `main`, per E1). Each PR is self-contained and buildable — the shim keeps `api.js` re-exporting everything not yet migrated.

### Sequence

| # | PR Title | Files Added | Files Modified | Est. Lines | Verification |
|---|----------|------------|----------------|------------|--------------|
| 1 | `refactor(services): extract axios client with fail-fast env check` | `services/client.js` (85) | `services/api.js` (remove lines 1-132, add import from client) | ~220 | `bun run lint && bun run build` |
| 2 | `refactor(services): extract auth domain module` | `services/auth.js` (18) | `api.js` (remove inline auth, add re-export), `context/AuthContext.jsx` (import path) | ~35 | lint + build |
| 3 | `refactor(services): extract products domain module` | `services/products.js` (10) | `api.js` (re-export), `components/Products/ProductList.jsx` (import path) | ~18 | lint + build |
| 4 | `refactor(services): extract combos domain module` | `services/combos.js` (28) | `api.js` (re-export), `pages/Admin/ComboManagement.jsx`, `components/Admin/ComboForm.jsx` (split imports: combos + products) | ~48 | lint + build |
| 5 | `refactor(services): extract cart domain module` | `services/cart.js` (22) | `api.js` (re-export), `context/CartContext.jsx` (import path) | ~35 | lint + build |
| 6 | `refactor(services): extract orders domain module` | `services/orders.js` (40) | `api.js` (re-export), `pages/MyOrders.jsx`, `pages/PaymentSuccess.jsx`, `pages/PaymentPending.jsx`, `pages/PaymentFailure.jsx` | ~75 | lint + build |
| 7 | `refactor(services): extract payments domain module` | `services/payments.js` (22) | `api.js` (re-export), `components/Layout/Footer.jsx`, `components/Cart/Cart.jsx` (split imports: orders + payments) | ~38 | lint + build |
| 8 | `refactor(services): extract shipping domain module` | `services/shipping.js` (8) | `api.js` (re-export), `components/Cart/ShippingAddressModal.jsx`, `pages/Home.jsx` (split imports: combos + cart + products + shipping) | ~20 | lint + build |
| 9 | `refactor(services): extract system domain module` | `services/system.js` (22) | `api.js` (re-export), `hooks/useMaintenanceMode.js`, `pages/Admin/SystemSettings.jsx` | ~35 | lint + build |
| 10 | `refactor(services): extract admin users module` | `services/admin/adminUsers.js` (12) | `api.js` (re-export), `pages/Admin/UserManagement.jsx` | ~20 | lint + build |
| 11 | `refactor(services): extract admin products module` | `services/admin/adminProducts.js` (20) | `api.js` (re-export), `components/Admin/ProductForm.jsx`, `pages/Admin/ProductManagement.jsx` (split imports: products + adminProducts) | ~32 | lint + build |
| 12 | `refactor(services): extract admin orders module` | `services/admin/adminOrders.js` (12) | `api.js` (re-export), `pages/Admin/OrderManagement.jsx` | ~20 | lint + build |
| 13 | `refactor(services): extract admin combos module` | `services/admin/adminCombos.js` (8) | none (re-exports from combos.js; api.js already covers via combos re-export) | ~8 | lint + build |
| 14 | `refactor(services): extract admin settings module with 3 new helpers` | `services/admin/adminSettings.js` (72) | `api.js` (re-export), `pages/Admin/AdminDashboard.jsx`, `pages/Admin/PaymentSettings.jsx`, `pages/Admin/ShippingSettings.jsx`, `pages/Admin/PricingSettings.jsx` (leaker), `components/Admin/BulkPriceUpdate.jsx` (leaker) | ~110 | lint + build |
| 15 | `refactor(services): finalize api.js as pure re-export shim` | none | `api.js` (verify all helpers are re-exports; add missing re-export if any) | ~5 | lint + build |

**Shim-removal (deletion of `api.js`)** is DEFERRED per P4 to a follow-up change. PR 15 ensures `api.js` is 100% re-exports and zero consumers import from it.

### Budget verdict

All 15 PRs are under the 400-line budget. The largest is PR 1 at ~220 lines. No splitting needed. No `size:exception` required.

### Order justification

The order follows the module dependency graph bottom-up:

1. **client** first — every domain module depends on it.
2. **auth, products** next — high-traffic modules with pure consumers, good early validation of the pattern.
3. **combos, cart, orders** — medium-traffic, establishes pattern for mixed-import consumers.
4. **payments, shipping** — smaller modules that unlock the remaining mixed consumers (Cart.jsx at PR 7, Home.jsx at PR 8).
5. **system** — isolated module, no mixed dependencies.
6. **admin modules** — depend only on `client` (except `adminCombos`). Ordered by dependency: `adminCombos` (PR 13) depends on `combos` (PR 4), so it comes AFTER combos but the dependency already existed. `adminSettings` (PR 14) is intentionally LAST among domain modules because it includes the 3 new helpers and the 2 leaker cleanups — the riskiest change in the chain.
7. **api.js finalize** (PR 15) — mechanical cleanup after all domain modules exist.

## 4. Migration Strategy (Consumer Files)

### Consumer → PR mapping

| Consumer File | Migrated in PR | New Import(s) |
|---------------|---------------|---------------|
| `context/AuthContext.jsx` | PR 2 (auth) | `{ login, register, getCurrentUser, verifyAge } from '../services/auth'` |
| `components/Products/ProductList.jsx` | PR 3 (products) | `{ getProducts } from '../../services/products'` |
| `pages/Admin/ComboManagement.jsx` | PR 4 (combos) | `{ getAdminCombos, deleteCombo } from '../../services/combos'` |
| `components/Admin/ComboForm.jsx` | PR 4 (combos) | Split: `{ createCombo, updateCombo } from '../../services/combos'` + `{ getProducts } from '../../services/products'` |
| `context/CartContext.jsx` | PR 5 (cart) | `{ getCart, addToCart, removeFromCart, clearCart } from '../services/cart'` (keep aliases) |
| `pages/MyOrders.jsx` | PR 6 (orders) | `{ getMyOrders } from '../services/orders'` |
| `pages/PaymentSuccess.jsx` | PR 6 (orders) | `{ validateOrder } from '../services/orders'` |
| `pages/PaymentPending.jsx` | PR 6 (orders) | `{ validateOrder } from '../services/orders'` |
| `pages/PaymentFailure.jsx` | PR 6 (orders) | `{ validateOrder } from '../services/orders'` |
| `components/Layout/Footer.jsx` | PR 7 (payments) | `{ getPaymentSettings } from '../../services/payments'` |
| `components/Cart/Cart.jsx` | PR 7 (payments) | Split: `{ createOrder } from '../../services/orders'` + `{ createPaymentPreference, getPaymentSettings } from '../../services/payments'` |
| `components/Cart/ShippingAddressModal.jsx` | PR 8 (shipping) | `{ getShippingPrices } from '../../services/shipping'` |
| `pages/Home.jsx` | PR 8 (shipping) | Split: 4 lines — `getCombos` from combos, `addComboToCart` from cart, `getProducts` from products, `getShippingPrices` from shipping |
| `hooks/useMaintenanceMode.js` | PR 9 (system) | `{ getSystemStatus } from '../services/system'` |
| `pages/Admin/SystemSettings.jsx` | PR 9 (system) | `{ getAdminSystemSettings, updateSystemStatus } from '../../services/system'` |
| `pages/Admin/UserManagement.jsx` | PR 10 (adminUsers) | `{ getAdminUsers, updateUserRole } from '../../services/admin/adminUsers'` |
| `components/Admin/ProductForm.jsx` | PR 11 (adminProducts) | `{ createProduct, updateProduct } from '../../services/admin/adminProducts'` |
| `pages/Admin/ProductManagement.jsx` | PR 11 (adminProducts) | Split: `{ getProducts, getProduct } from '../../services/products'` + `{ deleteProduct, toggleProductActive } from '../../services/admin/adminProducts'` |
| `pages/Admin/OrderManagement.jsx` | PR 12 (adminOrders) | `{ getAdminOrders, updateOrderStatus } from '../../services/admin/adminOrders'` |
| `pages/Admin/AdminDashboard.jsx` | PR 14 (adminSettings) | `{ getAdminStats } from '../../services/admin/adminSettings'` |
| `pages/Admin/PaymentSettings.jsx` | PR 14 (adminSettings) | `{ getAdminPaymentSettings, updatePaymentSettings } from '../../services/admin/adminSettings'` |
| `pages/Admin/ShippingSettings.jsx` | PR 14 (adminSettings) | `{ getShippingSettings, updateShippingSettings } from '../../services/admin/adminSettings'` |
| `pages/Admin/PricingSettings.jsx` | PR 14 (adminSettings) | `{ getPricingSettings, updatePricingSettings } from '../../services/admin/adminSettings'` (leaker → helper) |
| `components/Admin/BulkPriceUpdate.jsx` | PR 14 (adminSettings) | `{ bulkUpdatePrices } from '../../services/admin/adminSettings'` (leaker → helper) |

### Verification command

```bash
bun run lint && bun run build
```

`bun run build` runs `vite build` (catches import resolution failures). No test runner exists.

After PR 15, verify zero raw `api` imports outside `services/`:
```bash
grep -r "from.*services/api" src/ --include='*.jsx' --include='*.js'
```
Should return zero matches.

## 5. Leaker Cleanup Strategy

Both leakers are absorbed in **PR 14** (`admin/adminSettings`) because the 3 new helpers (`getPricingSettings`, `updatePricingSettings`, `bulkUpdatePrices`) live there.

### PricingSettings.jsx (lines 4, 34, 63)

**Before:**
```js
import api from '../../services/api';
// ...
const response = await api.get('/admin/pricing-settings');
await api.put('/admin/pricing-settings', settings);
```

**After:**
```js
import { getPricingSettings, updatePricingSettings } from '../../services/admin/adminSettings';
// ...
const response = await getPricingSettings();
await updatePricingSettings(settings);
```

The `response.data` shape consumed on line 36 (`if (response.data) { setSettings(response.data); }`) is identical — the new helper returns the same axios response promise.

### BulkPriceUpdate.jsx (lines 4, 40-44)

**Before:**
```js
import api from '../../services/api';
// ...
const response = await api.post('/admin/bulk-price-update', {
    percentage: parseFloat(updateData.percentage) / 100,
    based_on: updateData.based_on,
    target: updateData.target
});
```

**After:**
```js
import { bulkUpdatePrices } from '../../services/admin/adminSettings';
// ...
const response = await bulkUpdatePrices({
    percentage: parseFloat(updateData.percentage) / 100,
    based_on: updateData.based_on,
    target: updateData.target
});
```

The payload shape is identical — `percentage` division by 100 stays in the component.

**Justification for absorbing in PR 14**: The new helpers AND the leaker fixes belong to the same module. Splitting them across PRs would create a temporary state where `adminSettings.js` exists but the leakers still import raw `api` — confusing mid-chain. Bundling them is cleaner and PR 14 is still ~110 lines (well under 400).

## 6. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Refresh token flow regression** | High | The entire interceptor block (request interceptor + response interceptor + `processQueue` + `isRefreshing`/`failedQueue`) moves verbatim from `api.js` to `client.js`. The only diff is the env check (`console.error` → `throw TypeError`). No logic, no variable name, no control flow changes. |
| **Import path mismatches at consumers** | Medium | Each PR migrates consumers atomically — the import change and the shim re-export happen in the same commit. `bun run build` catches import resolution failure immediately. `eslint .` catches unused imports. |
| **Shim divergence** | Low | The shim (`api.js`) is a pure `export { ... } from './module'` file — no logic. ESLint rule `no-restricted-imports` can be configured post-PR-15 to flag any future import from `services/api` (enforcing direct domain imports). |
| **Build breaks mid-chain** | Low | The shim keeps `api.js` re-exporting everything until PR 14. Any consumer still importing from the shim gets the correct export via pass-through. PR 15 verifies zero shim consumers remain. |
| **`getShippingSettings` placement conflict** | Low | The spec places it in both `shipping.js` and `adminSettings.js`. Resolution: `adminSettings.js` (matches actual endpoint URL `/admin/shipping-settings` and consumer `Admin/ShippingSettings.jsx`). `shipping.js` exports only `getShippingPrices`. Spec will need correction. |
| **Consumer with aliased imports (CartContext, AuthContext)** | Low | Aliases (`as apiAddToCart`, `as apiLogin`) are preserved — only the import path changes. No internal usage changes needed. |
| **`validateOrder` internal dependency** | Low | `validateOrder` calls `getOrder` internally. Both live in `orders.js` — no cross-module import. No change needed. |

## 7. Out of Scope

- No `ApiError` class or custom error types
- No React ErrorBoundary integration
- No React Query / SWR / data fetching library adoption
- No test infrastructure or test files
- No response data formatter/normalizer
- No deletion of unused helpers (per P4 — all 41 existing helpers are moved, none removed)
- No barrel `services/index.js` (per P2 — explicit per-domain imports)
- No deletion of `api.js` (deferred to follow-up change per P4)
- No behavioral or payload changes to any helper
- No changes to the refresh token flow logic

## 8. Open Questions

1. **`getShippingSettings` spec conflict**: The shipping spec requirement says `shipping.js` exports `getShippingSettings`, but the admin settings requirement says `adminSettings.js` exports it. The actual endpoint is `GET /admin/shipping-settings`. This design resolves to `admin/adminSettings.js`. Does this require a spec correction before tasks?

**All other decisions are locked.** No other open questions.
