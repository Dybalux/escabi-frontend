# Spec: API Services Layer

## Purpose

The `api-services-layer` capability is the HTTP client and domain helper layer for the application. It exposes a configured axios client with fail-fast environment validation, a request interceptor that attaches bearer tokens, a response interceptor that handles 401-driven token refresh with concurrent request queueing, and 14 domain modules that group all endpoint helpers by URL prefix. Consumers import from the specific domain module via an explicit relative path; no barrel file and no raw axios instance access.

The capability is the replacement for the legacy `src/services/api.js` god-file (264 lines, 48 helpers in one module, raw `api` instance leaked to two consumer files). The legacy file is now a 28-line pure re-export shim retained for backward compatibility; it exports no logic of its own.

---

## Requirement: Client — Fail-Fast Environment Validation

The `services/client.js` module MUST throw a `TypeError` at module-load time if `VITE_API_URL` is undefined.

#### Scenario: VITE_API_URL is defined

- GIVEN `VITE_API_URL` is set in the environment
- WHEN `client.js` is imported
- THEN the module loads successfully and exports a configured axios instance

#### Scenario: VITE_API_URL is missing

- GIVEN `VITE_API_URL` is undefined or empty
- WHEN `client.js` is imported
- THEN a `TypeError` is thrown immediately with a descriptive message
- AND no axios instance is created

---

## Requirement: Client — Request Interceptor (Authorization Header)

The client MUST attach an `Authorization: Bearer <token>` header to every outgoing request when a token exists in `localStorage`.

#### Scenario: Token present in localStorage

- GIVEN `localStorage.getItem('token')` returns a non-null string
- WHEN any request is dispatched through the client
- THEN the request includes `Authorization: Bearer <token>` header
- AND the original request config is returned

#### Scenario: No token in localStorage

- GIVEN `localStorage.getItem('token')` returns null
- WHEN a request is dispatched through the client
- THEN the request proceeds without an `Authorization` header
- AND no error is thrown (public endpoints)

---

## Requirement: Client — Response Interceptor (401 Refresh Flow)

The client MUST handle 401 responses by attempting a token refresh exactly once via `/auth/refresh`, queuing concurrent requests, and replaying the original request on success. If refresh fails, the client MUST reject with the original error and redirect to `/login`.

#### Scenario: Successful token refresh

- GIVEN a request receives a 401 response and is not a `/auth/refresh` or `/auth/token` call
- WHEN the response interceptor detects the 401
- THEN it calls `POST /auth/refresh` with the stored `refresh_token`
- AND on success, stores the new `access_token` (and `refresh_token` if rotated) in localStorage
- AND replays the original request with the new token
- AND resolves with the replayed response

#### Scenario: Refresh fails

- GIVEN the `/auth/refresh` call returns an error
- WHEN the refresh attempt fails
- THEN `token` and `refresh_token` are removed from localStorage
- AND `window.location.href` is set to `/login`
- AND the original error is rejected

#### Scenario: Concurrent 401 requests during refresh

- GIVEN a refresh is already in progress (`isRefreshing === true`)
- WHEN another request receives a 401
- THEN the request is added to `failedQueue`
- AND it waits for the refresh to complete
- AND on success, retries with the new token
- AND on failure, rejects with the refresh error

#### Scenario: 503 Service Unavailable

- GIVEN a response has status 503
- WHEN the response interceptor processes it
- THEN the error is rejected immediately (no refresh attempt)
- AND `App.jsx` handles the maintenance screen

#### Scenario: No refresh token available

- GIVEN a 401 response and no `refresh_token` in localStorage
- WHEN the interceptor attempts refresh
- THEN tokens are cleared from localStorage
- AND `window.location.href` is set to `/login`
- AND the original error is rejected

---

## Requirement: Auth Domain Module

The `services/auth.js` module MUST export `register`, `login`, `getCurrentUser`, and `verifyAge` helpers with identical request/response shapes to the original `api.js` exports.

#### Scenario: register — POST /auth/register

- GIVEN user registration data `{ email, password, ... }`
- WHEN `register(userData)` is called
- THEN `POST /auth/register` is sent with `userData` as JSON body
- AND the axios response promise is returned

#### Scenario: login — POST /auth/token (form-urlencoded)

- GIVEN credentials `{ email, password }`
- WHEN `login(credentials)` is called
- THEN `POST /auth/token` is sent with `Content-Type: application/x-www-form-urlencoded`
- AND body is `username=<email>&password=<password>` (URLSearchParams)
- AND the axios response promise is returned

#### Scenario: getCurrentUser — GET /auth/me

- WHEN `getCurrentUser()` is called
- THEN `GET /auth/me` is sent with the Authorization header (via interceptor)
- AND the axios response promise is returned

