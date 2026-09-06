/* ===========================================================
   Misbah Azib — Website
   site/js/site.config.js  ·  public runtime configuration

   COMMITTED FILE — NEVER put secrets, API keys or tokens here.
   Everything in this file ships to the browser.

   The Start-a-Project form (start.html) submits to an n8n
   Webhook when FORM.WEBHOOK_URL is set. Left blank here on
   purpose: with no URL the form falls back to the WhatsApp /
   email / copy handoff only — nothing is sent automatically.

   To connect it, set FORM.WEBHOOK_URL on the DEPLOYED copy of
   this file (edit it on the server, or have your deploy step
   write it in). Do not commit the real URL. See
   docs/webhook-setup.md.
=========================================================== */
export const SITE = {
  FORM: {
    /* n8n Production Webhook URL. Blank = disabled (handoff only). */
    WEBHOOK_URL: '',

    /* Abort the POST after this long and fall back to the handoff. */
    TIMEOUT_MS: 8000,
  },

  VERSION: '0.1.0',
};

export const isFormWebhookEnabled = () => Boolean(SITE.FORM.WEBHOOK_URL);
