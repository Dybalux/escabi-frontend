# Tasks: API Services Layer

> **Plan version**: G2 (9 chained PRs, stacked-to-main)
> **Consolidation rationale**: 15→9 PRs by merging adjacent domains with no functional conflict. P1 (client) and P2 (auth) kept solo due to risk profile. P3-P8 merge catalog, checkout, and admin pairs that share consumers. P9 absorbs cleanup (adminSettings + leakers + shim finalization) into one termination PR.

## Section 1: Task List Overview

| Field | Value |
|-------|-------|
| Total tasks (PRs) | 9 |
| Total estimated changed lines | ~717 |
| Highest-risk task | PR 1 (client extraction — touches interceptors, refresh flow, env check) |
| Any PR exceeds 400-line budget | NO |
| `size:exception` required | NO |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

## Section 5: Review Workload Forecast

| PR | Title | Est. Lines | ≥350? | >400? |
|----|-------|-----------|-------|-------|
| 1 | Extract axios client (foundation) | ~220 | NO | NO |
| 2 | Extract auth module | ~35 | NO | NO |
| 3 | Extract products + combos modules | ~66 | NO | NO |
| 4 | Extract cart module | ~35 | NO | NO |
| 5 | Extract orders + payments modules | ~113 | NO | NO |
| 6 | Extract shipping + system modules | ~55 | NO | NO |
| 7 | Extract admin/users + admin/orders modules | ~40 | NO | NO |
| 8 | Extract admin/products + admin/combos modules | ~40 | NO | NO |
| 9 | Extract admin/settings + fix leakers + finalize api.js shim | ~115 | NO | NO |

**Change totals**: ~717 lines total, ~80 avg per PR, 220 max (PR 1), 115 second-largest (PR 9).

**Verdict**: All PRs under 400 lines, no exception required, ask-always trigger fires for any PR that lands at >350 lines. PR 1 (220) and PR 9 (115) are the largest; both intentionally kept under the warning zone.

## Section 3: Cross-PR Ordering

Order: `P1 client` → `P2 auth` → `P3 products+combos` → `P4 cart` → `P5 orders+payments` → `P6 shipping+system` → `P7 admin/users+admin/orders` → `P8 admin/products+admin/combos` → `P9 admin/settings+leakers+shim`.

**Parallelization notes** (informational, not blocking):
- P2-P8 are independent of each other — all depend only on P1 (client). Could be parallelized with a larger team.
- P8 depends on P3 (adminCombos re-exports from combos).
- P9 depends on P1 and benefits from P2-P8 being merged to ensure api.js shim is consistent before finalization.

**Consolidation rationale** (per merged PR):
- **P3 (products+combos)**: both are public catalog domains; consumers (ProductList, Home, ComboManagement) import from both; the split-import refactor in Home/ComboForm is atomic.
- **P5 (orders+payments)**: tightly coupled flow (createOrder → createPaymentPreference); Cart.jsx needs both imports; splitting would force two reviews of the same file.
- **P6 (shipping+system)**: both are small independent domains; merging reduces PR count without losing functional focus.
- **P7 (admin/users+admin/orders)**: both are admin CRUD with single consumer each; no functional coupling.
- **P8 (admin/products+admin/combos)**: both are admin catalog; adminCombos re-exports from combos (P3 dependency).
- **P9 (adminSettings+leakers+shim)**: cleanup PR; a 5-line shim finalization PR alone is not worth the review round-trip.

## Section 4: Cross-PR Dependency Gates

- PR N can only be merged after PR N-1 is merged (stacked-to-main).
- P1 is the foundation — it must be merged first and breaks NOTHING (shim still re-exports from old code).
- P8 has a soft dependency on P3 (adminCombos re-exports from combos).
- P9 has a soft dependency on P2-P8 (finalization verifies all helpers re-export).
- Each task block below references the previous PR as a dependency gate.

## Section 6: Strict TDD Forwarding Note

Strict TDD: **disabled** for this project. No test runner, no test files, no test dependencies configured. Verification = `bun run lint` + `bun run build` + manual smoke. The apply agent MUST NOT write tests.

## Section 7: Apply-Progress Continuity

This is the first change in a long time — no prior `apply-progress` exists for this change. The apply agent should start fresh.

For each PR's apply, the apply agent must record progress to engram topic `sdd/api-services-layer/apply-progress` after the PR lands, with PR number and merge commit SHA.

---

## Phase 1: Foundation

- [x] ## Task 1: refactor(services): extract axios client with fail-fast env check

