import { useEffect, useRef } from "react";
import type { ElementType, ReactNode, Ref } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../lib/useReducedMotion";

interface RevealTextProps {
  /** One entry per line — each masks and rises into place, staggered. */
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  /** Animate once the block scrolls into view (default) vs. immediately on mount. */
  trigger?: "scroll" | "mount";
  delay?: number;
}

/**
 * Premium "line reveal": each line sits inside an overflow-hidden mask and
 * rises up from below it, staggered. Used for every major headline in the
 * site so big type never just snaps into place.
 */
export function RevealText({
  lines,
  as: Tag = "div",
  className,
  trigger = "scroll",
  delay = 0,
}: RevealTextProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const inners = root.querySelectorAll<HTMLElement>(".rt-inner");

    if (reduced) {
      gsap.set(inners, { yPercent: 0, opacity: 1 });
      return;
    }

    gsap.set(inners, { yPercent: 110 });
    const tween = gsap.to(inners, {
      yPercent: 0,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.09,
      delay,
      scrollTrigger:
        trigger === "scroll"
          ? { trigger: root, start: "top 85%", once: true }
          : undefined,
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced, trigger, delay, lines.length]);

  return (
    <Tag ref={rootRef as Ref<HTMLElement>} className={className}>
      {lines.map((line, i) => (
        <span className="rt-mask" key={i}>
          <span className="rt-inner">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
