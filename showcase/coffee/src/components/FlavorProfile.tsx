import { useState } from "react";
import { FLAVOR_SECTION, FLAVOR_NOTES } from "../data/flavorNotes";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";

export function FlavorProfile() {
  const [active, setActive] = useState(0);
  const note = FLAVOR_NOTES[active];

  return (
    <section className="section flavor" style={{ ["--flavor-hue" as string]: active }}>
      <div className="container flavor__grid">
        <div className="flavor__intro">
          <Reveal as="span" className="eyebrow">{FLAVOR_SECTION.eyebrow}</Reveal>
          <RevealText as="h2" className="flavor__heading" lines={FLAVOR_SECTION.headingLines} />
        </div>

        <div className="flavor__panel">
          <div className="flavor__visual" aria-hidden="true">
            <span className="flavor__visual-ring" />
            <span className="flavor__visual-note">{note.name}</span>
          </div>

          <ul className="flavor__chips" role="tablist" aria-label="Flavor notes">
            {FLAVOR_NOTES.map((n, i) => (
              <li key={n.name}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={`flavor__chip ${i === active ? "is-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  {n.name}
                </button>
              </li>
            ))}
          </ul>

          <p className="flavor__desc" key={note.name}>{note.description}</p>
        </div>
      </div>
    </section>
  );
}
