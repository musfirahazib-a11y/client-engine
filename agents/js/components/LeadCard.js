/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/LeadCard.js

   Cards for the Lead Qualification + Appointment Booking agent.
   Reuses the .ml-order* shell so it reads as a sibling of
   OrderCard / RecoveryCard. Every button calls onAction(phrase),
   fed back into the chat by agent.entry.
=========================================================== */
import { el, money } from '../core/dom.js';
import { fmtTime, fmtDate } from '../repositories/slotRepo.js';

const TEMP = {
  Hot: { accent: '#6E2C3B', glyph: '🔥' },
  Warm: { accent: '#A9702F', glyph: '☀' },
  Cold: { accent: '#4A6157', glyph: '❄' },
  Unqualified: { accent: '#6B5A5F', glyph: '·' },
};

function row(dt, dd) {
  return el('div', { class: 'ml-order__row' },
    el('span', { class: 'ml-order__dt' }, dt),
    el('span', { class: 'ml-order__dd' }, dd));
}

function thumb(glyph, accent) {
  return el('div', {
    class: 'ml-order__thumb',
    'aria-hidden': 'true',
    style: { background: `linear-gradient(150deg, ${accent} 0%, ${accent}bb 100%)` },
  }, glyph);
}

function budgetLabel(lead) {
  if (typeof lead.budget === 'number') return money(lead.budget);
  if (typeof lead.budget === 'string') return lead.budget;
  return 'not stated';
}

/** renderLeadCard(lead, { onAction, compact }) */
export function renderLeadCard(lead, opts = {}) {
  const { onAction, compact = false } = opts;
  if (!lead) return el('p', { class: 'ml-cmp__empty' }, 'No lead to show.');

  const t = TEMP[lead.qualificationStatus] || TEMP.Unqualified;
  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Name', `${lead.name}${lead.business ? ` · ${lead.business}` : ''}`));
  grid.append(row('Service', lead.service || '—'));
  grid.append(row('Budget', budgetLabel(lead)));
  grid.append(row('Timeline', lead.timeline || 'not stated'));
  grid.append(row('Source', lead.source || '—'));
  grid.append(row('Status', lead.appointmentStatus === 'booked' ? 'Appointment booked'
    : lead.appointmentStatus === 'requested' ? 'Appointment requested'
      : lead.qualificationStatus));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    const btn = (label, phrase) => actions.append(el('button', {
      type: 'button', class: 'btn btn-outline', onClick: () => onAction(phrase),
    }, label));
    btn('View lead', `show ${lead.leadId}`);
    btn('Qualify', `qualify ${lead.leadId}`);
    btn('Book', `book an appointment for ${lead.leadId}`);
    btn('Handoff', `hand ${lead.leadId} to a human`);
  }

  return el('article', {
    class: `ml-order ml-order--lead${compact ? ' ml-order--compact' : ''}`,
    dataset: { leadId: lead.leadId },
  },
    thumb(t.glyph, t.accent),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' },
        el('h4', { class: 'ml-order__id' }, lead.leadId),
        el('span', { class: 'ml-order__status', style: { color: t.accent, borderColor: t.accent } },
          `${lead.qualificationStatus} · ${lead.score}/100`),
      ),
      grid,
      actions.childElementCount ? actions : null,
    ),
  );
}

/** renderLeadList([lead, ...], { onAction }) */
export function renderLeadList(leads, opts = {}) {
  const wrap = el('div', { class: 'ml-lead-list' });
  (leads || []).forEach((l) => wrap.append(renderLeadCard(l, { ...opts, compact: true })));
  return wrap;
}

/**
 * renderScoreCard(lead, scoring, { onAction })
 * scoring = leadRepo.calculateScore(lead)
 */
export function renderScoreCard(lead, scoring, opts = {}) {
  const { onAction } = opts;
  if (!scoring) return el('p', { class: 'ml-cmp__empty' }, 'No score to show.');

  const t = TEMP[scoring.temperature] || TEMP.Unqualified;
  const b = scoring.breakdown;
  const mx = scoring.max;

  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Budget', `${b.budget} / ${mx.budget}`));
  grid.append(row('Authority', `${b.authority} / ${mx.authority}`));
  grid.append(row('Need', `${b.need} / ${mx.need}`));
  grid.append(row('Timeline', `${b.timeline} / ${mx.timeline}`));
  grid.append(row('Fit', `${b.fit} / ${mx.fit}`));
  grid.append(row('Why', scoring.reason));
  grid.append(row('Next', scoring.nextAction));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    actions.append(el('button', {
      type: 'button', class: 'btn btn-solid',
      onClick: () => onAction(lead && lead.leadId ? `book an appointment for ${lead.leadId}` : 'show available appointments'),
    }, 'Book appointment'));
    actions.append(el('button', {
      type: 'button', class: 'btn btn-outline',
      onClick: () => onAction(lead && lead.leadId ? `hand ${lead.leadId} to a human` : 'talk to a human'),
    }, 'Handoff'));
  }

  return el('article', { class: 'ml-order ml-order--score' },
    thumb(t.glyph, t.accent),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' },
        el('h4', { class: 'ml-order__id' }, lead && lead.leadId ? lead.leadId : 'Lead score'),
        el('span', { class: 'ml-order__status', style: { color: t.accent, borderColor: t.accent } },
          `${scoring.temperature} · ${scoring.score}/100`),
      ),
      grid,
      actions.childElementCount ? actions : null,
    ),
  );
}

