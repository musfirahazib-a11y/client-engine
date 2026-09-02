/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   services/funnelAnalytics.js  ·  STEP 15

   Derives the funnel picture from visitorRepo + funnelLeadRepo.
   Every number is computed from stored records — nothing is
   hard-coded. When demo data is loaded those records are the
   synthetic set (clearly flagged); otherwise they are real
   captures.
=========================================================== */
import * as visitorRepo from '../repositories/visitorRepo.js';
import * as leadRepo from '../repositories/funnelLeadRepo.js';
import { getConfig } from './funnelConfig.js';

function rate(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10; // one decimal
}

/** Ordered funnel stages with counts and step-to-step conversion. */
export function funnel() {
  const v = visitorRepo.metrics();
  const l = leadRepo.metrics();

  const goal = (getConfig().meta.conversionGoal) || 'lead';
  const midLabel = goal === 'purchase' ? 'Add to cart' : goal === 'appointment' ? 'Appointments booked' : 'Viewings booked';
  const endLabel = goal === 'purchase' ? 'Purchases' : goal === 'appointment' ? 'Attended / completed' : 'Conversions';
  const midCount = goal === 'purchase' ? Math.max(l.abandonedCarts + l.converted, l.booked) : l.booked;

  const stages = [
    { key: 'visitors', label: 'Visitors', count: v.visitors },
    { key: 'engaged', label: 'Landing engagement', count: v.engaged },
    { key: 'leads', label: 'Lead captures', count: l.total },
    { key: 'conversations', label: 'Sales conversations', count: l.conversations },
    { key: 'qualified', label: 'Qualified leads', count: l.qualified },
    { key: 'booked', label: midLabel, count: midCount },
    { key: 'converted', label: endLabel, count: l.converted },
  ];

  const withRates = stages.map((s, i) => ({
    ...s,
    fromPrev: i === 0 ? 100 : rate(s.count, stages[i - 1].count),
    ofTop: rate(s.count, stages[0].count),
  }));

  // biggest single drop-off between consecutive stages
  let drop = { from: null, to: null, lostPct: 0 };
  for (let i = 1; i < stages.length; i += 1) {
    const lost = stages[i - 1].count - stages[i].count;
    const pct = stages[i - 1].count ? Math.round((lost / stages[i - 1].count) * 100) : 0;
    if (pct > drop.lostPct) drop = { from: stages[i - 1].label, to: stages[i].label, lostPct: pct, lost };
  }

  return { stages: withRates, biggestDropOff: drop };
}

/** Headline KPIs for the dashboard. */
export function kpis() {
  const v = visitorRepo.metrics();
  const l = leadRepo.metrics();
  const goal = (getConfig().meta.conversionGoal) || 'lead';
  return {
    goal,
    visitors: v.visitors,
    engaged: v.engaged,
    leads: l.total,
    qualified: l.qualified,
    hot: l.hot,
    bookings: l.booked,
    conversions: l.converted,
    revenue: l.revenue,
    abandoned: l.abandoned,
    abandonedCarts: l.abandonedCarts,
    abandonedCartValue: l.abandonedCartValue,
    recovered: l.recovered,
    recoveredCartRevenue: l.recoveredCartRevenue,
    avgScore: l.avgScore,

    visitorToLead: rate(l.total, v.visitors),
    leadToQualified: rate(l.qualified, l.total),
    qualifiedToBooking: rate(l.booked, l.qualified),
    bookingToConversion: rate(l.converted, l.booked),
    overall: rate(l.converted, v.visitors),
    recoveryRate: rate(l.recovered, l.recovered + l.abandoned),
    byChannel: v.byChannel,
  };
}
