/* ===========================================================
   Demo data · Real Estate campaign (Aurora Bay Realty)
   Synthetic. Conversion = a booked viewing; a few older leads
   completed a purchase (revenue).
=========================================================== */
import { buildVisitors, buildLead } from './build.js';

const SEEDS = [
  { name: 'Priya Natarajan', interest: '2-bed near the marina', source: 'instagram', status: 'Converted', category: 'HOT', score: 91, hrs: 210, orderValue: 640000, orderRef: 'AB-SALE-101', booked: 'BK-20101', recs: ['AB-101', 'AB-155'], answers: { need: 'Buy to live in', budget: '$500k–$800k', timeline: 'ASAP', authority: 'Me and a partner', finance: 'Mortgage — pre-approved' }, convo: [{ ts: null, role: 'agent', text: 'Hi Priya — I\'m Ava. Buy to live in, invest, or exploring?' }, { role: 'user', text: 'Buy to live in' }, { role: 'agent', text: 'Budget range?' }, { role: 'user', text: '$500k–$800k, near the marina' }, { role: 'agent', text: 'Marina Loft (2 bed, $640k) fits — shall I book a viewing?' }] },
  { name: 'Marcus Bell', interest: 'investor studio, high yield', source: 'google', status: 'Converted', category: 'HOT', score: 88, hrs: 150, orderValue: 385000, orderRef: 'AB-SALE-124', booked: 'BK-20124', recs: ['AB-124'], answers: { need: 'Buy to invest', budget: 'Under $500k', timeline: '1–3 months', authority: 'Just me', finance: 'Cash buyer' } },
  { name: 'The Okafor Family', interest: '3-bed townhouse with a garden', source: 'facebook', status: 'Hot', category: 'HOT', score: 84, hrs: 20, booked: 'BK-20140', recs: ['AB-118'], answers: { need: 'Buy to live in', budget: '$800k–$1.2M', timeline: '1–3 months', authority: 'Family / board sign-off needed', finance: 'Mortgage — pre-approved' } },
  { name: 'Dana Whitfield', interest: 'penthouse, waterfront, premium', source: 'paid', status: 'Hot', category: 'HOT', score: 82, hrs: 6, recs: ['AB-140'], answers: { need: 'Buy to live in', budget: '$1.2M+', timeline: 'ASAP', authority: 'Just me', finance: 'Cash buyer' } },
  { name: 'Sofia Marchetti', interest: 'under $600k with a mooring', source: 'instagram', status: 'Warm', category: 'WARM', score: 71, hrs: 30, recs: ['AB-155'], answers: { need: 'Buy to live in', budget: '$500k–$800k', timeline: '3–6 months', authority: 'Me and a partner', finance: 'Mortgage — not yet approved' } },
  { name: 'Ken Adebayo', interest: 'buy-to-let, managed scheme', source: 'youtube', status: 'Warm', category: 'WARM', score: 66, hrs: 54, recs: ['AB-124'], answers: { need: 'Buy to invest', budget: '$500k–$800k', timeline: '3–6 months', authority: 'Just me', finance: 'Mortgage — not yet approved' } },
  { name: 'Rachel Kim', interest: 'first home near the boardwalk', source: 'tiktok', status: 'Warm', category: 'WARM', score: 62, hrs: 12, recs: ['AB-155', 'AB-101'], answers: { need: 'Buy to live in', budget: 'Under $500k', timeline: '1–3 months', authority: 'Just me', finance: 'Mortgage — pre-approved' } },
  { name: 'Tomás Herrera', interest: 'exploring the area, no rush', source: 'google', status: 'Cold', category: 'COLD', score: 44, hrs: 96, answers: { need: 'Just exploring', budget: '$500k–$800k', timeline: 'Just researching', authority: 'Me and a partner', finance: 'Mortgage — not yet approved' } },
  { name: 'Yuki Tanaka', interest: 'not sure yet', source: 'facebook', status: 'Cold', category: 'COLD', score: 39, hrs: 130, answers: { need: 'Just exploring', budget: 'Under $500k', timeline: 'Just researching', authority: 'Just me', finance: 'Mortgage — not yet approved' } },
  { name: 'Gregory Voss', interest: 'curious about prices', source: 'direct', status: 'Cold', category: 'UNQUALIFIED', score: 28, hrs: 180, answers: { need: 'Just exploring', budget: 'Under $500k', timeline: 'Just researching', authority: 'Family / board sign-off needed', finance: 'Mortgage — not yet approved' } },
  { name: 'Helena Cruz', interest: '2-bed marina condo', source: 'instagram', status: 'New', category: null, score: 0, hrs: 5, answers: {} },
  { name: 'Oliver Grant', interest: 'townhouse for the family', source: 'paid', status: 'Contacted', category: 'WARM', score: 68, hrs: 8, recs: ['AB-118'], answers: { need: 'Buy to live in', budget: '$800k–$1.2M', timeline: '1–3 months', authority: 'Me and a partner', finance: 'Mortgage — pre-approved' } },
  { name: 'Nadia Rahman', interest: 'investor unit', source: 'google', status: 'New', category: null, score: 0, hrs: 3, answers: {} },
];

export const visitors = buildVisitors({
  prefix: 're',
  weights: { instagram: 11, facebook: 7, google: 9, paid: 8, direct: 6, tiktok: 4, youtube: 2, email: 3 },
  campaignTag: 'q3-waterfront-search',
});

export const leads = SEEDS.map((s, i) => buildLead('re', i, s));
