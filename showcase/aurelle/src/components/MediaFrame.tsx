import { useState } from "react";
import type { Variant } from "./PlaceholderScene";
import { PlaceholderScene } from "./PlaceholderScene";

interface MediaFrameProps {
  /** Real asset path, e.g. "/assets/perfume/products/no-01.jpg". Until that
   *  file exists this frame quietly falls back to designed placeholder art
   *  — drop the real file in and it just works. */
  src: string;
  alt: string;
  placeholder: Variant;
  darkPlaceholder?: boolean;
  className?: string;
  ratio?: string;
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
    <div className={`media-frame ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={alt}>
      {!failed && (
        <img src={src} alt="" loading={loading} onError={() => setFailed(true)} className="media-frame__img" />
      )}
      {failed && (
        <div className="media-frame__fallback" aria-hidden="true">
          <PlaceholderScene variant={placeholder} dark={darkPlaceholder} />
          <span className="media-frame__tag">Aurelle — placeholder</span>
        </div>
      )}
    </div>
  );
}
