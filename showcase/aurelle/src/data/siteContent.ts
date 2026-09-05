/* ===========================================================
   AURELLE — site-wide content
   Edit this file (and its siblings in src/data/) to re-skin the
   whole site for a different client without touching a component.
=========================================================== */

export const BRAND = {
  name: "Aurelle",
  wordmark: "Aurelle",
  tagline: "Parfum",
};

export const NAV_LINKS = [
  { label: "Collection", href: "#collection" },
  { label: "The Story", href: "#scent-story" },
  { label: "Journal", href: "#journal" },
  { label: "About", href: "#brand-story" },
];

export const NAV_CTA = { label: "Shop", href: "#collection" };

export const FOOTER = {
  statementLines: ["Something", "lingers."],
  columns: [
    {
      title: "Aurelle",
      links: [
        { label: "The Story", href: "#scent-story" },
        { label: "Ingredients", href: "#ingredients" },
        { label: "Collection", href: "#collection" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact", href: "mailto:hello@aurelle.parfum" },
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
      ],
    },
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Journal", href: "#journal" },
  ],
  newsletter: {
    title: "Join the house",
    body: "One email a season — new scents, notes on the atelier, nothing else.",
    cta: "Subscribe",
  },
  legal: "This is a fictional concept brand — a MusfirahLoom showcase. No purchases are processed.",
};

export const SHOWCASE = {
  label: "Concept Experience · Built by MusfirahLoom",
  agencyUrl: "https://musfirahloom.com",
  transition: {
    eyebrow: "Concept experience — built by MusfirahLoom",
    heading: ["Want something", "like this for", "your brand?"],
    body: "Aurelle is a concept — the craft behind it isn't. MusfirahLoom designs and builds cinematic, conversion-focused digital experiences for premium brands, from architecture through deployment.",
    primaryCta: { label: "Build something similar", href: "https://musfirahloom.com#contact" },
    secondaryCta: { label: "Explore MusfirahLoom", href: "https://musfirahloom.com" },
  },
};
