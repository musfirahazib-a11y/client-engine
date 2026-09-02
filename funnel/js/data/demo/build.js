/* ===========================================================
   MusfirahLoom — AI Sales Funnel · demo data builders

   Shared helpers so each campaign's synthetic dataset stays
   short and internally consistent. Timestamps are relative to
   "now" at load time; every record is stamped _demo:true by
   the repos' seed() helpers.
=========================================================== */

export const H = (hours) => new Date(Date.now() - hours * 3600000).toISOString();

const CAMPAIGN_MEDIUM = new Set(['paid', 'instagram', 'facebook', 'tiktok']);

export function buildVisitors({ prefix, weights, campaignTag = '' }) {
  const pool = [];
  Object.entries(weights).forEach(([c, n]) => { for (let i = 0; i < n; i += 1) pool.push(c); });
  return pool.map((source, i) => {
    const hoursAgo = Math.round((i / pool.length) * 336) + (i % 5);
    return {
      id: `V-${prefix}-${i + 1}`,
      sessionId: `S-${prefix}-${i + 1}`,
      ts: H(hoursAgo),
      source,
      medium: CAMPAIGN_MEDIUM.has(source) ? 'campaign' : 'organic',
      campaign: source === 'paid' ? campaignTag : '',
      landingPage: '/funnel.html',
      referrer: source === 'direct' ? '' : `https://${source === 'paid' ? 'google' : source}.com/`,
      engaged: i % 7 !== 0,
      convertedLeadId: null,
    };
  });
}

/**
 * buildLead(prefix, i, seed)
 * seed: { name, interest, source, status, category, score, hrs, answers,
 *         recs, offerId, booked, orderValue, orderRef, cartValue,
 *         abandonReason, recovered, convo }
 */
export function buildLead(prefix, i, s) {
  const created = H(s.hrs);
  const activity = [{ ts: created, type: 'captured', note: `Lead captured from ${s.source}` }];
  if (s.answers && Object.keys(s.answers).length) {
    activity.push({ ts: H(s.hrs - 0.2), type: 'qualified', note: `Scored ${s.score}/100 · ${s.category || '—'}` });
  }
  if (s.recs && s.recs.length) {
    activity.push({ ts: H(s.hrs - 0.15), type: 'recommendation', note: `Shown ${s.recs.length} matched item(s)` });
  }
  if (s.cartValue) {
    activity.push({ ts: H(s.hrs - 0.12), type: 'cart', note: `Added to cart · $${Math.round(s.cartValue)}` });
  }
  if (s.recovered) {
    activity.push({ ts: H(Math.max(0.4, s.hrs - 2)), type: 'recovered', note: 'Re-engaged from recovery queue' });
  }
  if (s.booked) {
    activity.push({ ts: H(Math.max(0.6, s.hrs - 1)), type: 'booked', note: `Booked · ${s.booked}` });
  }
  if (s.orderValue) {
    activity.push({ ts: H(Math.max(0.4, s.hrs - 18)), type: 'converted', note: `${s.orderRef ? `Order ${s.orderRef} · ` : ''}$${Math.round(s.orderValue)}` });
  }
  const lastTs = activity[activity.length - 1].ts;

  return {
    id: `FL-${prefix}-${i + 1}`,
    name: s.name,
    email: `${s.name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    phone: `+1 555 0${100 + i}`,
    whatsapp: `+1 555 0${100 + i}`,
    company: '',
    interest: s.interest || '',
    budget: (s.answers && s.answers.budget) || '',
    source: s.source,
    medium: CAMPAIGN_MEDIUM.has(s.source) ? 'campaign' : 'organic',
    campaign: '',
    landingPage: '/funnel.html',
    referrer: '',
    status: s.status,
    score: s.score || 0,
    category: s.category || null,
    answers: s.answers || {},
    recommendationIds: s.recs || [],
    offerId: s.offerId || (s.booked || s.orderValue ? 'off' : null),
    bookingRef: s.booked || null,
    orderValue: s.orderValue || null,
    orderRef: s.orderRef || null,
    cartValue: s.cartValue || null,
    abandonReason: s.abandonReason || null,
    recoveredAt: s.recovered ? H(Math.max(0.4, s.hrs - 2)) : null,
    optedOut: false,
    createdAt: created,
    lastActivityAt: lastTs,
    activity,
    conversation: s.convo || [],
  };
}

/** short synthetic transcript for a lead's CRM drawer */
export function convo(assistant, first, qa) {
  const out = [{ ts: H(qa.hrs - 0.05), role: 'agent', text: `Hi ${first} — I'm ${assistant}. ${qa.open}` }];
  (qa.turns || []).forEach((t, i) => {
    out.push({ ts: H(qa.hrs - 0.04 + i * 0.005), role: i % 2 === 0 ? 'user' : 'agent', text: t });
  });
  return out;
}
