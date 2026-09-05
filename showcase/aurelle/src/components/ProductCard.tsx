import type { Product } from "../data/products";
import { MediaFrame } from "./MediaFrame";
import { Reveal } from "./Reveal";

/** One editorial product spread — oversized image, alternating sides.
 *  Deliberately not a grid card: brief §17 asks for something more
 *  considered than a generic 3-column e-commerce layout. */
export function ProductCard({ product, flip }: { product: Product; flip?: boolean }) {
  return (
    <article className={`product-row ${flip ? "product-row--flip" : ""}`}>
      <Reveal as="div" className="product-row__media">
        <a href="#collection" aria-label={`Discover ${product.name}`}>
          <MediaFrame src={product.image} alt={`${product.name} — ${product.descriptor}`} placeholder="product" ratio="4 / 5" />
        </a>
      </Reveal>

      <Reveal as="div" delay={0.1} className="product-row__body">
        <span className="product-row__index">{product.index}</span>
        <h3 className="product-row__name">{product.name}</h3>
        <p className="product-row__descriptor">{product.descriptor}</p>
        <p className="product-row__desc">{product.description}</p>

        <ul className="product-row__notes">
          {product.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <div className="product-row__meta">
          <span>{product.size}</span>
          <span>{product.price}</span>
        </div>

        <a href="#collection" className="btn btn--outline-dark product-row__cta">
          Discover <span className="btn__arrow" aria-hidden="true">→</span>
        </a>
      </Reveal>
    </article>
  );
}
