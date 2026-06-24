# 0002 — Bookings (Epic)

## Goal

Create and track car rentals. Staff create bookings on behalf of walk-in customers; customers self-book via the portal.

## Pages & Stories

| Story | Route | File |
|---|---|---|
| 01-list | `/bookings` | 01-list.md |
| 02-create | `/bookings/new` | 02-create.md |
| 03-detail | `/bookings/:id` | 03-detail.md |
| 04-cancel | (action) | 04-cancel.md |

## Entities Touched

- `Booking` (primary)
- `Car` (read for availability check)
- `Customer` (read for customer attachment)
- `Driver` (read; required if `car.hasDriver = true`)

Schemas live in `src/modules/bookings/schema.ts`. Service functions in `service.ts`. tRPC procedures in `router.ts`.

## Shared Components

Under `src/components/bookings/`:

- `booking-form.tsx` (`BookingForm`) — full form, used by `02-create` and (read-only) `03-detail`
- `booking-status-badge.tsx` (`BookingStatusBadge`) — used by `01-list` and `03-detail`
- `availability-calendar.tsx` (`AvailabilityCalendar`) — visual date picker showing booked ranges for a car; used by `02-create`

## Shared Module Files

- `src/modules/bookings/schema.ts` — Zod schemas (`bookingCreateSchema`, `bookingFilterSchema`, `bookingCancelSchema`)
- `src/modules/bookings/service.ts` — `listBookings`, `getBooking`, `createBooking`, `cancelBooking`, `checkAvailability`
- `src/modules/bookings/router.ts` — tRPC procedures with role guards (Customer can only see own bookings)

## Build Order

1. Booking schema + migration (Booking entity, constraint on overlapping confirmed bookings)
2. Zod schemas
3. Service layer with overlap detection + unit tests
4. tRPC router with own-record filter for Customer role
5. Story 01-list (read-only)
6. Story 02-create (introduces `BookingForm` + `AvailabilityCalendar`)
7. Story 03-detail
8. Story 04-cancel

## Related

- [Project Brief](../../project-brief.md)
- [Trackers](../../trackers.md)

## Open Questions

- Overlap rule: block on `confirmed` + `active` only, or also `pending`? → defer to 02-create spec
- Customer cancellation window: how late can a customer cancel? → defer to 04-cancel spec
