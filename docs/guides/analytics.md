# Analytics

Google Analytics 4 is configured without a runtime package. The script is injected in `src/routes/__root.tsx`.

## Setup

1. Create or open a GA4 property in Google Analytics.
2. Create a Web data stream for the production domain.
3. Copy the Measurement ID, which usually looks like `G-XXXXXXXXXX`.
4. Set `VITE_GA_MEASUREMENT_ID` in the deployment environment.

Leave `VITE_GA_MEASUREMENT_ID` unset in development unless you intentionally want local traffic in GA4.

## Runtime behavior

The root document only injects GA4 scripts when `import.meta.env.VITE_GA_MEASUREMENT_ID` is set. Vite inlines `VITE_*` variables into the browser bundle at build time, so changes to this value require a rebuild/redeploy.

The injected script initializes `window.dataLayer`, defines `gtag`, sends the initial `js` event, and configures GA4 with the Measurement ID.

## Privacy note

GA4 may set cookies and process visitor data depending on your Analytics configuration and jurisdiction. Verify your consent, privacy policy, and retention requirements before enabling it in production. This guide is implementation guidance, not legal advice.
