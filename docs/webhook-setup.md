# Start-a-Project → n8n webhook

The `/start.html` form submits each completed brief (plus the transparent
lead triage) to an **n8n Webhook**. Until a URL is configured it does
nothing automatic — the visitor still gets the WhatsApp / email / copy
handoff, which always stays available as a fallback.

## 1. Create the webhook in n8n

1. New workflow → **Webhook** node.
2. Method `POST`, Path something unguessable (e.g. `start-a-project-9f3c1e`).
3. Activate the workflow and copy the **Production URL**
   (`https://<your-n8n>/webhook/start-a-project-9f3c1e`).
4. Build the rest of the workflow off the payload below — e.g. append a row
   to a sheet, send yourself an email/Telegram, branch on `triage.band`.

## 2. Point the site at it — without committing the URL

Set `FORM.WEBHOOK_URL` in **`site/js/site.config.js`** on the **deployed**
copy only:

```js
export const SITE = {
  FORM: {
    WEBHOOK_URL: 'https://<your-n8n>/webhook/start-a-project-9f3c1e',
    TIMEOUT_MS: 8000,
  },
  VERSION: '0.1.0',
};
```

Do this by editing the file on the server after upload, or have your deploy
step write the value in. The copy in git keeps `WEBHOOK_URL: ''`.
**Never commit a real URL.**

## 3. Payload shape (POST body, `application/json`)

```json
{
  "source": "musfirahloom.com/start",
  "submittedAt": "2026-09-07T10:00:00.000Z",
  "page": "https://musfirahloom.com/start.html",
  "lead": {
    "name": "", "email": "", "business": "", "link": "",
    "industry": "", "businessType": "", "challenge": "",
    "need": "", "budget": "", "timeline": "", "goal": "",
    "preferredContact": ""
  },
  "triage": {
    "score": 10, "maxScore": 12, "band": "hot", "bandLabel": "HOT",
    "capped": false, "capNote": "",
    "recommendedAction": "Reply within 2 hours. Prep a short proposal before the call.",
    "factors": [{ "key": "budget", "label": "Budget", "points": 2, "max": 3, "note": "$1,500 – $5,000" }]
  }
}
```

## 4. Security notes

- **The webhook path is the shared secret.** Make it long and random; rotate
  it if it leaks. Do not rely on a header token — anything in the client
  bundle is readable by anyone.
- Add basic protection in n8n / in front of it: rate-limiting, an allow-list
  on `source`, or a Cloudflare rule. A hidden honeypot field and/or a
  Turnstile check can be added to the form later if spam appears.
- The payload is visible to the visitor in their browser's Network tab —
  which is fine: every value in it came from that visitor. Do not add
  anything sensitive server-side-only to the client payload.
- The request uses `keepalive` and an 8s timeout; on any failure the form
  silently falls back to the handoff and tells the visitor to use a button.
