/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/console/funnelViz.js  ·  STEP 15 — funnel analytics

   A visual, top-to-bottom funnel with the count at each stage,
   the step-to-step conversion rate, and the share of the top
   of funnel that survives to each stage.
=========================================================== */
import { el } from '../../../../agents/js/core/dom.js';
import { funnel, kpis } from '../../services/funnelAnalytics.js';
import { isDemoLoaded } from '../../services/demoData.js';
import { head, tiles, empty } from './ui.js';

export function render(mount) {
  const f = funnel();
  const k = kpis();
  const top = f.stages[0].count;

  mount.append(head(
    'Funnel analytics',
    isDemoLoaded() ? 'Synthetic demo data — for demonstration only.' : 'Live data from this browser.',
  ));

  if (!top && !k.leads) {
    mount.append(empty('No funnel volume yet. Load demo data or run a lead through funnel.html.'));
    return;
  }

  const chart = el('div', { class: 'fc-funnel' });
  f.stages.forEach((s, i) => {
    const widthPct = top ? Math.max(6, Math.round((s.count / top) * 100)) : 6;
    chart.append(el('div', { class: 'fc-funnel__row' },
      el('div', { class: 'fc-funnel__bar', style: { width: `${widthPct}%` } },
        el('span', { class: 'fc-funnel__count' }, String(s.count))),
      el('div', { class: 'fc-funnel__meta' },
        el('strong', {}, s.label),
        el('span', { class: 'fc-td-sub' },
          i === 0 ? `${s.ofTop}% of visitors` : `${s.fromPrev}% from previous · ${s.ofTop}% of visitors`))));
  });
  mount.append(chart);

  mount.append(tiles([
    ['Overall conversion', `${k.overall}%`, 'visitor → conversion'],
    ['Lead conversion', `${k.visitorToLead}%`, 'visitor → lead'],
    ['Qualification rate', `${k.leadToQualified}%`, 'lead → qualified'],
    ['Booking rate', `${k.qualifiedToBooking}%`, 'qualified → booking'],
    ['Purchase rate', `${k.bookingToConversion}%`, 'booking → conversion'],
    ['Recovery rate', `${k.recoveryRate}%`, 'abandoned → recovered'],
  ]));

  if (f.biggestDropOff.from) {
    mount.append(el('div', { class: 'fc-card fc-card--flag' },
      el('h3', {}, 'Where you\'re losing people'),
      el('p', {}, `The steepest fall is ${f.biggestDropOff.lostPct}% between `,
        el('strong', {}, f.biggestDropOff.from), ' and ', el('strong', {}, f.biggestDropOff.to),
        ` (${f.biggestDropOff.lost} people). Focus optimisation here.`)));
  }
}
