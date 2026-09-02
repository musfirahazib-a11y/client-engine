/* ===========================================================
   MusfirahLoom — AI Agent Platform
   services/transport/mockTransport.js

   Demo-Mode transport. No network. Routes a conversation to a
   scripted agent implementation when one exists, otherwise
   returns a clear "workflow in progress" placeholder so every
   agent tile in the hub still opens something real.

   Phase 2 adds serverlessTransport.js / n8nTransport.js
   alongside this file; agentService picks between them.
=========================================================== */
import { salesAgent } from '../../agents/salesAgent.js';
import { supportAgent } from '../../agents/supportAgent.js';
import { cartRecoveryAgent } from '../../agents/cartRecoveryAgent.js';
import { leadBookingAgent } from '../../agents/leadBookingAgent.js';

/* Agents wired for Demo Mode. Others fall through to the
   "workflow in progress" placeholder below. */
const IMPLEMENTATIONS = {
  sales: salesAgent,
  support: supportAgent,
  cart: cartRecoveryAgent,
  lead: leadBookingAgent,
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockSend({ agent, history, context }) {
  // simulate a natural "thinking" pause
  await delay(420 + Math.random() * 680);

  const impl = IMPLEMENTATIONS[agent.id];

  if (!impl) {
    return {
      role: 'agent',
      text:
        `You are in Demo Mode. The “${agent.name}” workflow is still being scripted — ` +
        `but this chat interface is the exact one every agent uses.\n\n` +
        `The AI Sales & Product Recommendation agent is fully interactive right now if you ` +
        `would like to walk through a complete flow.`,
      quickReplies: ['Open the Sales agent'],
      meta: { placeholder: true },
    };
  }

  return impl.respond(history, context);
}
