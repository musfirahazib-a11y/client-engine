# AI Sales Funnel System (`funnel/`)

The 5th and flagship product of the MusfirahLoom AI portfolio: a complete,
niche-independent sales funnel that captures, qualifies, nurtures and converts
leads automatically — presented as **three interactive demo campaigns**
(Salon & Spa, Real Estate, E-commerce) that share one codebase and integrate
with the four existing agents.

Plain HTML + CSS + ES modules. **No framework, no build, no package manager** —
identical conventions to `agents/`. It reuses the agent platform's chat
component, DOM helpers, event bus, analytics, `slotRepo` (booking) and
`discountRepo` (incentives) rather than duplicating them.

## Pages

```
campaigns.html       Demo Campaigns selector + case studies + cross-campaign dashboard
funnel.html          Public funnel — landing + lead capture + AI assistant  (?campaign=<id>)
funnel-admin.html    Business console — CRM, analytics, follow-up, recovery, config  (?campaign=<id>)
```

`<id>` is `salon` | `realestate` | `ecommerce`. With no `?campaign=` the last
choice (or the default, `salon`) is used.

## Campaigns

Each campaign is a full funnel configuration in the shared schema
(`js/config/campaigns/<id>.campaign.js`), registered in
`js/config/campaigns/index.js`. A campaign sets branding, SEO, landing copy,
listings (homes / services / products), offers, **qualification questions with
per-option scores + match signatures**, AI instructions, `meta.conversionGoal`
(`viewing` | `appointment` | `purchase`), follow-up, recovery angles, a case
study, and which agents it uses.

`js/services/scope.js` resolves the active campaign and **namespaces every
storage key** (`funnel.leads.salon`, `funnel.visitors.ecommerce`, …) so the
three campaigns' data never mix. `withCampaign(id, fn)` runs a synchronous
read/seed as another campaign (used by the cross-campaign dashboard).

The e-commerce campaign's `conversionGoal: 'purchase'` switches
`funnelSalesAgent` from the slot-booking path to an **add-to-cart → checkout**
path, produces abandoned carts (recovery view) and an `ML-#####` order ref that
resolves in the Order Status agent.

Both need to be served over HTTP (ES modules). Any static server works:

```bash
node .claude/devserver.js      # tiny zero-dependency static server on :8000
```

Then open `http://localhost:8000/funnel.html` and `.../funnel-admin.html`.

## The blueprint

Everything about a business lives in **one config object**,
`js/config/funnel.config.js` (`DEFAULT_FUNNEL`). Edit it — or edit it live in
the console's **Configuration** tab — to retarget the funnel at dental,
medical, salon/spa, e-commerce, agency, coaching, home services or B2B. The
shipped default is a real-estate agency (**Aurora Bay Realty**, entirely
fictitious).

`js/services/funnelConfig.js` merges saved overrides (localStorage) over the
defaults and stores only the diff. `resetConfig()` restores defaults.

## Journey

```
traffic (UTM / referrer)        tracking.js -> visitorRepo
  -> landing page               components/landing.js  (all sections from config)
  -> lead capture               components/LeadForm.js -> funnelLeadRepo.capture()
  -> AI sales assistant         agents/funnelSalesAgent.js  (intent chain via baseAgent)
       -> qualification         agents/qualificationEngine.js  (5 axes, configurable weights)
       -> lead score card       reuses the Lead agent's renderScoreCard
       -> recommendations       repositories/recommendationRepo.js  (config catalog only)
       -> active offer          real expiry from config.offers[].endsAt
       -> book a viewing        shared agents/js/repositories/slotRepo.js
       -> WhatsApp / advisor     prefilled from config.conversion
  -> automated follow-up        services/followupEngine.js  (schedule + stop conditions)
  -> abandoned-lead recovery    components/console/recovery.js (+ discountRepo)
  -> CRM + analytics            services/funnelAnalytics.js, components/console/*
```

## Integration with the four existing agents

| From the funnel | To the agent |
| --- | --- |
| Qualified lead → **Send to Booking agent** | `agents/.../leadRepo.createLead()` + deep-link to `agent.html?id=lead` |
| Book a viewing | shared `agents/.../slotRepo` — real double-book prevention; the booking also shows in the Lead agent |
| Abandoned-lead recovery | `agents/.../discountRepo.selectIncentive()` + deep-link to `agent.html?id=cart` |
| Post-conversion support | deep-link to `agent.html?id=support` |
| E-commerce niche recommendations | can defer to `agents/.../productRepo` |

The only change made to the agents module is one additive, generic hook in
`components/MessageBubble.js` (`msg.custom` — append pre-built DOM nodes) so
the funnel can render its own cards without the agents importing funnel code.

## Demo data

`js/data/funnelDemo.js` holds ~30 synthetic visitors and 13 synthetic leads
(every status, scores, conversions with revenue, abandoned leads, sample
transcripts). Load / clear it from the console header. Demo rows carry
`_demo:true` and never mix with real captures. The console shows a
"synthetic demo data" banner whenever it is active.

## Phase 2 (not built)

`RUNTIME.MODE` / `API_BASE_URL` seams already exist in `agents/js/config`.
Add `services/crmSync.js` (push to `config.integrations.crmWebhook`) and a
real calendar behind `slotRepo`; swap `funnelSalesAgent`'s transport for a
serverless LLM proxy. Components, config schema and repositories are unchanged.
