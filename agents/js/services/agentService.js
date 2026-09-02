/* ===========================================================
   MusfirahLoom — AI Agent Platform
   services/agentService.js

   The single entry point the UI uses to talk to an agent. It
   selects a transport from the registry + RUNTIME.MODE. Phase 1
   only knows the mock transport.

   sendToAgent({ agent, history, context }) -> Promise<reply>
=========================================================== */
import { RUNTIME } from '../config/runtime.config.js';
import { mockSend } from './transport/mockTransport.js';

export async function sendToAgent(payload) {
  const { agent } = payload;
  const transport = agent?.transport?.[RUNTIME.MODE] || 'mock';

  if (RUNTIME.MODE === 'demo' || transport === 'mock') {
    return mockSend(payload);
  }

  // Phase 2 wiring point:
  //   if (transport === 'serverless') return serverlessSend(payload);
  //   if (transport === 'n8n')        return n8nSend(payload);
  throw new Error(
    `agentService: transport "${transport}" is not available in this build (MODE=${RUNTIME.MODE}).`,
  );
}
