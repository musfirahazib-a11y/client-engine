/* ===========================================================
   AMBLE — site-wide content
   Nav, footer, brand meta and the showcase labelling. Edit this
   file (and its siblings in src/data/) to re-skin the whole site
   for a different client without touching a single component.
=========================================================== */

export const BRAND = {
  name: "Amble",
  wordmark: "Amble.",
  tagline: "Coffee for the unhurried",
};

export const NAV_LINKS = [
  { label: "Story", href: "#story" },
  { label: "Origin", href: "#origin" },
  { label: "Coffee", href: "#collection" },
  { label: "About", href: "#brand-story" },
];

export const NAV_CTA = { label: "Shop", href: "#collection" };

export const FOOTER = {
  statementLines: ["Morning", "starts", "here."],
  columns: [
    {
      title: "Amble",
      links: [
        { label: "Story", href: "#story" },
        { label: "Origin", href: "#origin" },
        { label: "Collection", href: "#collection" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact", href: "mailto:hello@amble.coffee" },
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
      ],
    },
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Journal", href: "#story" },
  ],
  newsletter: {
    title: "Join the ritual",
    body: "One email a month — new arrivals, harvest notes, nothing else.",
    cta: "Subscribe",
  },
  legal: "This is a fictional concept brand — a MusfirahLoom showcase. No purchases are processed.",
};

export const SHOWCASE = {
  label: "MusfirahLoom Showcase",
  agencyUrl: "https://musfirahloom.com",
  transition: {
    eyebrow: "Built as a MusfirahLoom showcase",
    heading: ["Want something", "like this for", "your brand?"],
    body: "Amble is a concept — the craft behind it isn't. MusfirahLoom designs and builds cinematic, conversion-focused digital experiences for premium brands, from architecture through deployment.",
    primaryCta: { label: "Build something similar", href: "https://musfirahloom.com#contact" },
    secondaryCta: { label: "Explore MusfirahLoom", href: "https://musfirahloom.com" },
  },
};
