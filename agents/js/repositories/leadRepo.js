/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/leadRepo.js

   Read access to the mock lead set + demo lead state (created
   leads, appointment status) persisted to localStorage. The
   BANT-style scoring engine is here and is the single source
   of truth for score / temperature / breakdown — call sites
   never hard-code a score. No network calls.
=========================================================== */
import { LEADS } from '../../data/leads.js';
import { bus } from '../core/events.js';

const KEY = 'ml.agents.leads';

/* service -> typical starting budget used for the Budget factor */
const SERVICE_MIN = {
  website: 2000,
  ecommerce: 3000,
  'ai automation': 2500,
  'social media': 600,
  seo: 900,
  branding: 1500,
  'lead generation': 1200,
};

const OFFERED = Object.keys(SERVICE_MIN);

const SOURCE_QUALITY = {
  Referral: 5, Website: 4, Google: 4, WhatsApp: 3, Instagram: 3, Facebook: 2,
};

/* ---------- persistence ---------- */

function readState() {
  try {
    const obj = JSON.parse(localStorage.getItem(KEY) || '{}');
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function writeState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — in-memory result still returned */
  }
  bus.emit('leads:change', state);
  return state;
}

export function getState() {
  return readState();
}

export function resetLeadState() {
  writeState({});
  return {};
}

/* ---------- normalisation ---------- */

export function normalizeId(raw) {
  const s = String(raw || '').toUpperCase();
  const m = s.match(/LEAD[-\s]?(\d{3,6})/) || s.match(/\b(\d{4,6})\b/);
  return m ? `LEAD-${m[1]}` : null;
}

export function serviceKey(service) {
  const s = String(service || '').toLowerCase();
  if (/ecom|e-com|online store|storefront|shop/.test(s)) return 'ecommerce';
  if (/\bai\b|automation|chatbot|receptionist|assistant/.test(s)) return 'ai automation';
  if (/social|instagram|content|posts/.test(s)) return 'social media';
  if (/seo|search|ranking|google ranking/.test(s)) return 'seo';
  if (/brand|logo|identity/.test(s)) return 'branding';
  if (/lead gen|leads|funnel|pipeline/.test(s)) return 'lead generation';
  if (/web ?site|landing page|web design|web dev/.test(s)) return 'website';
  return null;
}

