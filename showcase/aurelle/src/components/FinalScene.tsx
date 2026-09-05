import { FINAL_SCENE } from "../data/scentStory";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { MediaFrame } from "./MediaFrame";

export function FinalScene() {
  return (
    <section className="final-scene">
      <div className="final-scene__media">
        <MediaFrame src={FINAL_SCENE.image} alt="The Aurelle bottle, alone in soft light" placeholder="bottle" darkPlaceholder ratio="auto" />
      </div>
      <div className="final-scene__scrim" />
      <div className="final-scene__content container on-dark">
        <RevealText as="h2" className="final-scene__heading" lines={FINAL_SCENE.headingLines} />
        <Reveal delay={0.2} className="final-scene__signoff">{FINAL_SCENE.signOff}</Reveal>
      </div>
    </section>
  );
}
