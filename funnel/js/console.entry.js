/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   console.entry.js  ·  bootstraps funnel-admin.html

   The business-facing console: dashboard, CRM lead table,
   funnel analytics, follow-up board, abandoned-lead recovery,
   and the live configuration panel. Reads the same repos the
   public funnel writes to, so a lead captured on funnel.html
   shows up here immediately (same browser).
=========================================================== */
import { getConfig } from './services/funnelConfig.js';
import { activeCampaignId } from './services/scope.js';
import { CAMPAIGNS } from './config/campaigns/index.js';
import { bus } from '../../agents/js/core/events.js';
import { el, clear } from '../../agents/js/core/dom.js';
import { isDemoLoaded, loadDemo, clearDemo, resetAll } from './services/demoData.js';
import * as dashboard from './components/console/dashboard.js';
import * as leadsView from './components/console/leads.js';
import * as funnelViz from './components/console/funnelViz.js';
import * as followupView from './components/console/followup.js';
import * as recoveryView from './components/console/recovery.js';
import * as configView from './components/console/config.js';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▤', view: dashboard },
  { id: 'leads', label: 'Leads (CRM)', icon: '☷', view: leadsView },
  { id: 'funnel', label: 'Funnel analytics', icon: '⧗', view: funnelViz },
  { id: 'followup', label: 'Follow-up', icon: '↻', view: followupView },
  { id: 'recovery', label: 'Recovery', icon: '⤴', view: recoveryView },
  { id: 'config', label: 'Configuration', icon: '⚙', view: configView },
];

const app = document.getElementById('consoleRoot');
const CAMPAIGN = activeCampaignId();
const qp = (href) => `${href}${href.includes('?') ? '&' : '?'}campaign=${CAMPAIGN}`;
document.body.dataset.campaign = CAMPAIGN;
if (getConfig().branding.primary) {
  document.documentElement.style.setProperty('--funnel', getConfig().branding.primary);
  document.documentElement.style.setProperty('--funnel-deep', getConfig().branding.primary);
  document.documentElement.style.setProperty('--funnel-gold', getConfig().branding.secondary);
}
let active = (location.hash || '#dashboard').slice(1);
if (!TABS.find((t) => t.id === active)) active = 'dashboard';

/* ---------- shell ---------- */
const nav = el('nav', { class: 'fc-nav' });
const panel = el('main', { class: 'fc-panel', id: 'fnPanel' });
const demoBtn = el('button', { type: 'button', class: 'fc-demobtn', onClick: toggleDemo });
const resetBtn = el('button', {
  type: 'button', class: 'fc-resetbtn',
  onClick: () => { if (confirm('Wipe ALL funnel data in this browser (demo + real captures)?')) { resetAll(); rerender(); } },
}, 'Reset all data');

const campaignSel = el('select', {
  class: 'fc-select fc-campaignsel',
  onChange: (e) => { window.location.href = `funnel-admin.html?campaign=${e.target.value}${location.hash}`; },
},
  ...CAMPAIGNS.map((c) => el('option', { value: c.id, selected: c.id === CAMPAIGN }, c.name)));

const header = el('header', { class: 'fc-head' },
  el('div', { class: 'fc-brand' },
    el('span', { class: 'fc-brand__mark' }, '⟠'),
    el('div', {},
      el('strong', {}, 'AI Sales Funnel'),
      el('span', { class: 'fc-brand__sub', 'data-biz-name': '' }, getConfig().business.name))),
  el('div', { class: 'fc-head__right' },
    el('span', { class: 'ml-badge' }, 'Interactive Demo'),
    campaignSel,
    demoBtn, resetBtn,
    el('a', { class: 'fc-head__link', href: `campaigns.html#performance` }, 'All campaigns'),
    el('a', { class: 'fc-head__link', href: qp('funnel.html'), target: '_blank', rel: 'noopener' }, 'Open funnel ↗')));

app.append(header, el('div', { class: 'fc-body' }, nav, panel));

buildNav();
syncDemoBtn();
route();

/* re-render current tab when underlying data changes */
['funnel:leads', 'funnel:visitors', 'funnel:config', 'funnel:followup'].forEach((evt) => {
  bus.on(evt, () => { syncDemoBtn(); route(); });
});
window.addEventListener('hashchange', () => {
  const next = location.hash.slice(1);
  if (TABS.find((t) => t.id === next)) { active = next; buildNav(); route(); }
});

function buildNav() {
  clear(nav);
  TABS.forEach((t) => {
    nav.append(el('a', {
      class: `fc-nav__item${t.id === active ? ' is-active' : ''}`,
      href: `#${t.id}`,
    }, el('span', { class: 'fc-nav__ic', 'aria-hidden': 'true' }, t.icon), t.label));
  });
}

function route() {
  const tab = TABS.find((t) => t.id === active) || TABS[0];
  clear(panel);
  try {
    tab.view.render(panel, { go: (id) => { location.hash = `#${id}`; } });
  } catch (err) {
    console.error(`[console] "${tab.id}" view failed`, err);
    panel.append(el('p', { class: 'fc-empty' }, 'This view hit an error — see the console.'));
  }
}

function rerender() { syncDemoBtn(); buildNav(); route(); }

function toggleDemo() {
  if (isDemoLoaded()) clearDemo(); else loadDemo();
  rerender();
}
function syncDemoBtn() {
  const on = isDemoLoaded();
  demoBtn.textContent = on ? 'Demo data: ON — clear' : 'Load demo data';
  demoBtn.classList.toggle('is-on', on);
  document.querySelectorAll('[data-biz-name]').forEach((n) => { n.textContent = getConfig().business.name; });
}
