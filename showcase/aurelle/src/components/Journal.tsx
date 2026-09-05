import { JOURNAL_SECTION, JOURNAL_POSTS } from "../data/journal";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { MediaFrame } from "./MediaFrame";

export function Journal() {
  return (
    <section id="journal" className="section journal">
      <div className="container">
        <div className="journal__head">
          <Reveal as="span" className="eyebrow">{JOURNAL_SECTION.eyebrow}</Reveal>
          <RevealText as="h2" className="journal__heading" lines={JOURNAL_SECTION.headingLines} />
        </div>

        <div className="journal__grid">
          {JOURNAL_POSTS.map((post, i) => (
            <Reveal as="a" href="#journal" key={post.title} className="journal__card" delay={i * 0.08}>
              <MediaFrame src={post.image} alt={post.title} placeholder="journal" ratio="4 / 3" />
              <span className="journal__category">{post.category}</span>
              <h3 className="journal__title">{post.title}</h3>
              <p className="journal__excerpt">{post.excerpt}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
