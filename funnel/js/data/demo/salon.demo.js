/* ===========================================================
   Demo data · Salon & Spa campaign (Lumière Beauty & Spa)
   Synthetic. Conversion = a booked appointment; attended
   appointments are marked Converted with the service price as
   revenue.
=========================================================== */
import { buildVisitors, buildLead } from './build.js';

const A = (service, occasion, timing, budget, client) => ({ service, occasion, timing, budget, client });

const SEEDS = [
  // --- attended (Converted + revenue) ---
  { name: 'Amara Osei', interest: 'bridal hair & makeup', source: 'instagram', status: 'Converted', category: 'HOT', score: 94, hrs: 240, orderValue: 650, booked: 'BK-30101', recs: ['SV-BRD'], answers: A('Bridal', 'My wedding', 'This week', '$400+ (package)', 'First time'),
    convo: [{ ts: null, role: 'agent', text: 'Hi Amara — I\'m Aria. What are you looking for today?' }, { role: 'user', text: 'Bridal, my wedding is in two weeks!' }, { role: 'agent', text: 'Our Bridal Package includes a trial + wedding-day hair and makeup. Shall I book your trial?' }, { role: 'user', text: 'Yes please, Saturday if possible' }] },
  { name: 'Lena Fischer', interest: 'hydrafacial before an event', source: 'facebook', status: 'Converted', category: 'HOT', score: 86, hrs: 120, orderValue: 150, booked: 'BK-30102', recs: ['SV-HYD'], answers: A('Facial / skin', 'A special event', 'This week', '$150–$400', 'Returning client') },
  { name: 'Priyanka Rao', interest: 'colour + treatment', source: 'instagram', status: 'Converted', category: 'WARM', score: 74, hrs: 90, orderValue: 185, booked: 'BK-30103', recs: ['SV-COL', 'SV-HT'], answers: A('Hair', 'Just treating myself', 'Next 1–2 weeks', '$150–$400', 'Returning client') },
  { name: 'Grace Bennett', interest: 'relaxing massage', source: 'google', status: 'Converted', category: 'WARM', score: 68, hrs: 60, orderValue: 95, booked: 'BK-30104', recs: ['SV-MAS'], answers: A('Spa & massage', 'Just treating myself', 'This week', '$60–$150', 'First time') },
  // --- upcoming (booked, Hot) ---
  { name: 'Chloe Martin', interest: 'bridesmaid hair', source: 'tiktok', status: 'Hot', category: 'HOT', score: 81, hrs: 14, booked: 'BK-30110', recs: ['SV-COL', 'SV-HC'], answers: A('Hair', "A wedding I'm in", 'This week', '$60–$150', 'First time') },
  { name: 'Deepa Nair', interest: 'signature facial', source: 'instagram', status: 'Hot', category: 'HOT', score: 79, hrs: 9, booked: 'BK-30111', recs: ['SV-FAC'], answers: A('Facial / skin', 'A special event', 'This week', '$60–$150', 'Returning client') },
  { name: 'Sara Whitmore', interest: 'mani + pedi', source: 'facebook', status: 'Hot', category: 'WARM', score: 64, hrs: 5, booked: 'BK-30112', recs: ['SV-MAN', 'SV-PED'], answers: A('Nails', 'A special event', 'This week', '$60–$150', 'First time') },
  // --- warm, no booking yet ---
  { name: 'Isabelle Laurent', interest: 'hair spa ritual', source: 'instagram', status: 'Warm', category: 'WARM', score: 60, hrs: 26, recs: ['SV-SPA'], answers: A('Spa & massage', 'Just treating myself', 'Next 1–2 weeks', '$60–$150', 'First time') },
  { name: 'Monica Alvarez', interest: 'colour change', source: 'youtube', status: 'Warm', category: 'WARM', score: 58, hrs: 40, recs: ['SV-COL'], answers: A('Hair', 'Just treating myself', 'This month', '$150–$400', 'First time') },
  // --- cold / browsing ---
  { name: 'Hannah Cole', interest: 'just looking at prices', source: 'google', status: 'Cold', category: 'COLD', score: 40, hrs: 110, answers: A('Not sure yet', 'Just treating myself', 'Just browsing', 'Under $60', 'First time') },
  { name: 'Tara Singh', interest: 'gift for my sister', source: 'direct', status: 'Cold', category: 'COLD', score: 44, hrs: 150, recs: ['SV-FAC', 'SV-MAN'], answers: A('Facial / skin', 'A gift', 'This month', '$60–$150', 'First time') },
  // --- abandoned (gave phone, no booking) ---
  { name: 'Bethany Ross', interest: 'bridal trial', source: 'instagram', status: 'Contacted', category: 'HOT', score: 83, hrs: 4, abandonReason: 'timing', recs: ['SV-BRD'], answers: A('Bridal', 'My wedding', 'This week', '$400+ (package)', 'First time') },
  { name: 'Ana Popović', interest: 'facial', source: 'paid', status: 'New', category: null, score: 0, hrs: 3, abandonReason: 'price', answers: {} },
];

export const visitors = buildVisitors({
  prefix: 'sl',
  weights: { instagram: 14, tiktok: 6, facebook: 7, google: 6, paid: 6, direct: 5, youtube: 2, email: 2 },
  campaignTag: 'ig-reels-glow',
});

export const leads = SEEDS.map((s, i) => buildLead('sl', i, s));
