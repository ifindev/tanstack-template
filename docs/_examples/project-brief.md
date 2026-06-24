# Car Rental System — Project Brief

> Example brief for reference. Use this as a guide to the level of detail and tone
> the `project-brief` skill should produce. Your real brief lives at `docs/project-brief.md`.

## Product

**What it is**: Internal management tool for ABC Rentals — a single-location car rental business with ~50 vehicles, ~5 staff, ~200 monthly customers.

**Primary users**:
- Office staff (Admin, Manager) — daily operations
- Drivers — view assigned trips
- Customers — browse and self-book

**Problems solved**:
- Replaces paper booking ledger (manual, error-prone, no audit trail)
- Tracks document expiries (registration, insurance) — currently missed
- Enables online self-service booking (currently phone-only)
- Provides real-time fleet status visibility

**Out of scope for MVP**:
- Payment processing (manual entry only)
- Multi-location / franchise support
- Mobile native apps
- GPS / telematics integration
- Customer loyalty / rewards

**Success metrics**:
- 80% of bookings created in system within 1 month of launch
- Zero insurance issues from expired documents
- 25%+ of bookings via customer portal by month 3

## Roles

- **Admin** — Full access. Owns settings, users, pricing, can delete records.
- **Manager** — Day-to-day ops. Cars, bookings, customers. No deletes, no settings.
- **Driver** — Sees only their assigned bookings and trip details.
- **Customer** — Self-service portal: browse, book, view own history.

## Features

| # | Feature | Roles | One-liner |
|---|---|---|---|
| 0001 | [Cars](./features/0001-cars/_epic.md) | Admin, Manager | Fleet inventory, docs, photos |
| 0002 | [Bookings](./features/0002-bookings/_epic.md) | Admin, Manager, Customer | Create and track rentals |
| 0003 | Customers | Admin, Manager | Customer records |
| 0004 | Drivers | Admin, Manager | Driver records & assignments |
| 0005 | Pricing | Admin | Rate cards |
| 0006 | Customer Portal | Customer | Self-service browse + book |
| 0007 | Reports | Admin, Manager | Revenue, utilization |

## RBAC Matrix

| Resource | View | Create | Edit | Delete/Archive |
|---|---|---|---|---|
| Car | Admin, Manager, Customer(public) | Admin, Manager | Admin, Manager | Admin |
| Booking | Admin, Manager, Driver(own), Customer(own) | Admin, Manager, Customer | Admin, Manager | Admin |
| Customer | Admin, Manager | Admin, Manager, Self(register) | Admin, Manager, Self(own) | Admin |
| Driver | Admin, Manager | Admin | Admin | Admin |
| Pricing | Admin, Manager | Admin | Admin | Admin |

## Data Model

### Car

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `plate` | `VARCHAR(10)` | NOT NULL, UNIQUE | `^[A-Z0-9]{4,10}$` |
| `make` | `VARCHAR(50)` | NOT NULL | 1-50 chars |
| `model` | `VARCHAR(50)` | NOT NULL | 1-50 chars |
| `year` | `INT` | NOT NULL | 1990 ≤ year ≤ current |
| `status` | `car_status` | NOT NULL, DEFAULT `'available'` | enum: `available`, `rented`, `maintenance`, `retired` |
| `hasDriver` | `BOOLEAN` | NOT NULL, DEFAULT `false` | true = car only rents with driver |
| `dailyRate` | `DECIMAL(10,2)` | NOT NULL | > 0 |
| `location` | `VARCHAR(100)` | NULL | |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |
| `updatedAt` | `TIMESTAMPTZ` | NOT NULL | auto-update on row change |

**Relations**: belongs to `Pricing`. Has many `CarDocument`, `CarPhoto`, `Booking`.
**Invariants**: cannot transition to `status = 'available'` without ≥1 photo and unexpired registration document.

### CarDocument

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `carId` | `VARCHAR(30)` | NOT NULL, FK → `Car.id` ON DELETE CASCADE | |
| `type` | `document_type` | NOT NULL | enum: `registration`, `insurance`, `inspection` |
| `fileUrl` | `TEXT` | NOT NULL | S3 URL |
| `expiresAt` | `DATE` | NOT NULL | must be > today on insert |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |

**Unique**: `(carId, type)` — one of each document type per car.
**Relations**: belongs to `Car`.