export function normalizeBudget(raw) {
  if (raw == null) return { amount: null, label: 'not stated' };
  if (typeof raw === 'number') return { amount: raw, label: `$${raw.toLocaleString()}` };
  const s = String(raw).toLowerCase().trim();
  if (/flex|open|whatever|no limit|not fixed/.test(s)) return { amount: null, label: 'flexible' };
  if (/don'?t know|not sure|no idea|unsure|tbd|not decided/.test(s)) return { amount: null, label: 'not stated' };
  const k = s.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (k) { const a = Math.round(parseFloat(k[1]) * 1000); return { amount: a, label: `$${a.toLocaleString()}` }; }
  const range = s.replace(/,/g, '').match(/\$?\s*(\d{2,6})\s*(?:-|–|to)\s*\$?\s*(\d{2,6})/);
  if (range) { const a = Math.round((+range[1] + +range[2]) / 2); return { amount: a, label: `$${(+range[1]).toLocaleString()}–$${(+range[2]).toLocaleString()}` }; }
  const n = s.replace(/,/g, '').match(/\$?\s*(\d{2,6})/);
  if (n) { const a = +n[1]; return { amount: a, label: `$${a.toLocaleString()}` }; }
  return { amount: null, label: 'not stated' };
}

const TIMELINE_ORDER = ['asap', 'this week', 'this month', 'next month', '1-3 months', '3-6 months', 'researching'];

export function normalizeTimeline(raw) {
  const s = String(raw || '').toLowerCase();
  if (/asap|immediately|right away|urgent|today|now\b/.test(s)) return 'asap';
  if (/this week|within (a|the) week|few days/.test(s)) return 'this week';
  if (/this month|next few weeks|within (a|the) month/.test(s)) return 'this month';
  if (/next month/.test(s)) return 'next month';
  if (/1-3 months|1 to 3 months|couple of months|this quarter|few months/.test(s)) return '1-3 months';
  if (/3-6 months|later this year|half a year|6 months/.test(s)) return '3-6 months';
  if (/research|just looking|no rush|someday|no timeline|not sure when|exploring/.test(s)) return 'researching';
  if (TIMELINE_ORDER.includes(s)) return s;
  return null;
}

export function authorityLevel(raw) {
  const s = String(raw || '').toLowerCase();
  if (/owner|founder|ceo|director|principal|proprietor|i own|my (own )?business/.test(s)) return 'decision-maker';
  if (/manager|head of|marketing lead|lead\b|supervisor/.test(s)) return 'influencer';
  if (/deciding with|with my (partner|spouse|co-?founder|husband|wife)|jointly/.test(s)) return 'joint';
  if (/ask (my )?(boss|manager|partner)|need approval|not the decision|researching for|team member|on behalf/.test(s)) return 'gatekeeper';
  return 'unknown';
}

/* ---------- scoring engine (BANT + fit + source, /100) ---------- */

export function calculateScore(lead) {
  const l = lead || {};
  const key = serviceKey(l.service);
  const bud = normalizeBudget(l.budget);
  const tl = normalizeTimeline(l.timeline);
  const auth = authorityLevel(l.authority);

  // Budget /25
  let budget = 6;
  const min = SERVICE_MIN[key] || 1500;
  if (bud.amount == null) budget = /flex/i.test(bud.label) ? 15 : 6;
  else if (bud.amount >= min * 1.5) budget = 25;
  else if (bud.amount >= min) budget = 22;
  else if (bud.amount >= min * 0.6) budget = 14;
  else budget = 7;

  // Authority /20
  const authority = { 'decision-maker': 20, influencer: 15, joint: 14, gatekeeper: 8, unknown: 6 }[auth];

  // Need /25
  const need = { clear: 25, good: 20, vague: 13, researching: 6 }[l.needStrength] ?? 13;

  // Timeline /20
  const timeline = {
    asap: 20, 'this week': 20, 'this month': 18, 'next month': 13,
    '1-3 months': 13, '3-6 months': 9, researching: 4,
  }[tl] ?? 8;

  // Fit + source /10
  let fit = SOURCE_QUALITY[l.source] || 2;
  fit += key && OFFERED.includes(key) ? 5 : 2;
  fit = Math.min(10, fit);

  const score = budget + authority + need + timeline + fit;
  const temperature = score >= 80 ? 'Hot' : score >= 60 ? 'Warm' : score >= 35 ? 'Cold' : 'Unqualified';

  const nextAction = {
    Hot: 'Book a consultation now',
    Warm: 'Book a discovery call and send a proposal',
    Cold: 'Add to nurture; follow up in 2–4 weeks',
    Unqualified: 'Low priority — automated nurture only',
  }[temperature];

  // reason — name the two strongest and (at most) the weakest factor
  const list = (arr) => (arr.length === 1 ? arr[0] : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);
  const parts = [
    ['budget', budget / 25], ['authority', authority / 20], ['need', need / 25],
    ['timeline', timeline / 20], ['fit', fit / 10],
  ].sort((a, b) => b[1] - a[1]);
  const strong = parts.filter((p) => p[1] >= 0.8).slice(0, 2).map((p) => p[0]);
  const weak = parts.filter((p) => p[1] < 0.5).slice(-1).map((p) => p[0]);
  let reason = '';
  if (strong.length) reason += `Strong ${list(strong)}`;
  if (weak.length) reason += `${reason ? '; ' : ''}${reason ? 'weak' : 'Weak'} ${list(weak)}`;
  if (!reason) reason = 'Middling across the board';
  reason += tl ? `. Wants to start ${tl === 'asap' ? 'ASAP' : tl}.` : '.';

  return {
    score,
    temperature,
    breakdown: { budget, authority, need, timeline, fit },
    max: { budget: 25, authority: 20, need: 25, timeline: 20, fit: 10 },
    reason,
    nextAction,
    normalized: { budget: bud, timeline: tl, authority: auth, serviceKey: key },
  };
}

/* ---------- merged view ---------- */

function merge(lead) {
  const ov = readState()[lead.leadId] || {};
  const m = { ...lead, ...ov };
  const scoring = calculateScore(m);
  return { ...m, score: scoring.score, qualificationStatus: scoring.temperature, scoreBreakdown: scoring.breakdown };
}

export function listLeads({ temperature = null, status = null, limit = null } = {}) {
  const state = readState();
  const created = Object.values(state).filter((r) => r && r._created);
  let list = [...LEADS, ...created].map((l) => merge(l));
  if (temperature) {
    const want = Array.isArray(temperature) ? temperature : [temperature];
    list = list.filter((l) => want.map((w) => w.toLowerCase()).includes(l.qualificationStatus.toLowerCase()));
  }
  if (status) list = list.filter((l) => l.appointmentStatus === status);
  list = list.sort((a, b) => b.score - a.score);
  return limit ? list.slice(0, limit) : list;
}

export function getLead(id) {
  const key = normalizeId(id);
  if (!key) return null;
  const state = readState();
  const base = LEADS.find((l) => l.leadId.toUpperCase() === key)
    || Object.values(state).find((r) => r && r._created && String(r.leadId).toUpperCase() === key);
  return base ? merge(base) : null;
}

export function findByEmail(email) {
  const k = String(email || '').toLowerCase().trim();
  return k ? listLeads().filter((l) => String(l.email).toLowerCase() === k) : [];
}

export function findByPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 6) return [];
  return listLeads().filter((l) => String(l.phone).replace(/\D/g, '').includes(digits));
}

