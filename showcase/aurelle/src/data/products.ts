export interface Product {
  index: string;
  slug: string;
  name: string;
  descriptor: string;
  notes: string[];
  description: string;
  size: string;
  price: string;
  image: string;
}

export const COLLECTION_SECTION = {
  eyebrow: "The collection",
  headingLines: ["Three signatures.", "One house."],
  body: "Numbered, not named — each built around a different hour of the day. When a batch sells out, it's gone until the next season.",
};

export const PRODUCTS: Product[] = [
  {
    index: "01",
    slug: "aurelle-no-01",
    name: "Aurelle No. 01",
    descriptor: "The morning one",
    notes: ["Bergamot", "Neroli", "White musk"],
    description: "Bright and short-lived by design — worn for the first two hours, not the last ten.",
    size: "50ml",
    price: "$145",
    image: "/assets/perfume/products/no-01.jpg",
  },
  {
    index: "02",
    slug: "aurelle-no-02",
    name: "Aurelle No. 02",
    descriptor: "The evening one",
    notes: ["Iris", "Rose", "Sandalwood"],
    description: "Powdery and low. Meant to be noticed only when someone stands close.",
    size: "50ml",
    price: "$165",
    image: "/assets/perfume/products/no-02.jpg",
  },
  {
    index: "03",
    slug: "aurelle-no-03",
    name: "Aurelle No. 03",
    descriptor: "The one you wear alone",
    notes: ["Vanilla", "Amber", "Musk"],
    description: "Warm and close to skin — the one that isn't really for anyone else.",
    size: "50ml",
    price: "$175",
    image: "/assets/perfume/products/no-03.jpg",
  },
];
