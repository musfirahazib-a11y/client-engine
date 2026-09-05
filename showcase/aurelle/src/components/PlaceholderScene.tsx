/* ===========================================================
   Honest placeholder art — shown only where a real photograph
   hasn't been dropped in yet (see MediaFrame). Each variant is a
   distinct, designed composition (gradient + line motif + grain),
   never a fake product photo.
=========================================================== */
export type Variant =
  | "hero"
  | "bottle"
  | "closeup"
  | "botanical"
  | "scent"
  | "product"
  | "atmosphere"
  | "journal";

const MOTIFS: Record<Variant, string> = {
  hero: "M70,30 h60 v18 h-14 v130 a16,16 0 0 1-32,0 V48 H70 Z M85,30 v-14 h30 v14",
  bottle: "M70,30 h60 v18 h-14 v130 a16,16 0 0 1-32,0 V48 H70 Z M85,30 v-14 h30 v14",
  closeup: "M60,60 h80 M60,90 h80 M60,120 h50 M100,10 v40",
  botanical: "M100,20 C60,60 60,120 100,180 C140,120 140,60 100,20 Z M100,20 v160 M75,70 q25,10 25,30 M125,70 q-25,10 -25,30",
  scent: "M20,180 Q60,140 100,180 T180,180 M30,140 Q65,105 100,140 T170,140 M40,100 Q68,72 100,100 T160,100",
  product: "M100,26 v168 M70,40 h60 v14 h-60 z M76,54 v130 a24,24 0 0 0 48,0 V54",
  atmosphere: "M-20,130 Q120,50 240,130 T500,130",
  journal: "M40,30 h120 v160 h-120 Z M100,30 v160 M56,60 h28 M56,80 h28 M116,60 h28 M116,80 h28",
};

export function PlaceholderScene({ variant, dark = false }: { variant: Variant; dark?: boolean }) {
  const uid = `ph-${variant}`;
  return (
    <svg className="placeholder-scene" viewBox="0 0 200 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
          {dark ? (
            <>
              <stop offset="0" stopColor="#3a1f2e" />
              <stop offset="1" stopColor="#170f10" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#ede1d2" />
              <stop offset="1" stopColor="#c79098" stopOpacity="0.5" />
            </>
          )}
        </linearGradient>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.045" />
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>
      <rect width="200" height="240" fill={`url(#${uid}-g)`} />
      <rect width="200" height="240" filter={`url(#${uid}-grain)`} />
      <g
        transform="translate(0,20) scale(0.85)"
        fill="none"
        stroke={dark ? "#e7c9c9" : "#4a2c3a"}
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={MOTIFS[variant]} />
      </g>
    </svg>
  );
}
