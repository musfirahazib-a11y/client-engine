/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/console/dashboard.js  ·  STEP 14

   Portfolio snapshot: traffic, leads, qualification, bookings,
   revenue, abandoned + recovered, and the biggest funnel
   drop-off. Every figure is derived from stored records.
=========================================================== */
import { el } from '../../../../agents/js/core/dom.js';
import { kpis, funnel } from '../../services/funnelAnalytics.js';
import { isDemoLoaded, loadDemo } from '../../services/demoData.js';
import { head, tiles, bar, usd, empty } from './ui.js';

export function render(mount, { go } = {}) {
  const k = kpis();

  if (k.visitors === 0 && k.leads === 0) {
    mount.append(head('Dashboard', 'No funnel activity yet.'));
    mount.append(empty(
      'Nothing has come through the funnel in this browser yet. Load the synthetic demo dataset to see the console populated, or open the funnel and submit a test lead.',
      'Load demo data', () => { loadDemo(); },
    ));
    return;
  }

  mount.append(head(
    'Dashboard',
    isDemoLoaded() ? 'Showing synthetic demo data — clearly flagged, not real customers.' : 'Live data from real captures in this browser.',
  ));

  const purchase = k.goal === 'purchase';
  const bookLabel = purchase ? 'Add to cart' : k.goal === 'appointment' ? 'Appointments' : 'Viewings';
  const convLabel = purchase ? 'Purchases' : 'Conversions';

  mount.append(tiles([
    ['Visitors', k.visitors],
    ['Engaged', k.engaged],
    ['Leads', k.leads],
    ['Qualified', k.qualified],
    ['Hot leads', k.hot],
    [bookLabel, purchase ? (k.abandonedCarts + k.conversions) : k.bookings],
    [convLabel, k.conversions],
    ['Revenue', usd(k.revenue)],
    [purchase ? 'Abandoned carts' : 'Abandoned', purchase ? k.abandonedCarts : k.abandoned],
    ...(purchase ? [['Abandoned $', usd(k.abandonedCartValue)]] : []),
    ['Recovered', k.recovered],
    ...(purchase ? [['Recovered $', usd(k.recoveredCartRevenue)]] : []),
    ['Avg lead score', `${k.avgScore}/100`],
    ['Overall conv.', `${k.overall}%`],
  ]));

  /* conversion rates between stages */
  const rateBlock = el('div', { class: 'fc-card' },
    el('h3', {}, 'Conversion between stages'),
    bar(k.visitorToLead, `Visitor → Lead · ${k.visitorToLead}%`),
    bar(k.leadToQualified, `Lead → Qualified · ${k.leadToQualified}%`),
    bar(k.qualifiedToBooking, `Qualified → Booking · ${k.qualifiedToBooking}%`),
    bar(k.bookingToConversion, `Booking → Conversion · ${k.bookingToConversion}%`, 'var(--funnel-gold, #C9A66B)'),
    bar(k.recoveryRate, `Abandoned → Recovered · ${k.recoveryRate}%`, '#A9702F'));

  /* traffic by channel */
  const chan = Object.entries(k.byChannel || {}).sort((a, b) => b[1] - a[1]);
  const maxC = chan.length ? chan[0][1] : 1;
  const chanBlock = el('div', { class: 'fc-card' },
    el('h3', {}, 'Traffic by channel'),
    ...(chan.length
      ? chan.map(([c, n]) => bar((n / maxC) * 100, `${c} · ${n}`))
      : [el('p', { class: 'fc-note' }, 'No channel data yet.')]));

  const drop = funnel().biggestDropOff;
  const dropBlock = el('div', { class: 'fc-card fc-card--flag' },
    el('h3', {}, 'Biggest drop-off'),
    drop.from
      ? el('p', {}, `${drop.lostPct}% of people fall out between `, el('strong', {}, drop.from), ' and ', el('strong', {}, drop.to), `. That's the stage to fix first.`)
      : el('p', {}, 'Not enough volume to identify a drop-off yet.'),
    el('button', { type: 'button', class: 'btn btn-outline', onClick: () => go?.('funnel') }, 'Open funnel analytics'));

  mount.append(el('div', { class: 'fc-grid2' }, rateBlock, chanBlock));
  mount.append(dropBlock);
}
