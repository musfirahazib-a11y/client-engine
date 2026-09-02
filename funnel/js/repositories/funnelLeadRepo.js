/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   repositories/funnelLeadRepo.js

   The funnel's lead store (localStorage). Captures leads,
   tracks status + qualification + activity timeline, and
   exposes the reads the CRM dashboard, analytics, follow-up
   and recovery views need.

   Integration seam: sendToBookingAgent() maps a funnel lead
   onto the existing Lead Qualification + Appointment Booking
   agent's leadRepo (agents/js/repositories/leadRepo.js) so a
   qualified funnel lead flows straight into that agent.

   Demo rows carry _demo:true.
=========================================================== */
import { bus } from '../../../agents/js/core/events.js';
import * as agentLeadRepo from '../../../agents/js/repositories/leadRepo.js';
import { scoped } from '../services/scope.js';

const KEY = () => scoped('funnel.leads');

export const STATUSES = ['New', 'Contacted', 'Qualified', 'Hot', 'Warm', 'Cold', 'Converted', 'Lost'];

function read() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY()) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function write(list) {
  try { localStorage.setItem(KEY(), JSON.stringify(list)); } catch { /* ignore */ }
  bus.emit('funnel:leads', list);
  return list;
}

let seq = 0;
function newId() {
  seq += 1;
  return `FL-${String(Math.floor(1000 + Math.random() * 9000))}${seq}`;
}

const now = () => new Date().toISOString();

/* ---------- capture ---------- */

export function capture(input = {}) {
  const list = read();
  const rec = {
    id: newId(),
    name: input.name || 'New lead',
    email: input.email || '',
    phone: input.phone || '',
    whatsapp: input.whatsapp || input.phone || '',
    company: input.company || '',
    interest: input.interest || '',
    budget: input.budget || '',
    source: input.source || 'direct',
    medium: input.medium || 'none',
    campaign: input.campaign || '',
    landingPage: input.landingPage || '/funnel.html',
    referrer: input.referrer || '',
    status: 'New',
    score: 0,
    category: null,
    answers: {},
    recommendationIds: [],
    offerId: null,
    bookingRef: null,
    orderValue: null,
    cartValue: null,        // e-commerce: value sitting in an unconverted cart
    abandonReason: null,    // e-commerce: recorded objection on an abandoned cart
    orderRef: null,         // e-commerce: order id after checkout (ties to the Order Status agent)
    recoveredAt: null,
    optedOut: false,
    createdAt: now(),
    lastActivityAt: now(),
    activity: [{ ts: now(), type: 'captured', note: `Lead captured from ${input.source || 'direct'}` }],
    conversation: [],
    _demo: Boolean(input._demo),
  };
  list.push(rec);
  write(list);
  return rec;
}

/* ---------- reads ---------- */

export function get(id) {
  return read().find((l) => l.id === id) || null;
}

export function list({ status = null, category = null, source = null, q = null, limit = null } = {}) {
  let out = read().slice().sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
  if (status) {
    const want = Array.isArray(status) ? status : [status];
    out = out.filter((l) => want.includes(l.status));
  }
  if (category) {
    const want = Array.isArray(category) ? category : [category];
    out = out.filter((l) => want.includes(l.category));
  }
  if (source) out = out.filter((l) => l.source === source);
  if (q) {
    const s = String(q).toLowerCase().trim();
    if (s) {
      out = out.filter((l) =>
        [l.name, l.email, l.phone, l.interest, l.source, l.id].some((f) => String(f).toLowerCase().includes(s)));
    }
  }
  return limit ? out.slice(0, limit) : out;
}

/* ---------- mutations ---------- */

export function update(id, patch = {}) {
  const list = read();
  const l = list.find((x) => x.id === id);
  if (!l) return null;
  Object.assign(l, patch, { lastActivityAt: now() });
  write(list);
  return l;
}

export function addActivity(id, type, note) {
  const list = read();
  const l = list.find((x) => x.id === id);
  if (!l) return null;
  l.activity.push({ ts: now(), type, note });
  l.lastActivityAt = now();
  write(list);
  return l;
}

export function addTurn(id, role, text) {
  const list = read();
  const l = list.find((x) => x.id === id);
  if (!l) return null;
  l.conversation.push({ ts: now(), role, text: String(text || '').slice(0, 600) });
  l.lastActivityAt = now();
  write(list);
  return l;
}

