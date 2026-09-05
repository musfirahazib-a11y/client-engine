import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../lib/useReducedMotion";
import { scrollToHash } from "../lib/useLenis";
import { HERO } from "../data/heroContent";
import { RevealText } from "./RevealText";
import { MediaFrame } from "./MediaFrame";

export function CinematicHero() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLSpanElement | null>(null);
  const ledeRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(bgRef.current, { scale: 1.14, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }, 0)
      .fromTo(eyebrowRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      .fromTo(ledeRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 1.5)
      .fromTo(actionsRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 1.75)
      .fromTo(cueRef.current, { opacity: 0 }, { opacity: 1, duration: 1.1 }, 2.3);
    return () => {
      tl.kill();
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const bg = bgRef.current;
    if (!bg) return;
    const moveX = gsap.quickTo(bg, "x", { duration: 1, ease: "power2.out" });
    const moveY = gsap.quickTo(bg, "y", { duration: 1, ease: "power2.out" });
    function onMove(e: PointerEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      moveX(nx * 12);
      moveY(ny * 8);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <section id="top" className="hero">
      <div ref={bgRef} className="hero__bg">
        <MediaFrame src={HERO.image} alt="An Aurelle bottle, held in soft daylight" placeholder="hero" darkPlaceholder ratio="16 / 10" loading="eager" />
        <div className="hero__scrim" />
      </div>

      <div className="hero__content container on-dark">
        <span ref={eyebrowRef} className="eyebrow">{HERO.eyebrow}</span>
        <RevealText as="h1" className="hero__headline" trigger="mount" delay={0.75} lines={HERO.headlineLines} />
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
