/* ===========================================================
   tests/leadScore.test.mjs  ·  run: node tests/leadScore.test.mjs

   Dependency-free checks for site/js/leadScore.js. Not loaded by
   any page — this file only runs when you run it.
=========================================================== */
import { scoreLead, triageText, MAX_SCORE } from '../site/js/leadScore.js';

let pass = 0;
let fail = 0;

function check(name, got, want) {
  const ok = got === want;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (got ${JSON.stringify(got)}${ok ? '' : `, want ${JSON.stringify(want)}`})`);
  ok ? pass++ : fail++;
}

/* ---------- fixtures ---------- */
const HOT_ECOM = {
  name: 'Sara Malik', email: 'sara@glowskin.co', business: 'GlowSkin Co',
  link: 'instagram.com/glowskin.co',
  industry: 'E-commerce / product brand', bizType: 'small-batch skincare brand',
  challenge: 'Ad traffic comes in but almost nobody buys, and the theme looks generic.',
  need: 'E-commerce website', budget: '$1,500 – $5,000', timeline: '2–4 weeks',
  goal: 'Lift the conversion rate and average order value from existing traffic.',
  contact: 'WhatsApp',
};

const HOT_BIGBUDGET = {
  business: 'Northgate Dental', link: 'northgatedental.co.uk',
  challenge: 'Our site is ten years old and we get almost no new patient enquiries from it.',
  need: 'Website redesign', budget: '$5,000 – $15,000', timeline: 'As soon as possible',
  goal: 'A modern site that brings in a steady flow of new patient bookings each month.',
  contact: 'Discovery call',
};

const WARM_MID = {
  business: 'Bloom Studio', link: 'bloomstudio.example',
  challenge: 'We want more class sign-ups from the website but it is a bit dated.',
  need: 'Business website', budget: '$500 – $1,500', timeline: '1–3 months',
  goal: 'more sign ups', // short -> partial detail
  contact: 'Email',
};

const WARM_NOTSURE = {
  business: 'Corner Cafe', link: '',
  challenge: 'Not really sure what we need but the current site looks unprofessional to us.',
  need: 'Other / not sure', budget: '$1,500 – $5,000', timeline: '2–4 weeks',
  goal: 'Look more professional and let people see the menu and opening hours easily.',
  contact: 'WhatsApp',
};

const LOW_TYREKICKER = {
  business: '', link: '',
  challenge: 'need a website', need: 'Other / not sure',
  budget: 'Under $500', timeline: 'Just exploring for now',
  goal: 'get online', contact: 'Email',
};

const LOW_EXPLORING = {
  business: 'Idea Co', link: '',
  challenge: 'Thinking about launching something next year, gathering costs for now.',
  need: 'Business website', budget: 'Under $500', timeline: 'Just exploring for now',
  goal: 'Understand roughly what a site like this would cost me to build.',
  contact: 'Email',
};

/* ---------- band expectations ---------- */
check('HOT_ECOM band', scoreLead(HOT_ECOM).band, 'hot');
check('HOT_ECOM score', scoreLead(HOT_ECOM).score, 10);          // 2+2+2+2+2
check('HOT_BIGBUDGET band', scoreLead(HOT_BIGBUDGET).band, 'hot'); // 3+3+2+2+2 = 12
check('HOT_BIGBUDGET score', scoreLead(HOT_BIGBUDGET).score, 12);
check('WARM_MID band', scoreLead(WARM_MID).band, 'warm');        // 1+1+2+1+2 = 7
check('WARM_MID score', scoreLead(WARM_MID).score, 7);
check('WARM_NOTSURE band', scoreLead(WARM_NOTSURE).band, 'warm'); // 2+2+1+2+1 = 8
check('WARM_NOTSURE score', scoreLead(WARM_NOTSURE).score, 8);
check('LOW_TYREKICKER band', scoreLead(LOW_TYREKICKER).band, 'low'); // 0+0+1+0+1 = 2
check('LOW_TYREKICKER score', scoreLead(LOW_TYREKICKER).score, 2);
check('LOW_EXPLORING band', scoreLead(LOW_EXPLORING).band, 'low');   // score 5 but capped: no budget AND no timeline
check('LOW_EXPLORING score', scoreLead(LOW_EXPLORING).score, 5);
check('LOW_EXPLORING capped', scoreLead(LOW_EXPLORING).capped, true);

/* ---------- robustness ---------- */
check('empty input does not throw / is low', scoreLead({}).band, 'low');
check('empty input scores 1 (maturity floor, everything else 0)', scoreLead({}).score, 1);
check('undefined input does not throw', scoreLead().band, 'low');
check('MAX_SCORE is 12', MAX_SCORE, 12);
check('factors always length 5', scoreLead(HOT_ECOM).factors.length, 5);
check('score never exceeds max', scoreLead(HOT_BIGBUDGET).score <= MAX_SCORE, true);

/* ---------- show one triage block ---------- */
console.log('\n--- sample triageText(HOT_ECOM) ---\n' + triageText(scoreLead(HOT_ECOM)) + '\n');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
