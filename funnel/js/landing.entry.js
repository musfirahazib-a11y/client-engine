/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   landing.entry.js  ·  bootstraps funnel.html

   Wires the full visitor journey:
     traffic capture -> landing page -> lead capture
       -> AI sales assistant (qualify -> score -> recommend
          -> offer -> book / WhatsApp / advisor)
       -> follow-up scheduled -> analytics recorded

   Reuses the agents platform's ChatWindow + MessageBubble and
   the shared slotRepo (booking state is the same one the Lead
   + Booking agent sees).
=========================================================== */
import { getConfig } from './services/funnelConfig.js';
import { activeCampaignId } from './services/scope.js';
import { captureContext, markEngaged, trackEvent } from './services/tracking.js';
import * as leadRepo from './repositories/funnelLeadRepo.js';
import * as visitorRepo from './repositories/visitorRepo.js';
import { funnelSalesAgent } from './agents/funnelSalesAgent.js';
import { renderLanding } from './components/landing.js';
import { renderLeadForm } from './components/LeadForm.js';
import {
  renderRecommendationList, renderOffer, renderCtaRow, renderWaLink,
  renderCheckout, renderLinks,
} from './components/funnelCards.js';
import { mountChatWindow } from '../../agents/js/components/ChatWindow.js';
import { track } from '../../agents/js/services/analyticsService.js';

const CAMPAIGN = activeCampaignId();
const qp = (href) => `${href}${href.includes('?') ? '&' : '?'}campaign=${CAMPAIGN}`;

const cfg = getConfig();
const ctx = captureContext();
const root = document.getElementById('funnelRoot');

applyBranding(cfg);
applySeo(cfg);

/* ---------- render the landing page ---------- */
const { fragment, startMount } = renderLanding(cfg, { onStart: focusStart });
root.append(fragment);

let currentLead = null;
let chat = null;
const history = [];
const agentCtx = freshAgentCtx();

renderCapture();
wireEngagement();
track('funnel_landing_view', { source: ctx.source, campaign: ctx.campaign });

/* ---------- lead capture ---------- */
function renderCapture() {
  startMount.innerHTML = '';
  startMount.classList.remove('fn-start--chat');
  const form = renderLeadForm(cfg, { onSubmit: handleCapture });
  startMount.append(el('div', { class: 'fn-start__panel' }, form.el));
}

async function handleCapture(values) {
  const lead = leadRepo.capture({
    ...values,
    source: ctx.source, medium: ctx.medium, campaign: ctx.campaign,
    landingPage: ctx.landingPage, referrer: ctx.referrer,
  });
  currentLead = lead;
  visitorRepo.attachLead(ctx.sessionId, lead.id);
  markEngaged();
  trackEvent('form_submit');
  track('lead_captured', { leadId: lead.id, source: ctx.source });

  agentCtx.leadId = lead.id;
  agentCtx.leadName = lead.name;
  agentCtx.leadInterest = lead.interest;

  mountChat();
}

