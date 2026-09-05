# Video

Reserved for any cinematic product video — a slow bottle turn, a pour, or
motion for one of the six signature-sequence beats.

- Export H.264 `.mp4`, muted, `<video muted loop playsInline autoPlay
  preload="metadata" poster="...">`. Never autoplay with sound.
- Keep a background loop under ~6MB — trim, compress, no audio track.
- For true scroll-scrubbed playback (video progress tied 1:1 to scroll,
  brief §13), drive `video.currentTime` from the beat's own fraction of
  `ScrollTrigger`'s `onUpdate` progress in `ProductScene.tsx`, instead of
  `autoPlay` — swap one `<MediaFrame>` layer for a `<video>` element using
  the same `.product-scene__layer` wrapper and opacity choreography.
