# 0001-cars / 02-create — Add new car

- Epic: [0001-cars](./_epic.md)
- Brief: [project-brief](../../project-brief.md)

## Page

- **Route**: `/cars/new`
- **Layout**: `_authed`
- **Roles**: Admin, Manager
- **Title**: "Add New Car"

## Dependencies / Prereqs

- Cars module exists: `schema.ts`, `service.ts`, `router.ts`
- `cars.create` tRPC procedure registered
- S3 upload helper available: `src/shared/storage/upload.ts`

## User Flow

1. User clicks "Add new car" on `/cars` → navigates to `/cars/new`
2. Form renders 5 sections (all visible from start): Basic Info, Documents, Photos, Pricing, Settings
3. User fills Basic Info (plate, make, model, year, location)
4. User uploads 3 required documents (registration, insurance, inspection) with expiry dates
5. User uploads 1-10 photos
6. User sets Pricing (daily rate, weekly rate)
7. User toggles Settings (hasDriver, initial status)
8. User clicks "Save Car"
9. On success: toast "Car added", redirect to `/cars/:id`
10. On error: top-of-form banner, form preserved, scroll to first invalid field if validation error

## Components on Page

Under `src/components/cars/`:

- `car-form.tsx` (`CarForm`) — full form covering basic info, documents, photos, pricing, settings, and submit/cancel buttons. Reused by `03-edit`.

Reused from elsewhere (do not recreate):
- `car-status-badge.tsx` (`CarStatusBadge`) — not used here, listed for awareness

> Component decomposition rule: keep `CarForm` flat (one file). Only split into
> section sub-components if the file passes ~300 lines or a section is reused elsewhere.

## Validations

Schema in `src/modules/cars/schema.ts` as `carCreateSchema`.

| Field | Rule |
|---|---|
| `plate` | required, regex `^[A-Z0-9]{4,10}$`, must be unique |
| `make` | required, 1-50 chars |
| `model` | required, 1-50 chars |
| `year` | required, integer, 1990 ≤ year ≤ current |
| `location` | optional, ≤ 100 chars |
| `documents` | exactly 3, one per type (`registration`, `insurance`, `inspection`) |
| `documents[].expiresAt` | required, must be > today |
| `photos` | min 1, max 10, each ≤ 10MB, MIME `image/jpeg`, `image/png`, `image/webp` |
| `dailyRate` | required, > 0, max 2 decimal places |
| `weeklyRate` | required, > 0, ≥ `dailyRate × 5` |
| `hasDriver` | required, boolean |
| `status` | enum, default `available`. Cannot be `available` if any document expires within 7 days |

## UI States

- **Initial**: all sections rendered, Save disabled until required fields valid
- **Uploading file**: per-file progress bar in respective uploader, other inputs remain enabled
- **Submitting**: Save button shows spinner + "Saving…", inputs disabled, Cancel still works
- **Validation error (client)**: red text below field, page scrolls to first invalid field on submit
- **Server error**: red banner at top of form, message from server, form preserved, no redirect
- **Success**: toast "Car added successfully", redirect to `/cars/:id` after 200ms
- **Confirm cancel**: if form is dirty and user clicks Cancel/Back, modal "Discard changes? Unsaved data will be lost."

## Copy

| Key | Text |
|---|---|
| page.title | Add New Car |
| page.subtitle | Add a vehicle to your fleet |
| btn.save | Save Car |
| btn.cancel | Cancel |
| btn.discard | Discard changes |
| toast.success | Car added successfully |
| modal.discard.title | Discard changes? |
| modal.discard.body | Unsaved data will be lost. |
| section.basic | Basic information |
| section.docs | Documents |
| section.photos | Photos |
| section.pricing | Pricing |
| section.settings | Settings |
| help.photos | Upload 1-10 photos. JPG, PNG, or WEBP, max 10MB each. |
| help.docs | Upload registration, insurance, and inspection documents with expiry dates. |
| err.plate.format | Plate must be 4-10 uppercase letters or numbers |
| err.plate.duplicate | A car with this plate already exists |
| err.weeklyRate.tooLow | Weekly rate must be at least 5× daily rate |
| err.status.expiringDocs | Cannot set status to Available — a document expires within 7 days |

## API

- **Procedure**: `cars.create` (mutation)
- **Auth**: `protectedProcedure` + role check `Admin | Manager`
- **Input**: `carCreateSchema` from `src/modules/cars/schema.ts`
- **Output**: `{ id: string }`
- **Side effects** (in single Prisma transaction):
  1. Create `Car` row
  2. Create `Pricing` row linked to car
  3. Create 3 `CarDocument` rows
  4. Create 1-10 `CarPhoto` rows with `order` 0..n
- **Failure modes**:
  - `CONFLICT` if plate already exists
  - `BAD_REQUEST` if invariants violated (e.g. `status = 'available'` with expiring docs)
  - `INTERNAL_SERVER_ERROR` if S3 upload happened but DB write failed → orphan file (acceptable for MVP; document for future cleanup job)

## Frontend Wiring

- **Route file**: `src/routes/_authed/cars/(new)/new.tsx`
- **View Model**: `src/routes/_authed/cars/(new)/-new.view-model.ts`
  - `useForm` with `zodResolver(carCreateSchema as any)`
  - `trpc.cars.create.useMutation` with `onSuccess` → `navigate({ to: '/cars/$id', params: { id } })`
  - `useFileUpload` hook (`src/hooks/use-file-upload.ts`) for S3 uploads — create if not present
  - `useNavigate` from TanStack Router
  - Tracks dirty state for discard-confirm modal
- **Components** (new in this story): `src/components/cars/car-form.tsx`
- **Schemas** (added in epic prereq or here): `carCreateSchema` in `src/modules/cars/schema.ts`

## Tasks

- [ ] Add `carCreateSchema` to `src/modules/cars/schema.ts` (if not done in epic prereq)
- [ ] Add `cars.create` procedure in `src/modules/cars/router.ts` with role guard
- [ ] Implement `createCar` service with Prisma transaction
- [ ] Build `CarForm` (basic info, documents, photos, pricing, settings, actions, discard-confirm modal)
- [ ] Implement `use-file-upload` hook (if not exists)
- [ ] Wire route + ViewModel
- [ ] Unit tests: `createCar` service (happy path, duplicate plate, expiring doc invariant)
- [ ] Manual test: full flow with 3 docs + 5 photos

## Open Questions

- Photo drag-to-reorder: in MVP or v1.1? → Default: upload order only, defer drag.
