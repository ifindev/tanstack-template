# 0001-cars / 01-list — Cars list

- Epic: [0001-cars](./epic.md)
- Brief: [project-brief](../../project-brief.md)

## Page

- **Route**: `/cars`
- **Layout**: `_authed` (sidebar + auth guard)
- **Roles**: Admin, Manager
- **Title**: "Cars"

## Dependencies / Prereqs

- Cars module exists: `schema.ts`, `service.ts`, `router.ts`
- `cars.list` tRPC procedure registered
- Migration applied for Car, CarDocument, CarPhoto, Pricing

## User Flow

1. User navigates to `/cars` from sidebar
2. Table renders with 25 cars per page, newest first
3. User filters by status (multi-select chips) or searches by plate / make / model (debounced 300ms)
4. User clicks "Add new car" → navigate to `/cars/new`
5. Per row: click "Edit" → navigate to `/cars/:id`; click "Archive" (Admin only) → open archive modal

## Components on Page

Under `src/components/cars/`:

- `car-list-page.tsx` (`CarListPage`) — full page: header, filters bar, search input, table, pagination, row actions

Reused from elsewhere (do not recreate):
- `car-status-badge.tsx` (`CarStatusBadge`) — used in each row's status column
- `data-table` primitives from `src/components/ui/` (Table, TableHeader, TableRow, etc.)

## Validations

Schema in `src/modules/cars/schema.ts` as `carFilterSchema`.

| Field | Rule |
|---|---|
| `status` | optional, array of `car_status` enum |
| `search` | optional, trimmed, 0-100 chars |
| `page` | optional, integer ≥ 1, default 1 |
| `pageSize` | optional, 1-100, default 25 |
| `sort` | optional, enum: `newest`, `oldest`, `plate-asc` (default `newest`) |

## UI States

- **Initial**: filters render empty, table shows first page of cars
- **Loading**: 5 skeleton rows
- **Empty (no cars at all)**: "No cars yet" message + primary CTA "Add your first car"
- **Empty (filtered)**: "No cars match these filters" + "Clear filters" button
- **Error**: inline error banner above table + "Retry" button
- **Loaded**: table with row actions (View, Edit, Archive)

## Copy

| Key | Text |
|---|---|
| page.title | Cars |
| page.subtitle | Manage your fleet inventory |
| btn.add | Add new car |
| btn.edit | Edit |
| btn.archive | Archive |
| empty.none | No cars yet |
| empty.none.cta | Add your first car |
| empty.filtered | No cars match these filters |
| empty.filtered.cta | Clear filters |
| filter.status | Status |
| search.placeholder | Search by plate, make, or model |
| col.photo | Photo |
| col.plate | Plate |
| col.make | Make & model |
| col.status | Status |
| col.rate | Daily rate |
| col.actions | Actions |
| err.load | Couldn't load cars |

## API

- **Procedure**: `cars.list` (query)
- **Auth**: `protectedProcedure` + role check `Admin | Manager`
- **Input**: `carFilterSchema` from `src/modules/cars/schema.ts`
- **Output**: `{ items: Car[], total: number, page: number, pageSize: number }`
- **Side effects**: none
- **Failure modes**:
  - `UNAUTHORIZED` if not Admin/Manager

## Frontend Wiring

- **Route file**: `src/routes/_authed/cars/(list)/cars.tsx`
- **View Model**: `src/routes/_authed/cars/(list)/-cars.view-model.ts`
  - `trpc.cars.list.useQuery(filters)` — keeps filter state in URL search params via TanStack Router
  - `useNavigate` for row actions and "Add new car"
  - Debounce search input with `useDebouncedValue` from `src/hooks/use-debounced-value.ts` (create if missing)
- **Components** (new in this story): `src/components/cars/car-list-page.tsx`
- **Schemas** (added in epic prereq, not here): `carFilterSchema`

## Tasks

- [ ] Add `carFilterSchema` to `src/modules/cars/schema.ts`
- [ ] Add `cars.list` procedure in `src/modules/cars/router.ts` with role guard
- [ ] Implement `listCars` service with pagination and filters
- [ ] Build `CarListPage` component (header, filter bar, search, table, pagination)
- [ ] Build (or reuse) `CarStatusBadge`
- [ ] Add `use-debounced-value` hook if not present
- [ ] Wire route + ViewModel
- [ ] Unit tests: `listCars` service (filter combinations, pagination boundaries, empty result)
- [ ] Manual test: filter + search + sort + paginate

## Open Questions

- Sticky filters across navigations? → MVP: no, URL-only.
