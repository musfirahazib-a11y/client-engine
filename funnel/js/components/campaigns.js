/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/campaigns.js  ·  the Demo Campaigns page

   Renders the selector, the "how it fits together" map, three
   case studies and a live cross-campaign performance panel,
   all from the campaign registry. No per-campaign markup.
=========================================================== */
import { el } from '../../../agents/js/core/dom.js';
import { money0 } from '../services/funnelConfig.js';

const AGENT_NAMES = {
  sales: 'Sales & Product Recommendation',
  support: 'Customer Support + Order/Returns',
  cart: 'Abandoned Cart Recovery',
  lead: 'Lead Qualification + Booking',
};

function sec(id, cls, ...kids) {
  return el('section', { class: `cp-sec ${cls}`, id: id || undefined }, el('div', { class: 'cp-wrap' }, ...kids));
}

export function renderCampaignsPage(root, { campaigns, statsFor }) {
  const frag = document.createDocumentFragment();

  /* ---------- hero ---------- */
  frag.append(sec(null, 'cp-hero',
    el('span', { class: 'cp-eyebrow' }, 'Demo Campaigns'),
    el('h1', {}, 'Explore our AI business campaigns'),
    el('p', { class: 'cp-lede' },
      'We don\'t just build AI agents — we build complete AI-powered customer acquisition, sales, conversion and '
      + 'automation systems. Each campaign below is a live, interactive demo of the same system, configured for a '
      + 'different industry.'),
    el('div', { class: 'cp-badges' },
      el('span', { class: 'ml-badge' }, 'Interactive Demo'),
      el('span', { class: 'cp-note' }, 'Synthetic data · fictitious businesses'))));

  /* ---------- selector ---------- */
  const grid = el('div', { class: 'cp-grid' });
  campaigns.forEach((c) => {
    grid.append(el('article', { class: 'cp-card', style: { '--cp-accent': c.accent, '--cp-accent2': c.accent2 } },
      el('div', { class: 'cp-card__top' },
        el('span', { class: 'cp-card__ic', 'aria-hidden': 'true' }, c.icon || '◆'),
        el('span', { class: 'cp-card__niche' }, c.niche.replace('-', ' / '))),
      el('h3', {}, c.name),
      el('p', { class: 'cp-card__blurb' }, c.blurb),
      el('ul', { class: 'cp-card__caps' },
        ...(c.config.landing.benefits || []).slice(0, 3).map((b) => el('li', {}, b.title))),
      el('div', { class: 'cp-card__foot' },
        el('a', { class: 'btn btn-solid', href: `funnel.html?campaign=${c.id}` }, 'Launch demo →'),
        el('a', { class: 'btn btn-outline', href: `funnel-admin.html?campaign=${c.id}` }, 'Console'),
        el('a', { class: 'cp-card__link', href: `#case-${c.id}` }, 'Case study ↓'))));
  });
  frag.append(sec(null, 'cp-selector',
    el('h2', {}, 'Pick an industry'),
    el('p', { class: 'cp-lede' }, 'Launch the demo to experience the customer journey, or open the console to see the business dashboard.'),
    grid));

  /* ---------- how it fits ---------- */
  frag.append(sec(null, 'cp-map',
    el('h2', {}, 'One system, three industries'),
    el('div', { class: 'cp-mapgrid' },
      el('div', { class: 'cp-mapcol' },
        el('h4', {}, 'Each campaign configures'),
        el('ul', {}, ...['Branding & copy', 'Products / services', 'AI instructions', 'Qualification rules', 'Offers', 'Conversion goal', 'Follow-up', 'Demo data'].map((x) => el('li', {}, x)))),
      el('div', { class: 'cp-maparrow', 'aria-hidden': 'true' }, '→'),
      el('div', { class: 'cp-mapcol cp-mapcol--shared' },
        el('h4', {}, 'Shared AI system'),
        el('ul', {},
          el('li', {}, el('strong', {}, 'AI Sales Funnel'), ' — landing, capture, qualification, recommendation, offer'),
          el('li', {}, el('strong', {}, 'Lead + Booking agent'), ' — books appointments / viewings'),
          el('li', {}, el('strong', {}, 'Cart Recovery agent'), ' — wins back abandoned carts'),
          el('li', {}, el('strong', {}, 'Order Status agent'), ' — "where is my order?", returns'),
          el('li', {}, el('strong', {}, 'Analytics'), ' — CRM, funnel, follow-up, recovery'))))));

  /* ---------- case studies ---------- */
  campaigns.forEach((c) => {
    const cs = c.config.meta.caseStudy || {};
    frag.append(el('section', { class: 'cp-sec cp-case', id: `case-${c.id}`, style: { '--cp-accent': c.accent } },
      el('div', { class: 'cp-wrap' },
        el('span', { class: 'cp-eyebrow' }, `Case study · ${c.name}`),
        el('div', { class: 'cp-case__grid' },
          el('div', {},
            el('h3', {}, 'The problem'),
            el('p', {}, cs.problem || '—'),
            el('h3', {}, 'The AI solution'),
            el('p', {}, cs.solution || '—')),
          el('div', {},
            el('h3', {}, 'The customer journey'),
            el('ol', { class: 'cp-journey' }, ...(cs.journey || []).map((j) => el('li', {}, j))),
            el('h3', {}, 'Agents used'),
            el('div', { class: 'cp-agentchips' },
              ...(c.config.meta.agents || []).map((a) => el('span', { class: 'cp-chip' }, AGENT_NAMES[a.id] || a.id))))),
        el('div', { class: 'cp-impact' },
          el('span', { class: 'cp-impact__label' }, 'Illustrative demo results — not actual client data'),
          el('div', { class: 'cp-impact__grid' },
            ...(cs.impact || []).map(([label, value]) => el('div', { class: 'cp-impact__tile' },
              el('span', { class: 'cp-impact__val' }, value),
              el('span', { class: 'cp-impact__k' }, label))))),
        el('a', { class: 'btn btn-solid', href: `funnel.html?campaign=${c.id}` }, `Launch the ${c.name} demo →`))));
  });

  /* ---------- cross-campaign performance ---------- */
  const perfGrid = el('div', { class: 'cp-perfgrid' });
  campaigns.forEach((c) => {
    const s = statsFor(c.id);
    const rows = [
      ['Visitors', s.visitors],
      ['Leads', s.leads],
      ['Qualified', s.qualified],
      [s.goalLabel || 'Conversions', s.conversions],
    ];
    const max = Math.max(...rows.map((r) => r[1]), 1);
    perfGrid.append(el('article', { class: 'cp-perf', style: { '--cp-accent': c.accent } },
      el('div', { class: 'cp-perf__head' },
        el('strong', {}, c.name),
        el('span', { class: 'cp-note' }, `${s.overall}% visitor → ${(s.goalLabel || 'conversion').toLowerCase()}`)),
      el('div', { class: 'cp-perf__bars' },
        ...rows.map(([label, n]) => el('div', { class: 'cp-perf__row' },
          el('div', { class: 'cp-perf__bar', style: { width: `${Math.max(8, Math.round((n / max) * 100))}%` } }, String(n)),
          el('span', { class: 'cp-perf__label' }, label)))),
      s.revenue ? el('p', { class: 'cp-perf__rev' }, `${money0(s.revenue)} demo revenue`) : null,
      el('a', { class: 'cp-card__link', href: `funnel-admin.html?campaign=${c.id}` }, 'Open console →')));
  });
  frag.append(sec('performance', 'cp-perfsec',
    el('h2', {}, 'Campaign performance'),
    el('p', { class: 'cp-lede' }, 'Live from each campaign\'s own data in this browser (seeded with a synthetic demo set). Interact with a demo and its numbers move.'),
    perfGrid));

  /* ---------- closing CTA ---------- */
  frag.append(el('section', { class: 'cp-sec cp-final', id: 'get-started' },
    el('div', { class: 'cp-wrap' },
      el('h2', {}, 'Want this system for your business?'),
      el('p', { class: 'cp-lede' }, 'Pick the closest industry, or tell us yours — the architecture is the same. We configure the branding, catalog, AI rules and follow-up around your business.'),
      el('div', { class: 'cp-final__cta' },
        el('a', { class: 'btn btn-solid', href: 'https://wa.me/923132028898?text=Hi%2C%20I%20want%20an%20AI%20sales%20funnel%20system%20for%20my%20business.', target: '_blank', rel: 'noopener' }, 'Book a demo'),
        el('a', { class: 'btn btn-outline', href: 'https://wa.me/923132028898?text=Hi%2C%20I%27d%20like%20my%20own%20AI%20system.', target: '_blank', rel: 'noopener' }, 'Get your AI system'),
        el('a', { class: 'btn btn-outline', href: 'index.html#contact' }, 'Talk to us')))));

  frag.append(el('footer', { class: 'cp-foot' },
    el('div', { class: 'cp-wrap' },
      el('span', {}, `© ${new Date().getFullYear()} Misbah Azib · MusfirahLoom`),
      el('span', { class: 'cp-note' }, 'All businesses and data on these pages are fictitious, for demonstration only.'))));

  root.append(frag);
}
