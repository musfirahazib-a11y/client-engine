/* ===========================================================
   MusfirahLoom — Website
   site/js/campaign-detail.entry.js
   bootstraps campaigns/<slug>.html  (reads <body data-campaign>)
=========================================================== */
import { NAV, getCampaign } from '../data/site.content.js';
import {
  renderSiteHeader, renderSiteFooter, renderHero, renderWorkflow,
  renderProductCTA, renderSkipLink, section, el,
} from './components.js';
import { initReveal } from './reveal.js';

const base = '../'; // detail pages live in campaigns/
const root = document.getElementById('siteRoot');
const c = getCampaign(document.body.dataset.campaign || '');

root.append(renderSkipLink());

if (!c) {
  root.append(renderSiteHeader(NAV(base, 'campaigns')));
  root.append(el('main', { id: 'main', tabindex: '-1' }, el('section', { class: 'site-hero' }, el('div', { class: 'site-wrap' },
    el('h1', { class: 'site-hero__title' }, 'Campaign not found'),
    el('p', { class: 'site-hero__lede' }, 'That campaign does not exist.'),
    el('a', { class: 'btn btn-solid', href: `${base}campaigns.html` }, 'All AI Campaigns →')))));
  root.append(renderSiteFooter(base));
} else {
  document.title = `${c.name} — MusfirahLoom`;
  root.append(renderSiteHeader(NAV(base, 'campaigns')));

  const main = el('main', { id: 'main', tabindex: '-1', style: { '--card-accent': `var(${c.accent})` } });

  main.append(el('div', { class: 'site-wrap' },
    el('a', { class: 'site-back', href: `${base}campaigns.html` }, '← All AI Campaigns')));

  main.append(renderHero({
    eyebrow: `AI Campaign System · ${c.short}`,
    badge: 'Interactive demo',
    title: `${c.name}.`,
    lede: c.tagline,
    actions: [
      { label: 'Launch the demo →', href: `${base}${c.demoHref}` },
      { label: 'Open the console', href: `${base}${c.consoleHref}`, kind: 'outline' },
    ],
  }));

  main.append(section('',
    el('h2', {}, 'The opportunity'),
    el('div', { class: 'cdt__two' },
      el('div', {}, el('h3', {}, 'The problem'), el('p', {}, c.problem)),
      el('div', {}, el('h3', {}, 'The AI solution'), el('p', {}, c.solution)))));

  main.append(section('',
    el('h2', {}, 'What it does'),
    el('div', { class: 'cdt__chips' }, ...c.objectives.map((o) => el('span', { class: 'cdt__chip' }, o))),
    el('h3', { style: { marginTop: 'var(--sp-5)', fontStyle: 'italic' } }, 'Agents + systems used'),
    el('ul', { class: 'cdt__agents' },
      ...c.agents.map(([n, r]) => el('li', {}, el('strong', {}, n), el('span', {}, r))))));

  main.append(section('',
    el('h2', {}, 'The customer journey'),
    el('div', { class: 'cdt__two' },
      el('div', {}, renderWorkflow(c.journey, { title: 'Step by step' })),
      el('div', {},
        el('h3', {}, 'Powered by the AI Sales Funnel'),
        el('p', {},
          'This campaign runs on the flagship funnel — landing, capture, qualification, scoring, '
          + 'recommendation, offer, booking / checkout, follow-up and recovery — with a CRM and analytics '
          + 'console behind it.'),
        el('a', { class: 'btn btn-outline', href: `${base}ai-sales-funnel.html` }, 'See the funnel →')))));

  main.append(renderProductCTA({
    title: `Want this for your ${c.short.toLowerCase()} business?`,
    text: "We'll configure the agents and funnel for your services, your data and your tools.",
    href: `${base}start.html`,
    label: 'Start a project →',
  }));

  root.append(main);
  root.append(renderSiteFooter(base));
  initReveal(root);
}
