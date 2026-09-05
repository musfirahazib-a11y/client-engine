import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let activeLenis: Lenis | null = null;

/** Current Lenis instance, if smooth scroll is active (null under
 *  prefers-reduced-motion, where native scrolling is left untouched). */
export function getLenis(): Lenis | null {
  return activeLenis;
}

/** Smoothly scroll to an in-page anchor, whether or not Lenis is active. */
export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset: -88, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** Wires Lenis smooth-scroll into the GSAP ticker so ScrollTrigger stays in
 *  sync (the documented Lenis + GSAP recipe). Call this ONCE, at the app
 *  root. Under prefers-reduced-motion it's a no-op — native scroll stands. */
export function useLenis(reducedMotion: boolean) {
  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 1,
    });
    activeLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      activeLenis = null;
    };
  }, [reducedMotion]);
}
