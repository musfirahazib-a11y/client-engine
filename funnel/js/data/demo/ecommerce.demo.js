/* ===========================================================
   Demo data · E-commerce campaign (Loom & Luxe)
   Synthetic. Conversion = a completed order. Abandoned carts
   carry a cartValue + abandonReason; recovered carts are
   Converted with recoveredAt set. Converted order refs use the
   ML-##### format so they resolve in the Order Status agent.
=========================================================== */
import { buildVisitors, buildLead } from './build.js';

const A = (recipient, budget, style, category, timing) => ({ recipient, budget, style, category, timing });

const SEEDS = [
  // --- completed orders (revenue; refs match the Order Status agent's demo orders) ---
  { name: 'Sarah Ahmed', interest: 'gift, minimal gold earrings', source: 'instagram', status: 'Converted', category: 'HOT', score: 88, hrs: 200, orderValue: 129, orderRef: 'ML-10482', recs: ['LL-01', 'LL-02'], answers: A('A gift', '$100–$250', 'Minimal', 'Jewelry', 'This week'),
    convo: [{ ts: null, role: 'agent', text: 'Hi Sarah — I\'m Coco. Who are you shopping for?' }, { role: 'user', text: 'A gift, minimal, gold, under $150' }, { role: 'agent', text: 'The Fine Gold Hoops ($68) and Birthstone Pendant ($96) both fit. Add the hoops to cart?' }, { role: 'user', text: 'Yes, the hoops' }] },
  { name: 'Daniel Cross', interest: 'signet ring for myself', source: 'google', status: 'Converted', category: 'HOT', score: 84, hrs: 150, orderValue: 120, orderRef: 'ML-10517', recs: ['LL-03'], answers: A('Myself', '$100–$250', 'Bold', 'Jewelry', 'Within the month') },
  { name: 'Mei Lin', interest: 'candle + pour-over set, housewarming', source: 'facebook', status: 'Converted', category: 'WARM', score: 72, hrs: 96, orderValue: 112, orderRef: 'ML-10592', recs: ['LL-08', 'LL-09'], answers: A('A gift', '$100–$250', 'Classic', 'Lifestyle', 'Within the month') },
  // --- recovered carts (abandoned, then recovered → Converted) ---
  { name: 'Jade Thompson', interest: 'Merino Wool Blanket Scarf', source: 'instagram', status: 'Converted', category: 'WARM', score: 69, hrs: 40, cartValue: null, orderValue: 68, orderRef: 'ML-20440', abandonReason: 'shipping', recovered: true, recs: ['LL-06'], answers: A('Myself', '$50–$100', 'Classic', 'Accessories', 'This week') },
  { name: 'Ade Bakare', interest: 'Amber & Oud Eau de Parfum', source: 'paid', status: 'Converted', category: 'WARM', score: 66, hrs: 30, orderValue: 92, orderRef: 'ML-20455', abandonReason: 'price', recovered: true, recs: ['LL-04'], answers: A('A gift', '$50–$100', 'Classic', 'Beauty', 'This week') },
  // --- live abandoned carts (Contacted, cartValue set, not converted) ---
  { name: 'Emma Rodriguez', interest: 'Birthstone Pendant Necklace', source: 'instagram', status: 'Contacted', category: 'HOT', score: 80, hrs: 3, cartValue: 96, abandonReason: 'distraction', recs: ['LL-02'], answers: A('A gift', '$50–$100', 'Minimal', 'Jewelry', 'This week') },
  { name: 'Tom Becker', interest: 'Signet Ring', source: 'google', status: 'Contacted', category: 'WARM', score: 63, hrs: 5, cartValue: 120, abandonReason: 'comparing', recs: ['LL-03'], answers: A('Myself', '$100–$250', 'Bold', 'Jewelry', 'Within the month') },
  { name: 'Lucia Ferrari', interest: 'Ceramic Pour-Over Set', source: 'tiktok', status: 'Contacted', category: 'WARM', score: 61, hrs: 8, cartValue: 78, abandonReason: 'price', recs: ['LL-09'], answers: A('A gift', '$50–$100', 'Classic', 'Lifestyle', 'Within the month') },
  { name: 'Noah Kim', interest: 'Leather Card Holder', source: 'facebook', status: 'Contacted', category: 'WARM', score: 57, hrs: 2, cartValue: 45, abandonReason: 'shipping', recs: ['LL-07'], answers: A('A gift', 'Under $50', 'Minimal', 'Accessories', 'This week') },
  // --- recommended, not carted ---
  { name: 'Priya Shah', interest: 'gift for mum, classic', source: 'instagram', status: 'Warm', category: 'WARM', score: 60, hrs: 22, recs: ['LL-02', 'LL-06'], answers: A('A gift', '$50–$100', 'Classic', 'Surprise me', 'Within the month') },
  { name: 'Chris Doyle', interest: 'something bold under $150', source: 'google', status: 'Warm', category: 'WARM', score: 58, hrs: 34, recs: ['LL-03'], answers: A('Myself', '$100–$250', 'Bold', 'Jewelry', 'No rush') },
  // --- browsing ---
  { name: 'Hana Suzuki', interest: 'just looking', source: 'direct', status: 'Cold', category: 'COLD', score: 38, hrs: 120, answers: A('Myself', 'Under $50', 'Not fussy', 'Surprise me', 'No rush') },
  { name: 'Omar Haddad', interest: 'browsing candles', source: 'youtube', status: 'Cold', category: 'COLD', score: 41, hrs: 150, recs: ['LL-08'], answers: A('Myself', 'Under $50', 'Not fussy', 'Lifestyle', 'No rush') },
];

export const visitors = buildVisitors({
  prefix: 'ec',
  weights: { google: 12, instagram: 10, facebook: 7, paid: 9, tiktok: 5, direct: 6, email: 4, youtube: 2 },
  campaignTag: 'q3-gifting',
});

export const leads = SEEDS.map((s, i) => buildLead('ec', i, s));