export function setStatus(id, status) {
  if (!STATUSES.includes(status)) return get(id);
  const l = update(id, { status });
  if (l) addActivity(id, 'status', `Status → ${status}`);
  return l;
}

/**
 * setQualification(id, { score, category, answers })
 * category is 'HOT' | 'WARM' | 'COLD' | 'UNQUALIFIED'.
 * Also nudges the pipeline status so the CRM stays coherent.
 */
export function setQualification(id, { score, category, answers } = {}) {
  const statusFromCat = { HOT: 'Hot', WARM: 'Warm', COLD: 'Cold', UNQUALIFIED: 'Contacted' };
  const l = update(id, {
    score: Math.round(score || 0),
    category: category || null,
    answers: answers || {},
    status: statusFromCat[category] || 'Qualified',
  });
  if (l) addActivity(id, 'qualified', `Scored ${Math.round(score || 0)}/100 · ${category || '—'}`);
  return l;
}

export function attachRecommendations(id, ids = [], offerId = null) {
  const l = update(id, { recommendationIds: ids.slice(), offerId: offerId || null });
  if (l) addActivity(id, 'recommendation', `Shown ${ids.length} matched listing(s)`);
  return l;
}

export function markBooked(id, bookingRef) {
  const l = update(id, { bookingRef: bookingRef || `BK-${Math.floor(10000 + Math.random() * 89999)}`, status: 'Hot' });
  if (l) addActivity(id, 'booked', `Viewing booked · ${l.bookingRef}`);
  return l;
}

export function markConverted(id, orderValue) {
  const l = update(id, { status: 'Converted', orderValue: Number(orderValue) || null });
  if (l) addActivity(id, 'converted', `Converted${orderValue ? ` · ${orderValue}` : ''}`);
  return l;
}

/* ---------- e-commerce: cart + checkout ---------- */

/** A product is in the cart but not yet bought (an abandonable state). */
export function markCart(id, { value, items = [], reason = null } = {}) {
  const l = update(id, {
    cartValue: Number(value) || null,
    abandonReason: reason,
    status: 'Contacted',
    interest: items[0] || undefined,
  });
  if (l) addActivity(id, 'cart', `Added to cart · $${Math.round(value || 0)}`);
  return l;
}

/** Completed checkout — records revenue and an order ref for the Order Status agent. */
export function markPurchased(id, { orderValue, orderRef } = {}) {
  const ref = orderRef || `ML-${Math.floor(10000 + Math.random() * 89999)}`;
  const l = update(id, {
    status: 'Converted',
    orderValue: Number(orderValue) || null,
    orderRef: ref,
    cartValue: null,
  });
  if (l) addActivity(id, 'converted', `Order placed · ${ref} · $${Math.round(orderValue || 0)}`);
  return l;
}

export function markRecovered(id) {
  const l = update(id, { recoveredAt: now(), status: 'Contacted' });
  if (l) addActivity(id, 'recovered', 'Re-engaged from recovery queue');
  return l;
}

export function optOut(id) {
  const l = update(id, { optedOut: true, status: 'Lost' });
  if (l) addActivity(id, 'opt_out', 'Lead opted out of follow-up');
  return l;
}

/* ---------- abandoned-lead detection ---------- */

export function abandoned(afterHours = 2) {
  const cutoff = Date.now() - afterHours * 3600000;
  return read().filter((l) =>
    !l.optedOut
    && !l.bookingRef
    && l.orderValue == null
    && ['New', 'Contacted'].includes(l.status)
    && (l.email || l.phone)
    && new Date(l.lastActivityAt).getTime() < cutoff
    && !l.recoveredAt);
}

/** Abandoned specifically with a cart value attached (e-commerce). */
export function abandonedCarts(afterHours = 1) {
  return abandoned(afterHours).filter((l) => Number(l.cartValue) > 0);
}

/* ---------- metrics ---------- */

