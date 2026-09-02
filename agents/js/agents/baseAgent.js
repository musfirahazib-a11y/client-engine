/* ===========================================================
   MusfirahLoom — AI Agent Platform
   agents/baseAgent.js

   Shared behaviour for every demo agent so the individual
   agent files stay small: last-message extraction, an ordered
   intent matcher chain, a fallback, response normalisation,
   guardrails, and logging/analytics hooks.

   createAgent({
     id,
     intents: [{ id, match(text, ctx, history), run(text, ctx, history) }],
     fallback(text, ctx, history),
   }) -> { id, respond(history, context) -> reply }

   A reply is normalised to:
   { role:'agent', text, cards?, compare?, quickReplies?, actions?, meta? }
=========================================================== */
import { RUNTIME } from '../config/runtime.config.js';
import { track } from '../services/analyticsService.js';
import { logTurn } from '../services/activityLog.js';

function lastUserText(history) {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i] && history[i].role === 'user') return String(history[i].text || '');
  }
  return '';
}

function normalise(reply) {
  if (!reply) return { role: 'agent', text: '' };
  if (typeof reply === 'string') return { role: 'agent', text: reply };
  return { role: 'agent', text: '', ...reply };
}

export function createAgent({ id, intents = [], fallback }) {
  async function respond(history = [], context = {}) {
    const text = lastUserText(history);

    // guardrail — overlong input
    if (text.length > (RUNTIME.LIMITS?.maxMessageChars || 800)) {
      return normalise({
        text: 'That is a lot to take in at once — could you shorten it to a sentence or two?',
        meta: { intent: 'guardrail:length' },
      });
    }

    let matchedId = 'fallback';
    let reply = null;

    for (const intent of intents) {
      let hit = false;
      try {
        hit = intent.match ? intent.match(text, context, history) : false;
      } catch (err) {
        console.error(`[${id}] intent "${intent.id}" match threw`, err);
      }
      if (hit) {
        matchedId = intent.id;
        try {
          reply = await intent.run(text, context, history, hit);
        } catch (err) {
          console.error(`[${id}] intent "${intent.id}" run threw`, err);
          reply = { text: 'Something went sideways on my end — try asking that a different way.' };
        }
        break;
      }
    }

    if (!reply && typeof fallback === 'function') {
      reply = await fallback(text, context, history);
    }

    const out = normalise(reply);
    out.meta = { intent: matchedId, ...(out.meta || {}) };

    logTurn({
      agentId: id,
      intent: matchedId,
      userText: text,
      replyText: out.text,
      transport: 'mock',
    });
    track('agent_replied', { agentId: id, intent: matchedId });

    return out;
  }

  return { id, respond };
}
