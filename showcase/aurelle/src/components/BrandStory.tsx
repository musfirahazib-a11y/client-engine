import { BRAND_STORY } from "../data/scentStory";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { ParallaxImage } from "./ParallaxImage";

export function BrandStory() {
  return (
    <section id="brand-story" className="section brand-story">
      <div className="container brand-story__grid">
        <ParallaxImage
          src={BRAND_STORY.image}
          alt="The Aurelle atelier, early light"
          placeholder="atmosphere"
          className="brand-story__media"
          ratio="5 / 6"
          strength={46}
        />
        <div className="brand-story__text">
          <Reveal as="span" className="eyebrow">{BRAND_STORY.eyebrow}</Reveal>
          <RevealText as="h2" className="brand-story__heading" lines={BRAND_STORY.headingLines} />
          <Reveal delay={0.12}>
            <p className="brand-story__body">{BRAND_STORY.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
