import { VISUAL_BREAK } from "../data/storySections";
import { RevealText } from "./RevealText";
import { MediaFrame } from "./MediaFrame";

export function VisualBreak() {
  return (
    <section className="visual-break">
      <MediaFrame
        src={VISUAL_BREAK.image}
        alt="Steam rising from a freshly poured cup"
        placeholder="atmosphere"
        darkPlaceholder
        ratio="auto"
        className="visual-break__media"
      />
      <div className="visual-break__scrim" />
      <RevealText as="h2" className="visual-break__line on-dark" lines={[VISUAL_BREAK.line]} />
    </section>
  );
}
