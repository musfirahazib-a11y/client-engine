# Hero assets

Drop the hero visual here, named exactly:

- `hero-main.jpg` (or `.png` / `.webp`) — full-bleed, ~2400×1500px, landscape.
  Referenced by `src/data/heroContent.ts` (`HERO.image`).
- `hero-main.mp4` (optional) — a looping ambient clip. Wire it into
  `CinematicHero.tsx` in place of the `<MediaFrame>` if you want motion
  instead of a still (muted, loop, playsInline, poster = hero-main.jpg).
- `og-cover.jpg` — 1200×630px, used for social share previews (`index.html`).

Until these exist, the hero shows a designed placeholder (not a broken
image) so the layout never looks unfinished.