**PR scope**: 1 of 9
**Files added**: `src/services/client.js`
**Files modified**: `src/services/api.js` — remove lines 1-132 (axios create + interceptors + refresh flow), add `import api from './client'` at top
**Estimated changed lines**: ~220
**Risk**: high — touches the entire interceptor/refresh logic; one mistake here breaks every API call
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: login flow works (token refresh), public pages load (no token), 503 maintenance screen still shows
**Commits**:
  - `refactor(services): extract axios client with fail-fast env check` — create client.js with verbatim interceptor logic + throw TypeError on missing VITE_API_URL; update api.js to import from client
**Work-unit rationale**: Single commit — the client extraction is one cohesive unit. The api.js change (import from client) is atomic with the creation.
**Open question for apply**: Confirm the exact line range to remove from api.js (lines 1-132) matches the interceptor block. The `export default api` line (265) must also be removed — client.js becomes the default export source.

**Depends on**: Nothing — this is the foundation PR.

**Status**: ✅ Complete — PR #4 (https://github.com/Dybalux/escabi-frontend/pull/4), branch `refactor/services-client-foundation`, commit `cbb625f`. `bun run build` passes, zero new lint errors. Awaiting merge.

---

## Phase 2: Core Domain Modules

- [x] ## Task 2: refactor(services): extract auth domain module

**PR scope**: 2 of 9
**Files added**: `src/services/auth.js`
**Files modified**: `src/services/api.js` — remove inline `register`, `login`, `getCurrentUser`, `verifyAge` (lines 135-145), add `export { register, login, getCurrentUser, verifyAge } from './auth'`; `src/context/AuthContext.jsx` — update import path from `'../services/api'` to `'../services/auth'`
**Estimated changed lines**: ~35
**Risk**: low — 4 simple helpers, one consumer file, pure move
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: register, login, logout flows work
**Commits**:
  - `refactor(services): extract auth domain module` — create auth.js with 4 helpers moved verbatim from api.js; update api.js re-export; update AuthContext import
**Work-unit rationale**: Single commit — auth module is self-contained with one consumer.
**Open question for apply**: Confirm aliased imports in AuthContext (if any `as apiXxx` aliases exist) are preserved — only the import path changes.

**Status**: ✅ Complete — PR #5 (https://github.com/Dybalux/escabi-frontend/pull/5), branch `refactor/services-auth-module`, commit `525edce`. `bun run build` passes, zero new lint errors. Awaiting merge.

**Depends on**: PR 1 (client must exist for auth.js to import from).

- [x] ## Task 3: refactor(services): extract products and combos domain modules

**PR scope**: 3 of 9
**Files added**: `src/services/products.js`, `src/services/combos.js`
**Files modified**: `src/services/api.js` — remove inline product helpers (lines 148-149) and combo helpers (lines 243-252), add re-exports for both; `src/components/Products/ProductList.jsx` — update import to products; `src/pages/Admin/ComboManagement.jsx` — update import to combos; `src/components/Admin/ComboForm.jsx` — split imports: getProducts from products, createCombo/updateCombo from combos
**Estimated changed lines**: ~66 (products ~18 + combos ~48)
**Risk**: low — 2 product helpers + 6 combo helpers across 3 consumer files, one needs split imports
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: product list loads, product detail loads, combo list, combo CRUD in admin, combo form with product dropdown
**Commits**:
  - `refactor(services): extract products domain module` — create products.js; update api.js re-export; update ProductList import
  - `refactor(services): extract combos domain module` — create combos.js with 6 helpers; update api.js re-export; update ComboManagement and ComboForm imports (ComboForm needs split)
**Work-unit rationale**: 2 commits — products and combos are independent catalog domains. Splitting commits makes each review focused; if one breaks, the other is identifiable. Combined PR because both are catalog-public and consumers import from both naturally.
**Open question for apply**: ComboForm.jsx needs split imports — confirm it imports `getProducts` from products AND `createCombo`/`updateCombo` from combos (not all from combos).

**Depends on**: PR 1 (client).

- [x] ## Task 4: refactor(services): extract cart domain module

**PR scope**: 4 of 9
**Files added**: `src/services/cart.js`
**Files modified**: `src/services/api.js` — remove inline cart helpers (lines 152-158), add re-export; `src/context/CartContext.jsx` — update import path (preserve aliases like `as apiAddToCart`)
**Estimated changed lines**: ~35
**Risk**: low — 5 helpers, one consumer with aliases
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: add to cart, remove from cart, clear cart
**Commits**:
  - `refactor(services): extract cart domain module` — create cart.js; update api.js re-export; update CartContext import (preserve aliases)
**Work-unit rationale**: Single commit.
**Open question for apply**: CartContext uses aliased imports (`as apiAddToCart` etc.) — only the import path changes, not the alias names.

**Depends on**: PR 1 (client).

- [x] ## Task 5: refactor(services): extract orders and payments domain modules

