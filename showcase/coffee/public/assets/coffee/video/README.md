# Video

Reserved for any cinematic product video (e.g. a slow-motion pour used as
the hero background, or as one of the four signature-sequence scenes).

Guidelines when you add one:
- Export H.264 `.mp4`, muted, `<video muted loop playsInline autoPlay
  preload="metadata" poster="/assets/coffee/hero/hero-main.jpg">`.
- Never autoplay with sound.
- Keep it under ~6MB for a hero background loop (trim, compress, no audio
  track at all rather than a muted one).
- For scroll-scrubbed playback, drive `video.currentTime` from a
  ScrollTrigger's `onUpdate` progress instead of `autoPlay` — see the note
  in `public/assets/coffee/story/README.md`.
