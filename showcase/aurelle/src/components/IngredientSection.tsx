import { useState } from "react";
import { INGREDIENTS_SECTION, INGREDIENTS } from "../data/ingredients";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";

export function IngredientSection() {
  const [active, setActive] = useState(0);
  const ingredient = INGREDIENTS[active];

  return (
    <section id="ingredients" className="section ingredient">
      <div className="container ingredient__grid">
        <div className="ingredient__intro">
          <Reveal as="span" className="eyebrow">{INGREDIENTS_SECTION.eyebrow}</Reveal>
          <RevealText as="h2" className="ingredient__heading" lines={INGREDIENTS_SECTION.headingLines} />
        </div>

        <div className="ingredient__list" role="tablist" aria-label="Ingredients">
          {INGREDIENTS.map((ing, i) => (
            <button
              key={ing.name}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`ingredient__row ${i === active ? "is-active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <span className="ingredient__index">{String(i + 1).padStart(2, "0")}</span>
              <span className="ingredient__name">{ing.name}</span>
            </button>
          ))}
        </div>

        <p className="ingredient__desc" key={ingredient.name}>{ingredient.description}</p>
      </div>
    </section>
  );
}
