/* ===========================================================
   MusfirahLoom — AI Agent Platform
   data/slots.js  ·  MOCK APPOINTMENT SLOTS (Demo Mode only)

   Slots are generated at load time across the next 5 business
   days so the demo never shows stale dates. slotIds stay
   stable across reloads (SLOT-101 … SLOT-120). A couple of
   slots ship pre-booked so "show available" filters and
   double-booking prevention are demonstrable.
=========================================================== */

const TIMES = [
  ['10:00', '10:45'],
  ['11:30', '12:15'],
  ['15:00', '15:45'],
  ['16:30', '17:15'],
];

const SERVICES = [
  'Website Consultation',
  'Discovery Call',
  'AI Automation Review',
  'Brand Strategy Session',
];

const STAFF = ['Misbah Azib', 'Alina Raza', 'Omar Sheikh'];

function build() {
  const out = [];
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  let n = 1;
  let days = 0;

  while (days < 5) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    days += 1;

    TIMES.forEach((t, i) => {
      out.push({
        slotId: `SLOT-${100 + n}`,
        date: d.toISOString().slice(0, 10),
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
        startTime: t[0],
        endTime: t[1],
        service: SERVICES[(n + i) % SERVICES.length],
        staffMember: STAFF[n % STAFF.length],
        available: true,
        timezone: 'PKT (GMT+5)',
      });
      n += 1;
    });
  }

  // pre-book a couple so availability filtering + double-booking are visible
  if (out[2]) out[2].available = false; // day 1, 15:00
  if (out[9]) out[9].available = false; // day 3, 11:30
  return out;
}

export const SLOTS = build();

export default SLOTS;
