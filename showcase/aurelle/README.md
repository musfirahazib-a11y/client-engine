# Aurelle — a MusfirahLoom showcase

A cinematic, scroll-driven concept storefront for a fictional fragrance
house ("Aurelle"), inspired by the *interaction quality* of a reference
video — not its brand, copy, colours, or assets, all of which are original
here. Built to demonstrate the same reusable pattern as `showcase/coffee/`:
React + Vite + TypeScript, GSAP/ScrollTrigger + Lenis, a pinned signature
sequence, content fully separated from presentation.

## Run it

```bash
cd showcase/aurelle
npm install
npm run dev   # → http://localhost:5174 (or the next free port)
npm run build # production build → dist/
npm run lint  # oxlint
```

## Stack

React 19 · TypeScript · Vite 8 · GSAP 3 (+ ScrollTrigger) · Lenis 1. No CSS
framework, no UI kit, no Three.js.

## Structure

```
src/
  data/         content — edit these to re-skin the site for a new brand
  components/   presentation — read data, own zero brand copy
  lib/          gsap.ts, useLenis, useReducedMotion, useIsMobile — shared
                with showcase/coffee/, copy these verbatim into a new project
  styles/       tokens.css (design tokens) + one CSS file per component group
public/assets/perfume/   drop real photography/video here (see each README)
```

## The signature interaction

`components/ProductScene.tsx` pins the viewport and scrubs through **six
beats** (presence → detail → origin → the wear → return → collection) —
richer than the coffee showcase's four-scene crossfade. A **persistent
bottle silhouette** scales, moves and rotates continuously through all six
beats (the through-line), a botanical sprig fades in only for the "origin"
beat, and a flowing ribbon motif drifts ambiently behind the bottle
throughout, breathing larger at the origin beat for emphasis. On mobile or
under `prefers-reduced-motion` it swaps automatically to
`ProductSceneStatic` — the same six beats stacked, revealed normally.

## Placeholder art

No real photography exists yet. Every image slot (`MediaFrame.tsx`) tries
the real asset path first; if it 404s, it falls back to designed abstract
placeholder art (`PlaceholderScene.tsx`), tagged "Aurelle — placeholder".
Drop a real file at the path named in the relevant
`public/assets/perfume/*/README.md` and it replaces the placeholder
automatically.

## Debugging the scroll system

`src/lib/gsap.ts` exposes `window.gsap` / `window.ScrollTrigger` in dev
builds only. `ScrollTrigger.getAll()` / `ScrollTrigger.update()` are the
fastest way to inspect pin/scrub state from the console.

## Original vs. reference

This project studies the *pacing and interaction quality* of a reference
video only. Brand name (Aurelle), palette (plum / ivory / dusty rose /
espresso / champagne), typography (Cormorant Garamond + Jost), copy,
product names, the bottle/ribbon motif and all code are original to this
build.