/* ---------- AI sales assistant ---------- */
function mountChat() {
  startMount.classList.add('fn-start--chat');
  startMount.innerHTML = '';
  const panel = el('div', { class: 'fn-start__panel fn-start__panel--chat', style: { '--agent-accent': 'var(--funnel)' } });
  startMount.append(panel);

  chat = mountChatWindow(panel, {
    agent: {
      short: `${cfg.ai.assistantName} · ${cfg.business.logoText}`,
      icon: '◆',
      sampleQuestions: [],
      accent: '--funnel',
    },
    maxChars: 600,
    onSend: handleSend,
    onReset: handleReset,
  });

  // seed the opening turn: warm welcome + first qualification question
  const first = cfg.qualification.questions[0];
  agentCtx.askedKey = first.key;
  const name = (currentLead.name || '').split(' ')[0];
  history.push({ role: 'agent', text: openingLine(name) });
  chat.addMessage({ role: 'agent', text: openingLine(name), quickReplies: first.options, ts: Date.now() });
  leadRepo.addTurn(currentLead.id, 'agent', openingLine(name));
  chat.focusInput();
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openingLine(name) {
  const qs = cfg.qualification.questions;
  const n = qs.length;
  return `Hi${name ? ` ${name}` : ''} — I'm ${cfg.ai.assistantName}, ${cfg.ai.role.toLowerCase()}. `
    + `${n} quick question${n === 1 ? '' : 's'} and I'll have your recommendation. ${qs[0].label}`;
}

async function handleSend(text) {
  history.push({ role: 'user', text });
  leadRepo.addTurn(currentLead.id, 'user', text);
  track('funnel_message', { leadId: currentLead.id });

  let reply;
  try {
    reply = await funnelSalesAgent.respond(history, agentCtx);
  } catch (err) {
    console.error('[funnel] agent failed', err);
    chat.showError('The assistant hit a snag. Try rephrasing that.');
    return;
  }
  reply = reply || { text: '(no response)' };
  history.push({ role: 'agent', text: reply.text || '' });
  leadRepo.addTurn(currentLead.id, 'agent', reply.text || '');

  applyActions(reply.actions);

  // build funnel-specific card nodes for the shared bubble's custom slot
  const custom = [];
  if (reply.recs && reply.recs.length) {
    custom.push(renderRecommendationList(reply.recs, { onAction: (t) => chat.send(t) }));
  }
  if (reply.offer) {
    const node = renderOffer(reply.offer, { onAction: (t) => chat.send(t) });
    if (node) custom.push(node);
  }
  if (reply.cta && reply.cta.length) {
    const node = renderCtaRow(reply.cta, {
      onAction: (t) => chat.send(t),
      links: {
        checkout: (cfg.conversion.paths.checkout || {}).url,
        whatsapp: waLink(),
      },
    });
    if (node) custom.push(node);
  }
  if (reply.checkout) {
    const node = renderCheckout(reply.checkout, { onAction: (t) => chat.send(t) });
    if (node) custom.push(node);
  }
  if (reply.links && reply.links.length) {
    const node = renderLinks(reply.links);
    if (node) custom.push(node);
  }
  if (reply.waLink) custom.push(renderWaLink(reply.waLink));

  chat.addMessage({
    role: 'agent',
    text: reply.text,
    quickReplies: reply.quickReplies,
    scoreCard: reply.scoreCard,
    slots: reply.slots,
    booking: reply.booking,
    handoff: reply.handoff,
    custom: custom.length ? custom : null,
    onCardAction: (t) => chat.send(t),
    ts: Date.now(),
  });

  (reply.events || []).forEach((e) => e && e.name && track(`funnel_${e.name}`, { leadId: currentLead.id, ...(e.props || {}) }));
}

function applyActions(actions) {
  (actions || []).forEach((a) => {
    if (!a || !a.type) return;
    if (a.type === 'qualified') {
      leadRepo.setQualification(currentLead.id, { score: a.score, category: a.category, answers: a.answers });
      track('lead_qualified', { leadId: currentLead.id, score: a.score, category: a.category });
    } else if (a.type === 'recommendations') {
      leadRepo.attachRecommendations(currentLead.id, a.ids || [], a.offerId);
      track('recommendation_shown', { leadId: currentLead.id, count: (a.ids || []).length });
    } else if (a.type === 'booked') {
      leadRepo.markBooked(currentLead.id, a.ref);
      track('booking_made', { leadId: currentLead.id, ref: a.ref });
    } else if (a.type === 'cart') {
      leadRepo.markCart(currentLead.id, { value: a.value, items: a.items });
      track('add_to_cart', { leadId: currentLead.id, value: a.value });
    } else if (a.type === 'purchased') {
      leadRepo.markPurchased(currentLead.id, { orderValue: a.orderValue, orderRef: a.orderRef });
      agentCtx.orderRef = a.orderRef;
      track('purchase', { leadId: currentLead.id, ref: a.orderRef, value: a.orderValue });
    } else if (a.type === 'handoff') {
      leadRepo.addActivity(currentLead.id, 'handoff', `Human handoff · ${a.ref}`);
      leadRepo.update(currentLead.id, { status: currentLead.category === 'HOT' ? 'Hot' : 'Qualified' });
    }
  });
}

function handleReset() {
  history.length = 0;
  Object.assign(agentCtx, freshAgentCtx());
  agentCtx.leadId = currentLead.id;
  agentCtx.leadName = currentLead.name;
  agentCtx.leadInterest = currentLead.interest;
  const first = cfg.qualification.questions[0];
  agentCtx.askedKey = first.key;
  const name = (currentLead.name || '').split(' ')[0];
  // ChatWindow clears the transcript AFTER onReset returns — re-seed the
  // opening turn on the next tick so it survives.
  setTimeout(() => {
    history.push({ role: 'agent', text: openingLine(name) });
    chat.addMessage({ role: 'agent', text: openingLine(name), quickReplies: first.options, ts: Date.now() });
  }, 0);
}

/* ---------- helpers ---------- */
function freshAgentCtx() {
  return {
    greeted: true, answers: {}, askedKey: null,
    lastRecs: [], lastSlots: [], awaitingHandoff: false, scored: null,
    cart: null, cartValue: null, orderRef: null,
    leadId: null, leadName: '', leadInterest: '',
  };
}

function waLink() {
  const num = String(cfg.business.whatsapp || '').replace(/\D/g, '');
  const msg = (cfg.conversion.whatsappTemplate || 'Hi, I\'m interested in {interest}.')
    .replace('{interest}', (currentLead && currentLead.interest) || 'this');
  return num ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}` : '';
}

function focusStart() {
  markEngaged();
  trackEvent('cta_click');
  document.getElementById('fn-start').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (!currentLead) startMount.querySelector('input')?.focus();
}

function wireEngagement() {
  let done = false;
  const fire = () => { if (!done) { done = true; markEngaged(); } };
  window.addEventListener('scroll', () => { if (window.scrollY > 400) fire(); }, { passive: true, once: false });
  root.addEventListener('pointerdown', fire, { once: true });
}

function applyBranding(c) {
  const r = document.documentElement;
  if (c.branding.primary) {
    r.style.setProperty('--funnel', c.branding.primary);
    r.style.setProperty('--funnel-deep', c.branding.primary);
  }
  if (c.branding.secondary) r.style.setProperty('--funnel-gold', c.branding.secondary);
  document.body.dataset.campaign = CAMPAIGN;
  document.querySelectorAll('[data-biz-name]').forEach((n) => { n.textContent = c.business.logoText || c.business.name; });
  // carry the active campaign on internal links (console, back to selector)
  document.querySelectorAll('a[data-campaign-link]').forEach((a) => {
    const base = a.getAttribute('href') || '';
    if (base && !base.startsWith('http') && !base.includes('campaign=')) a.setAttribute('href', qp(base));
  });
}

function applySeo(c) {
  if (c.seo.title) document.title = c.seo.title;
  const set = (sel, attr, val) => { const m = document.querySelector(sel); if (m && val) m.setAttribute(attr, val); };
  set('meta[name="description"]', 'content', c.seo.description);
  set('meta[property="og:title"]', 'content', c.seo.title);
  set('meta[property="og:description"]', 'content', c.seo.description);
}

/* minimal el() — avoid importing for one helper before core loads */
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) return;
    if (k === 'class') n.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else n.setAttribute(k, v);
  });
  kids.flat().forEach((c) => c != null && n.append(c.nodeType ? c : document.createTextNode(String(c))));
  return n;
}
