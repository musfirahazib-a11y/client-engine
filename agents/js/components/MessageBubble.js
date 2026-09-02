/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/MessageBubble.js

   Renders a single chat message. A message is:
   {
     role: 'user' | 'agent' | 'system',
     text: string,
     ts?: number,
     cards?:   [{ product, reason }]   // rich product cards
     compare?: [productA, productB]    // comparison table
     order?:      order object          // support: order-status card
     returnCard?: return record         // support: return-confirmation card
     handoff?:    { stage, ref, ... }   // support: human-handoff card
     recovery?:      opportunity object  // cart: recovery-opportunity card
     recoveryList?:  [opportunity, ...]  // cart: list of recovery cards
     messagePreview?: { cart, ... }      // cart: recovery message preview
     recovered?:     { cartId, ... }     // cart: recovered success card
     metrics?:       metrics object      // cart: recovery metrics panel
     lead?:          lead object          // lead: single lead card
     leadList?:      [lead, ...]          // lead: list of lead cards
     scoreCard?:     { lead, scoring }    // lead: BANT score breakdown card
     slots?:         [slot, ...]          // lead: available appointment slots
     booking?:       { booking, slot }    // lead: confirmed booking card
     leadMetrics?:   metrics object       // lead: lead metrics panel
     cardsReadOnly?: boolean            // product cards shown without buttons
     onAdd?, onCompare?                // handlers passed through to product cards
     onCardAction?(text)              // in-card buttons -> chat.send(text)
   }
=========================================================== */
import { el } from '../core/dom.js';
import { renderProductCard, renderComparison } from './ProductCard.js';
import { renderOrderCard, renderReturnCard, renderHandoffCard } from './OrderCard.js';
import {
  renderRecoveryCard, renderRecoveryList, renderMessagePreview,
  renderRecoveredCard, renderMetricsPanel,
} from './RecoveryCard.js';
import {
  renderLeadCard, renderLeadList, renderScoreCard,
  renderSlotList, renderBookingCard, renderLeadMetrics,
} from './LeadCard.js';

function timeLabel(ts) {
  try {
    return new Date(ts || Date.now()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function renderMessage(msg) {
  const role = msg.role === 'user' || msg.role === 'system' ? msg.role : 'agent';

  const bubble = el('div', { class: 'ml-msg__bubble' });

  // text (supports simple line breaks; no HTML injection)
  String(msg.text || '')
    .split('\n')
    .forEach((line, i, arr) => {
      bubble.append(document.createTextNode(line));
      if (i < arr.length - 1) bubble.append(el('br'));
    });

  // rich product cards
  if (Array.isArray(msg.cards) && msg.cards.length) {
    const deck = el('div', {
      class: `ml-msg__cards${msg.cards.length > 1 ? ' ml-msg__cards--row' : ''}`,
    });
    msg.cards.forEach((entry) => {
      const product = entry.product || entry;
      deck.append(
        renderProductCard(product, {
          reason: entry.reason,
          compact: msg.cards.length > 1,
          onAdd: msg.cardsReadOnly ? undefined : msg.onAdd,
          onCompare: msg.cardsReadOnly ? undefined : msg.onCompare,
        }),
      );
    });
    bubble.append(deck);
  }

  // comparison table
  if (Array.isArray(msg.compare) && msg.compare.length >= 2) {
    bubble.append(renderComparison(msg.compare, { onAdd: msg.onAdd }));
  }

  // support: order / return / handoff cards
  if (msg.order) {
    bubble.append(renderOrderCard(msg.order, { onAction: msg.onCardAction }));
  }
  if (msg.returnCard) {
    bubble.append(renderReturnCard(msg.returnCard, { onAction: msg.onCardAction }));
  }
  if (msg.handoff) {
    bubble.append(renderHandoffCard(msg.handoff, { onAction: msg.onCardAction }));
  }

  // cart recovery: opportunity / list / message preview / recovered / metrics
  if (msg.recovery) {
    bubble.append(renderRecoveryCard(msg.recovery, { onAction: msg.onCardAction }));
  }
  if (Array.isArray(msg.recoveryList) && msg.recoveryList.length) {
    bubble.append(renderRecoveryList(msg.recoveryList, { onAction: msg.onCardAction }));
  }
  if (msg.messagePreview) {
    bubble.append(renderMessagePreview(msg.messagePreview, { onAction: msg.onCardAction }));
  }
  if (msg.recovered) {
    bubble.append(renderRecoveredCard(msg.recovered, { onAction: msg.onCardAction }));
  }
  if (msg.metrics) {
    bubble.append(renderMetricsPanel(msg.metrics));
  }

  // lead qualification + booking: lead / list / score / slots / booking / metrics
  if (msg.lead) {
    bubble.append(renderLeadCard(msg.lead, { onAction: msg.onCardAction }));
  }
  if (Array.isArray(msg.leadList) && msg.leadList.length) {
    bubble.append(renderLeadList(msg.leadList, { onAction: msg.onCardAction }));
  }
  if (msg.scoreCard) {
    bubble.append(renderScoreCard(msg.scoreCard.lead, msg.scoreCard.scoring, { onAction: msg.onCardAction }));
  }
  if (Array.isArray(msg.slots) && msg.slots.length) {
    bubble.append(renderSlotList(msg.slots, { onAction: msg.onCardAction }));
  }
  if (msg.booking) {
    bubble.append(renderBookingCard(msg.booking.booking, msg.booking.slot, { onAction: msg.onCardAction }));
  }
  if (msg.leadMetrics) {
    bubble.append(renderLeadMetrics(msg.leadMetrics));
  }

  /* generic escape hatch: pre-built DOM node(s) or a factory
     returning them. Lets add-on modules (e.g. the AI Sales
     Funnel) attach their own card renderers without this file
     importing them. */
  if (msg.custom) {
    const items = typeof msg.custom === 'function' ? msg.custom() : msg.custom;
    (Array.isArray(items) ? items : [items]).forEach((n) => {
      if (n && n.nodeType) bubble.append(n);
    });
  }

  const row = el('div', {
    class: `ml-msg ml-msg--${role}`,
    dataset: { role },
  });

  if (role !== 'system') {
    row.append(
      el('span', { class: 'ml-msg__who' }, role === 'user' ? 'You' : 'Agent'),
    );
  }
  row.append(bubble);
  if (role !== 'system') {
    row.append(el('span', { class: 'ml-msg__time' }, timeLabel(msg.ts)));
  }
  return row;
}
