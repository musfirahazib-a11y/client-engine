# Story / signature-sequence photography

Referenced by `src/data/scrollScenes.ts` and `src/data/storySections.ts`:

- `scene-01.jpg` … `scene-04.jpg` — the four beats of the signature pinned
  sequence (bag → bean → pour → finished cup). Full-bleed, ~2400×1500px.
  A short muted `.mp4` per scene also works — swap the `<MediaFrame>` in
  `ScrollScene.tsx` for a `<video>` and drive `currentTime` from
  ScrollTrigger's `progress` if you want scroll-scrubbed footage (see the
  README at the repo root, "Reuse the animation system").
- `story-main.jpg` — the "Ritual" section image.
- `visual-break.jpg` — the full-width break ("Take your time").
- `brand-story.jpg` — the "About" section image.
