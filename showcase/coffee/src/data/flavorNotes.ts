export interface FlavorNote {
  name: string;
  description: string;
}

export const FLAVOR_SECTION = {
  eyebrow: "Flavor notes",
  headingLines: ["Taste is the", "whole point."],
};

export const FLAVOR_NOTES: FlavorNote[] = [
  { name: "Chocolate", description: "Dark, dry cocoa — the base note in almost every cup." },
  { name: "Caramel", description: "A round sweetness that shows up as the cup cools." },
  { name: "Citrus", description: "Bright bergamot and orange peel, up front on lighter roasts." },
  { name: "Stone fruit", description: "Apricot and peach — common in washed African lots." },
  { name: "Nuts", description: "Roasted almond and hazelnut, low and warm in the finish." },
  { name: "Florals", description: "Jasmine and honeysuckle, most present just off the boil." },
];
