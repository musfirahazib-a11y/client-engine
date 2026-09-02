/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/console/recovery.js  ·  STEP 13 — abandoned-lead recovery

   Surfaces leads that gave contact details, started but didn't
   convert, and have gone quiet. For each one it picks the right
   recovery angle from the recorded objection / answers, drafts
   the outreach message, and lets you mark the lead recovered or
   hand it to the existing Abandoned Cart Recovery agent.

   Reuses discountRepo.selectIncentive() from the agents
   platform to keep the incentive logic in one place.
=========================================================== */
import { el, clear } from '../../../../agents/js/core/dom.js';
import { getConfig } from '../../services/funnelConfig.js';
import * as leadRepo from '../../repositories/funnelLeadRepo.js';
import { selectIncentive } from '../../../../agents/js/repositories/discountRepo.js';
import { head, pill, empty, ago, usd } from './ui.js';

export function render(mount, { go } = {}) {
  const cfg = getConfig();
  const hrs = cfg.recovery.abandonAfterHours || 2;
  const rows = leadRepo.abandoned(hrs);
  const recovered = leadRepo.list().filter((l) => l.recoveredAt);
  const isCart = cfg.meta.conversionGoal === 'purchase';

  mount.append(head(
    isCart ? 'Abandoned-cart recovery' : 'Abandoned-lead recovery',
    `${rows.length} ${isCart ? 'cart' : 'lead'}${rows.length === 1 ? '' : 's'} quiet for ${hrs}h+ with no ${isCart ? 'checkout' : 'booking'} · ${recovered.length} recovered.`,
  ));

  if (!rows.length) {
    mount.append(empty('No abandoned leads right now — everything is either progressing, booked or recovered.'));
    if (recovered.length) mount.append(recoveredList(recovered));
    return;
  }

  rows.forEach((lead) => mount.append(card(lead, cfg, () => render(clearAnd(mount), { go }))));
  if (recovered.length) mount.append(recoveredList(recovered));
}

function card(lead, cfg, refresh) {
  const angle = pickAngle(lead, cfg);
  const message = draft(lead, cfg, angle);

  const wrap = el('article', { class: 'fc-recovery' },
    el('div', { class: 'fc-recovery__head' },
      el('div', {},
        el('strong', {}, lead.name), ' ', pill(lead.status, 'warm'),
        el('span', { class: 'fc-td-sub' }, ` · ${lead.id} · last seen ${ago(lead.lastActivityAt)} · from ${lead.source}`)),
      lead.orderValue ? el('span', {}, usd(lead.orderValue)) : null),
    el('div', { class: 'fc-kv' },
      row('Interest', lead.interest || '—'),
      lead.cartValue ? row('Cart value', usd(lead.cartValue)) : null,
      lead.abandonReason ? row('Recorded reason', lead.abandonReason) : null,
      row('Score', lead.score ? `${lead.score}/100 · ${lead.category || '—'}` : 'not scored'),
      row('Recovery angle', angle.label)),
    el('blockquote', { class: 'ml-quote' }, message),
    el('div', { class: 'fc-drawer__actions' },
      el('button', { type: 'button', class: 'btn btn-solid', onClick: () => { leadRepo.markRecovered(lead.id); refresh(); } }, 'Mark recovered'),
      el('button', { type: 'button', class: 'btn btn-outline', onClick: () => { leadRepo.setStatus(lead.id, 'Lost'); refresh(); } }, 'Close as lost'),
      el('a', {
        class: 'btn btn-outline',
        href: `agent.html?id=${cfg.integrations.recoveryAgentId}`, target: '_blank', rel: 'noopener',
      }, 'Open Recovery agent')));

  return wrap;
}

/* map the recorded reason / answers to a recovery angle from config */
function pickAngle(lead, cfg) {
  const angles = cfg.recovery.incentives || {};
  const a = lead.answers || {};
  const reason = String(lead.abandonReason || '').toLowerCase();

  const order = [];
  if (/ship/.test(reason)) order.push('shipping');
  if (/price|expensive|budget/.test(reason)) order.push('price');
  if (/timing|time|distract|later/.test(reason)) order.push('timing');
  if (/compar|unsure|trust|not sure/.test(reason)) order.push('trust');
  if (/finance|mortgage/.test(reason) || /not yet|not approved/i.test(a.finance || '')) order.push('finance');
  if (/research|explor|brows/i.test(`${Object.values(a).join(' ')}`)) order.push('trust');
  order.push('no-objection');

  for (const key of order) {
    if (angles[key]) return { key, label: angles[key] };
  }
  // last resort — the agents platform's own incentive picker
  const inc = selectIncentive({ abandonmentReason: reason || 'needs more time', total: lead.cartValue || 0, items: [] });
  return { key: 'no-objection', label: inc.reason };
}

function draft(lead, cfg, angle) {
  const first = (lead.name || 'there').split(' ')[0];
  const A = cfg.ai.assistantName;
  const B = cfg.business.name;
  const isCart = cfg.meta.conversionGoal === 'purchase';
  const item = lead.interest || (isCart ? 'your cart' : 'your shortlist');
  const generic = isCart
    ? `Hi ${first}, ${A} from ${B}. ${cap(angle.label)} Your cart (${item}) is saved with your offer applied — one tap and it's yours.`
    : `Hi ${first}, ${A} from ${B}. ${cap(angle.label)} ${item} is ready whenever you are — one reply and I'll ${cfg.meta.conversionGoal === 'appointment' ? 'book you in' : 'get you a viewing'}.`;
  return generic;
}

function cap(s) { return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }

function recoveredList(list) {
  return el('div', { class: 'fc-card' },
    el('h3', {}, 'Recovered'),
    el('ul', { class: 'fc-simplelist' },
      ...list.map((l) => el('li', {}, `${l.name} (${l.id}) — re-engaged ${ago(l.recoveredAt)}`))));
}

function row(k, v) {
  return el('div', { class: 'fc-kv__row' }, el('span', { class: 'fc-kv__k' }, k), el('span', { class: 'fc-kv__v' }, String(v)));
}
function clearAnd(node) { clear(node); return node; }
