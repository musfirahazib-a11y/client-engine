import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useIsMobile } from "../lib/useIsMobile";
import { SCROLL_SCENES } from "../data/scrollScenes";
import { MediaFrame } from "./MediaFrame";
import { Reveal } from "./Reveal";

const PLACEHOLDERS = ["bag", "bean", "pour", "cup"] as const;

/**
 * The signature sequence (brief §10–11): scroll position drives which
 * "scene" — bag, bean, pour, finished cup — is in focus, with the caption
 * crossfading in step. Pinned + scrubbed on desktop; a lighter stacked
 * composition under prefers-reduced-motion or on small screens, per §25/26.
 */
export function ScrollScene() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  if (reduced || mobile) return <ScrollSceneStatic />;
  return <ScrollScenePinned />;
}

function ScrollScenePinned() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<HTMLDivElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const layers = layerRefs.current;
    if (!wrap || layers.length === 0) return;

    const n = SCROLL_SCENES.length;
    gsap.set(layers, { opacity: 0, scale: 1.08 });
    gsap.set(layers[0], { opacity: 1 });

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
      // continuous slow drift while a scene is the one in view
      tl.to(layer, { scale: 1, duration: seg }, start);
      if (i > 0) {
        tl.to(layers[i - 1], { opacity: 0, duration: seg * 0.28 }, start - seg * 0.14);
        tl.to(layer, { opacity: 1, duration: seg * 0.28 }, start - seg * 0.14);
      }
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const scene = SCROLL_SCENES[active];

  return (
    <section ref={wrapRef} className="scroll-scene" aria-label="The Amble ritual, in four scenes">
      <div ref={stageRef} className="scroll-scene__stage">
        <div className="scroll-scene__layers">
          {SCROLL_SCENES.map((s, i) => (
            <div
              key={s.index}
              ref={(el) => {
                if (el) layerRefs.current[i] = el;
              }}
              className="scroll-scene__layer"
            >
              <MediaFrame
                src={s.image}
                alt={s.heading}
                placeholder={PLACEHOLDERS[i]}
                darkPlaceholder
                ratio="auto"
                className="scroll-scene__media"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
          <div className="scroll-scene__scrim" />
        </div>

        <div className="scroll-scene__info container on-dark" key={scene.index}>
          <span className="eyebrow">{scene.eyebrow}</span>
          <h3 className="scroll-scene__heading">{scene.heading}</h3>
          <p className="scroll-scene__caption">{scene.caption}</p>
        </div>

        <div className="scroll-scene__meta">
          <span className="scroll-scene__count">
            {scene.index} <em>/ {String(SCROLL_SCENES.length).padStart(2, "0")}</em>
          </span>
          <ul className="scroll-scene__dots" aria-hidden="true">
            {SCROLL_SCENES.map((s, i) => (
              <li key={s.index} className={i === active ? "is-active" : ""} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Reduced-motion / mobile fallback: the same four scenes, stacked and
 *  revealed normally — full content, no pin, no scrub. */
function ScrollSceneStatic() {
  return (
    <section className="scroll-scene-static" aria-label="The Amble ritual, in four scenes">
      {SCROLL_SCENES.map((s, i) => (
        <Reveal as="article" key={s.index} className="scroll-scene-static__row container">
          <div className="scroll-scene-static__media">
            <MediaFrame src={s.image} alt={s.heading} placeholder={PLACEHOLDERS[i]} darkPlaceholder ratio="4 / 3" />
          </div>
          <div className="scroll-scene-static__text on-dark">
            <span className="eyebrow">{s.eyebrow}</span>
            <h3>{s.heading}</h3>
            <p>{s.caption}</p>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
