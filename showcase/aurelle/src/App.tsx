import { useEffect } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { useReducedMotion } from "./lib/useReducedMotion";
import { useLenis } from "./lib/useLenis";

import { Navbar } from "./components/Navbar";
import { CinematicHero } from "./components/CinematicHero";
import { ProductScene } from "./components/ProductScene";
import { ScentStory } from "./components/ScentStory";
import { IngredientSection } from "./components/IngredientSection";
import { FragranceNotes } from "./components/FragranceNotes";
import { ProductCollection } from "./components/ProductCollection";
import { Journal } from "./components/Journal";
import { VisualBreak } from "./components/VisualBreak";
import { BrandStory } from "./components/BrandStory";
import { ShopCTA } from "./components/ShopCTA";
import { FinalScene } from "./components/FinalScene";
import { ShowcaseCTA } from "./components/ShowcaseCTA";
import { Footer } from "./components/Footer";

export default function App() {
  const reducedMotion = useReducedMotion();
  useLenis(reducedMotion);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    if ("fonts" in document) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <Navbar />
      <main id="main">
        <CinematicHero />
        <ProductScene />
        <ScentStory />
        <IngredientSection />
        <FragranceNotes />
        <ProductCollection />
        <VisualBreak />
        <BrandStory />
        <Journal />
        <ShopCTA />
        <FinalScene />
        <ShowcaseCTA />
      </main>
      <Footer />
    </>
  );
}