/** renderSlotList([slot, ...], { onAction }) */
export function renderSlotList(slots, opts = {}) {
  const { onAction } = opts;
  const list = slots || [];
  if (!list.length) return el('p', { class: 'ml-cmp__empty' }, 'No open slots match that.');

  const wrap = el('div', { class: 'ml-lead-list' });
  list.forEach((s) => {
    const grid = el('div', { class: 'ml-order__grid' });
    grid.append(row('When', `${fmtDate(s.date)} · ${fmtTime(s.startTime)}–${fmtTime(s.endTime)}`));
    grid.append(row('Service', s.service));
    grid.append(row('With', s.staffMember));
    grid.append(row('Zone', s.timezone));

    const actions = el('div', { class: 'ml-order__actions' });
    if (typeof onAction === 'function') {
      actions.append(el('button', {
        type: 'button', class: 'btn btn-outline', onClick: () => onAction(`book ${s.slotId}`),
      }, 'Book this'));
    }

    wrap.append(el('article', { class: 'ml-order ml-order--slot ml-order--compact', dataset: { slotId: s.slotId } },
      thumb('❖', '#4C3A5E'),
      el('div', { class: 'ml-order__body' },
        el('div', { class: 'ml-order__head' },
          el('h4', { class: 'ml-order__id' }, s.slotId),
          el('span', { class: 'ml-order__status', style: { color: '#4C3A5E', borderColor: '#4C3A5E' } }, 'Open'),
        ),
        grid,
        actions.childElementCount ? actions : null,
      )));
  });
  return wrap;
}

/** renderBookingCard(booking, slot, { onAction }) */
export function renderBookingCard(booking, slot, opts = {}) {
  const { onAction } = opts;
  if (!booking || !slot) return el('p', { class: 'ml-cmp__empty' }, 'No booking to show.');

  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Booking', booking.ref));
  grid.append(row('Service', slot.service));
  grid.append(row('Date', fmtDate(slot.date)));
  grid.append(row('Time', `${fmtTime(slot.startTime)}–${fmtTime(slot.endTime)} (${slot.timezone})`));
  grid.append(row('With', slot.staffMember));
  if (booking.name) grid.append(row('For', booking.name));
  grid.append(row('Status', 'Confirmed'));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    actions.append(el('button', {
      type: 'button', class: 'btn btn-outline', onClick: () => onAction(`check ${booking.ref}`),
    }, 'Check booking'));
    actions.append(el('button', {
      type: 'button', class: 'btn btn-outline', onClick: () => onAction('show lead metrics'),
    }, 'Lead metrics'));
  }

  return el('article', { class: 'ml-order ml-order--booking' },
    thumb('✓', '#4A6157'),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' }, el('h4', { class: 'ml-order__id' }, 'Appointment confirmed')),
      grid,
      el('p', { class: 'ml-order__note' },
        'Demo Mode booking — no calendar invite was sent and no one was contacted.'),
      actions.childElementCount ? actions : null,
    ),
  );
}

/** renderLeadMetrics(m) */
export function renderLeadMetrics(m) {
  if (!m) return el('p', { class: 'ml-cmp__empty' }, 'No metrics available.');
  const usd0 = (n) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
  const tiles = [
    ['Total leads', String(m.totalLeads)],
    ['Hot', String(m.hot)],
    ['Warm', String(m.warm)],
    ['Cold', String(m.cold)],
    ['Unqualified', String(m.unqualified)],
    ['Qualified', String(m.qualified)],
    ['Avg score', `${m.avgScore}/100`],
    ['Booked', String(m.bookedAppointments)],
    ['Est. pipeline', usd0(m.estimatedPipeline)],
  ];
  const grid = el('div', { class: 'ml-metrics' });
  tiles.forEach(([label, value]) => {
    grid.append(el('div', { class: 'ml-metrics__tile' },
      el('span', { class: 'ml-metrics__value' }, value),
      el('span', { class: 'ml-metrics__label' }, label)));
  });
  return grid;
}
