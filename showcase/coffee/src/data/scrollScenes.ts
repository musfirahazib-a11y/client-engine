/* The signature pinned scroll sequence (see ScrollScene.tsx). Each scene
   pairs a full-bleed visual with a short caption; scroll progress drives
   which one is in focus. Swap `image` for real photography/video stills
   at public/assets/coffee/story/scene-0N.jpg — the layered SVG placeholder
   beneath each <img> is what you'll see until then. */
export interface ScrollSceneData {
  index: string;
  eyebrow: string;
  heading: string;
  caption: string;
  image: string;
}

export const SCROLL_SCENES: ScrollSceneData[] = [
  {
    index: "01",
    eyebrow: "The bag",
    heading: "Sealed at the peak of the roast.",
    caption: "One-way valve, resealable, roasted to order — never left waiting on a shelf.",
    image: "/assets/coffee/story/scene-01.jpg",
  },
  {
    index: "02",
    eyebrow: "The bean",
    heading: "Every lot cupped before it's bought.",
    caption: "We taste before we commit — density, moisture and defect count, checked by hand.",
    image: "/assets/coffee/story/scene-02.jpg",
  },
  {
    index: "03",
    eyebrow: "The pour",
    heading: "Brewed the way it was meant to be.",
    caption: "Slow, deliberate, and a little different every time — that's the point.",
    image: "/assets/coffee/story/scene-03.jpg",
  },
  {
    index: "04",
    eyebrow: "The ritual",
    heading: "This is the part worth staying for.",
    caption: "Not a task to finish. A reason to sit down for five unhurried minutes.",
    image: "/assets/coffee/story/scene-04.jpg",
  },
];
