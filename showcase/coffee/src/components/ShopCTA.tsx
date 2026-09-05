import { SHOP_CTA } from "../data/storySections";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";

export function ShopCTA() {
  return (
    <section className="section shop-cta">
      <div className="container shop-cta__inner">
        <RevealText as="h2" className="shop-cta__heading" lines={SHOP_CTA.headingLines} />
        <Reveal delay={0.1}>
          <p className="shop-cta__body">{SHOP_CTA.body}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <a href={SHOP_CTA.cta.href} className="btn btn--solid-dark">
            {SHOP_CTA.cta.label}
            <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
