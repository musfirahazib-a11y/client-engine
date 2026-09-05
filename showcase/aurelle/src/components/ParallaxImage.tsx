import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../lib/useReducedMotion";
import type { Variant } from "./PlaceholderScene";
import { MediaFrame } from "./MediaFrame";

interface ParallaxImageProps {
  src: string;
  alt: string;
  placeholder: Variant;
  darkPlaceholder?: boolean;
  ratio?: string;
  className?: string;
  strength?: number;
}

/** A self-contained scroll-scrubbed parallax image. */
export function ParallaxImage({
  src,
  alt,
  placeholder,
  darkPlaceholder,
  ratio = "4 / 5",
  className = "",
  strength = 60,
}: ParallaxImageProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !wrapRef.current || !imgRef.current) return;
    gsap.set(imgRef.current, { yPercent: 0 });
    const tween = gsap.fromTo(
      imgRef.current,
      { y: -strength },
      {
        y: strength,
        ease: "none",
        scrollTrigger: { trigger: wrapRef.current, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced, strength]);

  return (
    <div ref={wrapRef} className={`parallax-image ${className}`} style={{ aspectRatio: ratio }}>
      <div ref={imgRef} className="parallax-image__inner">
        <MediaFrame src={src} alt={alt} placeholder={placeholder} darkPlaceholder={darkPlaceholder} ratio="auto" />
      </div>
    </div>
  );
}
