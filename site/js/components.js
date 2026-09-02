/* ===========================================================
   MusfirahLoom — Website
   site/js/components.js  ·  reusable render helpers

   Vanilla ES modules, no build. Reuses the agent platform's
   tiny dom.js and its .ml-card / .ml-topbar / .btn styles so
   the new product pages match agents.html exactly.
=========================================================== */
import { el } from '../../agents/js/core/dom.js';

/* ---------- shared header ---------- */
export function renderSiteHeader(nav) {
  const links = nav.links.map((l) =>
    el('a', {
      href: l.href,
      class: `site-topbar__link${l.id === nav.active ? ' is-active' : ''}`,
    }, l.label));

  const cta = el('a', { href: nav.ctaHref, class: 'btn btn-solid site-topbar__cta' }, nav.ctaLabel);

  const menu = el('nav', { class: 'site-topbar__nav', id: 'siteNav', 'aria-label': 'Primary' },
    ...links, cta);

  const toggle = el('button', {
    class: 'site-topbar__toggle', id: 'siteNavToggle', type: 'button',
    'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'siteNav',
    onClick: () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    },
  }, '☰');

  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => menu.classList.remove('is-open')));

  return el('header', { class: 'site-topbar' },
    el('a', { href: nav.brandHref, class: 'site-topbar__brand' },
      'Misbah', el('span', {}, '.')),
    toggle,
    menu);
}

export function renderSiteFooter(base = '') {
  return el('footer', { class: 'site-foot' },
    el('div', { class: 'site-wrap site-foot__inner' },
      el('div', {},
        el('strong', {}, 'MusfirahLoom'),
        el('p', {}, 'AI Automation & Intelligent Business Systems')),
      el('nav', { class: 'site-foot__links', 'aria-label': 'Footer' },
        el('a', { href: `${base}ai-agents.html` }, 'AI Agents'),
        el('a', { href: `${base}ai-sales-funnel.html` }, 'AI Sales Funnel'),
        el('a', { href: `${base}campaigns.html` }, 'AI Campaigns'),
        el('a', { href: `${base}index.html#about` }, 'About'),
        el('a', { href: `${base}index.html#contact` }, 'Contact')),
      el('span', { class: 'site-foot__copy' }, '© 2026 Misbah Azib. All rights reserved.')));
}

/* ---------- hero ---------- */
export function renderHero({ eyebrow, title, lede, badge, actions = [] }) {
  return el('section', { class: 'site-hero site-reveal' },
    el('div', { class: 'site-wrap' },
      badge ? el('span', { class: 'ml-badge site-hero__badge' }, badge) : null,
      eyebrow ? el('span', { class: 'eyebrow site-hero__eyebrow' }, eyebrow) : null,
      el('h1', { class: 'site-hero__title', html: title }),
      lede ? el('p', { class: 'site-hero__lede' }, lede) : null,
      actions.length
        ? el('div', { class: 'site-hero__actions' },
          ...actions.map((a) => el('a', {
            href: a.href, class: `btn ${a.kind === 'outline' ? 'btn-outline' : 'btn-solid'}`,
          }, a.label)))
        : null));
}

/* ---------- workflow diagram (vertical, connected) ---------- */
export function renderWorkflow(steps, { title, compact = false } = {}) {
  return el('div', { class: `wf${compact ? ' wf--compact' : ''}` },
    title ? el('span', { class: 'wf__title eyebrow' }, title) : null,
    el('ol', { class: 'wf__list' },
      ...steps.map((s, i) => el('li', { class: 'wf__step' },
        el('span', { class: 'wf__node', 'aria-hidden': 'true' }, String(i + 1)),
        el('span', { class: 'wf__label' }, s)))));
}

/* ---------- agent card (reuses .ml-card) ----------
   detailBase: '' -> #agent-<id> on the same page;
               'ai-agents.html' -> deep-links from the homepage */
