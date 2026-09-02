/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/console/leads.js  ·  STEP 14 — CRM / lead dashboard

   Filterable, searchable lead table + a detail drawer with the
   full activity timeline, the AI conversation transcript, the
   qualification breakdown and per-lead actions — including the
   handoff into the existing Lead + Booking agent.
=========================================================== */
import { el, clear } from '../../../../agents/js/core/dom.js';
import * as leadRepo from '../../repositories/funnelLeadRepo.js';
import { getConfig } from '../../services/funnelConfig.js';
import { byId as listingById } from '../../repositories/recommendationRepo.js';
import { scheduleFor } from '../../services/followupEngine.js';
import {
  head, pill, empty, usd, ago, STATUS_TONE, CAT_TONE,
} from './ui.js';

const state = { q: '', status: '', category: '', source: '', openId: null };

export function render(mount, { go } = {}) {
  const all = leadRepo.list();
  mount.append(head('Leads (CRM)', `${all.length} lead${all.length === 1 ? '' : 's'} in the pipeline.`));

  if (!all.length) {
    mount.append(empty('No leads captured yet. Submit one on the funnel, or load demo data from the header.'));
    return;
  }

  /* toolbar */
  const search = el('input', { class: 'fc-input', type: 'search', placeholder: 'Search name, email, interest…', value: state.q });
  search.addEventListener('input', () => { state.q = search.value; paint(); });

  const statusSel = select(['', ...leadRepo.STATUSES], state.status, 'All statuses', (v) => { state.status = v; paint(); });
  const catSel = select(['', 'HOT', 'WARM', 'COLD', 'UNQUALIFIED'], state.category, 'All scores', (v) => { state.category = v; paint(); });
  const sources = [...new Set(all.map((l) => l.source))];
  const srcSel = select(['', ...sources], state.source, 'All sources', (v) => { state.source = v; paint(); });

  mount.append(el('div', { class: 'fc-toolbar' }, search, statusSel, catSel, srcSel));

  const tableWrap = el('div', { class: 'fc-tablewrap' });
  const drawer = el('aside', { class: 'fc-drawer', hidden: true });
  mount.append(el('div', { class: 'fc-leadsplit' }, tableWrap, drawer));

  function paint() {
    const rows = leadRepo.list({
      q: state.q || null,
      status: state.status || null,
      category: state.category || null,
      source: state.source || null,
    });
    clear(tableWrap);
    if (!rows.length) { tableWrap.append(empty('No leads match those filters.')); return; }
    tableWrap.append(buildTable(rows, (id) => { state.openId = id; renderDrawer(); }));
    renderDrawer();
  }

  function renderDrawer() {
    clear(drawer);
    if (!state.openId) { drawer.hidden = true; return; }
    const lead = leadRepo.get(state.openId);
    if (!lead) { drawer.hidden = true; return; }
    drawer.hidden = false;
    drawer.append(buildDrawer(lead, { go, refresh: paint }));
  }

  paint();
}

/* ---------- table ---------- */
function buildTable(rows, onOpen) {
  const cfg = getConfig();
  const table = el('table', { class: 'fc-table' });
  table.append(el('thead', {}, el('tr', {},
    ...['Lead', 'Contact', 'Source', 'Score', 'Status', 'Interest', 'Created', 'Last activity', 'Next action'].map((h) => el('th', {}, h)))));
  const tb = el('tbody', {});
  rows.forEach((l) => {
    const cat = l.category ? (cfg.qualification.categories[l.category] || {}) : {};
    const tr = el('tr', { class: 'fc-table__row', tabindex: '0', onClick: () => onOpen(l.id) });
    tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') onOpen(l.id); });
    tr.append(
      el('td', {}, el('strong', { class: 'fc-td-block' }, l.name), el('span', { class: 'fc-td-sub fc-td-block' }, l.id)),
      el('td', {}, el('span', { class: 'fc-td-sub fc-td-block' }, l.email || '—'), el('span', { class: 'fc-td-sub fc-td-block' }, l.phone || '')),
      el('td', {}, l.source),
      el('td', {}, l.score ? el('span', { class: 'fc-score' }, `${l.score}`) : '—', l.category ? pill(l.category, CAT_TONE[l.category]) : null),
      el('td', {}, pill(l.status, STATUS_TONE[l.status] || 'neutral')),
      el('td', {}, el('span', { class: 'fc-td-clamp' }, l.interest || '—')),
      el('td', {}, ago(l.createdAt)),
      el('td', {}, ago(l.lastActivityAt)),
      el('td', {}, el('span', { class: 'fc-td-sub fc-td-clamp' }, cat.action || recommendedAction(l))),
    );
    tb.append(tr);
  });
  table.append(tb);
  return table;
}

function recommendedAction(l) {
  if (l.status === 'Converted') return 'Move to onboarding / support';
  if (l.bookingRef) return 'Prep for the viewing';
  if (l.status === 'New') return 'First contact within the hour';
  if (l.status === 'Lost') return 'Closed';
  return 'Follow up';
}