#### Scenario: verifyAge — POST /age-verification/verify-age

- WHEN `verifyAge()` is called
- THEN `POST /age-verification/verify-age` is sent with no body
- AND the axios response promise is returned

---

## Requirement: Products Domain Module

The `services/products.js` module MUST export `getProducts` and `getProduct` helpers.

#### Scenario: getProducts with query params

- GIVEN an optional params object (e.g., `{ category: 'Cerveza' }`)
- WHEN `getProducts(params)` is called
- THEN `GET /products/` is sent with params as query string
- AND the axios response promise is returned

#### Scenario: getProduct by ID

- GIVEN a product ID
- WHEN `getProduct(id)` is called
- THEN `GET /products/<id>` is sent
- AND the axios response promise is returned

---

## Requirement: Combos Domain Module

The `services/combos.js` module MUST export `getCombos`, `getCombo`, `getAdminCombos`, `createCombo`, `updateCombo`, and `deleteCombo` helpers.

#### Scenario: getAdminCombos with include_inactive flag

- GIVEN `includeInactive` boolean (default false)
- WHEN `getAdminCombos(includeInactive)` is called
- THEN `GET /combos/admin/all` is sent with `?include_inactive=<bool>` query param
- AND the axios response promise is returned

#### Scenario: deleteCombo with permanent flag

- GIVEN a combo ID and `permanent` boolean (default false)
- WHEN `deleteCombo(id, permanent)` is called
- THEN `DELETE /combos/admin/<id>` is sent with `?permanent=<bool>` query param
- AND the axios response promise is returned

---

## Requirement: Cart Domain Module

The `services/cart.js` module MUST export `getCart`, `addToCart`, `addComboToCart`, `removeFromCart`, and `clearCart` helpers.

#### Scenario: addToCart

- GIVEN a `productId` and `quantity`
- WHEN `addToCart(productId, quantity)` is called
- THEN `POST /cart/add` is sent with body `{ product_id: productId, quantity }`
- AND the axios response promise is returned

#### Scenario: addComboToCart (uses same endpoint as addToCart)

- GIVEN a `comboId` and `quantity`
- WHEN `addComboToCart(comboId, quantity)` is called
- THEN `POST /cart/add` is sent with body `{ product_id: comboId, quantity }`
- AND the axios response promise is returned

---

## Requirement: Orders Domain Module

The `services/orders.js` module MUST export `createOrder`, `getMyOrders`, `getOrder`, `validateOrder`, and `selectPaymentMethod` helpers.

#### Scenario: createOrder with payment method param

- GIVEN `orderData` object and optional `paymentMethod` string (default 'Mercado Pago')
- WHEN `createOrder(orderData, paymentMethod)` is called
- THEN `POST /orders/` is sent with `orderData` as body and `?payment_method=<method>` query param
- AND the axios response promise is returned

#### Scenario: validateOrder returns structured result

- GIVEN an `orderId`
- WHEN `validateOrder(orderId)` is called and the order exists
- THEN it returns `{ valid: true, order: <response.data> }`
- WHEN the order returns 404
- THEN it returns `{ valid: false, error: 'Orden no encontrada' }`
- WHEN the order returns 403
- THEN it returns `{ valid: false, error: 'No tienes permiso para ver esta orden' }`

---

## Requirement: Payments Domain Module

The `services/payments.js` module MUST export `createPaymentPreference` and `getPaymentSettings` helpers.

#### Scenario: createPaymentPreference with 30s timeout

- GIVEN an `orderId`
- WHEN `createPaymentPreference(orderId)` is called
- THEN `POST /payments/create-preference/<orderId>` is sent with empty body
- AND `timeout: 30000` is set on the request config
- AND the axios response promise is returned

---

## Requirement: Shipping Domain Module

The `services/shipping.js` module MUST export ONLY `getShippingPrices` (the public shipping helper). `getShippingSettings` MUST NOT be exported from this module — it is an admin endpoint (`GET /admin/shipping-settings`), not a public shipping helper, and its only consumer is the admin panel (`pages/Admin/ShippingSettings.jsx`). It lives in `services/admin/adminSettings.js` (see the Admin Settings requirement).

#### Scenario: getShippingPrices

- WHEN `getShippingPrices()` is called
- THEN `GET /orders/shipping-prices` is sent
- AND the axios response promise is returned

---

## Requirement: System Domain Module

The `services/system.js` module MUST export `getSystemStatus`, `getAdminSystemSettings`, and `updateSystemStatus` helpers.

#### Scenario: updateSystemStatus with query params

- GIVEN `enabled` boolean and `message` string
- WHEN `updateSystemStatus(enabled, message)` is called
- THEN `PUT /admin/system-settings` is sent with query params `maintenance_mode=<enabled>` and `maintenance_message=<message>`
- AND the axios response promise is returned

