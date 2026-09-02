/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/slotRepo.js

   Read access to the generated demo slots + demo booking state
   persisted to localStorage. Prevents double booking. No
   calendar / Calendly / network calls.
=========================================================== */
import { SLOTS } from '../../data/slots.js';
import { bus } from '../core/events.js';

const KEY = 'ml.agents.bookings';

/* ---------- persistence ---------- */

function read() {
  try {
    const obj = JSON.parse(localStorage.getItem(KEY) || '{}');
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota */
  }
  bus.emit('bookings:change', state);
  return state;
}

export function resetBookings() {
  write({});
  return {};
}

export function getBookingState() {
  return read();
}

/* ---------- time helpers ---------- */

export function fmtTime(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  if (Number.isNaN(h)) return String(hhmm || '');
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m || 0).padStart(2, '0')} ${ap}`;
}

export function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return String(iso || '');
  }
}

/* ---------- reads ---------- */

export function isBooked(slotId) {
  return Boolean(read()[slotId]);
}

function enrich(slot) {
  const booking = read()[slot.slotId] || null;
  return {
    ...slot,
    booked: Boolean(booking) || !slot.available,
    bookingRef: booking ? booking.ref : null,
    label: `${fmtDate(slot.date)} at ${fmtTime(slot.startTime)}`,
  };
}

export function listAvailable(filter = {}) {
  const { service = null, date = null, day = null, staff = null, limit = null } = filter;
  let list = SLOTS.map(enrich).filter((s) => !s.booked);

  if (service) {
    const q = String(service).toLowerCase();
    list = list.filter((s) => s.service.toLowerCase().includes(q));
  }
  if (date) list = list.filter((s) => s.date === date);
  if (day) {
    const q = String(day).toLowerCase().slice(0, 3);
    list = list.filter((s) => s.day.toLowerCase().startsWith(q));
  }
  if (staff) {
    const q = String(staff).toLowerCase();
    list = list.filter((s) => s.staffMember.toLowerCase().includes(q));
  }
  list = list.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  return limit ? list.slice(0, limit) : list;
}

export function getSlot(slotId) {
  const s = SLOTS.find((x) => x.slotId.toUpperCase() === String(slotId || '').toUpperCase());
  return s ? enrich(s) : null;
}

/**
 * findSlot({ day, time, date, service }) — best fuzzy match for a
 * phrase like "Tuesday at 3 PM". Returns { slot } | { slot:null, reason }.
 */
export function findSlot(q = {}) {
  const slotIdMatch = String(q.text || '').toUpperCase().match(/SLOT[-\s]?(\d{2,4})/);
  if (slotIdMatch) {
    const s = getSlot(`SLOT-${slotIdMatch[1]}`);
    return s ? { slot: s } : { slot: null, reason: 'no such slot' };
  }

  let pool = SLOTS.map(enrich);

  // day
  const dayMatch = String(q.text || '').toLowerCase().match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/);
  const tomorrow = /\btomorrow\b/i.test(q.text || '');
  if (dayMatch) pool = pool.filter((s) => s.day.toLowerCase().startsWith(dayMatch[1]));
  else if (tomorrow && pool.length) {
    const firstDate = [...pool].sort((a, b) => a.date.localeCompare(b.date))[0].date;
    pool = pool.filter((s) => s.date === firstDate);
  }

  // time — "3 pm", "3:00 pm", "15:00", "at 11"
  const tm = String(q.text || '').toLowerCase().match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (tm) {
    let h = +tm[1];
    const min = tm[2] ? +tm[2] : 0;
    const ap = tm[3];
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    if (!ap && h <= 8) h += 12; // "at 3" -> afternoon
    const hhmm = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    pool = pool.filter((s) => s.startTime === hhmm || s.startTime.startsWith(`${String(h).padStart(2, '0')}:`));
  }

  if (q.service) {
    const qs = String(q.service).toLowerCase();
    const narrowed = pool.filter((s) => s.service.toLowerCase().includes(qs));
    if (narrowed.length) pool = narrowed;
  }

  if (!pool.length) return { slot: null, reason: 'no match' };
  const open = pool.filter((s) => !s.booked);
  if (!open.length) return { slot: null, reason: 'all matching slots are booked', matched: pool[0] };
  open.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  return { slot: open[0] };
}

/* ---------- booking ---------- */

function makeRef() {
  return `BK-${Math.floor(10000 + Math.random() * 89999)}`;
}

export function bookSlot(slotId, { leadId = null, name = null } = {}) {
  const slot = getSlot(slotId);
  if (!slot) return { error: 'not_found', message: `No slot ${slotId} in the demo schedule.` };
  if (slot.booked) {
    return {
      error: 'unavailable',
      message: `${slot.label} with ${slot.staffMember} is already taken.`,
      slot,
    };
  }
  const state = read();
  const ref = makeRef();
  state[slot.slotId] = {
    ref,
    slotId: slot.slotId,
    leadId,
    name: name || 'Demo lead',
    bookedAt: new Date().toISOString(),
  };
  write(state);
  return { booking: { ...state[slot.slotId] }, slot };
}

export function releaseSlot(slotId) {
  const state = read();
  delete state[slotId];
  write(state);
  return true;
}

export function getBooking(ref) {
  const key = String(ref || '').toUpperCase();
  const state = read();
  const hit = Object.values(state).find((b) => b.ref.toUpperCase() === key);
  if (!hit) return null;
  return { ...hit, slot: getSlot(hit.slotId) };
}

export function getBookingBySlot(slotId) {
  const b = read()[slotId];
  return b ? { ...b, slot: getSlot(slotId) } : null;
}

export function listBookings() {
  const state = read();
  return Object.values(state).map((b) => ({ ...b, slot: getSlot(b.slotId) }));
}
