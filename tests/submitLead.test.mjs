/* ===========================================================
   tests/submitLead.test.mjs  ·  run: node tests/submitLead.test.mjs

   Dependency-free checks for site/js/submitLead.js.
   `fetch` is stubbed per-case — no real network is touched.
=========================================================== */
import { buildPayload, postLead } from '../site/js/submitLead.js';
import { scoreLead } from '../site/js/leadScore.js';

let pass = 0;
let fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`}`);
  ok ? pass++ : fail++;
}
function ok(name, cond) { check(name, Boolean(cond), true); }

const VALUES = {
  name: 'Sara Malik', email: 'sara@glowskin.co', business: 'GlowSkin Co',
  link: 'instagram.com/glowskin.co', industry: 'E-commerce / product brand',
  bizType: 'small-batch skincare brand',
  challenge: 'Ad traffic comes in but almost nobody buys, and the theme looks generic.',
  need: 'E-commerce website', budget: '$1,500 – $5,000', timeline: '2–4 weeks',
  goal: 'Lift the conversion rate and average order value from existing traffic.',
  contact: 'WhatsApp',
};
const TRIAGE = scoreLead(VALUES);
const META = { now: '2026-09-07T10:00:00.000Z', page: 'https://musfirahloom.com/start.html' };

/* ---------- buildPayload ---------- */
const p = buildPayload(VALUES, TRIAGE, META);

check('source default', p.source, 'musfirahloom.com/start');
check('submittedAt from meta', p.submittedAt, META.now);
check('page from meta', p.page, META.page);
check('lead.name', p.lead.name, 'Sara Malik');
check('lead.businessType maps from bizType', p.lead.businessType, 'small-batch skincare brand');
check('lead.preferredContact maps from contact', p.lead.preferredContact, 'WhatsApp');
check('lead has all 12 fields', Object.keys(p.lead).length, 12);
check('triage.score passthrough', p.triage.score, TRIAGE.score);
check('triage.maxScore passthrough', p.triage.maxScore, TRIAGE.max);
check('triage.band passthrough', p.triage.band, TRIAGE.band);
check('triage.capped passthrough', p.triage.capped, TRIAGE.capped);
check('triage.recommendedAction passthrough', p.triage.recommendedAction, TRIAGE.action);
check('triage.factors length', p.triage.factors.length, TRIAGE.factors.length);
check('triage.factors[0] shape', Object.keys(p.triage.factors[0]).sort(), ['key', 'label', 'max', 'note', 'points']);

// deterministic
check('buildPayload deterministic', buildPayload(VALUES, TRIAGE, META), p);
// robust to empty input
ok('buildPayload({}) does not throw', buildPayload({}, {}, {}));
check('empty lead fields are empty strings', buildPayload({}, {}, {}).lead.name, '');
check('empty triage score is null', buildPayload({}, {}, {}).triage.score, null);
check('empty triage factors is []', buildPayload({}, {}, {}).triage.factors, []);

/* ---------- postLead ---------- */
const origFetch = globalThis.fetch;

// disabled: no URL -> no fetch call at all
let fetchCalled = false;
globalThis.fetch = () => { fetchCalled = true; return Promise.resolve({ ok: true }); };
check('no url -> disabled', await postLead(p, { url: '' }), { status: 'disabled' });
check('no url -> fetch not called', fetchCalled, false);

// sent: 2xx
globalThis.fetch = (url, opts) => {
  check('posts to the configured url', url, 'https://n8n.example/webhook/abc');
  check('method is POST', opts.method, 'POST');
  check('body is the JSON payload', JSON.parse(opts.body).lead.email, 'sara@glowskin.co');
  return Promise.resolve({ ok: true, status: 200 });
};
check('2xx -> sent', await postLead(p, { url: 'https://n8n.example/webhook/abc' }), { status: 'sent' });

// non-2xx
globalThis.fetch = () => Promise.resolve({ ok: false, status: 500 });
check('500 -> failed http 500', await postLead(p, { url: 'https://x/y' }), { status: 'failed', reason: 'http 500' });

// network error
globalThis.fetch = () => Promise.reject(new Error('boom'));
check('network error -> failed', await postLead(p, { url: 'https://x/y' }), { status: 'failed', reason: 'boom' });

// never throws even if fetch throws synchronously
globalThis.fetch = () => { throw new Error('sync boom'); };
check('sync throw -> failed (no rejection)', await postLead(p, { url: 'https://x/y' }), { status: 'failed', reason: 'sync boom' });

globalThis.fetch = origFetch;

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
