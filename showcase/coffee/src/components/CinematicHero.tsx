import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../lib/useReducedMotion";
import { scrollToHash } from "../lib/useLenis";
import { HERO } from "../data/heroContent";
import { RevealText } from "./RevealText";
import { MediaFrame } from "./MediaFrame";

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLSpanElement | null>(null);
  const ledeRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  // Cinematic entrance timeline.
  useEffect(() => {
    if (reduced) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(bgRef.current, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" }, 0)
      .fromTo(eyebrowRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.5)
      .fromTo(ledeRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.35)
      .fromTo(actionsRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.55)
      .fromTo(cueRef.current, { opacity: 0 }, { opacity: 1, duration: 1 }, 2);
    return () => {
      tl.kill();
    };
  }, [reduced]);

  // Gentle mouse parallax on the hero image — independent of scroll.
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const bg = bgRef.current;
    if (!bg) return;
    const move = gsap.quickTo(bg, "x", { duration: 0.9, ease: "power2.out" });
    const moveY = gsap.quickTo(bg, "y", { duration: 0.9, ease: "power2.out" });
    function onMove(e: PointerEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      move(nx * 14);
      moveY(ny * 10);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <section id="top" ref={sectionRef} className="hero">
      <div ref={bgRef} className="hero__bg">
        <MediaFrame src={HERO.image} alt="Amble coffee, poured for a slow morning" placeholder="hero" darkPlaceholder ratio="16 / 10" loading="eager" />
        <div className="hero__scrim" />
      </div>

      <div className="hero__content container on-dark">
        <span ref={eyebrowRef} className="eyebrow">{HERO.eyebrow}</span>
        <RevealText
          as="h1"
          className="hero__headline"
          trigger="mount"
          delay={0.65}
          lines={HERO.headlineLines}
        />
        <p ref={ledeRef} className="hero__lede">{HERO.lede}</p>
        <div ref={actionsRef} className="hero__actions">
          <a
            href={HERO.primaryCta.href}
            className="btn btn--solid-light"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash(HERO.primaryCta.href);
            }}
          >
            {HERO.primaryCta.label}
            <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <a
            href={HERO.secondaryCta.href}
            className="btn btn--outline-light"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash(HERO.secondaryCta.href);
            }}
          >
            {HERO.secondaryCta.label}
          </a>
        </div>
      </div>

      <div ref={cueRef} className="hero__cue" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero__cue-line" />
      </div>
    </section>
  );
}
