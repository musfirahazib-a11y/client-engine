/* The signature pinned sequence (see ProductScene.tsx) — six beats, per
   brief §11. A persistent bottle graphic scales/moves through each beat
   while the background and caption crossfade in step. Swap `image` for
   real photography at public/assets/perfume/story/scene-0N.jpg. */
export interface ProductSceneBeat {
  index: string;
  eyebrow: string;
  heading: string;
  caption: string;
  image: string;
}

export const PRODUCT_SCENE: ProductSceneBeat[] = [
  {
    index: "01",
    eyebrow: "Presence",
    heading: "Quiet, until it isn't.",
    caption: "A silhouette built to be recognised before it's read.",
    image: "/assets/perfume/story/scene-01.jpg",
  },
  {
    index: "02",
    eyebrow: "Detail",
    heading: "Cut like light.",
    caption: "Faceted glass, weighted to sit in the hand like something worth keeping.",
    image: "/assets/perfume/story/scene-02.jpg",
  },
  {
    index: "03",
    eyebrow: "Origin",
    heading: "Before the bottle, a field.",
    caption: "Every accord starts as something grown, not synthesised.",
    image: "/assets/perfume/story/scene-03.jpg",
  },
  {
    index: "04",
    eyebrow: "The wear",
    heading: "It changes as it settles.",
    caption: "The first hour and the last hour are not quite the same fragrance.",
    image: "/assets/perfume/story/scene-04.jpg",
  },
  {
    index: "05",
    eyebrow: "Return",
    heading: "Familiar, on the second wearing.",
    caption: "The notes you almost missed the first time.",
    image: "/assets/perfume/story/scene-05.jpg",
  },
  {
    index: "06",
    eyebrow: "The collection",
    heading: "Three signatures, one house.",
    caption: "Each built around a different hour of the day.",
    image: "/assets/perfume/story/scene-06.jpg",
  },
];