---

## Requirement: Admin Users Domain Module

The `services/admin/adminUsers.js` module MUST export `getAdminUsers` and `updateUserRole` helpers. Signatures, URLs, and behavior are moved verbatim from `api.js`.

#### Scenario: updateUserRole

- GIVEN a `userId` and `newRole` string
- WHEN `updateUserRole(userId, newRole)` is called
- THEN `PUT /admin/users/<userId>/role` is sent with `?new_role=<newRole>` query param and null body
- AND the axios response promise is returned

---

## Requirement: Admin Orders Domain Module

The `services/admin/adminOrders.js` module MUST export `getAdminOrders` and `updateOrderStatus` helpers. Signatures, URLs, and behavior are moved verbatim from `api.js`.

#### Scenario: updateOrderStatus

- GIVEN an `orderId` and `newStatus` string
- WHEN `updateOrderStatus(orderId, newStatus)` is called
- THEN `PUT /orders/admin/<orderId>/status` is sent with `?new_status=<newStatus>` query param and null body
- AND the axios response promise is returned

---

## Requirement: Admin Products Domain Module

The `services/admin/adminProducts.js` module MUST export `createProduct`, `updateProduct`, `deleteProduct`, and `toggleProductActive` helpers. Signatures, URLs, and behavior are moved verbatim from `api.js`.

---

## Requirement: Admin Combos Domain Module

The `services/admin/adminCombos.js` module MUST export combo-related admin helpers. Signatures, URLs, and behavior are moved verbatim from `api.js` (combo admin helpers are also exported from `combos.js` — both modules re-export from the same source or share the same implementation).

---

## Requirement: Admin Settings Domain Module

The `services/admin/adminSettings.js` module MUST export `getPricingSettings`, `updatePricingSettings`, and `bulkUpdatePrices` — three helpers that currently have no named export and are accessed via raw `api.get`/`api.put`/`api.post` calls. It MUST also export `getAdminPaymentSettings`, `updatePaymentSettings`, `getAdminStats`, `getShippingSettings`, and `updateShippingSettings` moved verbatim from `api.js`.

#### Scenario: getPricingSettings

- WHEN `getPricingSettings()` is called
- THEN `GET /admin/pricing-settings` is sent
- AND the axios response promise is returned

#### Scenario: updatePricingSettings

- GIVEN a settings object `{ enabled, multiplier, start_day, end_day, start_hour, end_hour }`
- WHEN `updatePricingSettings(settings)` is called
- THEN `PUT /admin/pricing-settings` is sent with `settings` as JSON body
- AND the axios response promise is returned

#### Scenario: bulkUpdatePrices

- GIVEN a payload `{ percentage, based_on, target }` where `percentage` is a decimal (e.g., 0.10 for 10%)
- WHEN `bulkUpdatePrices(payload)` is called
- THEN `POST /admin/bulk-price-update` is sent with the payload as JSON body
- AND the axios response promise is returned

#### Scenario: updateShippingSettings (query params)

- GIVEN a settings object with `central_zone_price`, `central_zone_description`, `central_zone_enabled`, `remote_zone_price`, `remote_zone_description`, `remote_zone_enabled`, `pickup_address`, `pickup_description`, `pickup_enabled`
- WHEN `updateShippingSettings(settings)` is called
- THEN `PUT /admin/shipping-settings` is sent with all 9 fields as query params and null body
- AND the axios response promise is returned

---

## Requirement: Services Consume Explicit Per-Domain Imports

All consumer files MUST import helpers from their specific domain module using explicit relative paths (e.g., `import { getProducts } from '../services/products'`). NO barrel import (`services/index.js`) is permitted. Each consumer file MUST be updated to use the correct domain-specific import path.

#### Scenario: Consumer file migration

- GIVEN a file like `src/components/Products/ProductList.jsx` imports `{ getProducts } from '../../services/products'`
- WHEN the consumer is built and run
- THEN the import resolves to the products domain module
- AND the helper behavior is identical to the legacy `api.js` export

#### Scenario: Leaker file migration (PricingSettings)

- GIVEN `PricingSettings.jsx` imports `{ getPricingSettings, updatePricingSettings } from '../../services/admin/adminSettings'`
- WHEN the consumer is built and run
- THEN the import resolves to the admin settings domain module
- AND no raw `api.get(...)` / `api.put(...)` calls remain in the consumer

---

## Non-Goals

- No `ApiError` class or custom error types
- No React ErrorBoundary integration
- No React Query / SWR / data fetching library adoption
- No test infrastructure or test files
- No response data formatter/normalizer
- No barrel `services/index.js` (explicit per-domain imports only)
