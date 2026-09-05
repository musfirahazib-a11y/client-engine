/* Central GSAP registration — import this (not "gsap" directly) so every
   component shares one registered instance and one ScrollTrigger. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

if (import.meta.env.DEV) {
  // Debug-only escape hatch so ScrollTrigger state can be inspected from
  // the console during development. Tree-shaken out of the prod build.
  (window as unknown as { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }).gsap = gsap;
  (window as unknown as { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
}

export { gsap, ScrollTrigger };
