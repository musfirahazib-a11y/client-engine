/* ===========================================================
   MusfirahLoom — Website
   site/js/ai-sales-funnel.entry.js  ·  bootstraps ai-sales-funnel.html
=========================================================== */
import { NAV, FUNNEL } from '../data/site.content.js';
import {
  renderSiteHeader, renderSiteFooter, renderHero, renderWorkflow,
  renderProductCTA, renderSkipLink, section, el,
} from './components.js';
import { initReveal } from './reveal.js';

const root = document.getElementById('siteRoot');
root.append(renderSkipLink());
root.append(renderSiteHeader(NAV('', 'ai-sales-funnel')));

const main = el('main', { id: 'main', tabindex: '-1', style: { '--card-accent': 'var(--agent-funnel)' } });

main.append(renderHero({
  eyebrow: 'MusfirahLoom · Flagship system',
  badge: FUNNEL.badge,
  title: FUNNEL.headline,
  lede: FUNNEL.lede,
  actions: [
    { label: 'Try the live demo →', href: FUNNEL.demoHref },
    { label: 'Open the business console', href: FUNNEL.consoleHref, kind: 'outline' },
  ],
}));

main.append(section('',
  el('h2', {}, 'The problem'),
  el('p', { class: 'site-lede' }, FUNNEL.problem)));

main.append(section('',
  el('h2', {}, 'The solution'),
  el('p', { class: 'site-lede' }, FUNNEL.solution)));

main.append(section('',
  el('h2', {}, 'Funnel architecture'),
  el('p', { class: 'site-lede' }, 'Every stage is one system — no separate tools, no manual hand-offs.'),
  renderWorkflow(FUNNEL.workflow, { title: 'Traffic → conversion' })));

main.append(section('',
  el('h2', {}, 'What each stage does'),
  el('div', { class: 'stage-grid' },
    ...FUNNEL.stages.map(([h, p]) => el('article', { class: 'stage' }, el('h3', {}, h), el('p', {}, p))))));

main.append(section('',
  el('h2', {}, 'One system, three industries'),
  el('p', { class: 'site-lede' },
    'The same funnel, configured for Salon & Spa, Real Estate and E-commerce — each a live interactive demo '
    + 'with its own CRM and analytics console.'),
  el('a', { class: 'btn btn-outline', href: FUNNEL.campaignsHref }, 'Explore the campaign systems →')));

main.append(renderProductCTA({
  title: 'Turn your traffic into customers.',
  text: "We'll configure the AI Sales Funnel for your business and wire it into your tools.",
  href: 'start.html',
  label: 'Start a project →',
}));

root.append(main);
root.append(renderSiteFooter(''));
initReveal(root);
