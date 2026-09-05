# Amble — a MusfirahLoom showcase

A cinematic, scroll-driven concept storefront for a fictional coffee brand
("Amble"), built to demonstrate what MusfirahLoom can deliver: React + Vite +
TypeScript, GSAP/ScrollTrigger + Lenis smooth scroll, a pinned signature
sequence, and content fully separated from presentation so the whole thing
can be re-skinned for a real client without touching the animation system.

## Run it

```bash
cd showcase/coffee
npm install   # already done if you're reading this from the built repo
npm run dev   # → http://localhost:5173
npm run build # production build → dist/
npm run lint  # oxlint
```

## Stack

React 19 · TypeScript · Vite 8 · GSAP 3 (+ ScrollTrigger) · Lenis 1.
No CSS framework, no UI kit, no Three.js (not needed — the visual system is
typography, imagery and motion choreography).

## Structure

```
src/
  data/         content — edit these to re-skin the site for a new brand
  components/   presentation — read data, own zero brand copy
  lib/          gsap.ts (registration), useLenis, useReducedMotion, useIsMobile
  styles/       tokens.css (design tokens) + one CSS file per component group
public/assets/coffee/   drop real photography/video here (see each README)
```

**Content lives in `src/data/*.ts`, nothing is hard-coded in JSX.** To re-skin
for a real client: edit `tokens.css` (palette/type), the files in `src/data/`
(copy, products, sections), and drop real assets into `public/assets/coffee/`
at the paths those data files already point to — no component changes needed
for a content-only rebrand.

## The signature interaction

`components/ScrollScene.tsx` pins the hero-adjacent viewport and scrubs
through four scenes (bag → bean → pour → cup) as the user scrolls, crossfading
both the visual and the caption in sync — see brief §10–11. On mobile or under
`prefers-reduced-motion` it swaps automatically to `ScrollSceneStatic`, the
same four scenes stacked and revealed normally, no pin/scrub at all.

## Placeholder art

No real photography exists yet. Every image slot (`MediaFrame.tsx`) tries to
load the real asset path first; if it 404s, it falls back to a designed
abstract placeholder (`PlaceholderScene.tsx`) rather than a broken-image icon,
tagged "Amble — placeholder" so nobody mistakes it for real brand photography.
Drop a real file at the path named in the relevant `public/assets/coffee/*/README.md`
and it replaces the placeholder automatically — no code change.

## Debugging the scroll system

`src/lib/gsap.ts` exposes `window.gsap` / `window.ScrollTrigger` in dev builds
only (stripped from production). Useful for inspecting pin/scrub state from
the console: `ScrollTrigger.getAll()`, `ScrollTrigger.update()`.
