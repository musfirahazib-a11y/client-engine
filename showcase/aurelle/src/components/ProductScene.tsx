import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useIsMobile } from "../lib/useIsMobile";
import { PRODUCT_SCENE } from "../data/productScene";
import { MediaFrame } from "./MediaFrame";
import { Reveal } from "./Reveal";
import type { Variant } from "./PlaceholderScene";

const BG_VARIANTS: Variant[] = ["bottle", "closeup", "botanical", "scent", "bottle", "product"];

/**
 * The signature sequence (brief §10–11): six beats — presence, detail,
 * origin, wear, return, collection — with a persistent bottle silhouette
 * that scales and repositions through the timeline while the atmosphere
 * and caption crossfade beneath it. A flowing "scent trail" ribbon drapes
 * the bottle throughout, the connective visual thread across every beat.
 * Pinned + scrubbed on desktop; a stacked static version on mobile /
 * reduced-motion, per §27/§29.
 */
export function ProductScene() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  if (reduced || mobile) return <ProductSceneStatic />;
  return <ProductScenePinned />;
}

function ProductScenePinned() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<HTMLDivElement[]>([]);
  const bottleRef = useRef<HTMLDivElement | null>(null);
  const ribbonRef = useRef<SVGGElement | null>(null);
  const sprigRef = useRef<SVGGElement | null>(null);
  const [active, setActive] = useState(0);

  // Ambient ribbon drift — independent of scroll, runs continuously.
  useEffect(() => {
    if (!ribbonRef.current) return;
    const tween = gsap.to(ribbonRef.current, {
      rotate: 6,
      transformOrigin: "50% 50%",
      duration: 6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const layers = layerRefs.current;
    if (!wrap || layers.length === 0) return;

    const n = PRODUCT_SCENE.length;
    gsap.set(layers, { opacity: 0 });
    gsap.set(layers[0], { opacity: 1 });
    gsap.set(sprigRef.current, { opacity: 0, scale: 0.8, transformOrigin: "50% 100%" });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: `+=${n * 100}%`,
        scrub: 0.6,
        pin: stageRef.current,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(n - 1, Math.floor(self.progress * n));
          setActive((prev) => (prev === idx ? prev : idx));
        },
      },
    });

    const seg = 1 / n;
    layers.forEach((layer, i) => {
      const start = i * seg;
      if (i > 0) {
        tl.to(layers[i - 1], { opacity: 0, duration: seg * 0.3 }, start - seg * 0.15);
        tl.to(layer, { opacity: 1, duration: seg * 0.3 }, start - seg * 0.15);
      }
    });

    // The bottle's journey through the six beats — this is the through-line.
    interface BottleKeyframe {
      scale: number;
      x: string;
      y: string;
      rotate: number;
    }
    const bottleKeyframes: BottleKeyframe[] = [
      { scale: 1, x: "0%", y: "0%", rotate: 0 }, // 01 presence
      { scale: 1.55, x: "0%", y: "-4%", rotate: 0 }, // 02 detail / close-up
      { scale: 0.9, x: "-16%", y: "0%", rotate: -3 }, // 03 origin — makes room for the sprig
      { scale: 0.95, x: "0%", y: "0%", rotate: 2 }, // 04 the wear
      { scale: 1.05, x: "0%", y: "0%", rotate: 0 }, // 05 return
      { scale: 0.62, x: "18%", y: "6%", rotate: 0 }, // 06 hands off into the collection
    ];
    bottleKeyframes.forEach((kf, i) => {
      tl.to(bottleRef.current, { ...kf, duration: seg, ease: "power2.inOut" }, i * seg);
    });

    // The sprig only appears for beat 03 (origin).
    tl.to(sprigRef.current, { opacity: 1, scale: 1, duration: seg * 0.5 }, 2 * seg)
      .to(sprigRef.current, { opacity: 0, scale: 0.8, duration: seg * 0.4 }, 3 * seg - seg * 0.3);

    // The ribbon breathes larger around the origin beat, for emphasis.
    tl.to(ribbonRef.current, { scale: 1.15, duration: seg, ease: "power2.inOut" }, 2 * seg).to(
      ribbonRef.current,
      { scale: 1, duration: seg, ease: "power2.inOut" },
      3 * seg,
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const beat = PRODUCT_SCENE[active];

  return (
    <section ref={wrapRef} className="product-scene" aria-label="The Aurelle bottle, in six beats">
      <div ref={stageRef} className="product-scene__stage">
        <div className="product-scene__layers">
          {PRODUCT_SCENE.map((s, i) => (
            <div
              key={s.index}
              ref={(el) => {
                if (el) layerRefs.current[i] = el;
              }}
              className="product-scene__layer"
            >
              <MediaFrame
                src={s.image}
                alt={s.heading}
                placeholder={BG_VARIANTS[i]}
                darkPlaceholder
                ratio="auto"
                className="product-scene__media"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
          <div className="product-scene__scrim" />
        </div>

        <div ref={bottleRef} className="product-scene__bottle" aria-hidden="true">
          <svg viewBox="0 0 200 260" className="product-scene__bottle-svg">
            <g className="product-scene__sprig-holder">
              <g ref={sprigRef}>
                <path
                  d="M40,190 C30,160 32,130 55,110 M40,190 C55,175 62,155 55,130 M40,190 C48,168 45,142 60,120"
                  fill="none"
                  stroke="var(--champagne)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </g>
            </g>
            <g ref={ribbonRef}>
              <path
                d="M20,60 C70,40 60,100 110,90 C150,82 130,140 170,150"
                fill="none"
                stroke="var(--rose)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>
            <g fill="none" stroke="var(--ink-on-dark)" strokeWidth="2" strokeLinejoin="round">
              <path d="M70,26 h60 v18 h-14 v168 a16,16 0 0 1-32,0 V44 H70 Z" />
              <path d="M85,26 v-14 h30 v14" />
            </g>
          </svg>
        </div>

        <div className="product-scene__info container on-dark" key={beat.index}>
          <span className="eyebrow">{beat.eyebrow}</span>
          <h3 className="product-scene__heading">{beat.heading}</h3>
          <p className="product-scene__caption">{beat.caption}</p>
        </div>

        <div className="product-scene__meta">
          <span className="product-scene__count">
            {beat.index} <em>/ {String(PRODUCT_SCENE.length).padStart(2, "0")}</em>
          </span>
          <ul className="product-scene__dots" aria-hidden="true">
            {PRODUCT_SCENE.map((s, i) => (
              <li key={s.index} className={i === active ? "is-active" : ""} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Reduced-motion / mobile fallback: the six beats stacked and revealed
 *  normally — full content, no pin, no scrub. */
function ProductSceneStatic() {
  return (
    <section className="product-scene-static" aria-label="The Aurelle bottle, in six beats">
      {PRODUCT_SCENE.map((s, i) => (
        <Reveal as="article" key={s.index} className="product-scene-static__row container">
          <div className="product-scene-static__media">
            <MediaFrame src={s.image} alt={s.heading} placeholder={BG_VARIANTS[i]} darkPlaceholder ratio="4 / 3" />
          </div>
          <div className="product-scene-static__text on-dark">
            <span className="eyebrow">{s.eyebrow}</span>
            <h3>{s.heading}</h3>
            <p>{s.caption}</p>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
