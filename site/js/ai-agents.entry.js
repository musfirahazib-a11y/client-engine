/* ===========================================================
   MusfirahLoom — Website
   site/js/ai-agents.entry.js  ·  bootstraps ai-agents.html
=========================================================== */
import { NAV, AGENTS, ECOSYSTEM } from '../data/site.content.js';
import {
  renderSiteHeader, renderSiteFooter, renderHero, renderAgentCard,
  renderAgentDetail, renderEcosystem, renderProductCTA, section, el,
} from './components.js';

const root = document.getElementById('siteRoot');
root.append(renderSiteHeader(NAV('', 'ai-agents')));

const main = el('main', {});

main.append(renderHero({
  eyebrow: 'MusfirahLoom · AI Agents',
  badge: 'Interactive demos',
  title: 'Your AI workforce.',
  lede:
    'Specialised AI agents that handle sales, customer support, cart recovery and lead qualification — '
    + 'each one owns a single job and runs it end to end. Try any of them live.',
  actions: [
    { label: 'Open the demo hub →', href: 'agents.html' },
    { label: 'See the AI Sales Funnel', href: 'ai-sales-funnel.html', kind: 'outline' },
  ],
}));

main.append(section('',
  el('h2', {}, 'Four agents, built for real business work'),
  el('p', { class: 'site-lede' }, 'Pick one to open its interactive demo, or read on for how each works.'),
  el('div', { class: 'ml-agent-grid' }, ...AGENTS.map(renderAgentCard))));

AGENTS.forEach((a) => main.append(renderAgentDetail(a)));

main.append(section('',
  el('h2', {}, 'More than agents. A connected system.'),
  el('p', { class: 'site-lede' },
    'Individual agents solve tasks. The AI Sales Funnel connects them into one capture-to-conversion '
    + 'machine, and three industry campaigns package the whole thing.'),
  renderEcosystem(ECOSYSTEM.levels),
  el('div', { style: { marginTop: 'var(--sp-5)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' } },
    el('a', { class: 'btn btn-outline', href: 'ai-sales-funnel.html' }, 'Explore the AI Sales Funnel →'),
    el('a', { class: 'btn btn-outline', href: 'campaigns.html' }, 'Explore campaign systems →'))));

main.append(renderProductCTA({
  title: 'Ready to put an agent to work?',
  text: "Tell us which job you want automated and we'll design the right agent — or the whole system.",
  href: 'index.html#contact',
  label: 'Build My AI System →',
}));

root.append(main);
root.append(renderSiteFooter(''));
