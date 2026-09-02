/* ===========================================================
   MusfirahLoom — Website
   site/js/reveal.js  ·  cinematic scroll reveal (shared)

   Adds .in to every .site-reveal as it enters the viewport.
   Respects prefers-reduced-motion (everything shown at once).
=========================================================== */
export function initReveal(rootEl = document) {
  const els = rootEl.querySelectorAll('.site-reveal');
  if (!els.length) return;

  const reduce = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach((el) => io.observe(el));
}
