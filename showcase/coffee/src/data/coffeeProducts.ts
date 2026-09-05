export interface CoffeeProduct {
  index: string;
  slug: string;
  name: string;
  origin: string;
  roast: "Light" | "Medium" | "Dark";
  notes: string[];
  description: string;
  price: string;
  image: string;
}

export const COLLECTION_SECTION = {
  eyebrow: "The collection",
  headingLines: ["Three coffees.", "One standard."],
  body: "A rotating collection, always sourced within the same harvest year. When a lot sells out, it's gone — the next one takes its place.",
};

export const COFFEE_PRODUCTS: CoffeeProduct[] = [
  {
    index: "01",
    slug: "house-espresso",
    name: "House Espresso",
    origin: "Brazil & Guatemala blend",
    roast: "Dark",
    notes: ["Dark chocolate", "Caramel", "Roasted almond"],
    description: "Our everyday blend — built for milk, honest on its own.",
    price: "$22 / 250g",
    image: "/assets/coffee/products/house-espresso.jpg",
  },
  {
    index: "02",
    slug: "ethiopian-light",
    name: "Ethiopian Light",
    origin: "Yirgacheffe, Ethiopia",
    roast: "Light",
    notes: ["Bergamot", "Berry", "Floral"],
    description: "Washed and sun-dried, roasted to let the origin speak for itself.",
    price: "$26 / 250g",
    image: "/assets/coffee/products/ethiopian-light.jpg",
  },
  {
    index: "03",
    slug: "colombian-reserve",
    name: "Colombian Reserve",
    origin: "Huila, Colombia",
    roast: "Medium",
    notes: ["Cocoa", "Red fruit", "Brown sugar"],
    description: "A single farm lot, small enough that it won't last the season.",
    price: "$28 / 250g",
    image: "/assets/coffee/products/colombian-reserve.jpg",
  },
];
