# MusfirahLoom — AI Agent Platform (`agents/`)

A self-contained module bolted onto the existing portfolio. **Nothing in
`index.html`, `style.css` or `script.js` is modified or imported-from except
`style.css`, which `agents.html` / `agent.html` link read-only for the shared
design tokens, typography and `.btn` styles.**

Plain HTML + CSS + ES modules. No framework, no build, no package manager.

## Phase 1 — Demo Mode (current)

- No real AI API, no API keys, no backend, no n8n.
- Every agent reply comes from `services/transport/mockTransport.js`.
- **Agents #1–#4 (Sales, Support, Cart Recovery, Lead + Booking) are fully
  interactive.**
- **Slot #5 is the flagship [AI Sales Funnel System](../funnel/README.md)** —
  a full capture-to-conversion system with its own pages (`funnel.html`,
  `funnel-admin.html`), not a single-chat agent. Its registry entry sets
  `href` so the hub links straight to it. It reuses this platform's chat
  component, `slotRepo` and `discountRepo`, and hands qualified leads to
  Agent #4.

## Files

```
agents.html                 hub — lists the 5 agents (cards from the registry)
agent.html                  shared shell — agent.html?id=<agentId>

agents/
  css/
    agents-theme.css        NEW design tokens only (agent accents, chat bubbles)
    agents-core.css         hub grid + agent-page shell layout
    agent-chat.css          the shared chat component + product/compare cards
  js/
    config/
      agents.config.js      THE REGISTRY — single source of truth for the 5 agents
      runtime.config.js     MODE flag + public config (no secrets, ever)
    core/                   events / store / dom / router  (framework-free helpers)
    components/             AgentGrid, AgentHeader, ChatWindow, MessageBubble, ProductCard
    agents/
      baseAgent.js          shared intent-loop + logging for every agent
      salesAgent.js         Agent #1 logic (intent/keyword driven, not a fixed script)
    services/
      agentService.js       picks a transport from (agent, MODE)
      transport/mockTransport.js
      analyticsService.js   event tracking (console sink in demo)
      activityLog.js        per-session transcript + success log (localStorage)
    repositories/
      productRepo.js        catalog access (swaps to a real API in Phase 2)
      cartRepo.js           simulated cart, persisted to localStorage
  data/
    products.js             mock catalog (~24 items)
```

## Run locally

The pages use `<script type="module">`, so they need to be served over HTTP
(not opened as `file://`). Any static server works, e.g. with Node:

```bash
npx --yes serve E:\portfolio      # or: python -m http.server
```

Then open `http://localhost:<port>/agents.html`.

Deploying: upload the whole `portfolio/` folder to any static host, exactly
as today. `agents.html` / `agent.html` sit next to `index.html`.

## Try Agent #1

Open `agent.html?id=sales` and try:

- `I need a gift under $100`
- `Recommend something for my wife`
- `Show me a cheaper option`
- `Compare these products`
- `add the first one`  → simulated cart, persisted, shown in the header

**Reset demo** (top-right of the chat) clears the cart, transcript and
session activity log.

## Phase 2 (later, not built)

Flip `RUNTIME.MODE` to `'live'`, set `API_BASE_URL`, add
`transport/serverlessTransport.js` + `transport/n8nTransport.js`. Components,
registry and repositories are unchanged — only the transport swaps.
