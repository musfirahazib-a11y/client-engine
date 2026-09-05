import { COLLECTION_SECTION, COFFEE_PRODUCTS } from "../data/coffeeProducts";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { ProductCard } from "./ProductCard";

export function ProductCollection() {
  return (
    <section id="collection" className="section collection">
      <div className="container">
        <div className="collection__head">
          <Reveal as="span" className="eyebrow">{COLLECTION_SECTION.eyebrow}</Reveal>
          <RevealText as="h2" className="collection__heading" lines={COLLECTION_SECTION.headingLines} />
          <Reveal delay={0.1}>
            <p className="collection__body">{COLLECTION_SECTION.body}</p>
          </Reveal>
        </div>

        <div className="collection__grid">
          {COFFEE_PRODUCTS.map((p, i) => (
            <Reveal as="div" key={p.slug} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
