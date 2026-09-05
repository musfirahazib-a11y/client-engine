import { SHOWCASE } from "../data/siteContent";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";

export function ShowcaseCTA() {
  const t = SHOWCASE.transition;
  return (
    <section className="section showcase-cta on-dark">
      <div className="container showcase-cta__inner">
        <Reveal as="span" className="showcase-cta__tag">{t.eyebrow}</Reveal>
        <RevealText as="h2" className="showcase-cta__heading" lines={t.heading} />
        <Reveal delay={0.12}>
          <p className="showcase-cta__body">{t.body}</p>
        </Reveal>
        <Reveal delay={0.22} className="showcase-cta__actions">
          <a href={t.primaryCta.href} className="btn btn--solid-light">
            {t.primaryCta.label}
            <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <a href={t.secondaryCta.href} className="btn btn--outline-light">
            {t.secondaryCta.label}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
