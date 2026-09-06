/* ===========================================================
   MusfirahLoom — AI Agent Platform
   agent.entry.js  ·  bootstraps agent.html

   - resolves ?id= to a registry entry (or redirects to the hub)
   - renders the header + the ONE shared ChatWindow
   - owns conversation state, cart side effects and analytics
   - the agent brain lives in agents/*.js via agentService
=========================================================== */
import { RUNTIME } from './config/runtime.config.js';
import { resolveAgentOrRedirect, goToAgent } from './core/router.js';
import { isEmbed, getBusiness } from './services/scope.js';
import { el } from './core/dom.js';
import { bus } from './core/events.js';
import { renderAgentHeader, updateCartReadout } from './components/AgentHeader.js';
import { mountChatWindow } from './components/ChatWindow.js';
import { sendToAgent } from './services/agentService.js';
import { track, setAnalyticsAgent } from './services/analyticsService.js';
import { log as activityLog, logSuccess } from './services/activityLog.js';
import { getSummary, addToCart, clearCart } from './repositories/cartRepo.js';
import { clearReturns } from './repositories/returnRepo.js';
import { resetRecoveryState } from './repositories/cartRecoveryRepo.js';
import { resetLeadState } from './repositories/leadRepo.js';
import { resetBookings } from './repositories/slotRepo.js';

const agent = resolveAgentOrRedirect();
if (agent) init(agent);

function freshContext() {
  return {
    // sales agent working memory
    maxPrice: null,
    minPrice: null,
    recipient: null,
    occasion: null,
    styles: [],
    lastShown: [],
    greeted: false,
    // support agent working memory
    lastOrderId: null,
    pendingReturnOrderId: null,
    awaitingHandoff: false,
    awaitingOrderIdFor: null,
    returnReason: null,
    issueType: null,
    // cart-recovery agent working memory
    currentCartId: null,
    selectedIncentive: null,
    pendingRecoverCartId: null,
    // lead + booking agent working memory
    currentLeadId: null,
    qual: null,
    lastSlots: [],
    awaitingLeadHandoff: false,
  };
}