export function metrics() {
  const all = read();
  const by = (fn) => all.filter(fn).length;
  const qualified = all.filter((l) => ['HOT', 'WARM'].includes(l.category) || ['Hot', 'Warm', 'Qualified'].includes(l.status));
  const converted = all.filter((l) => l.status === 'Converted');
  const revenue = converted.reduce((s, l) => s + (Number(l.orderValue) || 0), 0);
  const recovered = all.filter((l) => l.recoveredAt);
  const abandonedList = abandoned();
  const cartAbandoned = abandonedList.filter((l) => Number(l.cartValue) > 0);
  const abandonedCartValue = cartAbandoned.reduce((s, l) => s + Number(l.cartValue), 0);
  const recoveredCartRevenue = recovered.reduce((s, l) => s + (Number(l.orderValue) || Number(l.cartValue) || 0), 0);
  return {
    total: all.length,
    new: by((l) => l.status === 'New'),
    contacted: by((l) => l.status === 'Contacted'),
    qualified: qualified.length,
    hot: by((l) => l.category === 'HOT' || l.status === 'Hot'),
    warm: by((l) => l.category === 'WARM' || l.status === 'Warm'),
    cold: by((l) => l.category === 'COLD' || l.status === 'Cold'),
    booked: by((l) => Boolean(l.bookingRef)),
    converted: converted.length,
    lost: by((l) => l.status === 'Lost'),
    revenue,
    abandoned: abandonedList.length,
    abandonedCarts: cartAbandoned.length,
    abandonedCartValue: Math.round(abandonedCartValue),
    recovered: recovered.length,
    recoveredCartRevenue: Math.round(recoveredCartRevenue),
    // a lead that was scored necessarily went through the Q&A exchange,
    // even if the transcript wasn't retained
    conversations: by((l) => (l.conversation || []).length > 0 || Object.keys(l.answers || {}).length > 0),
    avgScore: all.length ? Math.round(all.reduce((s, l) => s + (l.score || 0), 0) / all.length) : 0,
  };
}

/* ---------- integration: hand a lead to the Booking agent ---------- */

/**
 * Maps this funnel lead onto the existing Lead + Booking agent's
 * leadRepo and returns the created agent lead id. The console
 * then deep-links to agent.html?id=<bookingAgentId>.
 */
export function sendToBookingAgent(id) {
  const l = get(id);
  if (!l) return null;
  const budgetNum = parseBudgetLabel(l.answers.budget || l.budget);
  const timelineMap = { 'ASAP': 'asap', '1–3 months': '1-3 months', '3–6 months': '3-6 months', 'Just researching': 'researching' };
  const authorityMap = { 'Just me': 'owner', 'Me and a partner': 'deciding with partner', 'Family / board sign-off needed': 'need to ask boss' };
  const agentLead = agentLeadRepo.createLead({
    name: l.name,
    email: l.email,
    phone: l.phone,
    business: l.company || null,
    service: l.interest || 'Waterfront home',
    budget: budgetNum,
    timeline: timelineMap[l.answers.timeline] || null,
    authority: authorityMap[l.answers.authority] || null,
    needStrength: l.category === 'HOT' ? 'clear' : l.category === 'WARM' ? 'good' : 'vague',
    source: capitalizeSource(l.source),
    notes: `From AI Sales Funnel (${l.id}). Score ${l.score}/100 · ${l.category || '—'}. Interest: ${l.interest || 'n/a'}.`,
  });
  addActivity(id, 'handoff', `Sent to Booking agent as ${agentLead.leadId}`);
  update(id, { status: l.category === 'HOT' ? 'Hot' : 'Qualified' });
  return agentLead.leadId;
}

function parseBudgetLabel(v) {
  if (typeof v === 'number') return v;
  const s = String(v || '').toLowerCase().replace(/,/g, '');
  const k = s.match(/\$?\s*(\d+(?:\.\d+)?)\s*k/);
  if (k) return Math.round(parseFloat(k[1]) * 1000);
  const m = s.match(/\$?\s*(\d+(?:\.\d+)?)\s*m/);
  if (m) return Math.round(parseFloat(m[1]) * 1000000);
  const n = s.match(/\$?\s*(\d{3,})/);
  if (n) return +n[1];
  if (s.includes('under $500')) return 400000;
  if (s.includes('500k')) return 650000;
  if (s.includes('800k') || s.includes('1.2m')) return 1000000;
  if (s.includes('1.2m+')) return 1400000;
  return null;
}

function capitalizeSource(s) {
  const map = { instagram: 'Instagram', facebook: 'Facebook', google: 'Google', direct: 'Website', paid: 'Google', email: 'Website', tiktok: 'Instagram', youtube: 'Website' };
  return map[String(s || '').toLowerCase()] || 'Website';
}

/* ---------- reset / seed ---------- */

export function reset({ demoOnly = false } = {}) {
  write(demoOnly ? read().filter((l) => !l._demo) : []);
}

export function seed(rows = []) {
  const list = read().filter((l) => !l._demo);
  rows.forEach((r) => list.push({ ...r, _demo: true }));
  write(list);
  return list;
}