/* ---------- drawer ---------- */
function buildDrawer(lead, { go, refresh }) {
  const cfg = getConfig();
  const wrap = el('div', { class: 'fc-drawer__inner' });

  wrap.append(el('div', { class: 'fc-drawer__head' },
    el('div', {},
      el('h3', {}, lead.name),
      el('span', { class: 'fc-td-sub' }, `${lead.id} · from ${lead.source}${lead.campaign ? ` / ${lead.campaign}` : ''}`)),
    el('button', { type: 'button', class: 'fc-drawer__x', onClick: () => { state.openId = null; refresh(); } }, '✕')));

  wrap.append(el('div', { class: 'fc-kv' },
    kv('Email', lead.email || '—'),
    kv('Phone / WhatsApp', lead.phone || '—'),
    kv('Interest', lead.interest || '—'),
    kv('Score', lead.score ? `${lead.score}/100 · ${lead.category || '—'}` : 'Not scored'),
    kv('Status', lead.status),
    kv('Booking', lead.bookingRef || '—'),
    kv('Deal value', lead.orderValue ? usd(lead.orderValue) : '—'),
    kv('Landing page', lead.landingPage || '—')));

  /* qualification answers */
  if (Object.keys(lead.answers || {}).length) {
    const qs = cfg.qualification.questions;
    wrap.append(el('div', { class: 'fc-drawer__block' },
      el('h4', {}, 'Qualification answers'),
      el('div', { class: 'fc-kv' },
        ...qs.filter((q) => lead.answers[q.key]).map((q) => kv(q.key, lead.answers[q.key])))));
  }

  /* recommendations shown */
  if ((lead.recommendationIds || []).length) {
    wrap.append(el('div', { class: 'fc-drawer__block' },
      el('h4', {}, 'Homes recommended'),
      el('ul', { class: 'fc-simplelist' },
        ...lead.recommendationIds.map((id) => {
          const L = listingById(id);
          return el('li', {}, L ? `${L.title} — ${L.priceLabel}` : id);
        }))));
  }

  /* actions */
  const statusSel = select(leadRepo.STATUSES, lead.status, null, (v) => { leadRepo.setStatus(lead.id, v); refresh(); });
  const actions = el('div', { class: 'fc-drawer__actions' },
    el('label', { class: 'fc-actionlabel' }, 'Status', statusSel),
    el('button', {
      type: 'button', class: 'btn btn-solid',
      onClick: () => {
        const agentLeadId = leadRepo.sendToBookingAgent(lead.id);
        if (agentLeadId) {
          window.open(`agent.html?id=${cfg.integrations.bookingAgentId}`, '_blank', 'noopener');
          alert(`Sent to the Booking agent as ${agentLeadId}. Opening that agent in a new tab.`);
        }
        refresh();
      },
    }, 'Send to Booking agent →'),
    el('button', {
      type: 'button', class: 'btn btn-outline',
      onClick: () => {
        const v = prompt('Deal / sale value for this conversion (numbers only):', String(lead.orderValue || ''));
        if (v != null) { leadRepo.markConverted(lead.id, Number(v.replace(/[^0-9.]/g, '')) || 0); refresh(); }
      },
    }, 'Mark converted'),
    el('button', { type: 'button', class: 'btn btn-outline', onClick: () => go?.('recovery') }, 'Recovery queue'),
    el('a', { class: 'btn btn-outline', href: `agent.html?id=${cfg.integrations.supportAgentId}`, target: '_blank', rel: 'noopener' }, 'Open Support agent'));
  wrap.append(el('div', { class: 'fc-drawer__block' }, el('h4', {}, 'Actions'), actions));

  /* follow-up schedule */
  const sched = scheduleFor(lead);
  wrap.append(el('div', { class: 'fc-drawer__block' },
    el('h4', {}, `Follow-up ${sched.stoppedBy ? `· stopped (${sched.stoppedBy})` : sched.enabled ? '· active' : '· disabled'}`),
    el('ul', { class: 'fc-timeline' },
      ...sched.steps.map((s) => el('li', { class: `fc-timeline__item fc-fu--${s.status}` },
        el('span', { class: 'fc-timeline__dot' }),
        el('div', {},
          el('span', { class: 'fc-td-sub' }, `${s.channel} · ${s.status} · ${new Date(s.dueAt).toLocaleString()}`),
          el('p', {}, s.message)))))));

  /* activity timeline */
  wrap.append(el('div', { class: 'fc-drawer__block' },
    el('h4', {}, 'Activity'),
    el('ul', { class: 'fc-timeline' },
      ...[...(lead.activity || [])].reverse().map((a) => el('li', { class: 'fc-timeline__item' },
        el('span', { class: 'fc-timeline__dot' }),
        el('div', {}, el('span', { class: 'fc-td-sub' }, `${a.type} · ${ago(a.ts)}`), el('p', {}, a.note)))))));

  /* conversation transcript */
  if ((lead.conversation || []).length) {
    wrap.append(el('div', { class: 'fc-drawer__block' },
      el('h4', {}, 'AI conversation'),
      el('div', { class: 'fc-transcript' },
        ...lead.conversation.map((m) => el('div', { class: `fc-tr fc-tr--${m.role}` },
          el('span', { class: 'fc-tr__who' }, m.role === 'user' ? lead.name.split(' ')[0] : 'Assistant'),
          el('p', {}, m.text))))));
  }

  return wrap;
}

/* ---------- small helpers ---------- */
function kv(k, v) {
  return el('div', { class: 'fc-kv__row' },
    el('span', { class: 'fc-kv__k' }, k),
    el('span', { class: 'fc-kv__v' }, String(v)));
}

function select(values, current, placeholder, onChange) {
  const s = el('select', { class: 'fc-select' });
  values.forEach((v) => {
    const label = v === '' ? (placeholder || 'Any') : v;
    s.append(el('option', { value: v, selected: v === current }, label));
  });
  s.addEventListener('change', () => onChange(s.value));
  return s;
}
