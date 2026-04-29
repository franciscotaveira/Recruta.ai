# Recrutaria Institutional Site

## Analytics Activation

Edit `analytics-config.js` and set your real IDs:

- `gtmContainerId`: e.g. `GTM-XXXXXXX`
- `preferGtm`: `true` to send events via `dataLayer` only
- `ga4MeasurementId`: e.g. `G-XXXXXXXXXX`
- `metaPixelId`: e.g. `123456789012345`
- `linkedinPartnerId`: e.g. `123456`

If you want to disable all tracking temporarily:

- `enabled: false`

## Events

`site.js` emits:

- `page_view`
- `cta_click`
- `nav_click`

All events include context fields (`page`, `title`, `referrer`, `utm_*`, `gclid`, `fbclid`).

## Deploy

Use:

```bash
VPS_HOST=187.127.9.92 VPS_USER=root VPS_PASS='***' ./ops/deploy-institutional-site.sh
```