**PR scope**: 5 of 9
**Files added**: `src/services/orders.js`, `src/services/payments.js`
**Files modified**: `src/services/api.js` — remove inline order helpers (lines 161-197) and payment helpers (lines 169-175, 178-181), add re-exports for both; `src/pages/MyOrders.jsx` — update import to orders; `src/pages/PaymentSuccess.jsx` — update import to orders; `src/pages/PaymentPending.jsx` — update import to orders; `src/pages/PaymentFailure.jsx` — update import to orders; `src/components/Layout/Footer.jsx` — update import to payments; `src/components/Cart/Cart.jsx` — split imports: createOrder from orders, createPaymentPreference/getPaymentSettings from payments
**Estimated changed lines**: ~113 (orders ~75 + payments ~38)
**Risk**: medium — `validateOrder` has internal dependency on `getOrder`, both in same file. Cart.jsx needs split imports across orders+payments. Footer needs only payments. Total 6 consumer files.
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: my orders list, order detail, payment success/pending/failure flows, payment settings in footer, checkout flow with Mercado Pago preference
**Commits**:
  - `refactor(services): extract orders domain module` — create orders.js with 5 helpers (validateOrder calls getOrder internally); update api.js re-export; update 4 consumer imports (MyOrders, PaymentSuccess, PaymentPending, PaymentFailure)
  - `refactor(services): extract payments domain module` — create payments.js with 3 helpers; update api.js re-export; update Footer and Cart imports (Cart needs split)
**Work-unit rationale**: 2 commits — orders and payments are separate concerns but functionally coupled (createOrder → createPaymentPreference). Splitting commits allows focused review of each domain's logic. Combined PR because the checkout flow depends on both being available simultaneously.
**Open question for apply**: validateOrder wraps getOrder internally — confirm both are in orders.js and no cross-module import is needed. Cart.jsx needs split imports — `createOrder` from orders, `createPaymentPreference`/`getPaymentSettings` from payments.

**Depends on**: PR 1 (client).

- [x] ## Task 6: refactor(services): extract shipping and system domain modules

**PR scope**: 6 of 9
**Files added**: `src/services/shipping.js`, `src/services/system.js`
**Files modified**: `src/services/api.js` — remove inline `getShippingPrices` (line 240) and system helpers (lines 255-263), add re-exports for both; `src/components/Cart/ShippingAddressModal.jsx` — update import to shipping; `src/pages/Home.jsx` — split imports: combos for getCombos, cart for addComboToCart, products for getProducts, shipping for getShippingPrices; `src/hooks/useMaintenanceMode.js` — update import to system; `src/pages/Admin/SystemSettings.jsx` — update import to system
**Estimated changed lines**: ~55 (shipping ~20 + system ~35)
**Risk**: low — 1 shipping helper + 3 system helpers, 4 consumer files (one with 4-way split imports)
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: shipping prices in cart modal, home page loads all sections, maintenance mode toggle, system settings page
**Commits**:
  - `refactor(services): extract shipping domain module` — create shipping.js with getShippingPrices only; update api.js re-export; update ShippingAddressModal and Home imports (Home needs 4-way split)
  - `refactor(services): extract system domain module` — create system.js with 3 helpers; update api.js re-export; update useMaintenanceMode and SystemSettings imports
**Work-unit rationale**: 2 commits — shipping and system are independent small domains. Combined PR to reduce PR count without coupling concerns.
**Open question for apply**: shipping.js exports ONLY `getShippingPrices`. `getShippingSettings` is in adminSettings (PR 9), NOT here. Home.jsx needs 4 import sources (combos, cart, products, shipping).

**Depends on**: PR 1 (client).

---

## Phase 3: Admin Domain Modules

- [x] ## Task 7: refactor(services): extract admin/users and admin/orders modules

**PR scope**: 7 of 9
**Files added**: `src/services/admin/adminUsers.js`, `src/services/admin/adminOrders.js`
**Files modified**: `src/services/api.js` — remove inline admin user helpers (lines 203-205) and admin order helpers (lines 208-210), add re-exports for both; `src/pages/Admin/UserManagement.jsx` — update import to admin/adminUsers; `src/pages/Admin/OrderManagement.jsx` — update import to admin/adminOrders
**Estimated changed lines**: ~40 (adminUsers ~20 + adminOrders ~20)
**Risk**: low — 2+2 helpers, 2 consumer files, no shared dependencies
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: admin user list, role update, admin order list, status update
**Commits**:
  - `refactor(services): extract admin users module` — create adminUsers.js; update api.js re-export; update UserManagement import
  - `refactor(services): extract admin orders module` — create adminOrders.js; update api.js re-export; update OrderManagement import
**Work-unit rationale**: 2 commits — independent admin domains, no coupling. Combined PR to reduce round trips.
**Open question for apply**: None.

**Depends on**: PR 1 (client).

- [x] ## Task 8: refactor(services): extract admin/products and admin/combos modules