export function searchLeads(q) {
  const s = String(q || '').toLowerCase().trim();
  if (!s || s.length < 2) return [];
  return listLeads().filter((l) =>
    [l.name, l.business, l.service, l.email, l.source].some((f) => String(f).toLowerCase().includes(s)));
}

export function hotLeads() { return listLeads({ temperature: 'Hot' }); }
export function warmLeads() { return listLeads({ temperature: 'Warm' }); }

/* ---------- mutations ---------- */

let seq = 0;
function newLeadId() {
  seq += 1;
  return `LEAD-${Math.floor(20000 + Math.random() * 9000) + seq}`;
}

export function createLead(input = {}) {
  const rec = {
    leadId: newLeadId(),
    name: input.name || 'New lead',
    email: input.email || null,
    phone: input.phone || null,
    business: input.business || null,
    businessType: input.businessType || null,
    service: input.service || 'Not specified',
    budget: input.budget ?? null,
    timeline: input.timeline || null,
    source: input.source || 'Website',
    authority: input.authority || null,
    needStrength: input.needStrength || 'good',
    intent: input.intent || 'evaluating',
    notes: input.notes || 'Captured via the qualification assistant (demo).',
    appointmentStatus: 'none',
    _created: true,
    createdAt: new Date().toISOString(),
  };
  const state = readState();
  state[rec.leadId] = rec;
  writeState(state);
  return merge(rec);
}

export function updateLead(id, patch = {}) {
  const key = normalizeId(id);
  const base = getLead(key);
  if (!base) return null;
  const state = readState();
  state[key] = { ...(state[key] || {}), leadId: key, ...patch };
  if (base._created) state[key]._created = true;
  writeState(state);
  return getLead(key);
}

/* ---------- portfolio metrics ---------- */

export function leadMetrics() {
  const all = listLeads();
  const by = (t) => all.filter((l) => l.qualificationStatus === t);
  const hot = by('Hot');
  const warm = by('Warm');
  const cold = by('Cold');
  const unq = by('Unqualified');
  const qualified = [...hot, ...warm];
  const booked = all.filter((l) => l.appointmentStatus === 'booked');

  const estValue = (l) => {
    const b = normalizeBudget(l.budget).amount;
    if (b) return b;
    return SERVICE_MIN[serviceKey(l.service)] || 1500;
  };
  const pipeline = qualified.reduce((s, l) => s + estValue(l), 0);

  return {
    totalLeads: all.length,
    hot: hot.length,
    warm: warm.length,
    cold: cold.length,
    unqualified: unq.length,
    qualified: qualified.length,
    avgScore: all.length ? Math.round(all.reduce((s, l) => s + l.score, 0) / all.length) : 0,
    bookedAppointments: booked.length,
    estimatedPipeline: Math.round(pipeline),
  };
}
