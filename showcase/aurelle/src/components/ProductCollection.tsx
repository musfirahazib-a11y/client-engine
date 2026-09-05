import { COLLECTION_SECTION, PRODUCTS } from "../data/products";
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
      </div>

      <div className="collection__rows">
        {PRODUCTS.map((p, i) => (
          <div className="container" key={p.slug}>
            <ProductCard product={p} flip={i % 2 === 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
