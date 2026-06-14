# Proposal: API Services Layer

## Intent

`src/services/api.js` is a 264-line god-file: axios client, interceptors, refresh-token flow, and 48 helpers across 6+ domains in one module. Two files leak the raw `api` instance (`PricingSettings.jsx`, `BulkPriceUpdate.jsx`) — helpers were never written for those endpoints. This refactor splits the monolith, seals the module boundary, and adds a barrel.

## Scope

### In Scope

- `services/client.js`: axios instance, request/response interceptors, refresh flow, queue.
- 14 domain modules matching URL prefixes: `auth`, `products`, `cart`, `orders`, `payments`; `admin/adminUsers`, `adminOrders`, `adminProducts`, `adminCombos`, `adminSettings`; `combos`, `shipping`, `system`.
- Write 3 missing helpers: `getPricingSettings`, `updatePricingSettings`, `bulkUpdatePrices` in `adminSettings.js`.
- `services/index.js` barrel re-exporting all helpers.
- Redirect all 24 consumer files to barrel; delete `services/api.js`.
- Verify: `bun run build` + `eslint .` pass.

### Out of Scope

- ApiError, ErrorBoundary, React Query/SWR, testing infrastructure.
- Behavioral or payload changes.

## Capabilities

- **New**: None — pure structural refactor.
- **Modified**: None — no spec-level behavior changes.

## Approach

1. Create `services/client.js` — default-export `api` instance.
2. Create domain modules — each imports `api` from `./client`, exports named functions.
3. Write barrel `services/index.js`.
4. Update 24 consumer files to import from barrel; migrate 2 leakers to named helpers.
5. Delete `services/api.js`; verify build + lint.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/services/` | 1 → 15 files (client + 14 modules + barrel) |
| 2 leaker files | Replace raw `api` with named helpers |
| 22 other consumers | Import path updated to barrel |

## Risks

| Risk | Mitigation |
|------|------------|
| Circular imports | All modules only import `./client`; barrel only re-exports. |
| Refresh flow breakage | Move interceptor block as-is into `client.js`. |
| Import path mismatches | Batch all 24 files; lint catches broken paths. |

## Rollback Plan

Git revert. Zero behavioral delta — revert restores working `api.js` monolith instantly.

## Dependencies

None.

## Success Criteria

- [ ] `bun run build` succeeds.
- [ ] `eslint .` passes (no new warnings).
- [ ] Zero raw `api` imports outside `services/`: `grep -r "import api" src/` returns nothing.
- [ ] All consumers import from `services/index.js` barrel.
