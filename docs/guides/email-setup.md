# Email Setup

## How email works in this repo

Email is sent via Nodemailer (generic SMTP). The transport is initialized in `src/shared/mail/transport.ts` and consumed by better-auth in `src/shared/auth/better-auth.ts` for verification emails.

The only email currently sent is the account verification email triggered on registration. The `sendEmail()` helper is available for any other use:

```ts
import { sendEmail } from "@/shared/mail/transport";

await sendEmail({ to, subject, html });
```

## Local development

Mailpit runs as a local SMTP sink via Docker Compose. It catches all outbound emails without delivering them, and exposes a web UI to inspect them.

```bash
docker compose up mailpit -d
```

| What | Where |
|---|---|
| SMTP endpoint | `localhost:1025` |
| Web UI | `http://localhost:8025` |

The defaults in `.env.example` point at Mailpit. No additional configuration is needed for local development.

## Production

The transport reads `SMTP_USER` and `SMTP_PASS` from the environment for authenticated SMTP. Pointing it at any real provider is a pure env var change — no code modifications required.

The transport uses `secure: false`, which is correct for port 587 (STARTTLS). All major providers support this. If your provider requires SSL on port 465 instead, change `secure: false` to `secure: true` in `src/shared/mail/transport.ts:6`.

### Required env vars for production

Add these to your production environment (they are intentionally absent from `.env.example` since they are not needed locally):

| Variable | Description |
|---|---|
| `SMTP_USER` | SMTP username (varies by provider — see examples below) |
| `SMTP_PASS` | SMTP password or API key |

Plus update the existing vars:

| Variable | Production value |
|---|---|
| `SMTP_HOST` | Your provider's SMTP hostname |
| `SMTP_PORT` | `587` (STARTTLS) or `465` (SSL) |
| `EMAIL_FROM` | A verified sender address on your domain |

### Resend

```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Postmark

```bash
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your_server_token
SMTP_PASS=your_server_token
EMAIL_FROM=noreply@yourdomain.com
```

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### AWS SES

```bash
SMTP_HOST=email-smtp.<region>.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_iam_smtp_username
SMTP_PASS=your_iam_smtp_password
EMAIL_FROM=noreply@yourdomain.com
```

SES requires the sender domain or address to be verified in the AWS console before emails will send.

## Additional production gotcha: trustedOrigins

`src/shared/auth/better-auth.ts` has `trustedOrigins` hardcoded to `['http://localhost:3000']`. Add your production domain or better-auth will reject cross-origin auth requests:

```ts
trustedOrigins: ["http://localhost:3000", "https://yourdomain.com"],
```

This is unrelated to email but surfaces at the same time as SMTP configuration, so it is worth setting together.

## Related references

- [`environment-setup.md`](environment-setup.md) — full env var reference and Docker setup
- [`README.md`](../../README.md) — project overview and quick start