export function renderAgentCard(a, { detailBase = '' } = {}) {
  return el('article', {
    class: 'ml-card site-card site-reveal',
    style: { '--card-accent': `var(${a.accent})` },
  },
    el('div', { class: 'ml-card__top' },
      el('span', { class: 'ml-card__icon', 'aria-hidden': 'true' }, a.no),
      el('span', { class: 'ml-card__cat' }, `Agent ${a.no}`)),
    el('h3', { class: 'ml-card__name' }, a.name),
    el('p', { class: 'ml-card__benefit' }, a.tagline),
    el('ul', { class: 'ml-card__caps' }, ...a.capabilities.map((c) => el('li', {}, c))),
    el('p', { class: 'site-card__flow' }, a.workflow.join('  →  ')),
    el('div', { class: 'ml-card__foot' },
      el('a', { class: 'btn btn-solid', href: a.demoHref }, 'Try demo →'),
      el('a', { class: 'btn btn-outline', href: `${detailBase}#agent-${a.id}` }, 'Explore agent')));
}

/* ---------- agent detail block ---------- */
export function renderAgentDetail(a) {
  return el('section', { class: 'agent-detail site-reveal', id: `agent-${a.id}`, style: { '--card-accent': `var(${a.accent})` } },
    el('div', { class: 'site-wrap agent-detail__grid' },
      el('div', { class: 'agent-detail__body' },
        el('span', { class: 'eyebrow' }, `Agent ${a.no}`),
        el('h2', {}, a.name),
        el('p', { class: 'agent-detail__lede' }, a.tagline),
        el('p', {}, a.description),
        el('ul', { class: 'ml-card__caps agent-detail__caps' }, ...a.capabilities.map((c) => el('li', {}, c))),
        el('a', { class: 'btn btn-solid', href: a.demoHref }, `Try the ${a.name} demo →`)),
      el('div', { class: 'agent-detail__flow' },
        renderWorkflow(a.workflow, { title: 'How it works' }))));
}

/* ---------- campaign card (reuses .ml-card) ---------- */
export function renderCampaignCard(c, base = '') {
  return el('article', {
    class: 'ml-card site-card site-reveal',
    style: { '--card-accent': `var(${c.accent})` },
  },
    el('div', { class: 'ml-card__top' },
      el('span', { class: 'ml-card__icon', 'aria-hidden': 'true' }, '◈'),
      el('span', { class: 'ml-card__cat' }, c.short)),
    el('h3', { class: 'ml-card__name' }, c.name),
    el('p', { class: 'ml-card__benefit' }, c.tagline),
    el('ul', { class: 'ml-card__caps' }, ...c.objectives.map((o) => el('li', {}, o))),
    el('div', { class: 'ml-card__foot' },
      el('a', { class: 'btn btn-solid', href: `${base}campaigns/${c.slug}.html` }, 'Full breakdown →'),
      el('a', { class: 'btn btn-outline', href: `${base}${c.demoHref}` }, 'Launch demo')));
}

/* ---------- ecosystem diagram ---------- */
export function renderEcosystem(levels) {
  return el('div', { class: 'eco' },
    ...levels.flatMap(([label, note], i) => {
      const row = el('div', { class: `eco__level eco__level--${i + 1}` },
        el('span', { class: 'eco__label' }, label),
        el('span', { class: 'eco__note' }, note));
      return i < levels.length - 1
        ? [row, el('span', { class: 'eco__arrow', 'aria-hidden': 'true' }, '↓')]
        : [row];
    }));
}

/* ---------- recurring CTA block ---------- */
export function renderProductCTA({ title, text, href, label }) {
  return el('section', { class: 'pcta site-reveal' },
    el('div', { class: 'site-wrap' },
      el('h2', {}, title),
      text ? el('p', {}, text) : null,
      el('a', { class: 'btn btn-solid', href }, label)));
}

/* ---------- section wrapper ---------- */
export function section(cls, ...kids) {
  return el('section', { class: `site-section site-reveal ${cls || ''}` }, el('div', { class: 'site-wrap' }, ...kids));
}

export { el };
