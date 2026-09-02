/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   services/followupEngine.js  ·  STEP 12

   Turns config.followup.sequence into a concrete, per-lead
   schedule and evaluates each step's state from the lead's own
   timeline. No timers, no network — it is a pure projection
   that the console renders and that "Run due steps" advances.

   Stop conditions (config.followup.stopOn): a sequence halts
   the moment a lead is booked, converts, replies, opts out or
   is manually closed.
=========================================================== */
import { getConfig } from './funnelConfig.js';
import { scoped } from './scope.js';
import * as leadRepo from '../repositories/funnelLeadRepo.js';
import { bus } from '../../../agents/js/core/events.js';

const KEY = () => scoped('funnel.followup');

function read() {
  try { return JSON.parse(localStorage.getItem(KEY()) || '{}') || {}; }
  catch { return {}; }
}
function write(state) {
  try { localStorage.setItem(KEY(), JSON.stringify(state)); } catch { /* ignore */ }
  bus.emit('funnel:followup', state);
  return state;
}

export function reset() { write({}); }

/* did a stop condition fire, and when? */
function stopEvent(lead) {
  const cfg = getConfig().followup;
  const acts = lead.activity || [];
  const find = (type) => acts.find((a) => a.type === type);
  if (cfg.stopOn.includes('booked') && lead.bookingRef) {
    const a = find('booked'); return { reason: 'booked', at: a ? a.ts : lead.lastActivityAt };
  }
  if (cfg.stopOn.includes('purchased') && lead.status === 'Converted') {
    const a = find('converted'); return { reason: 'purchased', at: a ? a.ts : lead.lastActivityAt };
  }
  if (cfg.stopOn.includes('opted_out') && lead.optedOut) {
    const a = find('opt_out'); return { reason: 'opted_out', at: a ? a.ts : lead.lastActivityAt };
  }
  if (cfg.stopOn.includes('closed') && lead.status === 'Lost' && !lead.optedOut) {
    return { reason: 'closed', at: lead.lastActivityAt };
  }
  if (cfg.stopOn.includes('replied')) {
    const replied = (lead.conversation || []).some((m) => m.role === 'user');
    const recovered = find('recovered');
    if (recovered) return { reason: 'replied', at: recovered.ts };
    if (replied && lead.bookingRef) { /* already covered */ }
  }
  return null;
}

/**
 * scheduleFor(lead) -> {
 *   leadId, enabled, stoppedBy, steps:[{ id, channel, dueAt, status, message }]
 * }
 * status: 'sent' | 'due' | 'scheduled' | 'stopped' | 'skipped'
 */
export function scheduleFor(lead) {
  const cfg = getConfig().followup;
  const persisted = read()[lead.id] || { sent: {} };
  const base = new Date(lead.createdAt).getTime();
  const stop = stopEvent(lead);
  const stopAt = stop ? new Date(stop.at).getTime() : null;
  const nowT = Date.now();

  const steps = (cfg.sequence || []).map((step) => {
    const dueAt = base + step.delayMinutes * 60000;
    let status;
    if (persisted.sent[step.id]) status = 'sent';
    else if (stopAt != null && dueAt >= stopAt) status = 'stopped';
    else if (!cfg.enabled) status = 'skipped';
    else if (dueAt <= nowT) status = 'due';
    else status = 'scheduled';
    return {
      id: step.id,
      channel: step.channel,
      trigger: step.trigger,
      dueAt: new Date(dueAt).toISOString(),
      status,
      message: fill(step.message, lead),
    };
  });

  return {
    leadId: lead.id,
    enabled: cfg.enabled,
    stoppedBy: stop ? stop.reason : null,
    steps,
  };
}

/** Mark every currently-due step as sent (simulated). */
export function runDue(lead) {
  const state = read();
  const rec = state[lead.id] || { sent: {} };
  const sched = scheduleFor(lead);
  let n = 0;
  sched.steps.forEach((s) => {
    if (s.status === 'due') { rec.sent[s.id] = new Date().toISOString(); n += 1; }
  });
  if (n) {
    state[lead.id] = rec;
    write(state);
    leadRepo.addActivity(lead.id, 'followup', `${n} follow-up message(s) sent (demo)`);
  }
  return n;
}

/** Run due steps across every lead; returns total sent. */
export function runAllDue() {
  return leadRepo.list().reduce((sum, l) => sum + runDue(l), 0);
}

export function stop(leadId, reason) {
  leadRepo.addActivity(leadId, 'followup_stop', `Follow-up stopped — ${reason}`);
}

/** Portfolio view for the Follow-up tab. */
export function overview() {
  const leads = leadRepo.list();
  const rows = leads.map((l) => scheduleFor(l));
  const counts = { scheduled: 0, due: 0, sent: 0, stopped: 0, skipped: 0 };
  rows.forEach((r) => r.steps.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; }));
  return { rows, counts, active: rows.filter((r) => !r.stoppedBy && r.enabled).length };
}

function fill(tpl, lead) {
  const cfg = getConfig();
  return String(tpl || '')
    .replace(/\{name\}/g, (lead.name || 'there').split(' ')[0])
    .replace(/\{assistant\}/g, cfg.ai.assistantName)
    .replace(/\{business\}/g, cfg.business.name)
    .replace(/\{interest\}/g, lead.interest || 'your search');
}
