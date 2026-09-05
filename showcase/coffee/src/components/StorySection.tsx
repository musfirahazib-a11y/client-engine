import { STORY } from "../data/storySections";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { ParallaxImage } from "./ParallaxImage";

export function StorySection() {
  return (
    <section id="story" className="section story">
      <div className="container story__grid">
        <div className="story__text">
          <Reveal as="span" className="eyebrow">{STORY.eyebrow}</Reveal>
          <RevealText as="h2" className="story__heading" lines={STORY.headingLines} />
          <Reveal delay={0.15}>
            <p className="story__body">{STORY.body}</p>
          </Reveal>
        </div>
        <ParallaxImage
          src={STORY.image}
          alt="A quiet kitchen counter mid pour-over, early morning light"
          placeholder="atmosphere"
          className="story__media"
          ratio="4 / 5"
        />
      </div>
    </section>
  );
}
