# 0001-cars / 03-edit — Edit car

- Epic: [0001-cars](./_epic.md)
- PRD: [prd](../../prd.md)

## Page

- **Route**: `/cars/:id`
- **Layout**: `_authed`
- **Roles**: Admin, Manager
- **Title**: "Edit Car · <plate>"

## Dependencies / Prereqs

- Story `02-create` complete — reuses `CarForm` component
- `cars.get` and `cars.update` tRPC procedures registered

## User Flow

1. User clicks "Edit" on a row in `/cars` → navigates to `/cars/:id`
2. Page fetches car + docs + photos + pricing
3. `CarForm` renders prefilled (same form as 02-create)
4. Form tracks dirty fields per section
5. On submit: only changed fields sent to `cars.update`
6. Document replacement creates a new `CarDocument` row (keep history, don't overwrite)
7. On success: toast "Car updated", remain on page (refetch)
8. Admin sees an "Archive" button that opens the archive modal (see 04-archive)

## Components on Page

Under `src/components/cars/`:

- `car-form.tsx` (`CarForm`) — reused from story 02 with `mode="edit"` and `initialValues` prop

Reused from elsewhere (do not recreate):
- `car-status-badge.tsx` (`CarStatusBadge`) — small status pill in page header

## Validations

Same `carCreateSchema` rules for fields. Additional rules for edit (in `carUpdateSchema`):

| Field | Rule |
|---|---|
| All fields from `carCreateSchema` | optional in update (partial) |
| `plate` | if changed, must still pass regex + uniqueness |
| `documents` | adding a new doc creates a new row; replacing keeps history |

## UI States

- **Loading car**: skeleton form
- **Not found**: 404 page (TanStack Router catch)
- **Form loaded, clean**: Save disabled
- **Form dirty**: Save enabled
- **Submitting**: button spinner, inputs disabled
- **Server error**: top banner
- **Success**: toast "Car updated", refetch, scroll to top

## Copy

| Key | Text |
|---|---|
| page.title | Edit Car |
| btn.save | Save changes |
| btn.cancel | Cancel |
| btn.archive | Archive car |
| toast.success | Car updated |
| toast.docExpiry | Document expires within 30 days |
| help.lastUpdated | Last updated: {date} |
| err.notFound | This car no longer exists |

## API

- **Procedure**: `cars.get` (query), `cars.update` (mutation)
- **Auth**: `protectedProcedure` + role check `Admin | Manager`
- **Input** (update): `carUpdateSchema` from `src/modules/cars/schema.ts`
- **Output** (update): `{ id: string, updatedAt: Date }`
- **Side effects** (update, in transaction):
  1. Update changed `Car` fields
  2. For each new document file: insert `CarDocument` row (do not delete old)
  3. For photo changes: insert / delete rows as needed; preserve `order`
  4. Update `Pricing` if changed
- **Failure modes**:
  - `NOT_FOUND` if id doesn't exist
  - `CONFLICT` if changed plate collides
  - `BAD_REQUEST` if invariants violated

## Frontend Wiring

- **Route file**: `src/routes/_authed/cars/$id/index.tsx`
- **View Model**: `src/routes/_authed/cars/$id/-index.view-model.ts`
  - `trpc.cars.get.useQuery({ id })` for initial load
  - `trpc.cars.update.useMutation` with `onSuccess` → invalidate `cars.get` and `cars.list`
  - Dirty tracking via `useForm`'s `formState.dirtyFields`
  - Builds patch (only dirty fields) before calling mutate
- **Components** (new in this story): none — reuses `car-form.tsx`
- **Schemas**: `carUpdateSchema` in `src/modules/cars/schema.ts`

## Tasks

- [ ] Add `carUpdateSchema` (partial of create + id) to `src/modules/cars/schema.ts`
- [ ] Add `cars.get` and `cars.update` procedures to `src/modules/cars/router.ts`
- [ ] Implement `getCar` and `updateCar` services (transaction with selective inserts)
- [ ] Extend `CarForm` to accept `mode` and `initialValues` props (no new file)
- [ ] Wire route + ViewModel with dirty-field patch
- [ ] Document expiry warning banner if any doc expires within 30 days
- [ ] Unit tests: `updateCar` (partial patch, doc history preservation, photo reorder)
- [ ] Manual test: edit each section independently

## Open Questions

- Document expiry warning lead time: 30 days for now. Configurable per-tenant later.
