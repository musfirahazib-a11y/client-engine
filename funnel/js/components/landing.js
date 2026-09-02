/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/landing.js  ·  STEP 2 — the high-converting landing page

   Renders every landing section from config.landing — hero,
   problem, solution, how-it-works, benefits, listings, features,
   social proof, FAQ, offer, final CTA, footer note. Nothing is
   hard-coded; swap the config and the page retargets.

   Returns a fragment plus refs the entry needs:
   { fragment, startMount }  — startMount is where the lead form
   / AI chat is placed.
=========================================================== */
import { el } from '../../../agents/js/core/dom.js';
import { activeOffer } from '../repositories/recommendationRepo.js';

function section(cls, ...kids) {
  return el('section', { class: `fn-sec ${cls}` }, el('div', { class: 'fn-wrap' }, ...kids));
}

export function renderLanding(cfg, { onStart } = {}) {
  const L = cfg.landing;
  const frag = document.createDocumentFragment();
  const niche = (cfg.meta && cfg.meta.niche) || '';
  const itemWord = niche.includes('salon') ? 'treatments' : niche.includes('commerce') ? 'pieces' : 'homes';
  const buyerWord = niche.includes('salon') ? 'clients' : niche.includes('commerce') ? 'customers' : 'buyers';

  /* ---------- hero ---------- */
  const startMount = el('div', { class: 'fn-start', id: 'fn-start' });

  const heroCtas = el('div', { class: 'fn-hero__ctas' },
    el('button', { type: 'button', class: 'btn btn-solid', onClick: () => onStart?.() }, L.hero.ctaPrimary.label),
    L.hero.ctaSecondary
      ? el('a', { class: 'btn btn-outline', href: '#fn-listings' }, L.hero.ctaSecondary.label)
      : null);

  const trust = el('ul', { class: 'fn-hero__trust' },
    ...(L.hero.trust || []).map((t) => el('li', {}, t)));

  frag.append(section('fn-hero',
    el('span', { class: 'fn-eyebrow' }, L.hero.eyebrow || cfg.business.name),
    el('h1', { class: 'fn-hero__headline' }, L.hero.headline),
    el('p', { class: 'fn-hero__sub' }, L.hero.sub),
    heroCtas,
    trust,
    startMount));

  /* ---------- problem ---------- */
  if (L.problem) {
    frag.append(section('fn-problem',
      el('h2', {}, L.problem.title),
      el('ul', { class: 'fn-list fn-list--x' }, ...(L.problem.points || []).map((p) => el('li', {}, p)))));
  }

  /* ---------- solution ---------- */
  if (L.solution) {
    frag.append(section('fn-solution',
      el('h2', {}, L.solution.title),
      el('p', { class: 'fn-lede' }, L.solution.body),
      el('ul', { class: 'fn-list fn-list--check' }, ...(L.solution.points || []).map((p) => el('li', {}, p)))));
  }

  /* ---------- how it works ---------- */
  if (L.steps && L.steps.length) {
    frag.append(section('fn-steps',
      el('h2', {}, 'How it works'),
      el('ol', { class: 'fn-steps__grid' },
        ...L.steps.map((s) => el('li', { class: 'fn-step' },
          el('span', { class: 'fn-step__n' }, String(s.n)),
          el('h3', {}, s.title),
          el('p', {}, s.body))))));
  }

  /* ---------- benefits ---------- */
  if (L.benefits && L.benefits.length) {
    frag.append(section('fn-benefits',
      el('h2', {}, 'Why it converts'),
      el('div', { class: 'fn-cards' },
        ...L.benefits.map((b) => el('div', { class: 'fn-card' },
          el('span', { class: 'fn-card__ic', 'aria-hidden': 'true' }, b.icon || '◆'),
          el('h3', {}, b.title),
          el('p', {}, b.body))))));
  }

  /* ---------- listings ---------- */
  if (cfg.listings && cfg.listings.length) {
    frag.append(el('section', { class: 'fn-sec fn-listings', id: 'fn-listings' },
      el('div', { class: 'fn-wrap' },
        el('h2', {}, `Featured ${itemWord}`),
        el('p', { class: 'fn-lede' }, 'A snapshot of what\'s available. The assistant narrows this to what fits you.'),
        el('div', { class: 'fn-listings__grid' },
          ...cfg.listings.map((p) => el('article', { class: 'fn-listing' },
            el('div', { class: 'fn-listing__media', 'aria-hidden': 'true' }, '⌂'),
            el('div', { class: 'fn-listing__body' },
              el('span', { class: 'fn-listing__cat' }, p.category),
              el('h3', {}, p.title),
              el('p', { class: 'fn-listing__meta' },
                (p.beds != null || p.sqft)
                  ? [p.beds ? `${p.beds} bd` : 'Studio', p.baths ? `${p.baths} ba` : null, p.sqft ? `${p.sqft.toLocaleString()} sqft` : null].filter(Boolean).join(' · ')
                  : [p.duration, ...(p.features || []).slice(0, 1)].filter(Boolean).join(' · ')),
              el('p', { class: 'fn-listing__blurb' }, p.blurb),
              el('div', { class: 'fn-listing__foot' },
                el('span', { class: 'fn-listing__price' }, p.priceLabel),
                el('button', { type: 'button', class: 'btn btn-outline', onClick: () => onStart?.() }, p.cta ? p.cta.label : 'Enquire')))))))));
  }

  /* ---------- features ---------- */
  if (L.features && L.features.length) {
    frag.append(section('fn-features',
      el('h2', {}, 'What\'s under the hood'),
      el('div', { class: 'fn-feature-grid' },
        ...L.features.map((f) => el('div', { class: 'fn-feature' },
          el('h3', {}, f.title),
          el('p', {}, f.body))))));
  }

  /* ---------- social proof (clearly synthetic) ---------- */
  if (L.social && L.social.testimonials && L.social.testimonials.length) {
    frag.append(section('fn-social',
      el('h2', {}, `What ${buyerWord} say`),
      el('p', { class: 'fn-note' }, L.social.note || 'Illustrative examples.'),
      el('div', { class: 'fn-quotes' },
        ...L.social.testimonials.map((t) => el('blockquote', { class: 'fn-quote' },
          el('p', {}, `“${t.quote}”`),
          el('cite', {}, `${t.name} — ${t.role}${t.synthetic ? ' · illustrative' : ''}`))))));
  }

  /* ---------- FAQ ---------- */
  if (L.faqEnabled && cfg.faqs && cfg.faqs.length) {
    frag.append(section('fn-faq',
      el('h2', {}, 'Questions, answered'),
      el('div', { class: 'fn-faq__list' },
        ...cfg.faqs.map((f) => el('details', { class: 'fn-faq__item' },
          el('summary', {}, f.q),
          el('p', {}, f.a))))));
  }

  /* ---------- offer band ---------- */
  const offer = activeOffer();
  if (offer) {
    frag.append(el('section', { class: 'fn-sec fn-offerband' },
      el('div', { class: 'fn-wrap fn-offerband__inner' },
        el('div', {},
          el('span', { class: 'fn-eyebrow' }, 'Limited'),
          el('h2', {}, offer.name),
          el('p', {}, offer.description),
          offer.urgency ? el('p', { class: 'fn-offerband__urgency' }, offer.urgency) : null),
        el('button', { type: 'button', class: 'btn btn-solid', onClick: () => onStart?.() }, offer.cta.label))));
  }

  /* ---------- final CTA ---------- */
  frag.append(section('fn-final',
    el('h2', {}, L.finalCta.headline),
    el('p', { class: 'fn-lede' }, L.finalCta.sub),
    el('button', { type: 'button', class: 'btn btn-solid', onClick: () => onStart?.() }, L.finalCta.label)));

  /* ---------- demo CTA band (this is a demo of the system, not a real business) ---------- */
  const dc = cfg.meta && cfg.meta.demoCta;
  if (dc) {
    frag.append(el('section', { class: 'fn-sec fn-demoband' },
      el('div', { class: 'fn-wrap fn-demoband__inner' },
        el('div', {},
          el('span', { class: 'fn-eyebrow' }, 'Interactive demo'),
          el('h2', {}, 'Want this system for your business?'),
          el('p', {}, dc.text)),
        el('div', { class: 'fn-demoband__cta' },
          dc.primary ? el('a', { class: 'btn btn-solid', href: dc.primary.href, target: '_blank', rel: 'noopener' }, dc.primary.label) : null,
          dc.secondary ? el('a', { class: 'btn btn-outline', href: dc.secondary.href }, dc.secondary.label) : null))));
  }

  /* ---------- footer note ---------- */
  frag.append(el('footer', { class: 'fn-foot' },
    el('div', { class: 'fn-wrap' },
      el('span', {}, `© ${new Date().getFullYear()} ${cfg.business.name} · Interactive demo`),
      el('span', { class: 'fn-note' }, L.footerNote || ''))));

  return { fragment: frag, startMount };
}
