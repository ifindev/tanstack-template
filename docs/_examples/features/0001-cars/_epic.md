# 0001 — Cars (Epic)

## Goal

Manage fleet inventory: cars, their documents, photos, and pricing.

## Pages & Stories

| Story | Route | File |
|---|---|---|
| 01-list | `/cars` | [01-list.md](./01-list.md) |
| 02-create | `/cars/new` | [02-create.md](./02-create.md) |
| 03-edit | `/cars/:id` | [03-edit.md](./03-edit.md) |
| 04-archive | (action) | [04-archive.md](./04-archive.md) |

## Entities Touched

- `Car` (primary)
- `CarDocument` (created/edited inline with Car)
- `CarPhoto` (created/edited inline with Car)
- `Pricing` (created with car, edited via Pricing feature)

Schemas live in `src/modules/cars/schema.ts`. Service functions in `service.ts`. tRPC procedures in `router.ts`.

## Shared Components

Under `src/components/cars/`:

- `car-form.tsx` (`CarForm`) — full form (basic info, docs, photos, pricing, settings, actions). Used by `02-create` and `03-edit`.
- `car-status-badge.tsx` (`CarStatusBadge`) — status pill. Used by `01-list` and `03-edit`.

## Shared Module Files

- `src/modules/cars/schema.ts` — Zod schemas (`carCreateSchema`, `carUpdateSchema`, `carFilterSchema`, `carArchiveSchema`)
- `src/modules/cars/service.ts` — `listCars`, `getCar`, `createCar`, `updateCar`, `archiveCar`
- `src/modules/cars/router.ts` — tRPC procedures with role guards

## Build Order

1. Prisma schema + migration (Car, CarDocument, CarPhoto, Pricing)
2. Zod schemas in `src/modules/cars/schema.ts`
3. Service layer with unit tests
4. tRPC router with role guards
5. Story 01-list (read-only, lowest risk)
6. Story 02-create (introduces `CarForm`)
7. Story 03-edit (reuses 02's form)
8. Story 04-archive (action only)

## Related

- [PRD](../../prd.md)
- [Trackers](../../trackers.md)

## Open Questions

- Photo ordering: drag-to-reorder or upload order only? → defer to 02 spec
- Document expiry warning lead time? → defer to 03 spec
