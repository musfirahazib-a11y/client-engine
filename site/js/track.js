/* ===========================================================
   Misbah Azib — Website
   site/js/track.js  ·  dormant analytics seam

   A single place every conversion event is announced from. It
   is intentionally a NO-OP right now: it loads no script, sets
   no cookie, and sends no request. Nothing is tracked until a
   provider is wired in here on explicit approval.

   To activate later (one edit, one place):
     - add the provider's snippet to the page <head>, then
     - forward the call below, e.g. for Plausible:
         window.plausible?.(event, { props: meta });
       or for GA4:
         window.gtag?.('event', event, meta);

   Call sites currently in use (all harmless while dormant):
     start_view · form_start · form_submit ·
     whatsapp_click · email_click · book_click · copy_click
=========================================================== */

export function track(event, meta = {}) {
  // Dormant — no analytics provider connected yet.
  void event;
  void meta;
}