**PR scope**: 8 of 9
**Files added**: `src/services/admin/adminProducts.js`, `src/services/admin/adminCombos.js`
**Files modified**: `src/services/api.js` — remove inline admin product helpers (lines 213-216), add re-export; `src/components/Admin/ProductForm.jsx` — update import to admin/adminProducts; `src/pages/Admin/ProductManagement.jsx` — split imports: getProducts/getProduct from products, deleteProduct/toggleProductActive from adminProducts
**Estimated changed lines**: ~40 (adminProducts ~32 + adminCombos ~8)
**Risk**: low — 4 admin product helpers + admin combos re-export, 2 consumer files
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: product CRUD in admin, product form, product list with delete/toggle, admin combo management still works
**Commits**:
  - `refactor(services): extract admin products module` — create adminProducts.js with 4 helpers; update api.js re-export; update ProductForm and ProductManagement imports (ProductManagement needs split)
  - `refactor(services): extract admin combos module` — create adminCombos.js re-exporting 4 admin helpers from combos.js (no consumers to update; consumers import from combos.js)
**Work-unit rationale**: 2 commits — adminProducts is a real module with consumers; adminCombos is a pure re-export file. Different risk profiles warrant separate commits.
**Open question for apply**: ProductManagement.jsx needs split imports — `getProducts`/`getProduct` from products, `deleteProduct`/`toggleProductActive` from adminProducts. adminCombos.js re-exports from `../combos.js` (not from client). Confirm the import path is correct relative to `src/services/admin/`.

**Depends on**: PR 1 (client), PR 3 (combos must exist for adminCombos to re-export from).

---

## Phase 4: Finalization

- [x] ## Task 9: refactor(services): extract admin/settings, fix leakers, and finalize api.js shim

**PR scope**: 9 of 9
**Files added**: `src/services/admin/adminSettings.js`
**Files modified**: `src/services/api.js` — remove inline admin settings helpers (lines 200, 219-237), add re-export; `src/pages/Admin/AdminDashboard.jsx` — update import to admin/adminSettings; `src/pages/Admin/PaymentSettings.jsx` — update import to admin/adminSettings; `src/pages/Admin/ShippingSettings.jsx` — update import to admin/adminSettings; `src/pages/Admin/PricingSettings.jsx` — leaker: replace `import api from '../../services/api'` + raw `api.get`/`api.put` with named helpers; `src/components/Admin/BulkPriceUpdate.jsx` — leaker: replace `import api from '../../services/api'` + raw `api.post` with named helper; `src/services/api.js` (final pass) — verify all 44 helpers are re-exports (zero inline helpers remain), remove any stray inline code, remove `import axios` and `export default api` if still present
**Estimated changed lines**: ~115
**Risk**: medium — 8 helpers (3 NEW + 5 moved), 5 consumers, 2 leaker cleanups, plus finalization pass on api.js
**Verification**:
  - `bun run lint` — must pass
  - `bun run build` — must pass
  - Manual smoke: admin dashboard stats, payment settings, shipping settings, pricing settings, bulk price update
  - `grep -r "from.*services/api" src/ --include='*.jsx' --include='*.js'` — must return zero matches outside services/
  - `grep -r "import api from" src/ --include='*.jsx' --include='*.js'` — must return zero matches outside services/
  - `grep -E "import axios|export default api" src/services/api.js` — must return zero matches
**Commits**:
  - `refactor(services): extract adminSettings module with moved helpers` — create adminSettings.js with 5 moved helpers + 3 new helpers (getPricingSettings, updatePricingSettings, bulkUpdatePrices); update api.js re-export; update 3 consumer imports (AdminDashboard, PaymentSettings, ShippingSettings)
  - `refactor(services): migrate leakers to adminSettings helpers` — PricingSettings.jsx: replace raw api.get/api.put with getPricingSettings/updatePricingSettings; BulkPriceUpdate.jsx: replace raw api.post with bulkUpdatePrices
  - `refactor(services): finalize api.js as pure re-export shim` — verify all 44 helpers are re-exports, remove any stray inline code, remove `import axios` and `export default api` from api.js
**Work-unit rationale**: 3 commits — (1) module creation, (2) leaker cleanups, (3) shim finalization. This keeps each commit reviewable: the module is one unit, the leakers are a second unit (with their own pre-existing risk), and the shim finalization is the termination step that proves the refactor is complete.
**Open question for apply**: The 3 new helpers (getPricingSettings, updatePricingSettings, bulkUpdatePrices) have no existing code to move — they must be written from the spec. Confirm URL paths and request shapes match the spec exactly. For PricingSettings, confirm `response.data` shape is preserved (the component does `setSettings(response.data)`). After the finalization commit, api.js should contain ONLY re-export lines and zero logic.

**Depends on**: PRs 1-8 (all domain modules must exist and be re-exported before finalization).
