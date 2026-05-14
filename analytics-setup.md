# Linnéa Analytics Setup

The site is prepared for Google Analytics 4 and Meta Pixel, but tracking is disabled until real IDs are added.

## 1. Google Analytics 4

Create or open a GA4 property and copy the Measurement ID:

```text
G-XXXXXXXXXX
```

In `main.js`, replace:

```js
googleAnalyticsId: '',
```

with:

```js
googleAnalyticsId: 'G-XXXXXXXXXX',
```

## 2. Meta Pixel

Create a Meta Pixel in Meta Events Manager and copy the Pixel ID:

```text
123456789012345
```

In `main.js`, replace:

```js
metaPixelId: '',
```

with:

```js
metaPixelId: '123456789012345',
```

## 3. Consent Behavior

Tracking scripts load only after the visitor clicks cookie approval.

If the visitor declines cookies:

- Google Analytics does not load.
- Meta Pixel does not load.
- Consultation forms still work normally.

## 4. Events Currently Tracked

- `booking_modal_open` - user opens the consultation form.
- `consultation_request_submit` - user submits the form.
- `consultation_request_success` - Web3Forms confirms successful delivery.
- `whatsapp_click` - user clicks a WhatsApp link.

For Meta, these map to standard `Contact` and `Lead` events.

## 5. Recommended Next Setup

- Google Search Console verification.
- Meta domain verification.
- Google Ads conversion tracking only if paid search campaigns begin.
- Meta Conversions API only after paid Meta campaigns begin and consent/privacy wording is reviewed.

