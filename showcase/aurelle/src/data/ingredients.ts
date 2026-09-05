export interface Ingredient {
  name: string;
  description: string;
}

export const INGREDIENTS_SECTION = {
  eyebrow: "Ingredients",
  headingLines: ["What it's", "actually made of."],
};

export const INGREDIENTS: Ingredient[] = [
  { name: "Bergamot", description: "Bright. Citrus-sharp. Gone in the first minute." },
  { name: "Iris", description: "Powdered. Soft. Almost weightless." },
  { name: "Vanilla", description: "Warm. Not sweet — closer to skin." },
  { name: "Sandalwood", description: "Dry wood. Quiet. Holds everything else together." },
  { name: "Musk", description: "Barely there. The part that lingers longest." },
];

export const FRAGRANCE_PYRAMID = {
  eyebrow: "The fragrance pyramid",
  headingLines: ["How it", "unfolds."],
  tiers: [
    { label: "Top notes", notes: ["Bergamot", "Pink Pepper"] },
    { label: "Heart notes", notes: ["Iris", "Rose", "Jasmine"] },
    { label: "Base notes", notes: ["Sandalwood", "Musk", "Vanilla"] },
  ],
};