function init(agent) {
  const biz = getBusiness();
  const embedded = isEmbed();

  /* when scoped to a demo business, present the agent in that
     business's voice (name, one-liner, sample prompts) */
  const bizMeta = biz && biz.agents ? biz.agents[agent.id] : null;
  if (bizMeta) {
    agent = {
      ...agent,
      name: bizMeta.label || agent.name,
      benefit: bizMeta.purpose || agent.benefit,
      sampleQuestions: bizMeta.samples || agent.sampleQuestions,
    };
  }

  document.title = biz
    ? `${biz.agents?.[agent.id]?.label || agent.name} — ${biz.name} demo`
    : `${agent.name} — Demo — Misbah Azib`;
  setAnalyticsAgent(agent.id);

  if (embedded) document.body.classList.add('is-embed');

  const headerMount = document.getElementById('agentHeader');

  /* business-context strip: "this agent, for this demo business" */
  if (biz) {
    const meta = biz.agents?.[agent.id] || {};
    headerMount.append(el('div', {
      class: 'ml-biz-context',
      style: { '--biz-accent': biz.accent || 'var(--wine)' },
    },
      el('strong', {}, biz.name),
      el('span', { class: 'ml-biz-context__sep' }, '·'),
      el('span', {}, biz.kind),
      el('span', { class: 'ml-biz-context__sep' }, '·'),
      el('span', {}, meta.label || agent.name),
      biz.site
        ? el('a', {
            href: `../${biz.site}`,
            target: embedded ? '_top' : '_self',
          }, 'See the business site →')
        : null,
      meta.purpose
        ? el('span', { class: 'ml-biz-context__purpose' }, meta.purpose)
        : null,
    ));
  }

  headerMount.append(renderAgentHeader(agent));

  const history = [];
  const context = freshContext();
  const compareSel = [];

  const chat = mountChatWindow(document.getElementById('agentChat'), {
    agent,
    maxChars: RUNTIME.LIMITS.maxMessageChars,
    onSend: handleSend,
    onReset: handleReset,
  });

  // keep the header cart readout live
  syncCart();
  bus.on('cart:change', (s) => updateCartReadout(s.count, s.total));

  track('agent_opened', { agentId: agent.id, status: agent.status });
  activityLog({ type: 'session', agentId: agent.id, note: 'agent opened' });
  chat.focusInput();

  /* ---------- send ---------- */
  async function handleSend(text) {
    // working control on "coming-soon" agents
    if (agent.status !== 'ready' && /open the sales agent/i.test(text)) {
      goToAgent('sales');
      return;
    }

    if (history.filter((m) => m.role === 'user').length === 0) {
      track('conversation_started', { agentId: agent.id });
    }
    history.push({ role: 'user', text });
    track('message_sent', { agentId: agent.id, chars: text.length });

    let reply;
    try {
      reply = await sendToAgent({ agent, history, context });
    } catch (err) {
      console.error('[agent.entry] sendToAgent failed', err);
      activityLog({ type: 'error', agentId: agent.id, note: String(err && err.message || err) });
      chat.showError('The demo agent could not respond just now. Try again.');
      return;
    }

    reply = reply || { role: 'agent', text: '(no response)' };
    history.push({ role: 'agent', text: reply.text || '' });

    applyActions(reply.actions);

    chat.addMessage({
      role: 'agent',
      text: reply.text,
      cards: reply.cards,
      compare: reply.compare,
      order: reply.order,
      returnCard: reply.returnCard,
      handoff: reply.handoff,
      recovery: reply.recovery,
      recoveryList: reply.recoveryList,
      messagePreview: reply.messagePreview,
      recovered: reply.recovered,
      metrics: reply.metrics,
      lead: reply.lead,
      leadList: reply.leadList,
      scoreCard: reply.scoreCard,
      slots: reply.slots,
      booking: reply.booking,
      leadMetrics: reply.leadMetrics,
      cardsReadOnly: reply.cardsReadOnly,
      quickReplies: reply.quickReplies,
      onAdd,
      onCompare,
      onCardAction: (t) => chat.send(t),
      ts: Date.now(),
    });

    // domain analytics + success logs an agent declares on its reply
    (reply.events || []).forEach((e) => {
      if (e && e.name) track(e.name, { agentId: agent.id, ...(e.props || {}) });
    });
    if (reply.log && reply.log.event) {
      logSuccess({ agentId: agent.id, event: reply.log.event, props: reply.log.props || {} });
    }
  }

  /* ---------- actions the agent requested ---------- */
  function applyActions(actions) {
    (actions || []).forEach((a) => {
      if (a.type === 'add_to_cart' && a.product) {
        commitAdd(a.product);
      }
    });
  }

  /* ---------- cart ---------- */
  function onAdd(product) {
    commitAdd(product);
  }

  function commitAdd(product) {
    const s = addToCart(product, 1);
    track('add_to_cart', {
      agentId: agent.id,
      productId: product.id,
      price: product.price,
      cartCount: s.count,
    });
    logSuccess({
      agentId: agent.id,
      event: 'add_to_cart',
      props: {
        productId: product.id,
        title: product.title,
        cartCount: s.count,
        cartTotal: Number(s.total.toFixed(2)),
      },
    });
    chat.addMessage({
      role: 'system',
      text: `✓ Added “${product.title}” to the demo cart — ${s.count} item${s.count === 1 ? '' : 's'}, $${s.total.toFixed(2)}.`,
    });
  }

  /* ---------- compare (from ProductCard "Compare" buttons) ---------- */
  function onCompare(product) {
    if (compareSel.find((p) => p.id === product.id)) {
      chat.addMessage({ role: 'system', text: `“${product.title}” is already selected to compare.` });
      return;
    }
    compareSel.push(product);
    track('compare_selected', { agentId: agent.id, productId: product.id, selected: compareSel.length });

    if (compareSel.length < 2) {
      chat.addMessage({ role: 'system', text: `Added “${product.title}” to compare — pick one more.` });
      return;
    }
    const picks = compareSel.splice(0, compareSel.length);
    chat.addMessage({
      role: 'agent',
      text: `Here is how ${picks.map((p) => p.title).join(' and ')} compare:`,
      compare: picks,
      quickReplies: ['Show me a cheaper option', `Add ${picks[0].title.split(/\s+/)[0]}`],
      onAdd,
      onCompare,
      ts: Date.now(),
    });
    logSuccess({ agentId: agent.id, event: 'comparison_shown', props: { ids: picks.map((p) => p.id) } });
  }

  /* ---------- reset ---------- */
  function handleReset() {
    history.length = 0;
    compareSel.length = 0;
    Object.assign(context, freshContext());
    clearCart();
    clearReturns();
    resetRecoveryState();
    resetLeadState();
    resetBookings();
    track('demo_reset', { agentId: agent.id });
    activityLog({ type: 'reset', agentId: agent.id, note: 'demo reset from chat' });
    syncCart();
  }

  function syncCart() {
    const s = getSummary();
    updateCartReadout(s.count, s.total);
  }
}
