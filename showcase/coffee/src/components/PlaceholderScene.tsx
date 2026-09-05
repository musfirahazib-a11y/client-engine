/* ===========================================================
   Honest placeholder art — used only where a real photo/video
   hasn't been dropped in yet (see MediaFrame). Each variant is a
   distinct, designed composition (gradient + line motif + grain),
   never a fake product photo, and always carries a small on-image
   label so nobody mistakes it for real brand photography.
=========================================================== */
type Variant =
  | "hero"
  | "bag"
  | "bean"
  | "pour"
  | "cup"
  | "product"
  | "origin"
  | "atmosphere";

const MOTIFS: Record<Variant, string> = {
  hero: "M-20,150 Q100,60 220,150 T460,150",
  bag: "M70,40 h100 l14,190 a14,14 0 0 1-14,14 H70 a14,14 0 0 1-14-14 Z M70,80 h100",
  bean: "M100,40 C40,40 30,100 30,140 C30,190 60,220 100,220 C140,220 170,190 170,140 C170,100 160,40 100,40 Z M100,45 C85,90 85,170 100,215",
  pour: "M96,20 v70 M84,100 q-30,10 -30,50 a46,46 0 0 0 92,0 q0,-40 -30,-50 Z",
  cup: "M50,80 h100 l-10,110 a14,14 0 0 1-14,12 H74 a14,14 0 0 1-14-12 Z M150,95 q34,4 34,34 a34,34 0 0 1-34,34",
  product: "M100,30 v170 M40,60 h120",
  origin: "M20,140 Q60,80 100,140 T180,140 M20,170 Q60,110 100,170 T180,170",
  atmosphere: "M-20,120 Q120,40 240,120 T500,120",
};

export function PlaceholderScene({ variant, dark = false }: { variant: Variant; dark?: boolean }) {
  const uid = `ph-${variant}`;
  return (
    <svg
      className="placeholder-scene"
      viewBox="0 0 200 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
          {dark ? (
            <>
              <stop offset="0" stopColor="#2e2318" />
              <stop offset="1" stopColor="#15100c" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#ece2d0" />
              <stop offset="1" stopColor="#c9a15a" stopOpacity="0.55" />
            </>
          )}
        </linearGradient>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.05" />
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>
      <rect width="200" height="240" fill={`url(#${uid}-g)`} />
      <rect width="200" height="240" filter={`url(#${uid}-grain)`} />
      <g transform="translate(0,20) scale(0.85)" fill="none" stroke={dark ? "#e7d3a4" : "#3a2c1c"} strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={MOTIFS[variant]} />
      </g>
    </svg>
  );
}
