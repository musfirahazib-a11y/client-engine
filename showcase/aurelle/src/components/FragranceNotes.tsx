import { FRAGRANCE_PYRAMID } from "../data/ingredients";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";

export function FragranceNotes() {
  return (
    <section className="section notes on-dark">
      <div className="container notes__grid">
        <div className="notes__intro">
          <Reveal as="span" className="eyebrow">{FRAGRANCE_PYRAMID.eyebrow}</Reveal>
          <RevealText as="h2" className="notes__heading" lines={FRAGRANCE_PYRAMID.headingLines} />
        </div>

        <ol className="notes__pyramid">
          {FRAGRANCE_PYRAMID.tiers.map((tier, i) => (
            <Reveal as="li" key={tier.label} className="notes__tier" delay={i * 0.1}>
              <span className="notes__tier-label">{tier.label}</span>
              <span className="notes__tier-notes">{tier.notes.join(" · ")}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
