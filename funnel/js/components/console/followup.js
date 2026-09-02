/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/console/followup.js  ·  STEP 12 — follow-up board

   Shows the configured sequence, a live per-lead schedule
   (scheduled / due / sent / stopped), and lets you "run" the
   currently-due steps (simulated send). Stop conditions come
   from config.followup.stopOn.
=========================================================== */
import { el } from '../../../../agents/js/core/dom.js';
import { getConfig } from '../../services/funnelConfig.js';
import { overview, runAllDue } from '../../services/followupEngine.js';
import { head, pill, empty, ago } from './ui.js';

export function render(mount) {
  const cfg = getConfig().followup;
  const ov = overview();

  mount.append(head(
    'Automated follow-up',
    cfg.enabled ? `${ov.active} active sequence${ov.active === 1 ? '' : 's'}.` : 'Follow-up is currently disabled in Configuration.',
    el('button', {
      type: 'button', class: 'btn btn-solid',
      onClick: () => { const n = runAllDue(); alert(n ? `${n} follow-up message(s) marked sent (demo).` : 'No steps are due right now.'); },
    }, 'Run due steps'),
  ));

  /* the sequence itself */
  mount.append(el('div', { class: 'fc-card' },
    el('h3', {}, 'Sequence'),
    el('ol', { class: 'fc-seq' },
      ...cfg.sequence.map((s) => el('li', { class: 'fc-seq__step' },
        el('span', { class: 'fc-seq__delay' }, delayLabel(s.delayMinutes)),
        el('div', {},
          el('span', { class: 'fc-td-sub' }, `${s.channel} · trigger: ${s.trigger}`),
          el('p', {}, s.message)))))),
  );

  mount.append(el('p', { class: 'fc-note' },
    `Stops automatically on: ${cfg.stopOn.join(', ')}.`));

  /* per-lead status */
  const counts = ov.counts;
  mount.append(el('div', { class: 'fc-fu-counts' },
    pill(`${counts.scheduled || 0} scheduled`, 'info'),
    pill(`${counts.due || 0} due`, 'warm'),
    pill(`${counts.sent || 0} sent`, 'good'),
    pill(`${counts.stopped || 0} stopped`, 'muted'),
    pill(`${counts.skipped || 0} skipped`, 'muted')));

  if (!ov.rows.length) {
    mount.append(empty('No leads to follow up yet.'));
    return;
  }

  const table = el('table', { class: 'fc-table' });
  table.append(el('thead', {}, el('tr', {}, ...['Lead', 'State', 'Next step due', 'Progress'].map((h) => el('th', {}, h)))));
  const tb = el('tbody', {});
  ov.rows.forEach((r) => {
    const next = r.steps.find((s) => s.status === 'due' || s.status === 'scheduled');
    const sent = r.steps.filter((s) => s.status === 'sent').length;
    tb.append(el('tr', {},
      el('td', {}, r.leadId),
      el('td', {}, r.stoppedBy ? pill(`stopped · ${r.stoppedBy}`, 'muted') : pill(r.enabled ? 'active' : 'disabled', r.enabled ? 'info' : 'muted')),
      el('td', {}, next ? `${next.channel} · ${ago(next.dueAt).replace(' ago', '')} ${new Date(next.dueAt) > new Date() ? 'from now' : 'ago'}` : '—'),
      el('td', {}, `${sent}/${r.steps.length} sent`)));
  });
  table.append(tb);
  mount.append(el('div', { class: 'fc-tablewrap' }, table));
}

function delayLabel(min) {
  if (!min) return 'immediately';
  if (min < 60) return `+${min}m`;
  if (min < 1440) return `+${Math.round(min / 60)}h`;
  return `+${Math.round(min / 1440)}d`;
}
