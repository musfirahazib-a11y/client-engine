import { useState } from "react";
import { PlaceholderScene } from "./PlaceholderScene";

type PlaceholderVariant = "hero" | "bag" | "bean" | "pour" | "cup" | "product" | "origin" | "atmosphere";

interface MediaFrameProps {
  /** Real asset path, e.g. "/assets/coffee/products/house-espresso.jpg".
   *  Until that file exists this frame quietly falls back to designed
   *  placeholder art — drop the real file in and it just works. */
  src: string;
  alt: string;
  placeholder: PlaceholderVariant;
  darkPlaceholder?: boolean;
  className?: string;
  ratio?: string; // e.g. "4 / 5"
  loading?: "lazy" | "eager";
}

export function MediaFrame({
  src,
  alt,
  placeholder,
  darkPlaceholder,
  className = "",
  ratio = "4 / 5",
  loading = "lazy",
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`media-frame ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={alt}
    >
      {!failed && (
        <img
          src={src}
          alt=""
          loading={loading}
          onError={() => setFailed(true)}
          className="media-frame__img"
        />
      )}
      {failed && (
        <div className="media-frame__fallback" aria-hidden="true">
          <PlaceholderScene variant={placeholder} dark={darkPlaceholder} />
          <span className="media-frame__tag">Amble — placeholder</span>
        </div>
      )}
    </div>
  );
}
