import { SCENT_STORY } from "../data/scentStory";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { ParallaxImage } from "./ParallaxImage";

export function ScentStory() {
  return (
    <section id="scent-story" className="section scent-story">
      <div className="container scent-story__grid">
        <ParallaxImage
          src={SCENT_STORY.image}
          alt="Soft, atmospheric light — the mood behind the fragrance"
          placeholder="atmosphere"
          className="scent-story__media"
          ratio="4 / 5"
        />
        <div className="scent-story__text">
          <Reveal as="span" className="eyebrow">{SCENT_STORY.eyebrow}</Reveal>
          <RevealText as="h2" className="scent-story__heading" lines={SCENT_STORY.headingLines} />
          <Reveal delay={0.15}>
            <p className="scent-story__body">{SCENT_STORY.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
