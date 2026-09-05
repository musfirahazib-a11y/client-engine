import { useEffect, useRef } from "react";
import type { ElementType, ReactNode, Ref } from "react";
import { ScrollTrigger } from "../lib/gsap";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
}

/** Generic once-only fade + rise when a block scrolls into view. Pairs with
 *  the base .reveal / .reveal.is-in CSS in globals.css, so it degrades to
 *  "always visible" for free under prefers-reduced-motion. */
export function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        window.setTimeout(() => el.classList.add("is-in"), delay * 1000);
      },
    });
    return () => st.kill();
  }, [delay]);

  return (
    <Tag ref={ref as Ref<HTMLElement>} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
