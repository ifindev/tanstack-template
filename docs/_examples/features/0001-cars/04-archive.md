# 0001-cars / 04-archive — Archive car

- Epic: [0001-cars](./_epic.md)
- Brief: [project-brief](../../project-brief.md)

## Page

- **Route**: (action only — modal on `/cars/:id` and `/cars`)
- **Layout**: modal triggered from existing pages
- **Roles**: Admin only
- **Title**: "Archive car?"

## Dependencies / Prereqs

- Story `03-edit` complete — modal triggers from edit page
- Story `01-list` complete — modal triggers from row action
- `cars.archive` tRPC procedure registered

## User Flow

1. Admin clicks "Archive" from edit page or list row
2. Confirmation modal opens: "Archive {plate}? This sets the car to `retired` and removes it from the default list view."
3. If car has active bookings: modal shows "Cannot archive — {N} active bookings" with a link to the bookings list, no archive button
4. If no active bookings: modal shows "Archive" button
5. On confirm: call `cars.archive` → toast "Car archived" → refetch list / car
6. Modal closes

## Components on Page

Under `src/components/cars/`:

- `archive-car-modal.tsx` (`ArchiveCarModal`) — confirm dialog. Triggered from `01-list` row action and from `03-edit` page header.

Reused from elsewhere (do not recreate):
- Dialog primitives from `src/components/ui/`

## Validations

Schema in `src/modules/cars/schema.ts` as `carArchiveSchema`.

| Field | Rule |
|---|---|
| `id` | required, CUID format |

Server-side invariant: car must have zero active bookings (status `confirmed` or `active`).

## UI States

- **Initial**: modal open with car summary + confirm button
- **Blocked**: car has active bookings → button disabled, message explains and links to bookings
- **Submitting**: button spinner, modal not dismissable
- **Success**: toast, modal closes, parent refetches
- **Error**: inline error in modal

## Copy

| Key | Text |
|---|---|
| modal.title | Archive car? |
| modal.body | This sets the car to "retired" and removes it from the default list view. |
| btn.archive | Archive |
| btn.cancel | Cancel |
| toast.success | Car archived |
| blocked.title | Cannot archive |
| blocked.body | This car has {count} active booking(s). Resolve them first. |
| blocked.link | View bookings |
| err.generic | Couldn't archive car |

## API

- **Procedure**: `cars.archive` (mutation)
- **Auth**: `protectedProcedure` + role check `Admin`
- **Input**: `carArchiveSchema` from `src/modules/cars/schema.ts`
- **Output**: `{ id: string }`
- **Side effects**:
  - Sets `Car.status = 'retired'`
  - Does not delete documents or photos (preserve audit trail)
- **Failure modes**:
  - `FORBIDDEN` if not Admin
  - `PRECONDITION_FAILED` if active bookings exist (error message includes count)
  - `NOT_FOUND` if id doesn't exist

## Frontend Wiring

- **Components**: `src/components/cars/archive-car-modal.tsx`
- **View Models** (modal trigger updates):
  - `-cars.view-model.ts` (list): opens modal with selected car
  - `-index.view-model.ts` (edit page): opens modal from header button
  - `trpc.cars.archive.useMutation` with `onSuccess` → invalidate `cars.get`, `cars.list` and close modal
- **Schemas**: `carArchiveSchema` in `src/modules/cars/schema.ts`

## Tasks

- [ ] Add `carArchiveSchema` (just `{ id: cuid }`) to `src/modules/cars/schema.ts`
- [ ] Add `cars.archive` procedure with Admin-only role guard
- [ ] Implement `archiveCar` service with active-booking check
- [ ] Build `ArchiveCarModal` (handles both blocked and ready states)
- [ ] Wire trigger from `01-list` row action
- [ ] Wire trigger from `03-edit` page header
- [ ] Unit tests: `archiveCar` (happy path, blocked-by-bookings, non-Admin denied)
- [ ] Manual test: archive a car with and without active bookings

## Open Questions

- Allow un-archive (set status back to `available`)? → MVP: no. Manually via DB if needed.
