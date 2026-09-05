import { ORIGIN_SECTION, ORIGIN_STEPS } from "../data/coffeeOrigins";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { ParallaxImage } from "./ParallaxImage";

export function OriginSection() {
  return (
    <section id="origin" className="section origin">
      <div className="container origin__grid">
        <ParallaxImage
          src={ORIGIN_SECTION.image}
          alt="Terraced coffee farmland at altitude"
          placeholder="origin"
          className="origin__media"
          ratio="3 / 4"
        />

        <div className="origin__text">
          <Reveal as="span" className="eyebrow">{ORIGIN_SECTION.eyebrow}</Reveal>
          <RevealText as="h2" className="origin__heading" lines={ORIGIN_SECTION.headingLines} />
          <Reveal delay={0.1}>
            <p className="origin__body">{ORIGIN_SECTION.body}</p>
          </Reveal>

          <dl className="origin__list">
            {ORIGIN_STEPS.map((step, i) => (
              <Reveal as="div" key={step.label} className="origin__row" delay={i * 0.07}>
                <dt>{step.label}</dt>
                <dd>{step.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