### CarPhoto

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `carId` | `VARCHAR(30)` | NOT NULL, FK → `Car.id` ON DELETE CASCADE | |
| `fileUrl` | `TEXT` | NOT NULL | S3 URL |
| `order` | `INT` | NOT NULL, DEFAULT `0` | 0-9 |

**Relations**: belongs to `Car`.

### Booking

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `customerId` | `VARCHAR(30)` | NOT NULL, FK → `Customer.id` | |
| `carId` | `VARCHAR(30)` | NOT NULL, FK → `Car.id` | |
| `driverId` | `VARCHAR(30)` | NULL, FK → `Driver.id` | required if `car.hasDriver = true` |
| `startDate` | `TIMESTAMPTZ` | NOT NULL | |
| `endDate` | `TIMESTAMPTZ` | NOT NULL | must be > startDate |
| `status` | `booking_status` | NOT NULL, DEFAULT `'pending'` | enum: `pending`, `confirmed`, `active`, `completed`, `cancelled` |
| `totalAmount` | `DECIMAL(10,2)` | NOT NULL | ≥ 0 |

**Invariants**: no overlapping confirmed bookings for the same car.
**Relations**: belongs to `Customer`, `Car`, optionally `Driver`.

### Customer

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `name` | `VARCHAR(100)` | NOT NULL | 1-100 chars |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | RFC 5321 email format |
| `phone` | `VARCHAR(20)` | NOT NULL | E.164 format |
| `licenseNumber` | `VARCHAR(30)` | NOT NULL, UNIQUE | |
| `licenseExpiresAt` | `DATE` | NOT NULL | |

**Relations**: has many `Booking`.

### Driver

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `userId` | `VARCHAR(30)` | NOT NULL, FK → `User.id` | |
| `licenseNumber` | `VARCHAR(30)` | NOT NULL, UNIQUE | |
| `status` | `driver_status` | NOT NULL, DEFAULT `'active'` | enum: `active`, `inactive` |

**Relations**: has many `Booking`.

### Pricing

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `carId` | `VARCHAR(30)` | NOT NULL, FK → `Car.id` | |
| `dailyRate` | `DECIMAL(10,2)` | NOT NULL | > 0 |
| `weeklyRate` | `DECIMAL(10,2)` | NOT NULL | ≥ dailyRate × 5 |
| `seasonalMultiplier` | `DECIMAL(4,2)` | NOT NULL, DEFAULT `1.00` | |

## Routes

| Route | Feature | Roles |
|---|---|---|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Public |
| `/dashboard` | Reports overview | Admin, Manager |
| `/cars` | Car list | Admin, Manager |
| `/cars/new` | Create car | Admin, Manager |
| `/cars/:id` | Edit car | Admin, Manager |
| `/bookings` | Booking list | Admin, Manager |
| `/bookings/new` | Create booking | Admin, Manager |
| `/bookings/:id` | Booking detail | Admin, Manager, Driver(own) |
| `/customers` | Customer list | Admin, Manager |
| `/portal/cars` | Public catalog | Customer |
| `/portal/bookings/new` | Self-book | Customer |
| `/portal/bookings` | My bookings | Customer |

## Tech

**Stack**
- TanStack Start (file-based routing + server fns)
- TypeScript strict, ES2022 target
- Prisma 7 + Postgres (via `@prisma/adapter-pg`)
- tRPC v11
- Better Auth (email/password, role on User)
- shadcn/ui + Tailwind v4
- Vitest (colocated unit tests)
- Biome (lint + format)

**Infrastructure**
- Local: Docker Compose (Postgres + Redis + Mailpit)
- Prod: Coolify on VPS, Traefik reverse proxy
- File storage: DigitalOcean Spaces (S3-compatible)
- Email: Mailpit dev → Resend prod
- Observability: pino (logs), Sentry (errors)

**Conventions**
- ViewModel pattern (see `docs/guides/application-architecture.md`)
- One component per file (kebab-case file, PascalCase export, function declaration)
- Imports via `@/` alias
- tRPC procedures: `<module>.<action>` (e.g. `cars.create`)
- RBAC enforced via shared `src/shared/auth/permissions.ts` — used in tRPC + UI

**Non-functional**
- Single-tenant
- ~50 concurrent users target
- List page p95 < 500ms
- File uploads ≤ 10MB each
- Browser support: latest 2 of Chrome / Safari / Edge / Firefox
- No real-time / websockets (poll if needed)

## Open Questions

- Payment integration timing (post-MVP?)
- Customer portal subdomain vs path-prefix?
- Document expiry warning lead time?
