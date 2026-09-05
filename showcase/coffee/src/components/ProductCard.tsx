import type { CoffeeProduct } from "../data/coffeeProducts";
import { MediaFrame } from "./MediaFrame";

export function ProductCard({ product }: { product: CoffeeProduct }) {
  return (
    <article className="product-card">
      <a href={`#collection`} className="product-card__media-link" aria-label={`Explore ${product.name}`}>
        <div className="product-card__media">
          <MediaFrame src={product.image} alt={`${product.name} — ${product.origin}`} placeholder="product" ratio="4 / 5" />
          <span className="product-card__roast">{product.roast} roast</span>
        </div>
      </a>

      <div className="product-card__body">
        <div className="product-card__row">
          <span className="product-card__index">{product.index}</span>
          <span className="product-card__price">{product.price}</span>
        </div>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__origin">{product.origin}</p>

        <ul className="product-card__notes">
          {product.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <p className="product-card__desc">{product.description}</p>

        <a href="#collection" className="btn btn--text product-card__cta">
          Explore coffee <span className="btn__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
